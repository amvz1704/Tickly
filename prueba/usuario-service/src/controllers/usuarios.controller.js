import { pool } from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/password.js";

/** Perfil propio */
export const me = async (req, res, next) => {
  try {
    const { sub } = req.user;
    const { rows } = await pool.query(
      `SELECT id_usuario, tipo_usuario, nombre_pila, apellido_paterno, apellido_materno,
              correo_electronico, telefono, estado, foto_perfil
       FROM public."Usuario"
       WHERE id_usuario=$1`,
      [sub]
    );
    if (!rows.length) return res.status(404).json({ msg: "No encontrado" });
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
};

/** Cambio de contraseña propia */
export const changePassword = async (req, res, next) => {
  try {
    const { sub } = req.user;
    const { old_password, new_password } = req.body || {};
    if (!old_password || !new_password) {
      return res.status(400).json({ msg: "old_password y new_password son requeridos" });
    }

    const { rows } = await pool.query(
      `SELECT contrasena FROM public."Usuario" WHERE id_usuario=$1`,
      [sub]
    );
    if (!rows.length) return res.status(404).json({ msg: "No encontrado" });

    const ok = await comparePassword(old_password, rows[0].contrasena);
    if (!ok) return res.status(401).json({ msg: "Contraseña actual incorrecta" });

    const hash = await hashPassword(new_password);
    await pool.query(
      `UPDATE public."Usuario" SET contrasena=$1 WHERE id_usuario=$2`,
      [hash, sub]
    );
    res.json({ msg: "Contraseña actualizada" });
  } catch (e) {
    next(e);
  }
};
