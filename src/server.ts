import app from './app';
import dotenv from 'dotenv';
import seedSuperAdmin from './app/db';

dotenv.config();

const PORT = process.env.PORT || 5000;

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
