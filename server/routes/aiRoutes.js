const express = require("express");
const router = express.Router();
const { debugError, checkDuplicateQuestion } = require("../controllers/aiController");

router.post("/debug", debugError);
router.post("/check-duplicate", checkDuplicateQuestion);

module.exports = router;
