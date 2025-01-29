import express, { Express, Request, Response } from "express";
import {
  ActionsController,
  CallController,
  CloseCallController,
  newCallController,
  StatusController,
  WebhookController,
} from "./controllers";

export class Server {
  app: Express = express();

  constructor() {
    this.setMiddlewares();
    this.setRoutes();
  }

  setMiddlewares() {
    this.app.use(express.json());
  }

  setRoutes() {
    this.app.post("/call/:number", CallController);
    this.app.delete("/close", CloseCallController);
    this.app.put("/new", newCallController);
    this.app.get("/status", StatusController);

    // api routes
    this.app.get("/webhook", WebhookController);
    this.app.get("/action/:status", ActionsController);
  }

  listen(port: any, callback?: () => void) {
    this.app.listen(port, callback);
  }
}

export const ServerInstance = new Server();
