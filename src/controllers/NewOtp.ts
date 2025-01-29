import { Request, Response } from "express";
import { newOtp } from "../services"; // Ensure to import the correct service function
import { CodeInMemoryInstance } from "../repositories"; // Ensure this is correctly imported from your codebase

export const newCallController = async (req: Request, res: Response) => {
  const { uuid } = req.query; // Extract the `uuid` from the query parameters

  if (!uuid) {
    return res.status(200).json({
      success: false,
      message: "UUID is required",
    });
  }

  try {
    await newOtp(uuid as string); // Assuming `uuid` is of type string and `newOtp` requires a string argument

    // Update in-memory or database state
    CodeInMemoryInstance.updateOne(uuid as string, {
      send_otp: "0.0",
      code: "0.0",
    });

    return res.json({
      success: true,
      message: "new otp solicited",
    });
  } catch (error) {

    return res.status(200).json({
      success: false,
      message: "An error occurred while soliciting new OTP",
    });
  }
};

export default newCallController;
