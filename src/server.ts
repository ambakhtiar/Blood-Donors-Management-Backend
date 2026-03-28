import app from './app';
import dotenv from 'dotenv';
import seedSuperAdmin from './app/db';
import { envVars } from './app/config/env';

dotenv.config();

const PORT = envVars.PORT;

async function server() {
  try {
    // await seedSuperAdmin();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

server();
