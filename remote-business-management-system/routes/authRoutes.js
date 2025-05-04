const express = require("express");
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  verifyEmail,
  setupTwoFactor,
  verifyTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
} = require("../controllers/authController");

const router = express.Router();

// Import authentication middleware
const { protect } = require("../middlewares/auth");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:token", resetPassword);
// router.get("/verify-email/:token", verifyEmail);
router.post("/verify-2fa", verifyTwoFactor);

// Protected routes
router.get("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/updatedetails", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);
router.post("/setup-2fa", protect, setupTwoFactor);
router.post("/enable-2fa", protect, enableTwoFactor);
router.post("/disable-2fa", protect, disableTwoFactor);

module.exports = router;
