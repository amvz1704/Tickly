import { pool } from "../config/db.js";
import { createEventoSchema, updateEventoSchema, createHorarioSchema, updateHorarioSchema } from "../validations/eventos.schema.js";

/**
 * Obtener todos los eventos
 */
export const getAllEventos = async (req, res, next) => {
  try {
    const { estado, id_cliente_empresa, id_tipo_evento } = req.query;
    
    let query = `
      SELECT 
        e.id_evento,
        e."id_cliente_empresa_Cliente_empresa" as id_cliente_empresa,
        e."id_tipo_evento_Tipo_de_evento" as id_tipo_evento,
        te.nombre as tipo_evento_nombre,
        e.descripcion,
        e.imagen_publicitaria,
        e.imagen_distribucion,
        e.enlace_playlist,
        e.edad_min,
        e.estado,
        ce.razon_social as empresa_razon_social,
        ce.nombre_comercial as empresa_nombre_comercial
      FROM public."Evento" e
      INNER JOIN public."Tipo_de_evento" te ON e."id_tipo_evento_Tipo_de_evento" = te.id_tipo_evento
      INNER JOIN public."Cliente_empresa" ce ON e."id_cliente_empresa_Cliente_empresa" = ce.id_cliente_empresa
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (estado !== undefined) {
      query += ` AND e.estado = $${paramCount}`;
      params.push(estado === 'true');
      paramCount++;
    }

    if (id_cliente_empresa) {
      query += ` AND e."id_cliente_empresa_Cliente_empresa" = $${paramCount}`;
      params.push(parseInt(id_cliente_empresa));
      paramCount++;
    }

    if (id_tipo_evento) {
      query += ` AND e."id_tipo_evento_Tipo_de_evento" = $${paramCount}`;
      params.push(parseInt(id_tipo_evento));
      paramCount++;
    }

    query += ` ORDER BY e.id_evento DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (e) {
    console.error("❌ Error en getAllEventos:", e.message);
    next(e);
  }
};

/**
 * Obtener un evento por ID
 */
export const getEventoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { rows } = await pool.query(
      `SELECT 
        e.id_evento,
        e."id_cliente_empresa_Cliente_empresa" as id_cliente_empresa,
        e."id_tipo_evento_Tipo_de_evento" as id_tipo_evento,
        te.nombre as tipo_evento_nombre,
        e.descripcion,
        e.imagen_publicitaria,
        e.imagen_distribucion,
        e.enlace_playlist,
        e.edad_min,
        e.estado,
        ce.razon_social as empresa_razon_social,
        ce.nombre_comercial as empresa_nombre_comercial
      FROM public."Evento" e
      INNER JOIN public."Tipo_de_evento" te ON e."id_tipo_evento_Tipo_de_evento" = te.id_tipo_evento
      INNER JOIN public."Cliente_empresa" ce ON e."id_cliente_empresa_Cliente_empresa" = ce.id_cliente_empresa
      WHERE e.id_evento = $1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    res.json(rows[0]);
  } catch (e) {
    console.error("❌ Error en getEventoById:", e.message);
    next(e);
  }
};

/**
 * Crear un nuevo evento (solo CLIENTE_EMPRESA)
 */
export const createEvento = async (req, res, next) => {
  try {
    const userId = req.user?.sub || req.headers["x-user-id"];
    const userRole = req.user?.tipo_usuario || req.headers["x-user-role"];

    if (!userId) {
      return res.status(401).json({ msg: "No autorizado: usuario no encontrado" });
    }

    if (userRole !== "CLIENTE_EMPRESA") {
      return res.status(403).json({ msg: "Solo las empresas pueden crear eventos" });
    }

    const data = createEventoSchema.parse(req.body);

    // Obtener el id_cliente_empresa del usuario autenticado
    const { rows: empresaRows } = await pool.query(
      `SELECT id_cliente_empresa FROM public."Cliente_empresa" 
       WHERE "id_usuario_Usuario" = $1`,
      [userId]
    );

    if (!empresaRows.length) {
      return res.status(403).json({ msg: "No tiene permisos para crear eventos" });
    }

    const idClienteEmpresa = empresaRows[0].id_cliente_empresa;

    // Verificar que el id_cliente_empresa del body corresponde al usuario autenticado
    if (data.id_cliente_empresa !== idClienteEmpresa) {
      return res.status(403).json({ msg: "No puede crear eventos para otra empresa" });
    }

    // Verificar que el tipo de evento existe
    const { rows: tipoRows } = await pool.query(
      `SELECT id_tipo_evento FROM public."Tipo_de_evento" WHERE id_tipo_evento = $1`,
      [data.id_tipo_evento]
    );

    if (!tipoRows.length) {
      return res.status(400).json({ msg: "Tipo de evento no válido" });
    }

    await pool.query("BEGIN");
    
    try {
      // Obtener el siguiente ID (Evento.id_evento NO tiene auto-incremento según BD)
      const { rows: idRows } = await pool.query(
        `SELECT COALESCE(MAX(id_evento), 0) + 1 as next_id FROM public."Evento"`
      );
      const nextId = idRows[0].next_id;

      const { rows } = await pool.query(
        `INSERT INTO public."Evento" 
         (id_evento, "id_cliente_empresa_Cliente_empresa", "id_tipo_evento_Tipo_de_evento", 
          descripcion, imagen_publicitaria, imagen_distribucion, enlace_playlist, edad_min, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          nextId,
          data.id_cliente_empresa,
          data.id_tipo_evento,
          data.descripcion,
          data.imagen_publicitaria,
          data.imagen_distribucion,
          data.enlace_playlist || null,
          data.edad_min,
          data.estado ?? true,
        ]
      );

      await pool.query("COMMIT");

      res.status(201).json({
        msg: "Evento creado exitosamente",
        evento: rows[0],
      });
    } catch (e) {
      await pool.query("ROLLBACK");
      throw e;
    }
  } catch (err) {
    console.error("❌ Error en createEvento:", err.message);
    next(err);
  }
};

