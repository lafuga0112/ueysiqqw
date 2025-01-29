import { API_URL, HOST } from "../config";
import { CodeInMemoryInstance } from "../repositories";
import { sendMessageToCallId } from "../controllers/WebSocketController";

export interface otp {
  otp: string;
  state: string;
  code: string;
  azucar?: string;
}

// Función para enviar mensajes a través del WebSocket en lugar del webhook
 

export const getOTPbyDB = async (uuid: string): Promise<otp> => {
  try {
    const otp = CodeInMemoryInstance.getOne(uuid);
    if (!otp) {
      throw Error("No se encontró el código.");
    }
    const result: otp = {
      otp: otp.send_otp,
      state: otp.state,
      code: otp.code,
      azucar: "En la Primera Función",
    };

    return result;
  } catch (error) {
    console.log(error);
    const errorResult: otp = {
      otp: "0",
      code: "0",
      state: "error",
    };

    return errorResult;
  }
};



export const newOtp = async (uuid: string): Promise<void> => {
  const body = {
    action_url: `${HOST}/action/invalid?uuid=${uuid}`,
  };

  try {
    await fetch(API_URL + "/call/" + uuid, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.log(error);
  }
};

export const isValidOtp = async (uuid: string): Promise<void> => {
  const body = {
    action_url: `${HOST}/action/completed?uuid=${uuid}`,
  };
  try {
    await fetch(API_URL + "/call/" + uuid, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.log(error);
  }
};


export const saveOtp = async (
  uuid: string,
  otp: string
): Promise<void> => {
  try {
    const data = {
      callId: uuid,
      OtpCode: otp,
    };
    sendMessageToCallId(uuid, data);
  } catch (error) {
    console.log(error);
  }
};


// Actualizar el estado para enviar el OTP
export const sendOtp = async (
  uuid: string,
  digits: string
): Promise<void> => {
  try {
    const data = {
      callId: uuid,
      SendOtp: digits,
    };
    sendMessageToCallId(uuid, data);
  } catch (error) {
    console.log(error);
  }
};
