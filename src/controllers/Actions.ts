import { Request, Response } from "express";
import { HOST } from "../config";
import { getActions, saveOtp, sendOtp } from "../services";

export const ActionsController = async (req: Request, res: Response) => {
 
  const { status } = req.params; // Access path parameters from the request
  const { uuid, Digits } = req.query; // Access query parameters from the request

  if (!uuid) {
    return res.status(200).json({
      success: false,
      message: "UUID is required",
    });
  }

  try {
    // Fetch actions from the service
    const actions = await getActions(uuid as string); // Pass Express request if needed by service


    if (!actions) {
      return res.status(200).send({
        success: false,
        message: "The uuid was not found in memory."
      }); // Send a 200 status with a null response
    }

    // Destructure the required fields from the actions object
    const { audio, next, dgts, timeout } = actions[status];
    const host = `${HOST}/action/`;

    // Logic for handling "gather" and "confirm" statuses
    if (status === "gather" && Digits) {
      await sendOtp(uuid as string, Digits as string); // Cast to string if necessary
    }

    if (status === "confirm") {
      await saveOtp(uuid as string, Digits as string); // Cast to string if necessary
    }

    // Construct XML response using template literals
    let xmlResponse = `<Response>
      <Play>${audio}</Play>`;

    if (status === "confirm") {
      xmlResponse += `<Gather input="speech dtmf" timeout="${timeout}" />`;
    } else {
      xmlResponse += `<Gather
        input="speech dtmf"
        action="${host}${next}?uuid=${uuid}"
        timeout="${timeout}"
        numDigits="${dgts}"
      />`;
    }

    xmlResponse += `</Response>`;

    // Set the Content-Type to XML and send the response
    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(xmlResponse);
  } catch (error) {

    // Respond with an error message in case of any exceptions
    res.status(200).json({
      success: false,
      message: "An error occurred while processing the request",
    });
  }
};

export default ActionsController;
