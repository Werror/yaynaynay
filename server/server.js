/* eslint-disable no-console */
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const chalk = require("chalk");
const path = require("path");
const compression = require("compression");

const app = express();

// Middleware
app.use(compression({}));

app.use(
  morgan(chalk`{yellow :method :status} :url  [:date[clf]] :response-time ms`)
);

// Routes & controllers
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../clients/index.html"));
// });

// Static serving
app.use(express.static(path.join(__dirname, "../build")));

// Error handling
app.use((err, req, res, next) => {
  console.log("ERROR:", err);
  res.status(500).send("Something broke!");
  next();
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(
    chalk`{bgBlue.white Server started at: http://localhost:${port}}`
  );
});

module.exports = app;
