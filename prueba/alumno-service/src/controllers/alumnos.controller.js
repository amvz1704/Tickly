import { alumnos } from "../models/alumno.model.js";

export const getAll = (req, res) => res.json(alumnos);
export const getById = (req, res) => {
  const alumno = alumnos.find(a => a.id === parseInt(req.params.id));
  alumno ? res.json(alumno) : res.status(404).json({ msg: "No encontrado" });
};
export const create = (req, res) => {
  const nuevo = { id: alumnos.length + 1, ...req.body };
  alumnos.push(nuevo);
  res.status(201).json(nuevo);
};
export const update = (req, res) => {
  const index = alumnos.findIndex(a => a.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ msg: "No encontrado" });
  alumnos[index] = { ...alumnos[index], ...req.body };
  res.json(alumnos[index]);
};
export const remove = (req, res) => {
  const index = alumnos.findIndex(a => a.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ msg: "No encontrado" });
  alumnos.splice(index, 1);
  res.status(204).send();
};
