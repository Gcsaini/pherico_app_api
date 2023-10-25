import cors from "cors";
import express, { urlencoded } from "express";
import { createPool } from "mysql2/promise";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import route from "./app/router/routes.js";

const app = express();
dotenv.config();

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 5000;

const reconnect_pool = () => {
  global.connection_W = createPool({
    connectionLimit: process.env.DB_CONNECTION_W,
    host: process.env.DB_HOST_W,
    user: process.env.DB_USERNAME_W,
    password: process.env.DB_PASSWORD_W,
    database: process.env.DB_NAME_W,
    port: process.env.DB_PORT_W,
    waitForConnections: true,
    queueLimit: 0,
  });
};
reconnect_pool();
global.connection_W.on("connection", (connection) => {
  connection.on("error", (error) => {
    console.error("MySQL Connection Error:", error);
    if (error.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("Reconnecting to MySQL...");
      global.connection_W.end();
      reconnect_pool();
    }
  });
});

app.use("/", route);

app.listen(port, () => {
  console.log(`App listening at ${port}`);
});
