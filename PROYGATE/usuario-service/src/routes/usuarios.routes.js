import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getAllUsuarios, me, changePassword } from "../controllers/usuarios.controller.js";

const router = Router();

//router.use(authMiddleware);
router.get("/me", me); // información de un usuario (esta ruta requiere autentcacion del usuario)
router.put("/change-password", changePassword);
router.get("/", getAllUsuarios); // Listar todos los usuarios (solo lo accede ADMIN)
export default router;
