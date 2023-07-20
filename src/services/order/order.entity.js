import Order from './order.schema';
import User from '../user/user.schema';
import Discount from '../discount/discount.schema';
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

    req.body.status = 'pending';
    req.body.user = req.user.id;
    const user = await db.findOne({ table: User, key: { id: req.user.id } });
    if (!user) return res.status(400).send({ error: true, message: 'Please login first' });
    user.shippingAddress = req.body.shippingAddress;
    db.save(user);
    if (req.body.code) {
      const discount = await db.findOne({
        table: Discount,
        key: { code: req.body.code },
      });
      if (!discount) return res.status(400).send({ eror: true, message: 'Invalid Discount code' });
      if ((discount.expiresIn - new Date()) < 0)
        return res.status(400).send({ error: true, message: 'Discount code is already expired' });
      const isFound = discount.user.find((user) => user.id === req.body.userId);
      if (isFound)
        return res.status(400).send({ error: true, message: 'You already applied this discount code before' });
      req.discount = discount;
    }
    const order = await db.create({ table: Order, key: { ...req.body } });
    if (!order) return res.status(400).send({ error: true, message: 'Order failed' });
    const result = await db.findOne({ table: Order, key: { id: order._id, populate: { path: 'products.pId' } } });
    let dTotal = 0;
    let nTotal = 0;
    for (let i = 0; i < result.products.length; i++){
      if (result.products[i].pId.category === req.discount.category || result.products[i].pId.subCategory === req.discount.subCategory) {
        dTotal += result.products[i].pId.price;
      }
      nTotal += result.products[i].pId.price;

    }
    if (req.discount) {
      if (req.discount.type === 'f')
        dTotal -= req.discount.amount;
      else if (req.discount.type === 'p') {
        dTotal -= (dTotal * req.discount.amount) / 100;
      }
    }
    result.totalAmount = dTotal + nTotal;
    db.save(result);
    res.send(result);
  }
  catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};