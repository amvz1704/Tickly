import { pool } from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/password.js";

//Informacion de perfil propio
export const me = async (req, res, next) => {
  try {
    // Tomamos el id de usuario ya decodificado por el Gateway
    const userId = req.user?.sub || req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({ msg: "No autorizado: usuario no encontrado en el token" });
    }

    const { rows } = await pool.query(
      `SELECT id_usuario, tipo_usuario, nombre_pila, apellido_paterno, apellido_materno,
              correo_electronico, telefono, estado, foto_perfil
       FROM public."Usuario"
       WHERE id_usuario=$1`,
      [userId]
    );

    if (!rows.length) return res.status(404).json({ msg: "No encontrado" });

    res.json(rows[0]);
  } catch (e) {
    console.error("❌ Error en /me:", e.message);
    next(e);
  }
};

// Cambio de contraseña propia
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.sub || req.headers["x-user-id"];
    const { old_password, new_password } = req.body || {};

    if (!old_password || !new_password) {
      return res.status(400).json({ msg: "old_password y new_password son requeridos" });
    }

    const { rows } = await pool.query(
      `SELECT contrasena FROM public."Usuario" WHERE id_usuario=$1`,
      [userId]
    );

    if (!rows.length) return res.status(404).json({ msg: "No encontrado" });

    const ok = await comparePassword(old_password, rows[0].contrasena);
    if (!ok) return res.status(401).json({ msg: "Contraseña actual incorrecta" });

    const hash = await hashPassword(new_password);
    await pool.query(
      `UPDATE public."Usuario" SET contrasena=$1 WHERE id_usuario=$2`,
      [hash, userId] // ✅ corregido
    );

    res.json({ msg: "Contraseña actualizada" });
  } catch (e) {
    console.error("❌ Error en changePassword:", e.message);
    next(e);
  }
};


//Listar todos los usuarios (solo puede acceder un administrador)
export const getAllUsuarios = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
          u.id_usuario,
          u.tipo_usuario,
          u.nombre_pila,
          u.apellido_paterno,
          u.apellido_materno,
          u.correo_electronico,
          u.telefono,
          u.estado,
          u.foto_perfil
       FROM public."Usuario" u
       ORDER BY u.id_usuario ASC`
    );

    res.json(rows);
  } catch (e) {
    console.error("❌ Error en getAllUsuarios:", e.message);
    next(e);
  }
};

