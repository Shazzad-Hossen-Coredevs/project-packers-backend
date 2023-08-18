import Discount from './discount.schema';
/**
 * This function is used to create a new discount Coupon.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const createDiscount = ({ db }) => async (req, res) => {
  try {
    const result = await db.create({ table: Discount, key: { ...req.body , populate: { path: 'category'} } });
    if (!result) return res.status(400).send('Discount Code already exists.Try new code' );
    res.status(200).send(result);
  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};

/**
 * This function is used to check if discount is valid for a user or not.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const checkValidity = ({ db }) => async (req, res) => {
  try {

    const result = await db.findOne({
      table: Discount,
      key: { code: req.body.code },
    });
    if (!result)
      return res.status(400).send('Invalid discount code');
    if ((result.expiresIn - new Date()) < 0)
      return res.status(400).send('Discount code is already expired');
    const isFound = result.user.find((user) => user.id === req.user.id);
    if (isFound)
      return res.status(400).send('You already applied this discount code before');
    result.limit -= 1;
    db.save(result);
    res.status(200).send(result);



  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};
/**
 * This function is used to fetch discount list.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const getDiscountlist = ({ db }) => async (req, res) => {
  try {
    const result =await  db.find({ table: Discount });
    if (!result)
      return res.status(400).send({ error: true, message: 'Something wents wrong' });
    res.status(200).send(result);

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};
/**
 * This function is used to delete a list of discount coupone record.
 * @param {Object} req This is the request object {codes:['shazad500']}.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const delDiscountcodes = ({ db }) => async (req, res) => {
  try {
    if (!req.body.codes)
      return res.status(400).send({ error: true, message: 'codes array is missing in body object' });
    const result = await db.removeAll({ table: Discount, key: { _id: { $in: req.body.codes } } });
    if (!result)
      return res.status(400).send({ error: true, message: 'Something wents wrong' });
    res.status(200).send(result);

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }

};