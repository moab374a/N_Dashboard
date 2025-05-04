const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const { query, transaction } = require("../config/db");
const logger = require("../utils/logger");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "1d",
  });
};

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user.user_id);

  // Set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // Remove sensitive data
  delete user.password_hash;

  // Send response with cookie
  res.status(statusCode).cookie("token", token, cookieOptions).json({
    success: true,
    token,
    user,
  });
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName, jobTitle } =
      req.body;

    // Check if email already exists
    const emailCheck = await query("SELECT email FROM users WHERE email = $1", [
      email,
    ]);
    if (emailCheck.rows.length > 0) {
      return next(new ErrorResponse("Email already in use", 400));
    }

    // Check if username already exists
    const usernameCheck = await query(
      "SELECT username FROM users WHERE username = $1",
      [username]
    );
    if (usernameCheck.rows.length > 0) {
      return next(new ErrorResponse("Username already in use", 400));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await transaction(async (client) => {
      const userResult = await client.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, job_title) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, username, email, first_name, last_name, job_title`,
        [username, email, hashedPassword, firstName, lastName, jobTitle]
      );

      const user = userResult.rows[0];

      // Assign default role (e.g., 'user')
      const roleResult = await client.query(
        "SELECT role_id FROM roles WHERE role_name = $1",
        ["user"]
      );

      if (roleResult.rows.length > 0) {
        const roleId = roleResult.rows[0].role_id;
        await client.query(
          "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
          [user.user_id, roleId]
        );
      }

      // Insert system log
      await client.query(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          user.user_id,
          "register",
          "user",
          user.user_id,
          "User registration",
          req.ip,
        ]
      );

      return user;
    });

    // Send response
    res.status(201).json({
      success: true,
      message: "User registered successfully. You can now log in.",
      user: {
        id: result.user_id,
        username: result.username,
        email: result.email,
        firstName: result.first_name,
        lastName: result.last_name,
        jobTitle: result.job_title,
      },
    });
  } catch (err) {
    logger.error(`Registration error: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse("Please provide email and password", 400));
    }

    // Check for user
    const result = await query(
      `SELECT u.user_id, u.username, u.email, u.password_hash, u.first_name, u.last_name, 
        u.job_title, u.is_active, u.two_factor_enabled, u.two_factor_secret
       FROM users u
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return next(
        new ErrorResponse(
          "Your account has been deactivated. Please contact support.",
          401
        )
      );
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      // Generate temporary token for 2FA validation
      const tempToken = jwt.sign(
        { id: user.user_id, twoFactorPending: true },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );

      return res.status(200).json({
        success: true,
        message: "Please enter your 2FA code",
        twoFactorRequired: true,
        tempToken,
      });
    }

    // Log successful login
    await query(
      `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        user.user_id,
        "login",
        "user",
        user.user_id,
        "User login",
        req.ip,
        req.headers["user-agent"],
      ]
    );

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Verify Two-Factor Authentication
 * @route   POST /api/auth/verify-2fa
 * @access  Public
 */
