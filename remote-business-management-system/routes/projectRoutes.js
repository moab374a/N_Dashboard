const express = require("express");
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStatistics,
} = require("../controllers/projectController");

const router = express.Router();

// Import authentication middleware
const { protect, authorize } = require("../middlewares/auth");

// Apply authentication to all routes
router.use(protect);

router.route("/").get(getProjects).post(createProject);

router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);

router.get("/:id/statistics", getProjectStatistics);

module.exports = router;
