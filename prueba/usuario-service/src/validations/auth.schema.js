import { z } from "zod";

export const registerClienteSchema = z.object({
  nombre_pila: z.string().min(1).max(30),
  apellido_paterno: z.string().min(1).max(30),
  apellido_materno: z.string().min(1).max(30).optional().or(z.literal("")),
  correo_electronico: z.string().email().max(254),
  contrasena: z.string().min(6).max(100), // recuerda ampliar columna en DB
  telefono: z.string().max(12).optional(),
  num_identificacion: z.string().max(20).optional(),
});

export const registerEmpresaSchema = z.object({
  nombre_pila: z.string().min(1).max(30),
  apellido_paterno: z.string().min(1).max(30),
  apellido_materno: z.string().min(1).max(30).optional().or(z.literal("")),
  correo_electronico: z.string().email().max(254),
  contrasena: z.string().min(6).max(100),
  telefono: z.string().max(12).optional(),
  RUC: z.string().min(8).max(11),
  razon_social: z.string().min(1).max(50),
  nombre_comercial: z.string().min(1).max(30).optional(),
});

export const loginSchema = z.object({
  correo_electronico: z.string().email().max(254),
  contrasena: z.string().min(6).max(100),
});
