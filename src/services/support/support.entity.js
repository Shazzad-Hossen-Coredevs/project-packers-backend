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
    const data = {
      chats: [{ user: req.user.id, message: req.body.message }],
      sender: req.user.id,
    };
    delete req.body.message;
    const chat = await db.create({ table: Support, key: { ...data, ...req.body } });
    if (!chat) return res.status(400).send('Something wents wrong');
    ws.emit('newChat', 'I have a query');
    res.send(chat);

  }
  catch (e) {
    console.log(e);
    res.status(500).send('Something went wrong.');
  }
};

