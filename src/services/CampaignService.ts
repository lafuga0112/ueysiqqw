import { campaignsUrl } from "../config";
const localCampaigns: Record<string, any> = {};

export class CampaignService {
    // Función para obtener una campaña, ya sea desde el almacenamiento local o haciendo la petición
    static async getCampaign(name: string): Promise<any | null> {
        // Si no hay campañas almacenadas localmente, obtener todas
        if (Object.keys(localCampaigns).length === 0) {
            try {
                console.log("Obteniendo todas las campañas de la API")
                const response = await fetch(campaignsUrl, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error fetching campaigns: ${response.statusText}`);
                }

                const data = await response.json();
                console.log("Respuesta de la API de campañas:", data)
                
                // Almacenar todas las campañas localmente
                Object.assign(localCampaigns, data);
                console.log("Campañas almacenadas localmente:", localCampaigns)
            } catch (error) {
                console.error('Error al obtener campañas:', error);
                return null;
            }
        }

        // Retornar la campaña solicitada del almacenamiento local
        if (localCampaigns[name]) {
            return localCampaigns[name];
        }

        console.log("Campaña no encontrada:", name);
        return null;
    }
}
