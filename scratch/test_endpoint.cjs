import axios from 'axios';

async function testEndpoint() {
  try {
    const res = await axios.post('http://localhost:5000/api/v1/auth/login', {
      contactNumber: '01711122233', // assuming some admin contact number
      password: 'password123'
    });
    const token = res.data.data.accessToken;
    console.log("Logged in");

    const donorsRes = await axios.get('http://localhost:5000/api/v1/admin/donors', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Response:", donorsRes.data);
  } catch (error) {
    if (error.response) {
      console.log("Error:", error.response.data);
    } else {
      console.log("Network Error:", error.message);
    }
  }
}

testEndpoint();
