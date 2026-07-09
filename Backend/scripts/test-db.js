require('dotenv').config();
const connectDatabase = require('../config/database');

connectDatabase().then(() => process.exit(0));
