import { generateMail } from '../../controllers/email/template/generateMail';

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