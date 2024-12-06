// user.routes.js
import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
  publicProfile,
  updateAccountDetails,
} from "../controllers/user.controller.js"; // User authentication controllers
import { upload } from "../middlewares/multer.middleware.js"; // Middleware to handle file uploads
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Middleware to verify JWT token
import {
  createResource,
  getAllResources,
  getSingleResource,
  updateResource,
  deleteResource,
} from "../controllers/resource.controller.js"; // Resource management controllers
import {
  rateResource,
  removeRating,
  getResourceRating,
} from "../controllers/rating.controller.js"; // Rating management controllers
import {
  addComment,
  editComment,
  deleteComment,
  getComments,
} from "../controllers/comment.controller.js"; // Comment management controllers

// Create a new Express Router instance
const router = new Router();

/**
 * @route POST /register
 * @description Register a new user
 * @access Public
 */
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 }, // Avatar image upload
    { name: "coverImage", maxCount: 1 }, // Cover image upload
  ]),
  registerUser // User registration handler
);

/**
 * @route POST /login
 * @description Login an existing user
 * @access Public
 */
router.route("/login").post(loginUser); // User login handler

/**
 * @route POST /logout
 * @description Logout the authenticated user
 * @access Private (requires JWT)
 */
router.route("/logout").post(verifyJWT, logoutUser); // User logout handler

/**
 * @route POST /refresh-token
 * @description Refresh the access token using the refresh token
 * @access Public
 */
router.route("/refresh-token").post(refreshAccessToken); // Token refresh handler
// Resource Routes (Secured for authenticated users)

/**
 * @route POST /resource
 * @description Create a new resource
 * @access Private (requires JWT)
 */
router.route("/resource").post(verifyJWT, createResource); // Resource creation handler

/**
 * @route GET /resources
 * @description Get all resources
 * @access Private (requires JWT)
 */
router.route("/resources").get(verifyJWT, getAllResources); // Fetch all resources

/**
 * @route GET /resource/:slug
 * @description Get a single resource by slug
 * @access Private (requires JWT)
 */
router.route("/resource/:slug").get(verifyJWT, getSingleResource); // Fetch a specific resource by slug

/**
 * @route PUT /resource/:slug
 * @description Update an existing resource by slug
 * @access Private (requires JWT)
 */
router.route("/resource/:slug").put(verifyJWT, updateResource); // Resource update handler by slug

/**
 * @route DELETE /resource/:slug
 * @description Delete a resource by slug
 * @access Private (requires JWT)
 */
router.route("/resource/:slug").delete(verifyJWT, deleteResource); // Resource deletion handler by slug

router.route("/profile").get(verifyJWT, getCurrentUser); // Fetch a specific user
// Rating Routes (Secured for authenticated users)

router.route("/profile").patch(verifyJWT, updateAccountDetails);

/**
 * @route POST /resource/:resourceId/rate
 * @description Rate a resource
 * @access Private (requires JWT)
 */
router.route("/resource/:resourceId/rate").post(verifyJWT, rateResource); // Rate a resource

/**
 * @route DELETE /resource/:resourceId/rating
 * @description Remove rating from a resource
 * @access Private (requires JWT)
 */
router.route("/resource/:resourceId/rating").delete(verifyJWT, removeRating); // Remove rating from resource

/**
 * @route GET /resource/:resourceId/rating
 * @description Get the average rating of a resource
 * @access Private (requires JWT)
 */
router.route("/resource/:resourceId/rating").get(verifyJWT, getResourceRating); // Get resource's average rating

// Comment Routes (Secured for authenticated users)

// Route to add a comment
router.post("/:resourceSlug/comments", verifyJWT, addComment);

// Route to get all comments for a resource
router.get("/:resourceSlug/comments", verifyJWT, getComments);

// Route to edit a specific comment by its slug
router.put("/:resourceSlug/comments/:commentSlug", verifyJWT, editComment);

// Route to delete a specific comment by its slug
router.delete("/:resourceSlug/comments/:commentSlug", verifyJWT, deleteComment);
// Uncomment below to enable download resource functionality
// /**
//  * @route GET /resource/download/:filename
//  * @description Download a resource (secured)
//  * @access Private (requires JWT)
//  */
// router.get("/resource/download/:filename", verifyJWT, downloadResource); // Resource download handler

// Export the router to be used in the main app

router.route("/public-profile/:username", verifyJWT, publicProfile);

export default router;
