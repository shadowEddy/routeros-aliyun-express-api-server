const express = require("express");
const router = express.Router();

router.use("/ddns", require("./ddns"));

module.exports = router;