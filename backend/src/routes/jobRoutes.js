const express = require('express');
const { createJob, getAllJobs, getJobById, updateJob, deleteJob, getMyJobs } = require('../controllers/jobController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllJobs);
router.get('/my-jobs', authenticateToken, authorizeRole(['RECRUITER']), getMyJobs);
router.get('/:id', getJobById);

router.post('/', authenticateToken, authorizeRole(['RECRUITER']), createJob);
router.put('/:id', authenticateToken, authorizeRole(['RECRUITER']), updateJob);
router.delete('/:id', authenticateToken, authorizeRole(['RECRUITER']), deleteJob);

module.exports = router;
