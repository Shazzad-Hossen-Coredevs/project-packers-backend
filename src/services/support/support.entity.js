import Support from './support.schema';
/**
 * Creates a new user in the database with the specified properties in the request body.
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
    const data = {
      chats: [{ user: req.user.id, message: req.body.message }],
      sender: req.user.id,
    };
    req.body.message;
    const chat = await db.create({ table: Support, key: { ...data, ...req.body, populate: { path: 'chats.user', select: 'id name'} } });
    if (!chat) return res.status(400).send('Something wents wrong');
    res.send(chat);

    ws.to('supportRoom').emit('newChat', chat);



  }
  catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};




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

export const addMsg = ({ db, ws }) => async (req, res) => {
  try {
    const { id, message } = req.body;
    if (!id || !message) return res.status(400).send(' Missing id and message in body');
    const chat = await db.findOne({ table: Support, key: { id: id } });
    if (!chat) return res.status(400).send('Somethiung wents wrong');
    chat.chats.unshift({
      user: req.user.id,
      message: message,
    });
    const result = await db.save(chat);
    res.status(200).send(result);
    ws.to(result.id).emit('supportChat',result);

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};




export const getAll = ({ db }) => async (req, res) => {
  try {
    const chats = await db.find({ table: Support, key:{ populate:{ path:'chats.user', select:' id name' }} });
    if (!chats) return res.status(400).send('Something wents wrong');
    res.status(200).send(chats);

  } catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};

export const joinRoom = async ({ data, session }) => {
  try {
    session['join'](data);
    console.log('A user connected to room => ', data);

  } catch (error) {
    console.log(error);

  }

};
export const leaveRoom = async ({ data, session }) => {
  try {
    session['leave'](data);

  } catch (error) {
    console.log(error);

  }

};