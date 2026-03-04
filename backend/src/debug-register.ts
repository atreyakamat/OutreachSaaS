import axios from 'axios';

const test = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      email: `test-${Date.now()}@test.com`,
      password: 'Password123!',
      organizationName: 'Debug Corp'
    });
    console.log('Success:', res.data);
  } catch (err: any) {
    console.error('Error:', err.response?.data || err.message);
  }
};

test();
