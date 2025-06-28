import { Router } from "express";
import { createSecurity, getSecurities, getSecurityById, updateSecurity } from "../controllers/security.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getSecurities);
router.route("/:securityId").get(verifyJWT, getSecurityById);

router.route("/create").post(verifyJWT,  createSecurity);
router.route("/update/:securityId").patch(verifyJWT, updateSecurity);

export default router;

