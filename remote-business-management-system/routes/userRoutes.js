const express = require("express");
const { getUsers, getUser } = require("../controllers/userController");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");

router.use(protect);
router.route("/").get(authorize("admin"), getUsers);
router.route("/:id").get(getUser);

module.exports = router;
