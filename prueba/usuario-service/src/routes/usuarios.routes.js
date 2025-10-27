import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { me, changePassword } from "../controllers/usuarios.controller.js";

const router = Router();

router.use(authMiddleware);
router.get("/me", me);
router.put("/change-password", changePassword);

export default router;
