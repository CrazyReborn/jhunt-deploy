/* eslint-disable no-underscore-dangle */
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const async = require('async');
const Offer = require('../models/offer');
const Application = require('../models/application');
const Interviews = require('../models/interview');
const User = require('../models/user');

const verifyToken = (req, res, next) => {
  const { cookies } = req;
  if ('token' in cookies) {
    next();
  } else {
    res.sendStatus(403);
  }
};

exports.user_get = [
  verifyToken,
  (req, res) => {
    const { cookies } = req;
    let user = {};
    jwt.verify(cookies.token, 'secretKey', (err, authData) => {
      if (err) {
        res.json({ err });
      } else {
        user = authData.user;
      }
    });
    async.parallel({
      applications(callback) {
        Application.find({ user: user._id }, callback);
      },
      interviews(callback) {
        Interviews.find({ user: user._id }, callback);
      },
      offers(callback) {
        Offer.find({ user: user._id }, callback);
      },
    })
      .then((results) => {
        res.json({
          interviews: results.interviews,
          applications: results.applications,
          offers: results.offers,
        });
      })
      .catch((err) => {
        res.json({ err });
      });
  },
];

exports.signin_get = [
  verifyToken,
  (req, res) => {
    const { cookies } = req;
    jwt.verify(cookies.token, 'secretKey', (err) => {
      if (err) {
        res.json({ msg: err });
      } else {
        res.json({ msg: 'ok' });
      }
    });
  },
];

// signin_post here
exports.signin_post = [
  body('username', 'Username field should not be empty').trim().isLength({ min: 1 }).escape(),
  body('password', 'Password field should not be empty').isLength({ min: 1 }).escape(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ err: errors });
    } else {
      User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
          res.json({ err });
        } else if (user === null) {
          const userErr = [{
            value: '',
            msg: 'Username not found',
            param: 'username',
            location: 'body',
          }];
          res.json({ err: { errors: userErr } });
        } else {
          bcrypt.compare(req.body.password, user.password, (compareErr, result) => {
            if (result) {
              const token = jwt.sign({ user }, 'secretKey');
              res.cookie('token', token, {
                httpOnly: true,
                expires: 0,
              }).json({ msg: 'success' });
            } else {
              const passwordErr = [{
                value: '',
                msg: 'Wrong password',
                param: 'password',
                location: 'body',
              }];
              res.json({ err: { errors: passwordErr } });
            }
          });
        }
      });
    }
  },
];

exports.signup_get = (req, res) => {
  res.json({ msg: 'success' });
};

exports.signup_post = [
  body('username', 'Username field should not be empty').trim().isLength({ min: 1 }).escape(),
  body('password', 'Password field should not be empty').isLength({ min: 1 }).escape(),
  body('confirmPassword', 'Confirm password field should not be empty').trim().isLength({ min: 1 }).escape()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ err: errors });
    } else {
      User.findOne({ username: req.body.username }, (errorExUs, existingUser) => {
        if (errorExUs) {
          res.json({ err: errorExUs });
        }
        if (existingUser != null) {
          const duplicateErr = [{
            value: '',
            msg: 'This username already exists.',
            param: 'username',
            location: 'body',
          }];
          res.json({ err: { errors: duplicateErr } });
        } else {
          bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            if (err) {
              res.json({ err });
            } else {
              const user = new User({
                username: req.body.username,
                password: hashedPassword,
                joined: Date.now(),
              });
              user.save((savingErr) => {
                if (err) {
                  res.json({ err: savingErr });
                } else {
                  res.json({ msg: 'success' });
                }
              });
            }
          });
        }
      });
    }
  },
];

exports.logout_post = (req, res) => {
  res.clearCookie('token').json({ msg: 'success' });
};