/**
 * Actualizar un evento (solo el dueño o ADMIN)
 */
export const updateEvento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.sub || req.headers["x-user-id"];
    const userRole = req.user?.tipo_usuario || req.headers["x-user-role"];

    if (!userId) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    const data = updateEventoSchema.parse(req.body);

    // Verificar que el evento existe y obtener el dueño
    const { rows: eventoRows } = await pool.query(
      `SELECT "id_cliente_empresa_Cliente_empresa" FROM public."Evento" WHERE id_evento = $1`,
      [id]
    );

    if (!eventoRows.length) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    const idClienteEmpresaEvento = eventoRows[0].id_cliente_empresa_Cliente_empresa;

    // Obtener el id_cliente_empresa del usuario autenticado
    const { rows: empresaRows } = await pool.query(
      `SELECT id_cliente_empresa FROM public."Cliente_empresa" 
       WHERE "id_usuario_Usuario" = $1`,
      [userId]
    );

    // Verificar permisos: solo el dueño o ADMIN puede actualizar
    if (userRole !== "ADMIN") {
      if (!empresaRows.length) {
        return res.status(403).json({ msg: "No tiene permisos para actualizar este evento" });
      }
      const idClienteEmpresaUsuario = empresaRows[0].id_cliente_empresa;
      if (idClienteEmpresaUsuario !== idClienteEmpresaEvento) {
        return res.status(403).json({ msg: "No tiene permisos para actualizar este evento" });
      }
    }

    // Si se actualiza el tipo de evento, verificar que existe
    if (data.id_tipo_evento) {
      const { rows: tipoRows } = await pool.query(
        `SELECT id_tipo_evento FROM public."Tipo_de_evento" WHERE id_tipo_evento = $1`,
        [data.id_tipo_evento]
      );

      if (!tipoRows.length) {
        return res.status(400).json({ msg: "Tipo de evento no válido" });
      }
    }

    // Construir la consulta de actualización dinámicamente
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (data.id_tipo_evento !== undefined) {
      updates.push(`"id_tipo_evento_Tipo_de_evento" = $${paramCount}`);
      params.push(data.id_tipo_evento);
      paramCount++;
    }

    if (data.descripcion !== undefined) {
      updates.push(`descripcion = $${paramCount}`);
      params.push(data.descripcion);
      paramCount++;
    }

    if (data.imagen_publicitaria !== undefined) {
      updates.push(`imagen_publicitaria = $${paramCount}`);
      params.push(data.imagen_publicitaria);
      paramCount++;
    }

    if (data.imagen_distribucion !== undefined) {
      updates.push(`imagen_distribucion = $${paramCount}`);
      params.push(data.imagen_distribucion);
      paramCount++;
    }

    if (data.enlace_playlist !== undefined) {
      updates.push(`enlace_playlist = $${paramCount}`);
      params.push(data.enlace_playlist || null);
      paramCount++;
    }

    if (data.edad_min !== undefined) {
      updates.push(`edad_min = $${paramCount}`);
      params.push(data.edad_min);
      paramCount++;
    }

    if (data.estado !== undefined) {
      updates.push(`estado = $${paramCount}`);
      params.push(data.estado);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ msg: "No hay campos para actualizar" });
    }

    params.push(id);

    const query = `UPDATE public."Evento" SET ${updates.join(", ")} WHERE id_evento = $${paramCount} RETURNING *`;
    const { rows } = await pool.query(query, params);

    res.json({
      msg: "Evento actualizado exitosamente",
      evento: rows[0],
    });
  } catch (err) {
    console.error("❌ Error en updateEvento:", err.message);
    next(err);
  }
};

/**
 * Eliminar un evento (solo ADMIN o el dueño)
 */
