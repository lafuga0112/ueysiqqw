import WebSocket, { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';

// Extender WebSocket para incluir propiedades personalizadas
interface CustomWebSocket extends WebSocket {
    isAlive: boolean;
    lastPing: number;
}

class WebSocketController {
    private wss: WebSocketServer;
    private connections: Map<string, CustomWebSocket>;
    private pingInterval: NodeJS.Timeout;
    private readonly MAX_CONNECTIONS = 1000;
    private readonly PING_INTERVAL = 30000; // 30 segundos
    private readonly CONNECTION_TIMEOUT = 60000; // 60 segundos

    constructor(server: any) {
        this.wss = new WebSocketServer({ 
            server,
            clientTracking: true,
            maxPayload: 1024 * 1024 // 1MB máximo de payload
        });
        this.connections = new Map<string, CustomWebSocket>();

        // Iniciar el ping interval
        this.pingInterval = setInterval(() => {
            this.checkConnections();
        }, this.PING_INTERVAL);

        this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
            const customWs = ws as CustomWebSocket;
            
            console.log(`Intentando conectar. Conexiones actuales: ${this.connections.size}`);

            if (this.connections.size >= this.MAX_CONNECTIONS) {
                console.log('No se puede conectar: Máximo de conexiones alcanzado');
                customWs.close(1013, 'Máximo de conexiones alcanzado');
                return;
            }

            const callId = req.url?.split('=')[1];
            if (!callId) {
                console.log('No se puede conectar: CallId requerido');
                customWs.close(1002, 'CallId requerido');
                return;
            }
            
            // Configurar el timeout y heartbeat
            customWs.isAlive = true;
            customWs.lastPing = Date.now();
            customWs.on('pong', () => {
                customWs.isAlive = true;
                customWs.lastPing = Date.now();
            });

            this.connections.set(callId, customWs);
            console.log(`Conexión establecida. Conexiones actuales: ${this.connections.size}`);

            customWs.on('message', (message: WebSocket.RawData) => {
                try {
                    const parsedMessage = JSON.parse(message.toString());
                    const { callId, status } = parsedMessage;
                    console.log(JSON.stringify(parsedMessage, null, 2))
                    // Validar tamaño del mensaje
                    if (message instanceof Buffer && message.length > (this.wss.options.maxPayload || 0)) {
                        customWs.close(1009, 'Mensaje demasiado grande');
                        return;
                    }

                    this.sendMessageToCallId(callId, parsedMessage);

                    if (status === "COMPLETED") {
                        this.cleanupConnection(customWs, callId);
                    }
                } catch (error) {
                    console.error('Error procesando mensaje:', error);
                    customWs.send(JSON.stringify({ error: 'Formato de mensaje inválido' }));
                }
            });

            customWs.on('error', (error) => {
                console.error('Error en conexión WebSocket:', error);
                this.cleanupConnection(customWs, callId);
            });

            customWs.on('close', () => {
                this.cleanupConnection(customWs, callId);
            });
        });
    }

    private cleanupConnection(ws: CustomWebSocket, callId: string): void {
        ws.terminate();
        this.connections.delete(callId);
        console.log(`Conexión cerrada. Conexiones actuales: ${this.connections.size}`);
    }

    private checkConnections(): void {
        const now = Date.now();
        this.connections.forEach((ws, callId) => {
            if (!ws.isAlive && (now - ws.lastPing) > this.CONNECTION_TIMEOUT) {
                return this.cleanupConnection(ws, callId);
            }
            ws.isAlive = false;
            ws.ping();
        });
    }

    public sendMessageToCallId(callId: string, message: object): boolean {
        const ws = this.connections.get(callId);
        if (!ws || ws.readyState !== WebSocket.OPEN) return false;
        
        try {
            ws.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            this.cleanupConnection(ws, callId);
            return false;
        }
    }

    public cleanup(): void {
        clearInterval(this.pingInterval);
        this.connections.forEach((ws, callId) => {
            this.cleanupConnection(ws, callId);
        });
        this.wss.close();
    }
}

let webSocketControllerInstance: WebSocketController | null = null;

export const initializeWebSocketController = (server: any) => {
    if (webSocketControllerInstance) {
        webSocketControllerInstance.cleanup();
    }
    webSocketControllerInstance = new WebSocketController(server);
};

export const sendMessageToCallId = (callId: string, message: object): boolean => {
    if (!webSocketControllerInstance) return false;
    return webSocketControllerInstance.sendMessageToCallId(callId, message);
};
