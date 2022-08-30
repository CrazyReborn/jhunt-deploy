const express = require('express');
const userController = require('../controllers/userController');
const applicationController = require('../controllers/applicationController');
const interviewController = require('../controllers/interviewController');
const offerController = require('../controllers/offerController');

const router = express.Router();

// Application routes
router.get('/api/v1/applications', applicationController.applications_get);
router.post('/api/v1/applications', applicationController.applications_post);
router.get('/api/v1/applications/:id', applicationController.application_get);
router.put('/api/v1/applications/:id', applicationController.application_put);
router.delete('/api/v1/applications/:id', applicationController.application_delete);

// Interview routes
router.get('/api/v1/interviews', interviewController.interviews_get);
router.post('/api/v1/interviews', interviewController.interviews_post);
router.get('/api/v1/interviews/:id', interviewController.inteview_get);
router.put('/api/v1/interviews/:id', interviewController.interview_put);
router.delete('/api/v1/interviews/:id', interviewController.interview_delete);

// Event routes
router.get('/api/v1/offers', offerController.offers_get);
router.get('/api/v1/offers/new', offerController.offer_new_get);
router.post('/api/v1/offers', offerController.offer_new_post);
router.put('/api/v1/offers/:id', offerController.offer_put);
router.delete('/api/v1/offers/:id', offerController.offer_delete);

// Sign Up and Sign In routes
router.get('/api/v1/signin', userController.signin_get);
router.post('/api/v1/signin', userController.signin_post);
router.get('/api/v1/signup', userController.signup_get);
router.post('/api/v1/signup', userController.signup_post);
router.post('/api/v1/signout', userController.logout_post);
router.get('/api/v1/profile', userController.user_get);

module.exports = router;
