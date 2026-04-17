import axios from 'axios';

async function testEndpoint() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'superadmin@bloodlink.com', // guess based on normal setups
      password: 'password123'
    });
    const token = loginRes.data.data.accessToken;
    console.log("Logged in!");

    const donorsRes = await axios.get('http://localhost:5000/api/v1/admin/donors', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Donors Response:", JSON.stringify(donorsRes.data, null, 2));
  } catch (error: any) {
    if (error.response) {
      console.log("Error:", error.response.data);
    } else {
      console.log("Network Error:", error.message);
    }
  }
}

testEndpoint();
