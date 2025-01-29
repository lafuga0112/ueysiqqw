export type Actions = {
    [key: string]: ActionData;
}
export interface ActionData {
    audio: string;
    next?: string;
    dgts?: number;
    method?: string;
    timeout: number;
}