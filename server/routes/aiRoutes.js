const express = require("express");
const router = express.Router();
const { debugError } = require("../controllers/aiController");

router.post("/debug", debugError);

module.exports = router;
