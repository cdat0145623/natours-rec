const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  //defined user, url
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    // this.from = `Quoc Dat <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //1) Render HTML based on pug template
    const html = pug.renderFile(`starter/public/views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    //quocdat@mailsac.com
    //2) Define email option

    const mailOptions = {
      from: process.env.SENDGRID_EMAIL_FROM,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    //3) Create the transport and send mail
    // this.newTransport();
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natous Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};

// const sendEmail = async(options) => {
//     //1) Create a transporter
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD
//         }

//     })

//     //2) Define the email option
//     const mailOptions = {
//         from: 'Quoc Dat <user@gmail.com',
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//         //html:
//     }

//     //3) Actually send email
//     await transporter.sendMail(mailOptions);
// };
