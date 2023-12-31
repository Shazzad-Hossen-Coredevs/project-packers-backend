import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './user.schema';
import Product from '../product/product.schema';





/**
 * these are the set to validate the request body or query.
 */
const createAllowed = new Set(['name', 'email', 'password', 'phone', 'role', 'avatar', 'shippingAddress', 'fbId']);
const allowedQuery = new Set(['name', 'page', 'limit', 'id', 'paginate', 'role', 'sortBy', 'search']);
const ownUpdateAllowed = new Set(['name', 'phone', 'email', 'password']);

/**
 * Creates a new user in the database with the specified properties in the request body.
 * The 'role' property is automatically set to 'user', and the 'password' property is hashed using bcrypt.
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The created user object, including the JWT token.
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const register = ({ db }) => async (req, res) => {

  try {
    req.body.role = 'user';
    const valid = Object.keys(req.body).every(k => createAllowed.has(k));
    if (!valid) return res.status(400).send('Bad request');
    req.body.password = await bcrypt.hash(req.body.password, 8);
    const user = await db.create({ table: User, key: { ...req.body } });
    if (!user) {
      return res.status(400).send('Email Already Exist');
    }
    await db.save(user);
    res.status(200).send(user);



  }
  catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};



/**
 * This function is used for login a user.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const login = ({ db, settings, ws }) => async (req, res) => {


  try {
    if (!req.body.email || !req.body.password) return res.status(400).send('Bad requests');
    const user = await db.findOne({ table: User, key: { email: req.body.email, populate: { path: 'cart.product' } } });
    if (!user) return res.status(401).send('No user exist with this email');
    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) return res.status(401).send('Invalid password');
    const token = jwt.sign({ id: user.id }, settings.secret);
    res.cookie(settings.secret, token, {
      httpOnly: true,
      ...settings.useHTTP2 && {
        sameSite: 'None',
        secure: true,
      },
      ...!req.body.rememberMe && { expires: new Date(Date.now() + 172800000/*2 days*/) },
    });
    ws.emit('ss', 'Your order successfully placed');
    res.status(200).send(user);
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};
/**
 * This function is used for generate otp.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns encrypted token as success response and otp on the mail. Otherwise it will through an error.
 */
