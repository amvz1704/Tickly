import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getAll, getById, create, update, remove } from "../controllers/alumnos.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
