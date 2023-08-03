import Notification from '../notification/notification.schema';

export const myNotification = ({ db }) => async (req, res) => {
  try {
    const notifications = await db.find({ table: Notification, key: { user: req.user.id } });
    if (!notifications) return res.status(400).send('Something wents wrong');

    res.status(200).send(notifications);

  } catch (error) {
    console.log(error);
    res.status(500).send('Something wents wrong');

  }
};