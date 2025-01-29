import { Request, Response } from "express";
import { updateCall } from "../services";
import { sendMessageToCallId } from "./WebSocketController";

export const WebhookController = async (req: Request, res: Response) => {
  const { uuid, status, CallDuration } = req.query; // Extract query parameters from Express request

  if (!uuid || !status) {
    return res.status(200).json({
      success: false,
      message: "UUID and status are required",
    });
  }

  try {
    // Update the call using the provided services
    await updateCall(uuid as string, status as string); // Assuming uuid and status are strings
    
    // Prepare the event message object
    let eventMessage: { callId: string; status: string; callDuration?: string | string[] } = {
      callId: uuid as string,
      status: status as string,
    };

    if (CallDuration !== undefined) {
      eventMessage.callDuration = CallDuration as string;
    }

    // Use WebSocketController to send the message
    sendMessageToCallId(uuid as string, eventMessage);
    //console.log(JSON.stringify(eventMessage, null, 2));

    return res.json({
      success: true,
      data: null,
      message: "call updated",
    });
  } catch (error) {
    console.error("Error processing WebhookController:", error);

    return res.status(200).json({
      success: false,
      message: "An error occurred while updating the call",
    });
  }
};

export default WebhookController;
