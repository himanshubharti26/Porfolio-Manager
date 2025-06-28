import { Router } from "express";
import { createSecurity, getSecurities, getSecurityById, updateSecurity } from "../controllers/security.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public route to get securities
router.route("/").get(verifyJWT, getSecurities);
// Secured route to get securities (if needed in future)
router.route("/:securityId").get(verifyJWT, getSecurityById);

router.route("/create").post(verifyJWT,  createSecurity);
router.route("/update/:securityId").patch(verifyJWT, updateSecurity);

export default router;

