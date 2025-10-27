export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);
  if (res.headersSent) return;
  res.status(500).json({ msg: "Error interno del servidor" });
};
