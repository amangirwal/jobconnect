const prisma = require('../utils/db');
const { z } = require('zod');

const profileSchema = z.object({
    headline: z.string().optional(),
    about: z.string().optional(),
    skills: z.string().optional(), // Expecting JSON string
    education: z.string().optional(), // Expecting JSON string
    experience: z.string().optional(), // Expecting JSON string
    companyName: z.string().optional(),
    companyWebsite: z.string().optional(),
    companyDescription: z.string().optional(),
});

exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                headline: true,
                about: true,
                skills: true,
                education: true,
                experience: true,
                resume: true,
                profilePicture: true,
                companyName: true,
                companyWebsite: true,
                companyDescription: true,
            }
        });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const data = profileSchema.parse(req.body);

        // Convert JSON strings to objects if present
        const updateData = {};
        if (data.headline) updateData.headline = data.headline;
        if (data.about) updateData.about = data.about;
        if (data.skills) updateData.skills = JSON.parse(data.skills);
        if (data.education) updateData.education = JSON.parse(data.education);
        if (data.experience) updateData.experience = JSON.parse(data.experience);

        // Recruiter fields
        if (data.companyName) updateData.companyName = data.companyName;
        if (data.companyWebsite) updateData.companyWebsite = data.companyWebsite;
        if (data.companyDescription) updateData.companyDescription = data.companyDescription;

        // Handle file uploads
        if (req.files) {
            if (req.files.resume) {
                updateData.resume = req.files.resume[0].path;
            }
            if (req.files.profilePicture) {
                updateData.profilePicture = req.files.profilePicture[0].path;
            }
        }

        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                headline: true,
                resume: true,
                profilePicture: true
            }
        });

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error(error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};
