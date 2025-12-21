const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_URL = 'http://localhost:3000/api/auth';

async function testSignupFlow() {
    const email = `testuser${Date.now()}@example.com`;
    const password = 'StrongPassword1!';
    const name = 'Test User';
    const role = 'CANDIDATE';

    console.log(`Step 1: Signing up with ${email}...`);
    try {
        const signupRes = await axios.post(`${API_URL}/signup`, {
            email,
            password,
            name,
            role
        });
        console.log('Signup response:', signupRes.data);
    } catch (error) {
        console.error('Signup failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }

    console.log('\nStep 2: Fetching OTP from database...');
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.otp) {
        console.error('User or OTP not found in DB');
        process.exit(1);
    }
    console.log('OTP found:', user.otp);

    console.log('\nStep 3: Verifying OTP...');
    try {
        const verifyRes = await axios.post(`${API_URL}/verify-otp`, {
            email,
            otp: user.otp
        });
        console.log('Verification response:', verifyRes.data);
        if (verifyRes.data.token) {
            console.log('SUCCESS: Token received!');
        } else {
            console.error('FAILURE: No token received');
        }
    } catch (error) {
        console.error('Verification failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

testSignupFlow()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
