const express = require("express");
const router = express.Router();

router.use("/ddns", require("./ddns"));
router.use("/fetchRecords", require("./fetchRecords"));

module.exports = router;