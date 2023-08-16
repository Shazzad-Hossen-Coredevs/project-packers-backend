import Category from '../category/category.schema';
/**
 * This function is use to create a new Category.
 *
 * @param {Object} req - The request object contains the category name.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The created user object, including the JWT token.
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const addCategory = ({ db }) => async (req, res) => {

  try {
    const result =  await db.create({ table: Category, key: { ...req.body } });
    if (!result) return res.status(400).send('Category Already exist');
    res.status(200).send(result);
  }
  catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};
/**
 * This function is use to get all Categories.
 *
 * @param {Object} req - This is the request object.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} TAll categories created before . Otherwise send error message.
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const getCategories = ({ db }) => async (req, res) => {
  try {
    const result = await db.find({ table: Category });
    if (!result) return res.status(400).send({ error: true, message: 'Something wents wrong' });
    res.status(200).send(result);

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};

/**
 * This function is use to add Sub Categories.
 *
 * @param {Object} req - This is the request object.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} TAll categories created before . Otherwise send error message.
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const addSubcategory = ({ db }) => async (req, res) => {
  try {
    const category = await db.findOne({ table: Category, key: { id: req.body.id } });
    if (!category) return res.status(400).send('Category not found');
    const isSub = category.subCategory.find(elem => elem.name === req.body.name);
    const isSlug = category.subCategory.find(elem => elem.slug === req.body.slug);
    if (isSub || isSlug) return res.status(400).send('Sub-categorie already exist');
    category.subCategory.push({ name: req.body.name, slug: req.body.slug });
    const result = await db.save(category);
    res.status(200).send(result);


  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};
/**
 * This function is use to delete a category.
 *
 * @param {Object} req - This is the request object.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} TAll categories created before . Otherwise send error message.
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const deletecategory = ({ db }) => async (req, res) => {
  try {
    const result = await db.remove({ table: Category, key: { id: req.params.id } });
    if (!result) return res.status(400).send({ error: true, message: 'Category does not exist' });
    res.status(200).send({ acknowledgement: true, message: 'Category successfully deleted' });

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};

/**
 * This function is use to delete a Sub category.
 *
 * @param {Object} req - This is the request object.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} TAll categories created before . Otherwise send error message.
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const deleteSubcategory = ({ db }) => async (req, res) => {
  try {
    if (!req.params.id || !req.body.name) return res.status(400).send({ error: true, message: 'missing id in params or name in body' });
    const category = await db.findOne({ table: Category, key: { id: req.params.id } });
    const subCat = category.subCategory.filter(elem => elem.name !== req.body.name);
    category.subCategory = subCat;
    db.save(category);
    res.status(200).send({ acknowledgement: true, message: 'Category successfully deleted', data:category });

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};

