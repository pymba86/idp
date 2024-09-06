export type Json = JsonObject | JsonArray | string | number | boolean | null;
export type JsonArray = Json[];
export type JsonObject = {
    [key: string]: Json;
};