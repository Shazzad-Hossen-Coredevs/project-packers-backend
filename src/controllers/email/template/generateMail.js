const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

export const imgConverter = (filePath) => {
  try {
    const image = fs.readFileSync(filePath);
    const base64Image = Buffer.from(image).toString('base64');
    const mimeType = path.extname(filePath).replace('.', '');

    return `data:image/${mimeType};base64,${base64Image}`;
  } catch (error) {
    console.error('Error converting image to Base64:', error);
    return null;
  }
};

export const generateMail = async (data) => {
  try {
    const templatePath = path.join(__dirname, 'emailTemplate.ejs');
    const html = await ejs.renderFile(templatePath, { name: 'Shazzad Hossen',});
    return html;


  } catch (err) {
    console.error('Error generating email content:', err);
    throw err;
  }

};