export const generateOtp = ({ db, settings, mail }) => async (req, res) => {



  try {

    const user = await db.findOne({ table: User, key: { email: req.body.email} });
    if (!user) return res.status(400).send('Email not found');

    const otp = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    if (req.body.email) {
      const token = jwt.sign(
        {
          otp: otp,
          time: new Date(),
        },
        settings.secret
      );


      await mail({
        receiver: req.body.email,
        subject: 'Project Packers - Password Reset OTP',
        body: otp,
        type: 'text',
      });
      res.status(200).send({ token: token });


    }
    else {
      res.status(400).send({ error: true, message: 'Something wents wrong' });
    }




  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};
/**
 * This function is used to verify otp.
 * @param {Object} req This is the request object.In request body it will receive object {otp, token}
 * @param {Object} res this is the response object
 * @returns It returns the encrypted token as success response. Otherwise it will through an error.
 */
export const verifyOtp = ({ settings }) => async (req, res) => {



  try {
    console.log(req.body);
    const data = await jwt.verify(req.body.token, settings.secret);
    if (data.otp === req.body.otp) {
      const timeDifference = Math.abs((new Date()) - (new Date(data.time)));
      if (!(timeDifference > 300000)) {
        const token = jwt.sign({ otp: req.body.otp, time: new Date() }, settings.secret);
        res.status(200).send({ token });
      }
      else {
        res.status(400).send({ error: true, message: 'Verification time out' });
      }

    }
    else res.status(400).send({ error: true, message: 'Invalid Otp' });

  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};


/**
 * This function is used for reset password.
 * @param {Object} req This is the request object{otp, email, token, password}.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const resetPassword = ({ db, settings }) => async (req, res) => {
  try {
    if (req.body.password && req.body.email && req.body.token) {
      const data = jwt.verify(req.body.token, settings.secret);
      const timeDifference = Math.abs(new Date() - new Date(data.time));
      if (timeDifference > timeDifference) {
        return res.status(400).send({ error: true, message: 'Request time out' });
      }
      else if (data.otp !== req.body.otp) {
        return res.status(400).send({ error: true, message: 'Unauthorized Access' });
      }
      const user = await db.findOne({ table: User, key: { email: req.body.email } });
      user.password = await bcrypt.hash(req.body.password, 8);
      const result = await db.save(user);
      if (result)
        res.status(200).send({ acknowledgement: true, message: 'Password reset Successfull' });
      else res.status(400).send({ error: true, message: 'Operation unsuccessfull' });

    }
    else {
      res.status(400).send({ error: true, message: 'Bad Request' });
    }

  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};




/**
 * This function is used for load a user profile from request header.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const me = () => async (req, res) => {
  try {
    res.status(200).send(req.user);
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};


/**
 * This function is used for logout a user.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const logout = ({ settings }) => async (req, res) => {
  try {
    res.clearCookie(settings.secret, {
      httpOnly: true,
      ...settings.useHTTP2 && {
        sameSite: 'None',
        secure: true,
      },
      expires: new Date(Date.now())
    });
    return res.status(200).send('Logout successful');
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};


/**
 * This function is used get all users in the database by query.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns a object, that contains resulted data and other information like page, limit.
 */
export const getAll = ({ db }) => async (req, res) => {
  try {
    const users = await db.find({ table: User, key: { query: req.query, allowedQuery: allowedQuery, paginate: req.query.paginate === 'true' } });
    res.status(200).send(users);
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};


/**
 * This function is used to find a user by id.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data of the id otherwise no result found with status 404 .
 */
export const userProfile = ({ db }) => async (req, res) => {
  try {
    const user = await db.findOne({ table: User, key: { id: req.params.id, populate: { path: 'role', select: 'name department' } } });
    if (!user) return res.status(404).send('No result found');
    res.status(200).send(user);
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};


const setPassword = async ({ oldPass, newPass, user }) => {
  if (!oldPass || !newPass) throw ({ status: 400, reason: 'bad request' });
  const isValid = await bcrypt.compare(oldPass, user.password);
  if (!isValid) throw ({ status: 401, reason: 'Invalid old Password' });
  return await bcrypt.hash(newPass, 8);
};

/**
 * This function is used to update user own profile.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the updated data.
 */
export const updateOwn = ({ db }) => async (req, res) => {

  try {

    const isValid = Object.keys(req.body).every(k => ownUpdateAllowed.has(k));
    if (!isValid) return res.status(400).send('Bad request');
    if (req.body.password) {
      req.body.password = await setPassword({ oldPass: req.body.password.old, newPass: req.body.password.new, user: req.user });
    }
    Object.keys(req.body).forEach(k => (req.user[k] = req.body[k]));
    await db.save(req.user);
    res.status(200).send(req.user);

  }
  catch (err) {
    console.log(err);
    res.status(err.status || 500).send(err.reason || 'Something went wrong');
  }
};


/**
 * This function is used update a user by admin, admin can update without only password and notifySubs.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the updated data.
 */
export const updateUser = ({ db, imageUp }) => async (req, res) => {
  try {
    req.body = JSON.parse(req.body.data || '{}');
    if (req.files?.avatar?.path) {
      req.body.avatar = await imageUp(req.files?.avatar.path);
    }
    const user = await db.findOne({ table: User, key: { id: req.params.id } });
    if (!user) return res.status(400).send('Bad request');
    if (req.body.password) req.body.password = await bcrypt.hash(req.body.password, 8);
    Object.keys(req.body).forEach(k => (user[k] = req.body[k]));
    await db.save(user);
    res.status(200).send(user);
  }
  catch (err) {
    console.log(err);
    res.status(err.status || 500).send(err.reason || 'Something went wrong');
  }
};

/**
 * This function is used to delete a user from database
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const remove = ({ db }) => async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.remove({ table: User, key: { id } });
    if (!user) return res.status(404).send({ messae: 'User not found' });
    res.status(200).send({ message: 'Deleted Successfully' });
  }
  catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
};
/**
 * This function is used to add item to cart of an user collection.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the updated data.
 */
export const addTocart = ({ db }) => async (req, res) => {
  try {
    const product = await db.findOne({ table: Product, key: { id: req.body.productId } });
    if (!product) return res.status(400).send('Product not Found');
    const cartItem = req.user.cart.find(item => item.product.equals(req.body.productId,));
    if (cartItem) {
      cartItem.quantity += req.body.quantity;
    } else {
      req.user.cart.push({ product: req.body.productId, quantity: req.body.quantity });
    }
    db.save(req.user);
    await db.populate(req.user, { path: 'cart.product' });
    res.status(200).send(req.user);

  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};
/**
 * This function is used to Update cart item of an user collection.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the updated data.
 */
export const updateCart = ({ db }) => async (req, res) => {

  try {


    req.user.cart = [];
    req.body.cart.forEach(item => {

      if (item.quantity > 0) {
        req.user.cart.push({ product: item?.product?.id, quantity: item.quantity });
      }

    });
    console.log(req.user.cart);
    await db.save(req.user);
    await db.populate(req.user, { path: 'cart.product' });
    res.status(200).send(req.user);


  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Something went wrong' });
  }

};
/**
 * This function is used to Create a Stuff
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the updated data.
 */
export const addStaff = ({ db }) => async (req, res) => {
  try {
    req.body.password = await bcrypt.hash('Coredevs#1234', 8);
    const staff = await db.create({ table: User, key: { ...req.body } });
    if (!staff) return res.status(400).send({ error: true, message: 'Staff creation unsuccessfull' });
    res.status(200).send(staff);

  } catch (error) {
    console.log(error);
    res.status(500).send('Something wents wrong');

  }
};
/**
 * This function is used to Update staff information
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the updated data.
 */
export const updateStaff = ({ db }) => async (req, res) => {
  try {
    const data =await db.findOne({ table: User, key: { id:req.body.id ,body: req.body} });
    if (!data) return res.status(400).send({ error: true, message: 'Operation failed' });
    if (req.body.access) {
      data.access = req.body.access;

    }
    if (req.body.role) {
      if (req.user.role === 'admin' && ((data.role === 'admin' || data.role === 'super-admin') || (req.body.role === 'admin' || req.body.role === 'super-admin'))) {
        db.save(data);
        return res.status(400).send({ error: true, message: 'You do not have permission to set this role to this user' });
      }
      data.role = req.body.role;
      const result = await db.save(data);
      res.status(200).send(result);
    }
    else {
      const result = await db.save(data);
      res.status(200).send(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('something wents wrong');

  }
};

/**
 * This function is used for social login
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the updated data.
 */
export const socialData = ({settings}) => async (req, res) => {
  try {
    const token = jwt.sign({ id: req.user.id }, settings.secret);
    res.cookie(settings.secret, token, {
      httpOnly: true,
      ...settings.useHTTP2 && {
        sameSite: 'None',
        secure: true,
      },
      ...!req.body.rememberMe && { expires: new Date(Date.now() + 172800000/*2 days*/) },
    });
    res.status(200).send(req.user);
  } catch (error) {
    console.log(error);
    res.status(500).send('something wents wrong');
  }
};

export const chatwithUser = (event) => {
  console.log(event);

};