const ejs = require('ejs');
const path = require('path');



export const generateMail = async (data, template) => {

  try {
    const baseUrl = 'http://localhost:4000';
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentDate = new Date();
    const date = `${currentDate.getDate()} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear() }`;
    const templatePath = path.join(__dirname, template);


    const html = await ejs.renderFile(templatePath, { ...data, date, baseUrl });
    return html;


  } catch (err) {
    console.error('Error generating email content:', err);
    throw err;
  }

};