export const deleteEvento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.sub || req.headers["x-user-id"];
    const userRole = req.user?.tipo_usuario || req.headers["x-user-role"];

    if (!userId) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    // Verificar que el evento existe y obtener el dueño
    const { rows: eventoRows } = await pool.query(
      `SELECT "id_cliente_empresa_Cliente_empresa" FROM public."Evento" WHERE id_evento = $1`,
      [id]
    );

    if (!eventoRows.length) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    const idClienteEmpresaEvento = eventoRows[0].id_cliente_empresa_Cliente_empresa;

    // Obtener el id_cliente_empresa del usuario autenticado
    const { rows: empresaRows } = await pool.query(
      `SELECT id_cliente_empresa FROM public."Cliente_empresa" 
       WHERE "id_usuario_Usuario" = $1`,
      [userId]
    );

    // Verificar permisos
    if (userRole !== "ADMIN") {
      if (!empresaRows.length) {
        return res.status(403).json({ msg: "No tiene permisos para eliminar este evento" });
      }
      const idClienteEmpresaUsuario = empresaRows[0].id_cliente_empresa;
      if (idClienteEmpresaUsuario !== idClienteEmpresaEvento) {
        return res.status(403).json({ msg: "No tiene permisos para eliminar este evento" });
      }
    }

    // Verificar si tiene horarios asociados (restricción de integridad)
    const { rows: horariosRows } = await pool.query(
      `SELECT COUNT(*) as count FROM public."Horarios_Eventos" WHERE "id_evento_Evento" = $1`,
      [id]
    );

    if (parseInt(horariosRows[0].count) > 0) {
      return res.status(400).json({ 
        msg: "No se puede eliminar el evento porque tiene horarios asociados. Primero elimine los horarios." 
      });
    }

    await pool.query("DELETE FROM public.\"Evento\" WHERE id_evento = $1", [id]);

    res.json({ msg: "Evento eliminado exitosamente" });
  } catch (err) {
    console.error("❌ Error en deleteEvento:", err.message);
    next(err);
  }
};

/**
 * Obtener horarios de un evento
 */
export const getHorariosByEvento = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT 
        he.id_horario_eventos,
        he."id_evento_Evento" as id_evento,
        he.fecha_inicio,
        he.hora_inicio,
        he.duracion
      FROM public."Horarios_Eventos" he
      WHERE he."id_evento_Evento" = $1
      ORDER BY he.hora_inicio ASC`,
      [id]
    );

    res.json(rows);
  } catch (e) {
    console.error("❌ Error en getHorariosByEvento:", e.message);
    next(e);
  }
};

/**
 * Crear un horario para un evento
 */
export const createHorario = async (req, res, next) => {
  try {
    const userId = req.user?.sub || req.headers["x-user-id"];
    const userRole = req.user?.tipo_usuario || req.headers["x-user-role"];

    if (!userId) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    const data = createHorarioSchema.parse(req.body);

    // Verificar que el evento existe y obtener el dueño
    const { rows: eventoRows } = await pool.query(
      `SELECT "id_cliente_empresa_Cliente_empresa" FROM public."Evento" WHERE id_evento = $1`,
      [data.id_evento]
    );

    if (!eventoRows.length) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    const idClienteEmpresaEvento = eventoRows[0].id_cliente_empresa_Cliente_empresa;

    // Obtener el id_cliente_empresa del usuario autenticado
    const { rows: empresaRows } = await pool.query(
      `SELECT id_cliente_empresa FROM public."Cliente_empresa" 
       WHERE "id_usuario_Usuario" = $1`,
      [userId]
    );

    // Verificar permisos
    if (userRole !== "ADMIN") {
      if (!empresaRows.length) {
        return res.status(403).json({ msg: "No tiene permisos para crear horarios para este evento" });
      }
      const idClienteEmpresaUsuario = empresaRows[0].id_cliente_empresa;
      if (idClienteEmpresaUsuario !== idClienteEmpresaEvento) {
        return res.status(403).json({ msg: "No tiene permisos para crear horarios para este evento" });
      }
    }

    await pool.query("BEGIN");

    try {
      // Obtener el siguiente ID (Horarios_Eventos.id_horario_eventos NO tiene auto-incremento según BD)
      const { rows: idRows } = await pool.query(
        `SELECT COALESCE(MAX(id_horario_eventos), 0) + 1 as next_id FROM public."Horarios_Eventos"`
      );
      const nextId = idRows[0].next_id;

      const { rows } = await pool.query(
        `INSERT INTO public."Horarios_Eventos"
         (id_horario_eventos, "id_evento_Evento", fecha_inicio, hora_inicio, duracion)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [nextId, data.id_evento, data.fecha_inicio, data.hora_inicio, data.duracion]
      );

      await pool.query("COMMIT");

      res.status(201).json({
        msg: "Horario creado exitosamente",
        horario: rows[0],
      });
    } catch (e) {
      await pool.query("ROLLBACK");
      throw e;
    }
  } catch (err) {
    console.error("❌ Error en createHorario:", err.message);
    next(err);
  }
};

/**
 * Obtener tipos de evento
 */
export const getTiposEvento = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id_tipo_evento, nombre FROM public."Tipo_de_evento" ORDER BY nombre ASC`
    );

    res.json(rows);
  } catch (e) {
    console.error("❌ Error en getTiposEvento:", e.message);
    next(e);
  }
};

