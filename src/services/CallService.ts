import { API_URL } from "../config";
import { CodeInMemoryInstance } from "../repositories";
export interface call {
  id: string;
  uuid?: string;
  trunk: string;
  to_number: string;
  from_number: string;
  action_url: string;
  status_callback: string;
}

export const sendCall = async (
  call: object,
  campaign: string
): Promise<call | null> => {
  try {
    const response = await fetch(API_URL + "/call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(call),
    });

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      const errorText = await response.text(); // Obtener la respuesta como texto para el manejo de errores
      console.error(`Error en la petición: ${response.status} ${errorText}`);
      return null; // Retornar null si la respuesta no es 200-299
    }

    // Convertir la respuesta a JSON
    const data = await response.json();
    const { id } = data as call;
    CodeInMemoryInstance.saveOne(id, "pending", "0", "0", campaign);

    return data as call;
  } catch (error) {
    console.log("Error en la petición:", error);
    return null;
  }
};


export const closeCall = async (uuid: string): Promise<void> => {
  try {
    await fetch(API_URL + "/call/" + uuid, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    CodeInMemoryInstance.deleteOne(uuid);
  } catch (error) {
    console.log(error);
  }
};

export const updateCall = async (
  uuid: string,
  status: string
): Promise<void> => {
  try {
    CodeInMemoryInstance.updateOne(uuid, { state: status });
  } catch (error) {
    console.log(error);
  }
};
