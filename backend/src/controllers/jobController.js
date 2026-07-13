const { z } = require('zod');
const prisma = require('../utils/db');

const jobSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    company: z.string().min(1, 'Company is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    location: z.string().min(1, 'Location is required'),
    salary: z.string().optional(),
    jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional(),
    experienceLevel: z.enum(['ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR']).optional(),
    skillsRequired: z.string().optional(), // Expecting JSON string array
});

exports.createJob = async (req, res) => {
    try {
        const data = jobSchema.parse(req.body);

        // Fetch recruiter details to get official company details
        const recruiter = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        if (!recruiter || !recruiter.companyName) {
            return res.status(400).json({ message: 'You must complete your profile (Company Name) before posting a job.' });
        }

        let skillsRequired = [];
        if (data.skillsRequired) {
            skillsRequired = JSON.parse(data.skillsRequired);
        }

        const job = await prisma.job.create({
            data: {
                title: data.title,
                company: recruiter.companyName, // Force official company name from profile
                description: data.description,
                location: data.location,
                salary: data.salary,
                jobType: data.jobType || 'FULL_TIME',
                experienceLevel: data.experienceLevel || 'ENTRY_LEVEL',
                skillsRequired: skillsRequired,
                recruiterId: req.user.userId,
            },
        });

        res.status(201).json(job);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getMyJobs = async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            where: { recruiterId: req.user.userId },
            include: {
                applications: {
                    select: { id: true, status: true, isViewed: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        const jobsWithCount = jobs.map(job => {
            const unviewedCount = job.applications.filter(app => !app.isViewed).length;
            const selectedCount = job.applications.filter(app => app.status === 'SELECTED').length;
            const totalCount = job.applications.length;
            const { applications, ...jobData } = job;
            return {
                ...jobData,
                unviewedApplicationsCount: unviewedCount,
                selectedApplicationsCount: selectedCount,
                totalApplicationsCount: totalCount
            };
        });

        res.json(jobsWithCount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllJobs = async (req, res) => {
    try {
        const { keyword, location, jobType, experienceLevel, salary } = req.query;

        const where = {};

        if (keyword) {
            where.OR = [
                { title: { contains: keyword } }, // Remove mode: 'insensitive' for MySQL compatibility if needed, or keeping it if safe
                { description: { contains: keyword } },
                { company: { contains: keyword } },
            ];
        }

        if (location) {
            where.location = { contains: location };
        }

        if (jobType) {
            where.jobType = jobType;
        }

        if (experienceLevel) {
            where.experienceLevel = experienceLevel;
        }

        // Simple salary filtering (exact match or contains) appropriate for string type
        if (salary) {
            where.salary = { contains: salary };
        }

        const jobs = await prisma.job.findMany({
            where,
            include: { recruiter: { select: { name: true, email: true, profilePicture: true, companyWebsite: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await prisma.job.findUnique({
            where: { id },
            include: { recruiter: { select: { name: true, email: true, profilePicture: true, companyWebsite: true } } },
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json(job);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const data = jobSchema.parse(req.body);

        const job = await prisma.job.findUnique({ where: { id } });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.recruiterId !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied: You can only edit your own jobs' });
        }

        let skillsRequired = job.skillsRequired; // Default to existing
        if (data.skillsRequired) {
            skillsRequired = JSON.parse(data.skillsRequired);
        }

        const updatedJob = await prisma.job.update({
            where: { id },
            data: {
                title: data.title,
                company: data.company,
                description: data.description,
                location: data.location,
                salary: data.salary,
                jobType: data.jobType,
                experienceLevel: data.experienceLevel,
                skillsRequired: skillsRequired
            },
        });

        res.json(updatedJob);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await prisma.job.findUnique({ where: { id } });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.recruiterId !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied: You can only delete your own jobs' });
        }

        // Fetch all application IDs for this job to delete their messages first
        const applications = await prisma.application.findMany({
            where: { jobId: id },
            select: { id: true }
        });
        const appIds = applications.map(app => app.id);

        // Delete all messages in these applications
        await prisma.message.deleteMany({
            where: { applicationId: { in: appIds } }
        });

        // Delete all applications for this job
        await prisma.application.deleteMany({
            where: { jobId: id }
        });

        // Now safe to delete the job
        await prisma.job.delete({ where: { id } });

        res.json({ message: 'Job and all its applications deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
