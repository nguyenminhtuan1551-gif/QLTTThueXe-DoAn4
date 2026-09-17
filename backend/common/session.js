const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();

module.exports = session({
  name: process.env.SESSION_NAME || 'car_rental.sid',
  secret: process.env.SESSION_SECRET || 'car-rental-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: String(process.env.SESSION_SECURE || 'false') === 'true',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});
