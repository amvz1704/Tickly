import { Router } from "express";
import { login, registerCliente, registerEmpresa, verify } from "../controllers/auth.controller.js";
import { registerAdmin } from "../controllers/auth.controller.js";


const router = Router();

router.post("/register", registerCliente);           // Cliente_comprador
router.post("/register-empresa", registerEmpresa);   // Cliente_empresa
router.post("/login", login);
router.get("/verify", verify);                       // usado por otros servicios
router.post("/register-admin", registerAdmin);       // Admin (cuando necesite registrar uno)

export default router;
