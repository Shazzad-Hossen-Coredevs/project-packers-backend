import Product from './product.schema';
const createAllowed = new Set(['name', 'description', 'price','from','whereToBuy','develeryTime']);
const allowedQuery = new Set(['page', 'limit', '_id', 'paginate']);
const ownUpdateAllowed = new Set(['name', 'description', 'price','from','whereToBuy','develeryTime']);


/**
 * Creates a new product in the database with the specified properties in the request body.
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} acknowledgement: true
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const addProduct = ({ db }) => async (req, res) => {

  try {

    const valid = Object.keys(req.body).every(k => createAllowed.has(k));
    if (!valid) return res.status(400).send('Bad request');
    db.create({ table: Product, key: { ...req.body} })
      .then(async product => {
        if (!product) {
          return res.status(400).send({ message: 'Something Wents Wrong' });
        }
        await db.save(product);
        res.status(200).send({ acknowledgment: true });
      })
      .catch(({ message }) => res.status(400).send({ message }));


  }
  catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};
/**
 * Creates a new product in the database with the specified properties in the request body.
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} acknowledgement: true
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const getProducts = ({ db }) => async (req, res) => {

  try {


    db.find({ table: Product})
      .then(async product => {
        if (!product) {
          return res.status(400).send({ message: 'Something Wents Wrong' });
        }

        res.status(200).send(product);
      })
      .catch(({ message }) => res.status(400).send({ message }));


  }
  catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};
