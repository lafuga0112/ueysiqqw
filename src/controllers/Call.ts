import { Request, Response } from "express";
import { sendCall } from "../services";
import { HOST } from "../config";
import queueManager from "./QueueManager"; 

export const CallController = async (req: Request, res: Response) => {
  const { number } = req.params;
  const { trunk, from, campaign } = req.query;

  // Verificar si el parámetro requerido está presente
  if (!number || !trunk || !from) {
    return res.status(200).json({
      success: false,
      data: null,
      message: "number, trunk, and from are required",
    });
  }

  // Preparar los datos de la llamada
  const callData = {
    trunk: trunk,
    to_number: number,
    from_number: from,
    action_url: `${HOST}/action/answer`,
    status_callback: `${HOST}/webhook`,
  };

  // Función que se enviará a la cola para ser procesada
  const processCall = async () => {
    try {
      // Llamar al servicio y esperar su resultado
      const data = await sendCall(callData, campaign as string);
      
      if (data && data.id) {
        const response = {
            success: true,
            callId: data.id,
            message: "call sent",
        };
        // Enviar la respuesta y registrar el log
        res.json(response);
        //console.log(response);
      } else {
        res.status(500).json({
          success: false,
          message: "call sent but no ID returned",
      });
  }
    } catch (error) {
      res.status(404).json({
        success: false,
        message: "call failed, please try again",
      });
    }
  };

  // Añadir la llamada a la cola del trunk específico
  queueManager.enqueue(trunk as string, processCall);
};

export default CallController;
