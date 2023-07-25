const ejs = require('ejs');
const path = require('path');



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