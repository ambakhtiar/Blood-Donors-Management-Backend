import app from './app';
import dotenv from 'dotenv';
import { envVars } from './app/config/env';

dotenv.config();

const PORT = envVars.PORT;

async function server() {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

server();
