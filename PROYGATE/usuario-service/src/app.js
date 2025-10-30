import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", router);
app.use(errorHandler);

export default app;


//OJO SI QUIERO CORRERLO LOCAL CAMBIAR host.docker.internal POR localhost
//EN EL .evn FIJARSE!! para correr en docker debe ser host.docker.internal