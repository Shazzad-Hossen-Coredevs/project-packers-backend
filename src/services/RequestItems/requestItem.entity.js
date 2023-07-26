import { generateMail } from '../../controllers/email/template/generateMail';
import RequestItem from './requestItem.schema';
import User from '../user/user.schema';
import jwt from 'jsonwebtoken';

const createAllowed = new Set(['name', 'link', 'quantity', 'thumbnails', 'notes','user']);
const allowedQuery = new Set(['page', 'limit', '_id', 'paginate']);
const updateAllowed = new Set(['name', 'whereToBuy', 'quantity', 'thumbnails', 'notes', 'email','status','tax','fee','stock','price']);
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
      // receiver: 'firebase2420@gmail.com',
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


    // when user accept this and api hit trigered and this product will be added to product list and also added to user cart.
    //and set the status of requested item accepted. if user canceled the invoice the status will be abandoned.
    //then admin can change the status to closed.
    // then further process will be continued as normal order.

  } catch (error) {
    console.log(error);
    res.status(500).send('Something wents wrong');

  }
};


export const invoiceResponse = ({ db, settings}) => async (req, res) => {
  try {
    //redirect url will be change
    if (!req.params.token) return res.redirect('http://facebook.com');
    const data = await jwt.verify(req.params.token, settings.secret);
    const item = await db.findOne({ table: RequestItem, key: { id: data.id } });

    if (data.status === 'accepted') {
      item.status = 'accepted';
      //now add this item to product and user art

    }
    else {
      item.status = 'abandoned';

    }

  } catch(error) {
    console.log(error);
    res.status(500).send('Something wents wrong');

  }

};