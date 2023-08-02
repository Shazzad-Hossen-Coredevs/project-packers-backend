import moment from 'moment';
import { generateMail } from '../../controllers/email/template/generateMail';
import Order from '../order/order.schema';

export const demoget = () => (req, res) => {
  try {
    // do what you used to do in the previous way.
    res.status(200).send('Yo yo');
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Don"t connect with me');
  }
};
export const demoMail = ({mail}) => async (req, res) => {
  const dynamicData = {
    subject: 'Your Order Summary',
    name: 'John Doe',
    cartItems: [
      {
        image: 'item1.jpg',
        name: 'Item 1',
        quantity: 2,
        price: '$10.00'
      },
      {
        image: 'item2.jpg',
        name: 'Item 2',
        quantity: 1,
        price: '$25.00'
      }
    // Add more cart items here as needed
    ]
  };
  const htmlContent = await generateMail(dynamicData);
  await mail({
    receiver:'shazzad.srv@gmail.com',
    subject:'Project Packers -Orde confirmatiuon',
    body:htmlContent,
    type:'html',
  });


};

export const demoGraph = ({ db }) => async (req, res) => {
  try {
    const data = await db.find({ table: Order });
    data.docs.forEach(o => {
      const date = new Date(o.createdAt).toLocaleString();
      console.log(date);
      console.log(new Date(o.createdAt).getHours());
    });

  } catch (error) {
    console.log(error);
    res.status(500).send('Something wents wrong');

  }
}