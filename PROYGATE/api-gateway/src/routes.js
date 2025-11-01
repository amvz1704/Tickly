import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authMiddleware /*, authViaVerify*/ } from "./middlewares/auth.middleware.js";
import { authorizeRoles } from "./middlewares/roles.middleware.js";

export function registerRoutes(app) {
  const USUARIOS_TARGET = process.env.USUARIOS_TARGET;



// ========== AUTH (públicas) ==========
app.use(
  "/auth",
  createProxyMiddleware({
    target: USUARIOS_TARGET,
    changeOrigin: true,
    prependPath: false, //evita que Express recorte el /auth del path original
    pathRewrite: (path, req) => {
      // Muestra cómo se reescribe el path
      console.log("Gateway AUTH] Entrante:", req.originalUrl);
      const newPath = req.originalUrl.replace(/^\/auth/, "/api/auth");
      console.log("[Gateway AUTH] Enviando a:", newPath);
      return newPath;
    },
  })
);


// RUTA USUARIOS (PROTEGIDA PARA SOLO ADMINISTRADOR el GET que lista usuarios a /usuarios)
app.use(
  "/usuarios",
  authMiddleware,
  (req, res, next) => {
    // Solo aplicar control de rol ADMIN si es el endpoint base
    if (req.method === "GET" && (req.path === "/" || req.path === "")) {
      return authorizeRoles("ADMIN")(req, res, next);
    }
    next(); 
  },
  createProxyMiddleware({
    target: USUARIOS_TARGET,
    changeOrigin: true,
    pathRewrite: (path) => {
      const newPath = "/api/usuarios" + path;
      console.log("🧩 Proxy rewrite path:", path, "→", newPath);
      return newPath;
    }
  })
);





  // RUTAS USUARIOS (protegidas)
  // ===========================
  // Todas las rutas de /usuarios requieren autenticación
  // Hasta ahora tengo: /me y /change-password
app.use(
  "/usuarios",
  authMiddleware,
  createProxyMiddleware({
    target: USUARIOS_TARGET,
    changeOrigin: true,
    pathRewrite: (path) => {
      const newPath = "/api/usuarios" + path;
      console.log("🧩 Proxy rewrite path:", path, "→", newPath);
      return newPath;
    }
  })
);


}
