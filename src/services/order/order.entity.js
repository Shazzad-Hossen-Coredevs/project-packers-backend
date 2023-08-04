import Order from './order.schema';
import Discount from '../discount/discount.schema';
import SSLCommerzPayment from 'sslcommerz-lts';
import Notification from '../notification/notification.schema';



const ownUpdateAllowed = new Set(['completed', 'pending', 'processing', 'shipping', 'canceled']);
/**
 * Creates new order in the database based on the property of request body.
 *
 * @param {Object} req - The request object containing the properties for the new product{name,thumbnails[],desc,price,from,whereToBuy,develeryTime,category,subCategory}.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} acknowledgement: true
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const addOrder = ({ db, settings,ws }) => async (req, res) => {

  try {
    if (!req.user.cart.length) return res.status(400).send({ error: true, message: 'You can not order while your cart is empty' });
    if (!paramsValidator(req.body, ['shipping', 'contact', 'shippingAddress'])) return res.status(400).send({ error: true, message: ' body object must have shipping, contact, shippingAddress' });
    if (!paramsValidator(req.body.contact, ['email', 'phone'])) return res.status(400).send({ error: true, message: 'contact object must have email and phone' });
    if (!req.body.contact.phone.primary) return res.status(400).send({ error: true, message: 'Primary phone number missing in contact information' });
    if (req.body.code) {
      const discount = await db.findOne({ table: Discount, key: { code: req.body.code } });
      if (!discount) return res.status(400).send({ error: true, message: ' Invalid discount code' });
      if ((discount.expiresIn - new Date()) < 0) return res.status(400).send({ error: true, message: 'Discount code is already expired' });
      const isFound = discount.user.find((user) => user === req.user.id);
      if (isFound) return res.status(400).send({ error: true, message: 'You already applied this discount code before' });
      req.discount = discount;
    }
    if (!req.body.shippingAddress) return res.status(400).send({ error: true, message: 'Shipping address missing in request body' });
    const isValid = paramsValidator(req.body.shippingAddress, ['name', 'address', 'city', 'area', 'zip']);
    if (!isValid) return res.status(400).send({ error: true, message: 'Invalid shipping address' });
    req.user.shippingAddress = req.body.shippingAddress;
    let dTotal = 0, nTotal = 0;

    let estimatedDtime = {
      min: 0, max: 0
    };
    let tax = 0; let fee = 0;
    req.user.cart.forEach(prod => {
      tax += prod.product.tax;
      fee += prod.product.fee;

      if (prod.product.develeryTime.max > estimatedDtime.max) {
        estimatedDtime.max = prod.product.develeryTime.max;
        estimatedDtime.min = prod.product.develeryTime.min;
      }


      req.discount &&
        prod.product.category === req.discount.category &&
        prod.product.subCategory === req.discount.subCategory
        ? (dTotal += prod.product.price * prod.quantity)
        : (nTotal += prod.product.price * prod.quantity);
    });
    estimatedDtime.max = generateDate(estimatedDtime.max);
    estimatedDtime.min = generateDate(estimatedDtime.min);

    if (req.discount) {
      req.discount.type === 'p' ? req.body.subTotal = ((dTotal * (100 - req.discount.amount)) / 100) + nTotal : req.discount.type === 'f' ? req.body.subTotal = (dTotal - req.discount.amount) + nTotal : req.body.subTotal = dTotal + nTotal;
    }
    else req.body.subTotal = dTotal + nTotal;
    req.body.tax = tax;
    req.body.fee = fee;
    if (req.body.shipping === 'inside') req.body.shippingAmount = 99;
    else if (req.body.shipping === 'outside') req.body.shippingAmount = 150;
    req.body.estimatedTotal = req.body.subTotal + req.body.shippingAmount+tax+fee;
    req.body.orderNumber = new Date().getTime();
    req.body.date = formatedDatestring();

    const order = await db.create({
      table: Order,
      key: { ...req.body, products: req.user.cart, user: req.user.id, estimatedDtime, populate: { path: 'products.product user', select: '_id shippingAddress name email phone avatar thumbnails price  category' } },
    });
    if (!order) return res.status(400).send({ error: true, message: 'Order creation failed' });
    if (req.discount) {
      req.discount.user.push(req.user.id);
      db.save(req.discount);
    }
    req.user.cart = [];
    db.save(req.user);
    const data = {
      total_amount: order.estimatedTotal,
      currency: 'BDT',
      tran_id: order.orderNumber, // use unique tran_id for each api call
      success_url: `http://localhost:4000/api/order/payment/success/${order.id}`,
      fail_url: `http://localhost:4000/api/order/payment/fail/${order.id}`,
      cancel_url: `http://localhost:4000/api/order/payment/cancel/${order.id}`,
      ipn_url: 'http://localhost:4000/api/order/payment/ipn',
      shipping_method: 'Courier',
      product_name: order.products[0].product.name,
      product_category: order.products[0].product.category,
      product_profile: 'general',
      cus_name: order.user.name,
      cus_email: order.user.email,
      cus_add1: order.shippingAddress.address,
      cus_add2: order.shippingAddress.address,
      cus_city: order.shippingAddress.city,
      cus_state: order.shippingAddress.area,
      cus_postcode: order.shippingAddress.zip,
      cus_country: 'Bangladesh',
      cus_phone: order.user.phone,
      cus_fax: order.user.phone,
      ship_name: order.user.name,
      ship_add1: order.shippingAddress.address,
      ship_add2: order.shippingAddress.address,
      ship_city: order.shippingAddress.city,
      ship_state: order.shippingAddress.area,
      ship_postcode: Number(order.shippingAddress.zip),
      ship_country: 'Bangladesh',
    };
    const sslcz = new SSLCommerzPayment(settings.PAYMENT_GATEWAY.STORE_ID, settings.PAYMENT_GATEWAY.STORE_PSWD, settings.PAYMENT_GATEWAY.IS_LIVE);
    sslcz.init(data).then(async(apiResponse) => {
      const GatewayPageURL = apiResponse.GatewayPageURL;
      res.status(200).send(GatewayPageURL);
      const notification = await db.create({
        table: Notification, key: {
          user: req.user.id,
          type: 'prod',
          msg: 'Your Order has been placed. Please complete your payment.',
          url: '/'
        }
      });

      if (notification) ws.to(req.user.id).emit('notification', { ...notification });

    });

  }
  catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};
export const paramsValidator = (data, requiredKeys) => {
  for (const key of requiredKeys) {
    if (!(key in data)) {
      return false;
    }
  }

  return true;
};

const generateDate = (days) => {
  const today = new Date();
  const newDate = new Date(today);
  newDate.setDate(newDate.getDate() + days);
  return newDate.toDateString();
};
const formatedDatestring = () => {

  const currentDate = new Date();
  let hours = currentDate.getHours();
  let amOrPm = 'AM';
  if (hours >= 12) {
    amOrPm = 'PM';
  }
  if (hours > 12) {
    hours -= 12;
  }
  return `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getDate().toString().padStart(2, '0')}, ${currentDate.getFullYear()}, ${hours}:${currentDate.getMinutes().toString().padStart(2, '0')} ${amOrPm}`;


};
/**
 * fatch all orders list .
 *
 * @param {Object} req - This is the request object.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} all orders collection
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */

export const getOrders = ({ db }) => async (req, res) => {
  try {
    const orders = await db.find({
      table: Order,
      key: {
        populate: { path: 'user products.product', select: 'name email phone avatar shippingAddress _id  thumbnails desc price from whereToBuy category subCategory ' }
      },
    });
    if (!orders) return res.status(200).send({ error: true, mesage: 'Failed to fetch data' });
    res.status(200).send(orders);

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};/**
 * Change order status
 *
 * @param {Object} req - The request object contains the order id(mongodb) and status .
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} Updated order details
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */


export const updateOrderstatus = ({ db, ws }) => async (req, res) => {
  try {
    const isValid = paramsValidator(req.body, ['id', 'status']);
    if (!isValid) return res.status(400).send({ error: true, message: ' Invalid body object keys' });
    if (!ownUpdateAllowed.has(req.body.status)) return res.status(400).send({ error: true, mesage: 'Invalid status' });

    const order = await db.findOne({ table: Order, key: { id: req.body.id } });
    if (!order) return res.status(400).send({ error: true, message: 'Order not found' });
    order.status = req.body.status;
    db.save(order);
    res.status(200).send(order);
    const notification = await db.create({
      table: Notification, key: {
        user: order.user,
        type: 'prod',
        msg: order.status === 'completed' ? `your product for order no: ${order.orderNumber} has been delivered.` : order.status === 'processing' ? `We are currently processing your order ( Order no: ${order.orderNumber})` : order.status === 'shipping' ? `The shipping process of your order is started ( Order no: ${order.orderNumber})` : order.status === 'canceled' ? `Your order ( Order no: ${order.orderNumber}) has been canceled`: 'This is the autometed notification from the system',
        url: '/'
      }
    });

    if (notification) ws.emit(order.user, notification);

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};
/**
 * Delete a order from collection
 *
 * @param {Object} req - The request object contains the order id from prams.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} acknowledgement: true
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const deleteOrder = ({ db }) => async (req, res) => {
  try {

    const isFound = await db.findOne({ table: Order, key: { id: req.params.id } });
    if (!isFound) return res.status(400).send({ error: true, message: 'Order not Found' });
    isFound.remove();
    res.status(200).send({ acknowledgement: true });


  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};
/**
 * Fatch a specific userd all orders collection
 * @param {Object} req - This is the request object.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} Orders  collections
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const myOrder = ({ db }) => async (req, res) => {
  try {
    const orders = await db.find({ table: Order, key: { id: req.user.id, populate: { path: 'products.product' } } });
    if (!orders) return res.status(400).send({ error: true, message: 'Failed to fatch data' });
    res.status(200).send(orders);

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};
/**
 * Fatch a specific order details
 * @param {Object} req - This is the request object.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} Orders  collections
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const singleOrder = ({ db }) => async (req, res) => {
  try {

    const order = await db.findOne({ table: Order, key: { id: req.params.id, populate: { path: 'products.product' } } });
    if (!order) return res.send({ error: true, message: 'Something wents wrong!' });
    res.status(200).send(order);

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};
/**
 * Fatch a specific user orders
 * @param {Object} req - This is the request object.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} Orders  collections
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */

export const userOrder = ({ db }) => async (req, res) => {
  try {
    const orders = await db.find({ table: Order, key: { id: req.params.id } });
    res.send(orders);

  } catch (error) {
    console.log(error);
    res.status(500).send('Something went wrong.');

  }
};

export const successPayment = ({ db, settings, ws }) => async (req, res) => {
  try {

    const order = await db.findOne({ table: Order, key: { id: req.params.id } });
    const sslcz = new SSLCommerzPayment(settings.PAYMENT_GATEWAY.STORE_ID, settings.PAYMENT_GATEWAY.STORE_PSWD, settings.PAYMENT_GATEWAY.IS_LIVE);
    const response = await sslcz.validate({ val_id: req.body.val_id });

    if (response.status === 'VALID' && order.estimatedTotal === Number(response.amount)) {
      order.status = 'paid';
      order.paymentDetails = {
        val_id: response.val_id,
        tran_id: response.tran_id,
        tran_date: response.tran_date,
        bank_tran_id: response.bank_tran_id,
        card_type: response.card_type,
        card_no: response.card_no,
        card_issuer: response.card_issuer,
        card_brand: response.card_brand,
        card_category: response.card_category,
        card_sub_brand: response.card_sub_brand,
        card_issuer_country: response.card_issuer_country,
        card_issuer_country_code: response.card_issuer_country_code,
        currency_type: response.currency_type
      };

    }
    await db.save(order);
    res.redirect(`http://localhost:5173/order-success/?status=${order.status}`);
    const notification = await db.create({
      table: Notification, key: {
        user: order.user,
        type: 'prod',
        msg: `You have successfully paid the amount for your order no: ${order.orderNumber}`,
        url: '/'
      }
    });

    if (notification) ws.emit(order.user, notification);







  } catch (error) {
    console.log(error);
    res.status(500).send('Something went wrong.');

  }
};
export const failPayment = () => async (req, res) => {
  try {
    //redirect url will be change .
    res.redirect('http://shazzad.online/?status=failed');

  } catch (error) {
    console.log(error);
    res.status(500).send('Something went wrong.');

  }
};
export const cancelPayment = () => async (req, res) => {
  try {
    //redirect url will be change .
    res.redirect('http://shazzad.online/?status=canceled');
  } catch (error) {
    console.log(error);
    res.status(500).send('Something went wrong.');

  }
};
export const ipnPayment = () => async (req, res) => {
  try {
    //


  } catch (error) {
    console.log(error);
    res.status(500).send('Something went wrong.');

  }
};
