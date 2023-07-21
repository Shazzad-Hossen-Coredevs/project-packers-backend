import Order from './order.schema';
import Discount from '../discount/discount.schema';

const ownUpdateAllowed = new Set(['completed', 'pending', 'processing', 'shipping','cancel']);
/**
 * Creates new order in the database based on the property of request body.
 *
 * @param {Object} req - The request object containing the properties for the new product{name,thumbnails[],desc,price,from,whereToBuy,develeryTime,category,subCategory}.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} acknowledgement: true
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const addOrder = ({ db }) => async (req, res) => {

  try {
    if (!req.user.cart.length) return res.status(400).send({ error: true, message: 'You can not order while your cart is empty' });
    if (!paramsValidator(req.body, ['shipping', 'contact', 'shippingAddress'])) return res.status(400).send({ error: true, message: ' body objectmust have shipping, contact, shippingAddress' });
    if (!paramsValidator(req.body.contact, ['email', 'phone'])) return res.status(400).send({ error: true, message: 'contact object must have email and phone' });
    if (!req.body.contact.phone.primary) return res.status(400).send({ error: true, message: 'Primary phone number missing in contact information' });
    if (req.body.code) {
      const discount = await db.findOne({ table: Discount, key: { code: req.body.code } });
      if (!discount) return res.status(400).send({ error: true, message: ' Invalid discount code' });
      if ((discount.expiresIn - new Date()) < 0) return res.status(400).send({ error: true, message: 'Discount code is already expired' });
      const isFound = discount.user.find((user) => user=== req.user.id);
      if (isFound) return res.status(400).send({ error: true, message: 'You already applied this discount code before' });
      req.discount = discount;

    }
    if (!req.body.shippingAddress) return res.status(400).send({ error: true, message: 'Shipping address missing in request body' });
    const isValid = paramsValidator(req.body.shippingAddress,['name', 'address', 'city', 'area', 'zip']);
    if (!isValid) return res.status(400).send({ error: true, message: 'Invalid shipping address' });
    req.user.shippingAddress = req.body.shippingAddress;
    let dTotal = 0, nTotal = 0;
    req.user.cart.forEach(prod => {
      req.discount &&
      prod.product.category === req.discount.category &&
      prod.product.subCategory === req.discount.subCategory
        ? (dTotal += prod.product.price * prod.quantity)
        : (nTotal += prod.product.price * prod.quantity);
    });
    if (req.discount) {
      req.discount.type==='p'? req.body.subTotal= ((dTotal*(100-req.discount.amount))/100)+nTotal: req.discount.type==='f'? req.body.subTotal=(dTotal-req.discount.amount)+nTotal:req.body.subTotal = dTotal + nTotal;
    }
    else req.body.subTotal = dTotal + nTotal;
    if (req.body.shipping === 'inside') req.body.shippingAmount = 99;
    else if (req.body.shipping === 'outside') req.body.shippingAmount = 150;
    req.body.estimatedTotal = req.body.subTotal + req.body.shippingAmount;
    req.body.orderNumber = new Date().getTime();
    const order = await db.create({
      table: Order,
      key: { ...req.body, products: req.user.cart , user: req.user.id, status:'pending'},
    });
    if (!order) return res.status(400).send({ error: true, message: 'Order creation failed' });
    if (req.discount) {
      req.discount.user.push(req.user.id);
      db.save(req.discount);
    }
    req.user.cart=[];
    db.save(req.user);
    res.status(200).send(order);
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

export const getOrders = ({ db }) => async (req, res) => {
  try {
    const orders = await db.find({
      table: Order,
      key: {
        populate: { path: 'user products.product', select:'name email phone avatar shippingAddress _id  thumbnails desc price from whereToBuy category subCategory ' } },
    });
    if (!orders) return res.status(200).send({ error: true, mesage: 'Failed to fetch data' });
    res.status(200).send(orders);

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};

export const updateOrderstatus = ({ db }) => async (req, res) => {
  try {
    const isValid = paramsValidator(req.body, ['id', 'status']);
    if (!isValid) return res.status(400).send({ error: true, message: ' Invalid body object keys' });
    if (!ownUpdateAllowed.has(req.body.status)) return res.status(400).send({ error: true, mesage: 'Invalid status' });

    const order = await db.findOne({ table: Order, key: { id: req.body.id } });
    if (!order) return res.status(400).send({ error: true, message: 'Order not found' });
    order.status = req.body.status;
    db.save(order);
    res.status(200).send(order);

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};
export const deleteOrder = ({ db }) => async (req, res) => {
  try {
    const isFound = await db.findOne({ table: Order, key: { id: req.params.id } });
    if (!isFound) return res.status(400).send({ error: true, message: 'Order not Found' });
    isFound.remove();
    res.status(200).send({ acknowledgement : true});


  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};