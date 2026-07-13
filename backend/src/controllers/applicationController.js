const uploadToCloudinary = require('../utils/uploadToCloudinary');
const { sendEmail } = require('../utils/emailService');
const prisma = require('../utils/db');

exports.applyForJob = async (req, res) => {
    try {
        console.log("Applying for job. Body:", req.body, "File:", req.file);
        const { jobId } = req.body;
        const candidateId = req.user.userId;

        if (!jobId) {
            return res.status(400).json({ message: 'Job ID is required' });
        }

        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: { recruiter: true } // Include recruiter to get email
        });
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const existingApplication = await prisma.application.findUnique({
            where: {
                jobId_candidateId: { jobId, candidateId },
            },
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Handle resume upload
       let resume = null;

        if (req.file) {
            const resumeResult = await uploadToCloudinary(
                req.file.buffer,
                {
                    folder: 'jobconnect/resumes',
                    resource_type: 'auto',
                    public_id: `application-resume-${req.user.userId}-${Date.now()}`,
                }
            );
            resume = resumeResult.secure_url;
        }

        const application = await prisma.application.create({
            data: {
                jobId,
                candidateId,
                resume: resume
            },
        });

        // Notify Recruiter
        try {
            const candidate = await prisma.user.findUnique({ where: { id: candidateId } });
            if (job.recruiter && job.recruiter.email) {
                await sendEmail({
                    from: process.env.EMAIL_USER,
                    to: job.recruiter.email,
                    subject: `New Application for ${job.title}`,
                    text: `You have received a new application from ${candidate.name} for the position of ${job.title}. Check your dashboard for details.`,
                    html: `<p>You have received a new application from <strong>${candidate.name}</strong> for the position of <strong>${job.title}</strong>.</p><p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-jobs">View Application</a></p>`
                });
            }
        } catch (emailError) {
            console.error("Failed to send notification email:", emailError);
            // Continue execution, do not fail the request
        }

        res.status(201).json(application);
    } catch (error) {
        console.error("Error in applyForJob:", error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

exports.getCandidateApplications = async (req, res) => {
    try {
        const candidateId = req.user.userId;
        const applications = await prisma.application.findMany({
            where: { candidateId },
            include: {
                job: {
                    include: { recruiter: { select: { name: true, email: true } } },
                },
            },
            orderBy: { appliedAt: 'desc' },
        });
        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;
        const recruiterId = req.user.userId;

        const job = await prisma.job.findUnique({ where: { id: jobId } });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.recruiterId !== recruiterId) {
            return res.status(403).json({ message: 'Access denied: You do not own this job' });
        }

        // Mark all applications for this job as viewed
        await prisma.application.updateMany({
            where: { jobId, isViewed: false },
            data: { isViewed: true }
        });

        const applications = await prisma.application.findMany({
            where: { jobId },
            include: {
                candidate: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        resume: true,
                        skills: true,
                        headline: true,
                        about: true,
                        experience: true,
                        education: true
                    }
                },
            },
            orderBy: { appliedAt: 'desc' },
        });

        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // SELECTED, REJECTED, REVIEWING

        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                job: true,
                candidate: true
            }
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.job.recruiterId !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied: You do not own the job for this application' });
        }

        const updatedApplication = await prisma.application.update({
            where: { id },
            data: { status }
        });

        // Send Status Update Email to Candidate
        try {
            if (application.candidate && application.candidate.email) {
                let subject = '';
                let text = '';
                let html = '';

                if (status === 'SELECTED') {
                    subject = `Congratulations! You have been Selected for ${application.job.title}`;
                    text = `Dear ${application.candidate.name},\n\nWe are pleased to inform you that your application for the ${application.job.title} role at ${application.job.company} has been SELECTED.\n\nYou can now chat with the recruiter directly on our platform.\n\nBest regards,\nRecruitment Team`;
                    html = `<p>Dear <strong>${application.candidate.name}</strong>,</p><p>We are pleased to inform you that your application for the <strong>${application.job.title}</strong> position at <strong>${application.job.company}</strong> has been <strong>SELECTED</strong>!</p><p>You can now message the recruiter directly on <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-applications">JobConnect</a>.</p><p>Best regards,<br/>Recruitment Team</p>`;
                } else if (status === 'REJECTED') {
                    subject = `Application status update: ${application.job.title}`;
                    text = `Dear ${application.candidate.name},\n\nThank you for applying to the ${application.job.title} position at ${application.job.company}. We appreciate your interest, but we have decided to proceed with other candidates. We wish you all the best in your job search.\n\nBest regards,\nRecruitment Team`;
                    html = `<p>Dear <strong>${application.candidate.name}</strong>,</p><p>Thank you for applying to the <strong>${application.job.title}</strong> position at <strong>${application.job.company}</strong>.</p><p>We appreciate the time you took to apply. However, we have decided to proceed with other candidates. We wish you all the best in your future endeavors.</p><p>Best regards,<br/>Recruitment Team</p>`;
                } else if (status === 'REVIEWING') {
                    subject = `Your application is now under review: ${application.job.title}`;
                    text = `Dear ${application.candidate.name},\n\nYour application for the ${application.job.title} position at ${application.job.company} is now being reviewed by the hiring manager. We will update you on any status changes.\n\nBest regards,\nRecruitment Team`;
                    html = `<p>Dear <strong>${application.candidate.name}</strong>,</p><p>Your application for the <strong>${application.job.title}</strong> position at <strong>${application.job.company}</strong> is now under <strong>REVIEW</strong>.</p><p>We will contact you if there are any updates.</p><p>Best regards,<br/>Recruitment Team</p>`;
                }

                if (subject) {
                    await sendEmail({
                        from: process.env.EMAIL_USER,
                        to: application.candidate.email,
                        subject,
                        text,
                        html
                    });
                }
            }
        } catch (emailError) {
            console.error("Failed to send status update email:", emailError);
        }

        res.json(updatedApplication);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Chat API: Send Message
