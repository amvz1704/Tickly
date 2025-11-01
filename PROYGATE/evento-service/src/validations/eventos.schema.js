import { z } from "zod";

export const createEventoSchema = z.object({
  id_cliente_empresa: z.number().int().positive(), // Referencia a Cliente_empresa.id_cliente_empresa
  id_tipo_evento: z.number().int().positive().max(32767), // smallint NOT NULL en BD (max 32767)
  descripcion: z.string().min(1).max(2000), // varchar(2000) NOT NULL
  imagen_publicitaria: z.string().min(1).max(255), // varchar(255) NOT NULL
  imagen_distribucion: z.string().min(1).max(255), // varchar(255) NOT NULL
  enlace_playlist: z.string().url().max(255).optional().or(z.literal("")), // varchar(255), nullable
  edad_min: z.number().int().min(0).max(32767), // smallint NOT NULL en BD (max 32767, edad mínima razonable < 120)
  estado: z.boolean().optional().default(true), // boolean, nullable
});

export const updateEventoSchema = z.object({
  id_tipo_evento: z.number().int().positive().max(32767).optional(), // smallint max 32767
  descripcion: z.string().min(1).max(2000).optional(), // varchar(2000)
  imagen_publicitaria: z.string().min(1).max(255).optional(), // varchar(255)
  imagen_distribucion: z.string().min(1).max(255).optional(), // varchar(255)
  enlace_playlist: z.string().url().max(255).optional().or(z.literal("")), // varchar(255), nullable
  edad_min: z.number().int().min(0).max(32767).optional(), // smallint NOT NULL (max 32767)
  estado: z.boolean().optional(), // boolean, nullable
});

export const createHorarioSchema = z.object({
  id_evento: z.number().int().positive(),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha debe ser YYYY-MM-DD"), // date NOT NULL en BD
  hora_inicio: z.string().datetime(), // timestamp NOT NULL en BD
  duracion: z.number().int().positive().max(32767), // smallint NOT NULL en BD (max 32767)
});

export const updateHorarioSchema = z.object({
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha debe ser YYYY-MM-DD").optional(),
  hora_inicio: z.string().datetime().optional(),
  duracion: z.number().int().positive().max(32767).optional(), // smallint max 32767
});

