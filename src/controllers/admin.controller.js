import { User } from "../models/user.model.js";
import { Resource } from "../models/resource.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
const adminDashboard = asyncHandler(async (req, res) => {
  try {
    // 1. Total Resources Published
    const totalResources = await Resource.countDocuments();

    // 2. Total Users Contributing Resources
    const totalUsersContributing =
      await Resource.distinct("owner").countDocuments();

    // 3. Total Resources Per Branch
    const resourcesPerBranch = await Resource.aggregate([
      {
        $group: {
          _id: "$branch", // Group by branch
          total: { $sum: 1 }, // Count number of resources in each branch
        },
      },
      { $sort: { total: -1 } }, // Sort by descending total
    ]);

    // 4. Total Resources Per Semester
    const resourcesPerSemester = await Resource.aggregate([
      {
        $group: {
          _id: "$semester", // Group by semester
          total: { $sum: 1 }, // Count number of resources in each semester
        },
      },
      { $sort: { _id: 1 } }, // Sort by ascending semester number
    ]);

    // 5. Top 3 Contributors (users with most resources)
    const topContributors = await Resource.aggregate([
      {
        $group: {
          _id: "$owner", // Group by owner (user)
          totalResources: { $sum: 1 }, // Count the number of resources per user
        },
      },
      {
        $sort: { totalResources: -1 }, // Sort by total resources in descending order
      },
      { $limit: 3 }, // Limit to the top 3 contributors
      {
        $lookup: {
          from: "users", // Lookup user details from the User collection
          localField: "_id", // Match the owner field from Resource to _id in User collection
          foreignField: "_id",
          as: "userDetails", // Alias for the user data
        },
      },
      { $unwind: "$userDetails" }, // Unwind the userDetails array to flatten it
      {
        $project: {
          _id: 1,
          totalResources: 1,
          fullName: "$userDetails.fullName", // Select full name of the user
          avatar: "$userDetails.avatar", // Select avatar of the user
        },
      },
    ]);

    // Return the dashboard summary
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalResources,
          totalUsersContributing,
          resourcesPerBranch,
          resourcesPerSemester,
          topContributors,
        },
        "Admin Dashboard Data"
      )
    );
  } catch (error) {
    return next(error); // Pass error to the global error handler
  }
});

// // Block a user by Admin
// const blockUser = asyncHandler(async (req, res) => {
//   const { userId } = req.params; // Get the userId from the request params

//   // Step 1: Find the user by ID
//   const user = await User.findById(userId);

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   // Step 2: Block the user (set isBlocked to true)
//   user.isBlocked = true;

//   // Step 3: Save the user with updated status
//   await user.save();

//   // Step 4: Invalidate the user's session
//   // 1. Clear the access token from the cookie
//   res.clearCookie("accessToken");

//   // 2. Optionally, blacklist or delete the refresh token from the database
//   // Assuming you store refresh tokens in a "RefreshToken" model
//   await RefreshToken.deleteMany({ user: userId }); // This deletes all refresh tokens associated with the user

//   // Step 5: Return success response
//   return res
//     .status(200)
//     .json(
//       new ApiResponse(200, null, "User blocked and logged out successfully")
//     );
// });
// Unblock a user by Admin
// const unblockUser = asyncHandler(async (req, res) => {
//   const { userId } = req.params; // Get the userId from the request params

//   // Step 1: Find the user by ID
//   const user = await User.findById(userId);

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   // Step 2: Unblock the user (set isBlocked to false)
//   user.isBlocked = false;

//   // Step 3: Save the user with updated status
//   await user.save();

//   // Step 4: Return success response
//   return res
//     .status(200)
//     .json(new ApiResponse(200, null, "User unblocked successfully"));
// });

// Delete a user by Admin
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Get the userId from the request params

  // Step 1: Find the user by ID
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Step 2: Delete the resources owned by the user
  await Resource.deleteMany({ owner: userId });

  // Step 3: Remove the user reference from any resources (if not already done)
  await Resource.updateMany({ owner: userId }, { $pull: { owner: userId } });

  // Step 4: Delete the user from the database
  await user.remove();

  // Step 5: Return success response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "User and associated resources deleted successfully"
      )
    );
});

// Block a resource by Admin
const blockResource = asyncHandler(async (req, res) => {
  const { resourceId } = req.params; // Get the resourceId from the request params

  // Step 1: Find the resource by ID
  const resource = await Resource.findById(resourceId);

  if (!resource) {
    throw new ApiError(404, "Resource not found");
  }

  // Step 2: Block the resource (set isBlocked to true)
  resource.isBlocked = true;

  // Step 3: Save the resource with updated status
  await resource.save();

  // Step 4: Return success response
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Resource blocked successfully"));
});

// Unblock a resource by Admin
const unblockResource = asyncHandler(async (req, res) => {
  const { resourceId } = req.params; // Get the resourceId from the request params

  // Step 1: Find the resource by ID
  const resource = await Resource.findById(resourceId);

  if (!resource) {
    throw new ApiError(404, "Resource not found");
  }

  // Step 2: Unblock the resource (set isBlocked to false)
  resource.isBlocked = false;

  // Step 3: Save the resource with updated status
  await resource.save();

  // Step 4: Return success response
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Resource unblocked successfully"));
});

export {
  adminDashboard,
  //   blockUser,
  //   unblockUser,
  deleteUser,
  blockResource,
  unblockResource,
};
