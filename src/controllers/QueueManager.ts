import { setTimeout } from 'timers/promises';

class QueueManager {
    private queues: Map<string, Array<() => Promise<void>>>; // Mapa de colas para cada trunk
    private isProcessing: Map<string, boolean>; // Mapa para verificar si un trunk está procesando

    constructor() {
        this.queues = new Map<string, Array<() => Promise<void>>>();
        this.isProcessing = new Map<string, boolean>();
    }

    // Método para agregar una función de llamada a la cola
    public enqueue(trunk: string, callFunction: () => Promise<void>): void {
        if (!this.queues.has(trunk)) {
            this.queues.set(trunk, []);
            this.isProcessing.set(trunk, false);
        }

        const queue = this.queues.get(trunk);
        if (queue) {
            queue.push(callFunction);
            //console.log(`Número de funciones en la cola para trunk ${trunk}: ${queue.length}`); // Imprime el número de funciones en la cola
        }

        this.processQueue(trunk);
    }

    // Procesar la cola para un trunk específico
    private async processQueue(trunk: string): Promise<void> {
        if (this.isProcessing.get(trunk)) {
            return; // Si ya se está procesando, no hacer nada
        }

        this.isProcessing.set(trunk, true);
        const queue = this.queues.get(trunk);

        while (queue && queue.length > 0) {
            const callFunction = queue.shift(); // Obtener la primera llamada en la cola
            if (callFunction) {
                try {
                    await callFunction(); // Procesar la llamada
                } catch (error) {
                    //console.error(`Error processing call for trunk ${trunk}:`, error);
                }

                // Esperar 1.5 segundos antes de procesar la siguiente llamada
                await setTimeout(1500);
            }
        }

        this.isProcessing.set(trunk, false);
    }
}

const queueManager = new QueueManager();
export default queueManager;