exports.sendMessage = async (req, res) => {
    try {
        const { applicationId, content } = req.body;
        const senderId = req.user.userId;

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { job: true }
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Determine Receiver and Validate Permissions
        let receiverId;
        const isCandidate = application.candidateId === senderId;
        const isRecruiter = application.job.recruiterId === senderId;

        if (isCandidate) {
            // Candidate trying to message Recruiter
            // Allow if status is SELECTED or if recruiter has initiated/sent a message first
            const hasRecruiterMessaged = await prisma.message.findFirst({
                where: {
                    applicationId,
                    senderId: application.job.recruiterId
                }
            });

            if (application.status !== 'SELECTED' && !hasRecruiterMessaged) {
                return res.status(403).json({ message: 'You can only chat with the recruiter if you are SELECTED or they have initiated the chat.' });
            }
            receiverId = application.job.recruiterId;
        } else if (isRecruiter) {
            // Recruiter trying to message Candidate
            // Recruiter can message any applicant (implicit "if he applies")
            receiverId = application.candidateId;
        } else {
            return res.status(403).json({ message: 'You are not authorized to chat in this application' });
        }

        const message = await prisma.message.create({
            data: {
                content,
                senderId,
                receiverId,
                applicationId
            }
        });

        res.status(201).json(message);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

// Chat API: Get Messages
exports.getMessages = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const userId = req.user.userId;

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { job: true }
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Verify participant
        if (application.candidateId !== userId && application.job.recruiterId !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const messages = await prisma.message.findMany({
            where: { applicationId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, name: true } }
            }
        });

        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};

// Chat API: Mark as Read
exports.markAsRead = async (req, res) => {
    try {
        const { applicationId } = req.body;
        const userId = req.user.userId;

        await prisma.message.updateMany({
            where: {
                applicationId,
                receiverId: userId,
                isRead: false
            },
            data: { isRead: true }
        });

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error("Error marking read:", error);
        res.status(500).json({ message: 'Failed to mark as read' });
    }
};

// Chat API: Get Unread Count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const count = await prisma.message.count({
            where: {
                receiverId: userId,
                isRead: false
            }
        });
        res.json({ count });
    } catch (error) {
        console.error("Error getting unread count:", error);
        res.status(500).json({ message: 'Failed to get unread count' });
    }
};

// Chat API: Get All My Chats (Central Hub)
exports.getMyChats = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Find applications where I am candidate OR recruiter AND there are messages
        const applications = await prisma.application.findMany({
            where: {
                OR: [
                    { candidateId: userId },
                    { job: { recruiterId: userId } }
                ],
                messages: { some: {} } // Only if there are messages
            },
            include: {
                candidate: { select: { id: true, name: true, profilePicture: true } },
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: true,
                        recruiter: { select: { id: true, name: true, profilePicture: true } }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: {
                // Ideally order by latest message, but Prisma basic sort doesn't support relation aggregate sort easily in this version. 
                // We'll sort in JS.
                appliedAt: 'desc'
            }
        });

        // Add unread count per chat
        const chatsWithMetadata = await Promise.all(applications.map(async (app) => {
            const unreadCount = await prisma.message.count({
                where: {
                    applicationId: app.id,
                    receiverId: userId,
                    isRead: false
                }
            });

            return {
                ...app,
                lastMessage: app.messages[0],
                unreadCount
            };
        }));

        // Sort by last message time
        chatsWithMetadata.sort((a, b) => {
            const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(0);
            const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(0);
            return dateB - dateA;
        });

        res.json(chatsWithMetadata);
    } catch (error) {
        console.error("Error fetching my chats:", error);
        res.status(500).json({ message: 'Failed to fetch chats' });
    }
};

exports.getRecruiterTotalApplicationsCount = async (req, res) => {
    try {
        const recruiterId = req.user.userId;
        const count = await prisma.application.count({
            where: {
                isViewed: false,
                job: { recruiterId: recruiterId }
            }
        });
        res.json({ count });
    } catch (error) {
        console.error("Error fetching recruiter unread applications count:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
