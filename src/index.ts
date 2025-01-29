import { ServerInstance } from "./server";
import dotenv from "dotenv";
import { initializeWebSocketController } from "./controllers/WebSocketController";
import http from "http";

// Configuración de dotenv para cargar las variables de entorno
dotenv.config();
const port = process.env.PORT || 8000;

// Crear un servidor HTTP usando Express para usarlo con WebSocket
const server = http.createServer(ServerInstance.app);

// Iniciar el WebSocket usando el servidor HTTP
initializeWebSocketController(server);

// Escuchar el servidor en el puerto especificado
server.listen(port, () => {
  console.log(`⚡[server]: Server is running at http://localhost:${port}`);
});
