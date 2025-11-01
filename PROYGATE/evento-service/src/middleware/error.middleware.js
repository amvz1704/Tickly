export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.stack || err);
  res.status(500).json({ msg: err.message || "Error interno del servidor" });
};

