require('dotenv').config();

// Import the compiled Express app
const app = require('../dist/server.js').default || require('../dist/server.js');

module.exports = app;
