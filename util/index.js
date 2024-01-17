// const express = require("express");
// const router = express.Router();

const errorHandler = require("./errorHandler");
const getTime = require("./getTime")

// router.use(errorHandler());

module.exports = { errorHandler,  getTime };