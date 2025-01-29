import { Request, Response } from "express";
import { getOTPbyDB } from "../services"; // Ensure the correct service function is imported

export const StatusController = async (req: Request, res: Response) => {
  const { uuid } = req.query; // Extract `uuid` from query parameters

  if (!uuid) {
    return res.status(200).json({
      success: false,
      message: "UUID is required",
    });
  }

  try {
    // Fetch OTP details from the database
    const { otp, state, code } = await getOTPbyDB(uuid as string); // Ensure `uuid` is cast to a string if needed


    // Check conditions and return appropriate response
    if (code !== "0.0" && otp === "0") {
      return res.json({
        success: true,
        code: code,
        state: state,
        message: "call status",
      });
    }

    if (code !== "0.0" && otp !== "0") {
      const data = {
        otp: otp,
        uuid: uuid,
        code: code,
      };
      return res.json({
        success: true,
        data: data,
        state: state,
        message: "call status",
      });
    }

    // If no conditions are met, return a default response
    return res.status(200).json({
      success: false,
      message: "No valid call status found",
    });
  } catch (error) {

    // Return a 500 Internal Server Error in case of any exceptions
    return res.status(200).json({
      success: false,
      message: "An error occurred while retrieving call status",
    });
  }
};

export default StatusController;
