import { pool } from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken, verifyToken } from "../utils/jwt.js";
import { registerClienteSchema, registerEmpresaSchema, loginSchema } from "../validations/auth.schema.js";

/**
 * Crea fila en "Usuario" y retorna id_usuario
 */
async function crearUsuarioBase(client, {
  nombre_pila, apellido_paterno, apellido_materno = null,
  correo_electronico, contrasena_hash, telefono = null,
  tipo_usuario, estado = true, foto_perfil = null
}) {
  const q = `
    INSERT INTO public."Usuario"
      (tipo_usuario, nombre_pila, apellido_paterno, apellido_materno, foto_perfil, contrasena, correo_electronico, telefono, estado)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id_usuario, tipo_usuario, correo_electronico;
  `;
  const params = [tipo_usuario, nombre_pila, apellido_paterno, apellido_materno, foto_perfil, contrasena_hash, correo_electronico, telefono, estado];
  const { rows } = await client.query(q, params);
  return rows[0];
}

export const registerCliente = async (req, res, next) => {
  try {
    const data = registerClienteSchema.parse(req.body);

    // ¿email ya existe?
    const exists = await pool.query(`SELECT 1 FROM public."Usuario" WHERE correo_electronico=$1`, [data.correo_electronico]);
    if (exists.rowCount > 0) return res.status(409).json({ msg: "Correo ya registrado" });

    const hash = await hashPassword(data.contrasena);

    await pool.query("BEGIN");
    try {
      const base = await crearUsuarioBase(pool, {
        nombre_pila: data.nombre_pila,
        apellido_paterno: data.apellido_paterno,
        apellido_materno: data.apellido_materno || null,
        correo_electronico: data.correo_electronico,
        contrasena_hash: hash,
        telefono: data.telefono || null,
        tipo_usuario: "CLIENTE_COMPRADOR",
        estado: true,
      });

      await pool.query(
        `INSERT INTO public."Cliente_comprador" ("id_usuario_Usuario", num_identificacion)
         VALUES ($1, $2)`,
        [base.id_usuario, data.num_identificacion || null]
      );

      await pool.query("COMMIT");

      const token = signToken({ sub: base.id_usuario, correo: base.correo_electronico, tipo_usuario: "CLIENTE_COMPRADOR" });
      return res.status(201).json({ token, id_usuario: base.id_usuario, tipo_usuario: "CLIENTE_COMPRADOR" });
    } catch (e) {
      await pool.query("ROLLBACK");
      throw e;
    }
  } catch (err) {
    return next(err);
  }
};

export const registerEmpresa = async (req, res, next) => {
  try {
    const data = registerEmpresaSchema.parse(req.body);

    const exists = await pool.query(`SELECT 1 FROM public."Usuario" WHERE correo_electronico=$1`, [data.correo_electronico]);
    if (exists.rowCount > 0) return res.status(409).json({ msg: "Correo ya registrado" });

    const hash = await hashPassword(data.contrasena);

    await pool.query("BEGIN");
    try {
      const base = await crearUsuarioBase(pool, {
        nombre_pila: data.nombre_pila,
        apellido_paterno: data.apellido_paterno,
        apellido_materno: data.apellido_materno || null,
        correo_electronico: data.correo_electronico,
        contrasena_hash: hash,
        telefono: data.telefono || null,
        tipo_usuario: "CLIENTE_EMPRESA",
        estado: true,
      });

      await pool.query(
        `INSERT INTO public."Cliente_empresa" ("id_usuario_Usuario","RUC", razon_social, nombre_comercial)
         VALUES ($1, $2, $3, $4)`,
        [base.id_usuario, data.RUC, data.razon_social, data.nombre_comercial || null]
      );

      await pool.query("COMMIT");

      const token = signToken({ sub: base.id_usuario, correo: base.correo_electronico, tipo_usuario: "CLIENTE_EMPRESA" });
      return res.status(201).json({ token, id_usuario: base.id_usuario, tipo_usuario: "CLIENTE_EMPRESA" });
    } catch (e) {
      await pool.query("ROLLBACK");
      throw e;
    }
  } catch (err) {
    return next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { correo_electronico, contrasena } = loginSchema.parse(req.body);

    const { rows } = await pool.query(
      `SELECT id_usuario, contrasena, tipo_usuario, estado, correo_electronico
       FROM public."Usuario" WHERE correo_electronico=$1`,
      [correo_electronico]
    );
    if (rows.length === 0) return res.status(400).json({ msg: "Usuario no encontrado" });

    const user = rows[0];
    if (user.estado === false) return res.status(403).json({ msg: "Usuario deshabilitado" });

    const ok = await comparePassword(contrasena, user.contrasena);
    if (!ok) return res.status(401).json({ msg: "Credenciales inválidas" });

    const token = signToken({ sub: user.id_usuario, correo: user.correo_electronico, tipo_usuario: user.tipo_usuario });
    return res.json({ token, id_usuario: user.id_usuario, tipo_usuario: user.tipo_usuario });
  } catch (err) {
    return next(err);
  }
};

export const verify = async (req, res) => {
  try {
    const header = req.headers["authorization"];
    if (!header) return res.status(200).json({ valid: false, message: "Token requerido" });

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) return res.status(200).json({ valid: false, message: "Formato inválido" });

    const payload = verifyToken(token);
    // Opcional: verificar que el usuario siga activo en DB
    const { rows } = await pool.query(
      `SELECT estado, tipo_usuario FROM public."Usuario" WHERE id_usuario=$1`,
      [payload.sub]
    );
    if (rows.length === 0 || rows[0].estado === false)
      return res.status(200).json({ valid: false, message: "Usuario deshabilitado o inexistente" });

    return res.json({
      valid: true,
      id_usuario: payload.sub,
      tipo_usuario: rows[0].tipo_usuario,
      correo: payload.correo,
    });
  } catch {
    return res.status(200).json({ valid: false, message: "Token inválido o expirado" });
  }
};
