import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { alumnos } from "../models/alumno.model.js";

export const register = async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password)
    return res.status(400).json({ msg: "Campos requeridos" });

  const existe = alumnos.find(a => a.email === email);
  if (existe) return res.status(400).json({ msg: "Email ya registrado" });

  const hashed = await bcrypt.hash(password, 10);
  const nuevo = { id: alumnos.length + 1, nombre, email, password: hashed };
  alumnos.push(nuevo);

  const token = jwt.sign({ sub: nuevo.id, email }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  res.status(201).json({ token, alumno: { id: nuevo.id, nombre, email } });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const alumno = alumnos.find(a => a.email === email);
  if (!alumno) return res.status(400).json({ msg: "Usuario no encontrado" });

  const valido = await bcrypt.compare(password, alumno.password);
  if (!valido) return res.status(401).json({ msg: "Credenciales inválidas" });

  const token = jwt.sign({ sub: alumno.id, email }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  res.json({ token });
};
