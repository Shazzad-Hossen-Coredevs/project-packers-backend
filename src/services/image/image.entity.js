const path = require('path');
/**
 * This function is used serve an image.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
*/
export const serveImage = () => async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).send({ error: true, message: 'Image id missing in params' });
    const imagePath = path.join(path.resolve(), 'images', req.params.id);
    res.status(200).sendFile(imagePath);


  } catch (error) {
    console.log(error);
    res.status(500).send('Something wents wrong');

  }

};