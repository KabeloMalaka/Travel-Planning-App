import { CitySuggestion } from "../interface/CitySuggestion";
import dotenv from 'dotenv';
dotenv.config();

const GEOCODING_API_URL = process.env.GEOCODING_API_URL;

export async function getGeocode(
    name: string,
    limit = 10,
    language = "en"
): Promise<CitySuggestion[]> {
    const url = `${GEOCODING_API_URL}?name=${encodeURIComponent(name)}&count=${limit}&language=${language}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Geocoding failed: ${response.status}`);
    
    const json = await response.json();
    
    return (json.results || []).map((result: any) => ({
        id: result.id,
        name: result.name,
        country: result.country,
        admin1: result.admin1,
        latitude: result.latitude,
        longitude: result.longitude,
        timezone: result.timezone,
        distanceKm: result.distanceKm,
    }));
}
