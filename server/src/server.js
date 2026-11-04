const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;


// Connect to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` IEM ADMISSION MANAGEMENT SYSTEM — BACKEND API SERVER `);
    console.log(` Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}).catch(err => {
  console.error(`Failed to connect to MongoDB: ${err.message}`);
  process.exit(1);
});
