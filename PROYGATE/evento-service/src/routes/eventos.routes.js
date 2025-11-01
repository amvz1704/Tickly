import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";
import {
  getAllEventos,
  getEventoById,
  createEvento,
  updateEvento,
  deleteEvento,
  getHorariosByEvento,
  createHorario,
  getTiposEvento,
} from "../controllers/eventos.controller.js";

const router = Router();

// Rutas públicas
router.get("/tipos", getTiposEvento); // Obtener tipos de evento

// Rutas que requieren autenticación
router.use(authMiddleware);

// CRUD de eventos
router.get("/", getAllEventos); // Listar eventos (puede filtrar por query params)
router.get("/:id", getEventoById); // Obtener evento por ID
router.post("/", roleMiddleware("CLIENTE_EMPRESA"), createEvento); // Crear evento (solo empresas)
router.put("/:id", updateEvento); // Actualizar evento (dueño o ADMIN)
router.delete("/:id", deleteEvento); // Eliminar evento (dueño o ADMIN)

// Horarios de eventos
router.get("/:id/horarios", getHorariosByEvento); // Obtener horarios de un evento
router.post("/horarios", roleMiddleware("CLIENTE_EMPRESA"), createHorario); // Crear horario (solo empresas)

export default router;

