/* eslint-disable no-underscore-dangle */
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const jwt = require('jsonwebtoken');
const Interview = require('../models/interview');
const Application = require('../models/application');

const verifyToken = (req, res, next) => {
  const { cookies } = req;
  if ('token' in cookies) {
    next();
  } else {
    res.sendStatus(403);
  }
};

exports.interviews_get = [
  verifyToken,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ err: errors });
    } else {
      const { cookies } = req;
      jwt.verify(cookies.token, 'secretKey', (err, authData) => {
        if (err) {
          res.json({ err });
        } else {
          const { user } = authData;
          Interview.find({ user: user._id }).populate('application').exec((findingErr, interviews) => {
            if (err) {
              res.json({ err: findingErr });
            } else {
              res.json({ interviews });
            }
          });
        }
      });
    }
  },
];

exports.interviews_post = [
  body('date', 'Date field should not be empty').trim().isLength({ min: 1 }).escape(),
  verifyToken,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ err: errors });
    } else {
      const { cookies } = req;
      let user;
      const sanitizedLength = req.body.length;
      const sanitizeRate = req.body.rate;
      jwt.verify(cookies.token, 'secretKey', (tokenErr, authData) => {
        if (tokenErr) {
          res.json({ err: tokenErr });
        } else {
          user = authData.user;
        }
      });
      const interview = new Interview({
        user: user._id,
        date: req.body.date,
        application: req.body.application,
        length: sanitizedLength,
        status: req.body.status,
        rate: sanitizeRate,
      });
      interview.save()
        .catch((err) => res.json({ err }));
      Application.updateOne({ user: user._id }, { $push: { interviews: interview } })
        .then(() => res.json({ msg: 'successs' }))
        .catch((err) => res.json({ err }));
    }
  },
];

exports.inteview_get = [
  verifyToken,
  (req, res) => {
    const { cookies } = req;
    jwt.verify(cookies.token, 'secretKey', (tokenErr) => {
      if (tokenErr) {
        res.json({ err: tokenErr });
      } else {
        Interview.findById(req.params.id).populate('application')
          .then((interview) => res.json({ interview }))
          .catch((err) => res.json({ err }));
      }
    });
  },
];

exports.interview_put = [
  verifyToken,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ err: errors });
    } else {
      const { cookies } = req;
      let user;
      jwt.verify(cookies.token, 'secretKey', (tokenErr, authData) => {
        if (tokenErr) {
          res.json({ err: tokenErr });
        } else {
          user = authData.user;
        }
      });
      const interview = new Interview({
        _id: req.params.id,
        user: user._id,
        date: req.body.date,
        application: req.body.application,
        length: req.body.length,
        status: req.body.status,
        rate: req.body.rate,
      });
      Interview.findByIdAndUpdate(req.params.id, interview)
        .then(() => res.json({ msg: 'success' }))
        .catch((err) => res.json({ err }));
    }
  },
];

exports.interview_delete = [
  verifyToken,
  (req, res) => {
    const { cookies } = req;
    let user;
    jwt.verify(cookies.token, 'secretKey', (err, authData) => {
      if (err) {
        res.json({ err });
      } else {
        user = authData.user;
      }
    });
    Interview.findByIdAndRemove(req.params.id)
      .catch((err) => res.json({ err }));
    Application.updateMany({ user: user._id }, { $pull: { interviews: req.params.id } })
      .then(() => res.json({ msg: 'seccess' }))
      .catch((err) => res.json({ err }));
  },
];
