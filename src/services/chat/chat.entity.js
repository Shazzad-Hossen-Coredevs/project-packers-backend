import Chat from './chat.schema';
import Support from '../support/support.schema';

const allowedQuery = new Set(['paginate', 'limit', 'page']);

export const sendMessage = ({ db,ws }) => async (req, res) => {
  try {
    if (!req.body.id || !req.body.message) return res.status(400).send(' Invalid request body object');
    const support = await db.findOne({ table: Support, key: { id: req.body.id } });
    if (!support) res.status(400).send('Something wents wrong');

    if (!(req.user.role === 'user' && (req.user.id === support.sender.toString() || req.user.id === support.staff.toString()))) {
      return res.status(400).send('You can not send message to this conversation');
    }

    const chat = await db.create({ table: Chat, key: { support: req.body.id, sender: req.user.id, message: req.body.message } });
    if (!chat) return res.status(400).send('Something wents wrong');
    res.status(200).send(chat);

    ws.to(req.body.id).emit('supportChat', chat);





  } catch (error) {
    console.log(error);
    res.status(500).send('Something wents wrong');

  }
};

export const getChats = ({ db }) => async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).send(' Id missing in request params');
    const chats = await db.find({ table: Chat, key: { support: req.params.id, query: req.query, allowedQuery: allowedQuery, paginate: req.query.paginate === 'true', populate: { path: 'sender', select: 'id name'} } });
    if (!chats) return res.status(400).send('Something wents wrong');
    res.status(200).send(chats);


  } catch (error) {
    console.log(error);
    res.status(500).send('Something wents wrong');

  }
};