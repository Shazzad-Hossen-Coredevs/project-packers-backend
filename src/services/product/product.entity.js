import Product from './product.schema';
const createAllowed = new Set(['name', 'desc', 'price', 'from', 'deliveryTime', 'thumbnails', 'category', 'subCategory', 'link', 'stock','tax','fee', 'tags']);
const allowedQuery = new Set(['page', 'limit', '_id', 'paginate', 'status', 'category']);
const ownUpdateAllowed = new Set(['name', 'desc', 'price', 'from', 'whereToBuy', 'develeryTime', 'thumbnails', 'category', 'subCategory', 'quantity', 'link', 'status', 'stock', 'tax', 'fee']);


/**
 * Creates a new product in the database with the specified properties in the request body.
 *
 * @param {Object} req - The request object containing the properties for the new product{name,thumbnails[],desc,price,from,whereToBuy,develeryTime,category,subCategory}.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} acknowledgement: true
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const addProduct = ({ db, imageUp }) => async (req, res) => {

  try {
    if (req.files) {
      req.body = JSON.parse(req.body.data || '{}');
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
    const whereToBuy = new URL(req.body.link).hostname.replace(/^www\./, '');
    db.create({ table: Product, key: { ...req.body, whereToBuy } })
      .then(async product => {
        if (!product) {
          return res.status(400).send('Something Wents Wrong');
        }
        const data = await db.save(product);
        res.status(200).send(data);
      })
      .catch(({ message }) => res.status(400).send({ message }));


  }
  catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};


/**
 * This function is used to get all products.
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} acknowledgement: true
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const getProducts = ({ db }) => async (req, res) => {

  try {


    db.find({ table: Product, key: { query: req.query, allowedQuery: allowedQuery, paginate: req.query.paginate === 'true', populate:{ path: 'category'} } })
      .then(async product => {
        if (!product) {
          return res.status(400).send( 'Something Wents Wrong');
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
/**
 * This function is used to get a single product details.
 *
 * @param {Object} req - The request object containing the properties for the new product{name,thumbnails[],desc,price,from,whereToBuy,develeryTime,category,subCategory}.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} acknowledgement: true
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const getSingleProduct = ({ db }) => async (req, res) => {

  try {

    db.findOne({ table: Product, key: { id: req.params.id } })
      .then(async (product) => {
        if (!product) {
          return res.status(400).send('Product not found');
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

/**
 * This function is used to update a specific product details.
 *
 * @param {Object} req - The request object containing the properties for the new product{name,thumbnails[],desc,price,from,whereToBuy,develeryTime,category,subCategory}.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} acknowledgement: true
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const updateProduct = ({ db, imageUp }) => async (req, res) => {

  try {
    if (req.files) {
      req.body = JSON.parse(req.body.data || '{}');
      if (req.files.thumbnails.length > 1) {
        for (let thumb of req.files.thumbnails) {
          req.body.thumbnails = [...req.body.thumbnails || [], (await imageUp(thumb.path))];
        }
      } else {
        req.body.thumbnails = [await imageUp(req.files.thumbnails.path)];
      }

    }

    const valid = Object.keys(req.body).every((k) => ownUpdateAllowed.has(k));
    if (!valid) return res.status(400).send('Bad request');
    db.findOne({ table: Product, key: { id: req.params.id } })
      .then(async product => {
        if (!product) {
          return res.status(400).send('Something Wents Wrong');
        }
        Object.keys(req.body).forEach((k) => (product[k] = req.body[k]));
        await db.save(product);
        res.status(200).send({ acknowledgment: true });
      })
      .catch(({ message }) => res.status(400).send({ message }));

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');

  }

};

/**
 * This function is used to delete a single product
 *
 * @param {Object} req - The request object containing the properties for the new product{name,thumbnails[],desc,price,from,whereToBuy,develeryTime,category,subCategory}.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} acknowledgement: true
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const deleteProduct = ({ db }) => async (req, res) => {
  try {
    const product = await db.remove({ table: Product, key: { id: req.params.id } });
    if (!product) return res.status(400).send({ error: true, message: 'Product not found' });
    res.status(200).send({ error: true, message: 'Product deleted successfully' });
  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};
