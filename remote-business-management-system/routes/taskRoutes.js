const express = require("express");
const { getTasks, createTask } = require("../controllers/taskController");
const router = express.Router();
const { protect } = require("../middlewares/auth");

router.use(protect);
router.route("/").get(getTasks).post(createTask);

module.exports = router;
