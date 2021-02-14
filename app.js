require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const nodemailer = require('nodemailer');
const session = require('express-session');
const htmlEncode = require('html-entities');

const log = console.log;
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({
  secret: 'secret', // change value
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false
}));

// body parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.route('/')
  .get((req, res) => {
    res.render('index');
  })

  .post((req, res) => {
    const Data = `
      <p>You have a new contact request</p>
      <h3>Contact Details</h3>

      <ul>
        <li>Name: ${htmlEncode.encode('< > " \' & © ∆'), req.body.fullName}</li>
        <li>Email: ${htmlEncode.encode('< > " \' & © ∆'), req.body.email}</li>
        <li>Phone: ${htmlEncode.encode('< > " \' & © ∆'), req.body.phone}</li>
      </ul>

      <h3>Message</h3>
      <p>${htmlEncode.encode('< > " \' & © ∆') ,req.body.message}</p>
    `;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.PASS
      }
    });

    function sendEmail(mail) {
      let mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: process.env.TO,
        subject: 'a new contact has been sent to you.',
        html: mail
      }
      transporter.sendMail(mailOptions, (err, info) => {
        if (!err) {
          log('Email sent: ' + info.response);
        } else {
          log(err);
        }
      });
    }

    sendEmail(Data);
    res.redirect('/');
  });

  let port = process.env.PORT;
  if(port == null || port == ''){
    port = 3000;
  }

app.listen(port, () => {
  log('Server is running successfully on PORT 3000.')
});

