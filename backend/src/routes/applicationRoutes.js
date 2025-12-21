const express = require('express');
const { applyForJob, getCandidateApplications, getJobApplications, updateApplicationStatus, sendMessage, getMessages, markAsRead, getUnreadCount, getMyChats } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, authorize('CANDIDATE'), upload.single('resume'), applyForJob);
router.get('/my-applications', protect, authorize('CANDIDATE'), getCandidateApplications);
router.get('/job/:jobId', protect, authorize('RECRUITER'), getJobApplications);
router.put('/:id/status', protect, authorize('RECRUITER'), updateApplicationStatus);
router.post('/message', protect, sendMessage);
router.get('/:applicationId/messages', protect, getMessages);
router.put('/message/read', protect, markAsRead);
router.get('/chats/unread-count', protect, getUnreadCount);
router.get('/chats', protect, getMyChats);

module.exports = router;
