const jwt = require("jsonwebtoken");
const { query } = require("../config/db");
const logger = require("../utils/logger");
const ErrorResponse = require("../utils/errorResponse");

/**
 * Middleware to protect routes - verifies the user's JWT token
 */
exports.protect = async (req, res, next) => {
  let token;

  // Get token from Authorization header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const userResult = await query(
      "SELECT user_id, username, email, is_active FROM users WHERE user_id = $1",
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return next(new ErrorResponse("User no longer exists", 401));
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return next(new ErrorResponse("User account is deactivated", 401));
    }

    // Get user roles and permissions
    const rolesResult = await query(
      `SELECT r.role_name 
       FROM user_roles ur 
       JOIN roles r ON ur.role_id = r.role_id 
       WHERE ur.user_id = $1`,
      [user.user_id]
    );

    const permissionsResult = await query(
      `SELECT p.permission_name 
       FROM role_permissions rp 
       JOIN permissions p ON rp.permission_id = p.permission_id 
       JOIN user_roles ur ON ur.role_id = rp.role_id 
       WHERE ur.user_id = $1`,
      [user.user_id]
    );

    // Add user info to request object
    req.user = {
      id: user.user_id,
      username: user.username,
      email: user.email,
      roles: rolesResult.rows.map((row) => row.role_name),
      permissions: permissionsResult.rows.map((row) => row.permission_name),
    };

    // Update last login time
    await query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1",
      [user.user_id]
    );

    next();
  } catch (err) {
    logger.error(`Auth error: ${err.message}`);
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
};

/**
 * Middleware to restrict access based on user roles
 * @param {String[]} roles - Array of roles allowed to access the route
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse("User information not found", 500));
    }

    // Check if user has any of the required roles
    const hasRole = req.user.roles.some((role) => roles.includes(role));

    if (!hasRole) {
      return next(
        new ErrorResponse(
          `User role ${req.user.roles.join(
            ", "
          )} is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Middleware to check specific permissions
 * @param {String[]} requiredPermissions - Array of permissions required
 */
exports.checkPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse("User information not found", 500));
    }

    // Check if user has all required permissions
    const hasPermissions = requiredPermissions.every((permission) =>
      req.user.permissions.includes(permission)
    );

    if (!hasPermissions) {
      return next(
        new ErrorResponse(
          "You do not have permission to perform this action",
          403
        )
      );
    }

    next();
  };
};
