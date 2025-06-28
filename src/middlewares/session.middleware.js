import { asyncHandler } from "../utils/AsyncHandler.js";

const sessionMiddleware = asyncHandler(async (req, res, next) => {
  try {
  // find the user from database
  // find userLoginDetail which is having user and createdAt is less than session timeout or same token
  // if no user loginDetail create new else 
  //  
  //




    next();
  } catch (error) {
    return error;
  }
});

export { sessionMiddleware };
