require('dotenv').config();

const express = require('express');
const routes = require('./routes');

//Import sequelize connection
const sequelize = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use(routes);

//Sync sequelize models to the database, then turn on the server
sequelize.sync()
  .then(() => {
    console.log('Database & tables synced!');
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}!`);
    });
  });