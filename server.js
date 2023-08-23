require('dotenv').config();

console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);

const express = require('express');
const routes = require('./routes');

// Import sequelize connection
const sequelize = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(routes);

// Sync sequelize models to the database, then turn on the server
sequelize.sync() // <-- Here's the change: Removed { force: true }
  .then(() => {
    console.log('Database & tables synced!');
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}!`);
    });
  });