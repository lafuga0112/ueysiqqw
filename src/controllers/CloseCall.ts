import { Request, Response } from "express";
import { isValidOtp, closeCall } from "../services"; // Make sure to import these functions from the correct location

export const CloseCallController = async (req: Request, res: Response) => {
  const { uuid, type } = req.query; // Extracting query parameters from Express request object

  if (!uuid || !type) {
    return res.status(200).json({
      success: false,
      message: "Missing required query parameters: uuid and/or type",
    });
  }

  try {
    // If type is '1', validate OTP
    if (type === "1") {
      await isValidOtp(uuid as string); // Assuming uuid is a string
    }

    // If type is '2', close the call
    if (type === "2") {
      await closeCall(uuid as string); // Assuming uuid is a string
    }

    // Respond with success message if no errors occurred
    return res.json({
      success: true,
      message: "call closed",
    });
  } catch (error) {

    // Respond with an error message in case of an exception
    return res.status(200).json({
      success: false,
      message: "An error occurred while closing the call",
    });
  }
};

export default CloseCallController;
