import { generateMail } from '../../controllers/email/template/generateMail';
import RequestItem from './requestItem.schema';
import User from '../user/user.schema';
import Product from '../product/product.schema';
import jwt from 'jsonwebtoken';

const createAllowed = new Set(['name', 'link', 'quantity', 'thumbnails', 'notes','user']);
const allowedQuery = new Set(['page', 'limit', '_id', 'paginate']);
const updateAllowed = new Set(['name', 'link', 'whereToBuy', 'quantity', 'thumbnails', 'notes','status','tax','fee','stock','price']);
/**
 * This function is used for Request a new product which will add a collection in table RequestItems.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const requestProduct = ({ db, imageUp }) => async (req, res) => {
  try {

    if (req.files) {
      req.body = JSON.parse(req.body.data || '{}');

      req.body.user = req.user.id;
      if (req.files.thumbnails.length > 1) {
        for (let thumb of req.files.thumbnails) {
          req.body.thumbnails = [...req.body.thumbnails || [], (await imageUp(thumb.path))];
        }
      } else {
        req.body.thumbnails = [await imageUp(req.files.thumbnails.path)];
      }

    }
    const valid = Object.keys(req.body).every(k => createAllowed.has(k));
    if (!valid) return res.status(400).send('Bad request');
    const data = await db.create({ table: RequestItem, key: { ...req.body } });
    if (!data) return  res.status(400).send({ message: 'Something Wents Wrong' });
    res.status(200).send(data);

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};
/**
 * This function is used to get all requested items.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const getAllRequestedProduct = ({ db }) => async (req, res) => {
  try {
    const products = await db.find({
      table: RequestItem,
      key: { query: req.query, allowedQuery: allowedQuery, paginate: true },
    });
    if (!products) return res.status(400).send({ errre: true, message: 'Something wents wrong' });
    res.status(200).send(products);


  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};
/**
 * This function is used to get a single requested item details.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const getSingleProduct = ({ db }) => async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).send({ error: true, message: 'You mus send product id as params' });
    const item = await db.findOne({ table: RequestItem, key: { id: req.params.id } });
    if (!item) return res.status(400).send({ error: true, message: 'Product not found' });
    res.status(200).send(item);

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};
/**
 * This function is used to updated an requested item status.
 * @param {Object} req This is the request object {status}.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const updateProduct = ({ db }) => async (req, res) => {
  try {
    const data = await db.update({ table: RequestItem, key: { id: req.params.id, body: req.body } });
    if (!data) return res.status(400).send({ error: true, message: 'Operation failed' });
    res.status(200).send(data);

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};


export const sendInvoice = ({ db, settings, mail }) => async (req, res) => {
  try {
    if (!req.body.id) return res.status(400).send({ error: true, message: 'id missing in request body' });
    const product = await db.findOne({ table: RequestItem, key: { id: req.body.id } });
    if (!product) return res.status(400).send({ error: true, message: 'There is no items with this id' });
    const user = await db.findOne({ table: User, key: { id: product.user } });
    if (!user) return res.status(400).send({ error: true, message: 'Something wents Wrong' });
    const acceptToken = jwt.sign({
      status: 'accepted',
      user: product.user,
      id: product.id
    }, settings.secret);
    const declineToken = jwt.sign({
      status: 'abandoned',
      id: product.id
    }, settings.secret);

    const html = await generateMail({ acceptToken, declineToken, user, product}, 'invoice.ejs');
    const mailRes = await mail({
      receiver: user.email,
      subject: 'Project Packers - Invoice for your requested product',
      body: html,
      type: 'html',
    });
    if (!mailRes) return res.status(400).send({ error: true, message: 'Invoice send Failed' });

    product.status = 'estimate-sent';
    product.invoice = true;
    const result = await db.save(product);
    if (!result) return res.status(400).send({ error: true, message: 'Sattus set to estimate-sent failed' });
    res.status(200).send(result);

  } catch (error) {
    console.log(error);
    res.status(500).send('Something wents wrong');

  }
};


export const invoiceResponse = ({ db, settings}) => async (req, res) => {
  try {
    //redirect url will be change
    if (!req.params.token) return res.redirect('https://shazzad.online?message=error');
    const data = await jwt.verify(req.params.token, settings.secret);
    const item = await db.findOne({ table: RequestItem, key: { id: data.id } });
    if (!item) return res.redirect('https://shazzad.online?message=error');
    if (item.status !== 'estimate-sent') return res.redirect('https://shazzad.online?message=closed');
    item.status = data.status;
    db.save(item);
    res.redirect(`https://shazzad.online?message=${data.status}`);

  } catch(error) {
    console.log(error);
    res.status(500).send('Something wents wrong');

  }

};

export const addtoProduct = ({ db }) => async (req, res) => {
  try {
    if (!req.body.id) return res.status(400).send('id missing in body object');
    const item = await db.findOne({ table: RequestItem, key: { id: req.body.id } });
    if (!item) return res.status(400).send('Something wents wrong');
    const data ={};
    Object.keys(item._doc).forEach(param => data[param] = item._doc[param]);
    Object.keys(req.body).forEach(param => data[param] = req.body[param]);
    data.status = 'pending';
    data.whereToBuy = new URL(data.link).hostname.replace(/^www\./, '');
    data.stock = data.quantity;
    delete data._id;
    const product = await db.create({ table: Product, key: { ...data } });
    if (!product) return res.status(400).send('Item add to product collection failed');
    item.product = product.id;
    db.save(item);
    res.status(200).send(product);
  } catch (error) {
    console.log(error);
    res.status(500).send('Something wents wrong');
  }

};

export const sendtoCart = ({ db, mail }) => async (req, res) => {
  try {
    if (!req.body.id) return res.status(400).send('Requested product id missing in request body');
    const reqItem = await db.findOne({ table: RequestItem, key: { id: req.body.id } });
    if (!reqItem) return res.status(400).send('Something wents wrong');
    const product = await db.findOne({ table: Product, key: { id: reqItem.product } });
    if (!product) return res.status(400).send('Something wents wrong');
    const user = await db.findOne({ table: User, key: { id: reqItem.user } });
    if (!user) return res.status(400).send('Something wents wrong');
    user.cart.push(product);
    const result = await db.save(user);
    if (!result) return res.status(400).send('Something wents wrong');
    reqItem.cart = true;
    db.save(reqItem);
    const html = await generateMail({ user, product, reqItem }, 'reqTocart.ejs');
    const mailRes = await mail({
      receiver: user.email,
      subject: 'Project Packers - Check your cart',
      body: html,
      type: 'html',
    });
    if (!mailRes) return res.status(400).send({ error: true, message: 'Invoice send Failed' });
    res.status(200).send('Success');





  } catch (error) {
    console.log(error);
    res.status(500).send('Something wents wrong');
  }

};