const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const PORT = process.env.PORT || 5000;

const app = express();

mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));

app.use(cors({ origin: process.env.CLIENT_SERVER, credentials: true }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(session({
//   secret: process.env.EXPRESS_SECRET,
//   saveUninitialized: true,
//   // 24 hours
//   cookie: { maxAge: 1000 * 60 * 60 * 24 },
//   resave: false,
// }));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const setCache = function (req, res, next) {
  res.set('Cache-control', 'no-store');
  next();
};

app.use(setCache);

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, './public') });
});

app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged In' : 'Logged Out');
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(process.env.CLIENT_SERVER);
  console.log('App listening on port ', PORT);
});
module.exports = app;
