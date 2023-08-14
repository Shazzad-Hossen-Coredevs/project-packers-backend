import Notification from '../notification/notification.schema';
const allowedQuery = new Set(['page', 'limit', 'paginate']);

export const myNotification = ({ db }) => async (req, res) => {
  try {
    const notifications = await db.find({ table: Notification, key: { user: req.user.id, query: req.query, allowedQuery: allowedQuery, paginate: req.query.paginate === 'true' } });
    if (!notifications) return res.status(400).send('Something wents wrong');

    res.status(200).send(notifications);

  } catch (error) {
    console.log(error);
    res.status(500).send('Something wents wrong');

  }
};


export const notify = async ({ db, ws, room, data }) => {

  const notification = await db.create({
    table: Notification, key: { ...data , }
  });

  if (notification) ws.to(room).emit('notification', notification);
  return;
};