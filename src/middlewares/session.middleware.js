import { LoginStatusType } from "../constants.js";
import { AuditUserLogin } from "../models/auditUserLogin.model.js";
import { userLoginDetail } from "../models/userLoginDetail.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const sessionMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const userLoginDetail = userLoginDetail.findOne({
      userDetailId: eq.user._id,
    });
    const auditUserLogin = AuditUserLogin.findOne({
      userLoginDetailId: userLoginDetail._id,
      loginStatus: LoginStatusType.LOGGEDIN,
    });

    if (!auditUserLogin) {
      const newLogin = new AuditUserLogin.create({
        userLoginDetailId: userLoginDetail._id,
        sessionID: `SESSION-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        loginDateTime: Date.now(),
      });

      (req.auditUserLoginId = newLogin._id), next();
      return;
    }

    req.auditUserLoginId = auditUserLogin._id;

    next();
  } catch (error) {
    return error;
  }
});

export { sessionMiddleware };
