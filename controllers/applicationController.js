/* eslint-disable no-underscore-dangle */
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Application = require('../models/application');

const verifyToken = (req, res, next) => {
  const { cookies } = req;
  if ('token' in cookies) {
    next();
  } else {
    res.sendStatus(403);
  }
};

exports.applications_get = [
  verifyToken,
  (req, res) => {
    const { cookies } = req;
    jwt.verify(cookies.token, 'secretKey', (errors, authData) => {
      if (errors) {
        res.json({ err: [errors] });
      } else {
        const { user } = authData;
        let averagesAll = {};
        Application.aggregate([{ $group: { _id: null, avg: { $avg: '$salary' } } }])
          .then((found) => {
            averagesAll = found;
          })
          .catch((userErr) => console.log(userErr));
        Application.find({ user: user._id })
          .then((applications) => res.json({ applications, averagesAll }))
          .catch((userErr) => res.json({ err: [userErr] }));
      }
    });
  },
];

exports.applications_post = [
  //  Maybe exclude validation and leave only sanitization;
  body('companyName', 'Company name field should not be empty').trim().isLength({ min: 1 }).escape(),
  body('position', 'Position should field not be empty').trim().isLength({ min: 1 }).escape(),
  body('salary', 'Salary field should not be empty').trim().isLength({ min: 1 }).escape(),
  body('location', 'Location field should not be empty').trim().isLength({ min: 1 }).escape(),
  body('date', 'Date field should not be empty'),
  body('jobLink', 'Link field should not be empty').trim().isLength({ min: 1 }),
  verifyToken,
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ err: errors });
    } else {
      const { cookies } = req;
      let user;
      jwt.verify(cookies.token, 'secretKey', (err, authData) => {
        if (err) {
          res.json({ err });
        } else {
          user = authData.user;
        }
      });
      const application = new Application({
        user: user._id,
        company_name: req.body.companyName,
        position: req.body.position,
        salary: req.body.salary,
        status: req.body.status,
        date: req.body.date,
        jobLink: req.body.jobLink,
        location: req.body.location,
        qualifications_met: req.body.qualificationsMet,
      });
      application.save()
        .then(() => res.json({ msg: 'success' }))
        .catch((err) => res.json({ err }));
    }
  },
];

exports.application_get = [
  verifyToken,
  (req, res) => { // Add jwt.verify function
    Application.findById(req.params.id)
      .then((application) => res.json({ application }))
      .catch((err) => res.json({ err }));
  },
];

exports.application_put = [
  body('companyName', 'Company field name should not be empty').trim().isLength({ min: 1 }).escape(),
  body('position', 'Position field should not be empty').trim().isLength({ min: 1 }).escape(),
  body('salary', 'Salary field should not be empty').trim().isLength({ min: 1 }).escape(),
  body('location', 'Location field should not be empty').trim().isLength({ min: 1 }).escape(),
  body('date', 'Date field should not be empty'),
  body('jobLink', 'Link field should not be empty').trim().isLength({ min: 1 }).escape(),
  verifyToken,
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ err: errors });
    } else {
      const application = new Application({
        _id: req.params.id,
        user: req.body.userId,
        company_name: req.body.companyName,
        position: req.body.position,
        salary: req.body.salary,
        status: req.body.status,
        jobLink: req.body.jobLink,
        date: req.body.date,
        location: req.body.location,
        qualifications_met: req.body.qualificationsMet,
      });
      const { cookies } = req;
      jwt.verify(cookies.token, 'secretKey', (jwterr) => {
        if (jwterr) {
          res.json({ err: [jwterr] });
        } else {
          Application.findByIdAndUpdate(req.params.id, application)
            .then(() => {
              res.json({ msg: 'succsess' });
            })
            .catch((saveErr) => {
              res.json({ err: saveErr });
            });
        }
      });
    }
  },
];

exports.application_delete = [
  verifyToken,
  (req, res) => {
    const { cookies } = req;
    jwt.verify(cookies.token, 'secretKey', (errors) => {
      if (errors) {
        res.json({ err: errors });
      } else {
        Application.findByIdAndRemove(req.params.id)
          .then(() => res.json({ msg: 'success' }))
          .catch((delErr) => res.json({ err: delErr }));
      }
    });
  },
];