exports.verifyTwoFactor = async (req, res, next) => {
  try {
    const { tempToken, twoFactorCode } = req.body;

    if (!tempToken || !twoFactorCode) {
      return next(
        new ErrorResponse("Please provide temporary token and 2FA code", 400)
      );
    }

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

    if (!decoded.twoFactorPending) {
      return next(new ErrorResponse("Invalid token", 401));
    }

    // Get user with 2FA secret
    const result = await query(
      "SELECT user_id, username, email, first_name, last_name, job_title, two_factor_secret FROM users WHERE user_id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return next(new ErrorResponse("User not found", 404));
    }

    const user = result.rows[0];

    // Verify 2FA code
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: "base32",
      token: twoFactorCode,
    });

    if (!verified) {
      return next(new ErrorResponse("Invalid 2FA code", 401));
    }

    // Log successful 2FA verification
    await query(
      `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        user.user_id,
        "verify_2fa",
        "user",
        user.user_id,
        "2FA verification",
        req.ip,
        req.headers["user-agent"],
      ]
    );

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (err) {
    logger.error(`2FA verification error: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Setup Two-Factor Authentication
 * @route   POST /api/auth/setup-2fa
 * @access  Private
 */
exports.setupTwoFactor = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `RemoteBusinessApp:${req.user.email}`,
    });

    // Store the secret temporarily
    await query(
      "UPDATE users SET temp_two_factor_secret = $1 WHERE user_id = $2",
      [secret.base32, userId]
    );

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
    });
  } catch (err) {
    logger.error(`2FA setup error: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Verify and Enable Two-Factor Authentication
 * @route   POST /api/auth/enable-2fa
 * @access  Private
 */
exports.enableTwoFactor = async (req, res, next) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    // Get temporary secret
    const result = await query(
      "SELECT temp_two_factor_secret FROM users WHERE user_id = $1",
      [userId]
    );

    if (!result.rows[0].temp_two_factor_secret) {
      return next(new ErrorResponse("2FA setup not initiated", 400));
    }

    const tempSecret = result.rows[0].temp_two_factor_secret;

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: tempSecret,
      encoding: "base32",
      token: token,
    });

    if (!verified) {
      return next(new ErrorResponse("Invalid verification code", 400));
    }

    // Enable 2FA
    await transaction(async (client) => {
      await client.query(
        "UPDATE users SET two_factor_enabled = true, two_factor_secret = temp_two_factor_secret, temp_two_factor_secret = NULL WHERE user_id = $1",
        [userId]
      );

      // Log 2FA enablement
      await client.query(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, "enable_2fa", "user", userId, "2FA enabled", req.ip]
      );
    });

    res.status(200).json({
      success: true,
      message: "2FA has been enabled successfully",
    });
  } catch (err) {
    logger.error(`2FA enable error: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Disable Two-Factor Authentication
 * @route   POST /api/auth/disable-2fa
 * @access  Private
 */
exports.disableTwoFactor = async (req, res, next) => {
  try {
    const { password, token } = req.body;
    const userId = req.user.id;

    // Get user data
    const userResult = await query(
      "SELECT password_hash, two_factor_secret FROM users WHERE user_id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return next(new ErrorResponse("User not found", 404));
    }

    const user = userResult.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return next(new ErrorResponse("Invalid password", 401));
    }

    // Verify 2FA token
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: "base32",
      token: token,
    });

    if (!verified) {
      return next(new ErrorResponse("Invalid 2FA code", 401));
    }

    // Disable 2FA
    await transaction(async (client) => {
      await client.query(
        "UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL WHERE user_id = $1",
        [userId]
      );

      // Log 2FA disablement
      await client.query(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, "disable_2fa", "user", userId, "2FA disabled", req.ip]
      );
    });

    res.status(200).json({
      success: true,
      message: "2FA has been disabled successfully",
    });
  } catch (err) {
    logger.error(`2FA disable error: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Logout user / clear cookie
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    // Log logout
    if (req.user) {
      await query(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user.id, "logout", "user", req.user.id, "User logout", req.ip]
      );
    }

    // Clear cookie
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    logger.error(`Logout error: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.user_id, u.username, u.email, u.first_name, u.last_name, 
        u.job_title, u.profile_image_url, u.two_factor_enabled,
        u.created_at, u.last_login
       FROM users u
       WHERE u.user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Get user roles
    const rolesResult = await query(
      `SELECT r.role_name 
       FROM user_roles ur 
       JOIN roles r ON ur.role_id = r.role_id 
       WHERE ur.user_id = $1`,
      [req.user.id]
    );

    const user = {
      ...result.rows[0],
      roles: rolesResult.rows.map((row) => row.role_name),
    };

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    logger.error(`Get user profile error: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
exports.updateDetails = async (req, res, next) => {
  try {
    const { firstName, lastName, jobTitle, phone } = req.body;
    const userId = req.user.id;

    // Update user details
    const result = await query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, job_title = $3, phone_number = $4, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $5
       RETURNING user_id, username, email, first_name, last_name, job_title, phone_number`,
      [firstName, lastName, jobTitle, phone, userId]
    );

    // Log update
    await query(
      `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details, ip_address) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        "update_profile",
        "user",
        userId,
        "Profile details updated",
        req.ip,
      ]
    );

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    logger.error(`Update user details error: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user with password
    const result = await query(
      "SELECT password_hash FROM users WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return next(new ErrorResponse("User not found", 404));
    }

    const user = result.rows[0];

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return next(new ErrorResponse("Current password is incorrect", 401));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await transaction(async (client) => {
      await client.query(
        "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2",
        [hashedPassword, userId]
      );

      // Log password update
      await client.query(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, "update_password", "user", userId, "Password updated", req.ip]
      );
    });

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    logger.error(`Update password error: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const result = await query(
      "SELECT user_id, email, username FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return next(new ErrorResponse("There is no user with that email", 404));
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await transaction(async (client) => {
      await client.query(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at) 
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO UPDATE
         SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at`,
        [user.user_id, resetTokenHash, resetExpiry]
      );

      // Log password reset request
      await client.query(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          user.user_id,
          "forgot_password",
          "user",
          user.user_id,
          "Password reset requested",
          req.ip,
        ]
      );
    });

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const message = `
      <h1>Password Reset</h1>
      <p>You are receiving this email because you (or someone else) has requested a password reset.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message,
      });

      res.status(200).json({
        success: true,
        message: "Password reset email sent",
      });
    } catch (err) {
      logger.error(`Reset email could not be sent: ${err.message}`);

      // Delete reset token
      await query("DELETE FROM password_reset_tokens WHERE user_id = $1", [
        user.user_id,
      ]);

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (err) {
    logger.error(`Forgot password error: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Reset password
 * @route   PUT /api/auth/resetpassword/:token
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetToken = req.params.token;
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Find valid token
    const tokenResult = await query(
      `SELECT user_id FROM password_reset_tokens 
       WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP`,
      [resetTokenHash]
    );

    if (tokenResult.rows.length === 0) {
      return next(new ErrorResponse("Invalid or expired token", 400));
    }

    const userId = tokenResult.rows[0].user_id;

    // Hash new password
    const { password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and remove token
    await transaction(async (client) => {
      await client.query(
        "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2",
        [hashedPassword, userId]
      );

      // Delete used token
      await client.query(
        "DELETE FROM password_reset_tokens WHERE user_id = $1",
        [userId]
      );

      // Log password reset
      await client.query(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          "reset_password",
          "user",
          userId,
          "Password reset completed",
          req.ip,
        ]
      );
    });

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    logger.error(`Reset password error: ${err.message}`);
    next(err);
  }
};
