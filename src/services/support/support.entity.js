import Support from './support.schema';

const createAllowed = new Set(['type', 'order', 'sender', 'message']);

/**
 * Creates a new support chat request.
 * The 'role' property is automatically set to 'user', and the 'password' property is hashed using bcrypt.
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The created user object, including the JWT token.
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
*/
export const createChat = ({ db, ws }) => async (req, res) => {

  try {

    //db.removeAll({ table: Support });
    req.body.sender = req.user;
    const valid = Object.keys(req.body).every(k => createAllowed.has(k));
    if (!valid) return res.status(400).send('Invalid body object');
    const chat = await db.create({ table: Support, key: { ...req.body, populate: { path: 'sender', select: ' id name avatar' } } });
    if (!chat) return res.status(400).send('Something wents wrong');
    res.status(200).send(chat);
    ws.to('supportRoom').emit('newChat', chat);


  }
  catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};


/**
 * This function is used for accepting a support chat.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */

export const acceptChat = ({ db }) => async (req, res) => {
  try {

    if (!req.params.id) return res.status(400).send('Chat id missing in params');
    const chat = await db.findOne({ table: Support, key: { id: req.params.id } });
    if (!chat) return res.status(400).send('Something wents wrong');
    chat.staff = req.user.id;
    chat.status = 'open';
    const result = await db.save(chat);
    res.status(200).send(result);


  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};


/**
 * This function is used to  get all support chat list.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const getAll = ({ db }) => async (req, res) => {
  try {
    const chats = await db.find({ table: Support });
    if (!chats) return res.status(400).send('Something wents wrong');
    res.status(200).send(chats);

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};

//used for joining a room
export const joinRoom = async ({ data, session }) => {
  try {
    session['join'](data);
    console.log('A user connected to room => ', data);

  } catch (error) {
    console.log(error);

  }

};

//Used for leave from a room
export const leaveRoom = async ({ data, session }) => {
  try {
    session['leave'](data);

  } catch (error) {
    console.log(error);

  }

};