import { CitySuggestion } from "./interface/CitySuggestion.ts";
import dotenv from 'dotenv';
dotenv.config();

const GEOCODING_API_URL = process.env.GEOCODING_API_URL;
const FORECAST_API_URL = process.env.FORECAST_API_URL;

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

export async function fetchForecast(
  latitude: number,
  longitude: number,
  timezone = "auto",
  forecastDays = 7
) {
  // request hourly variables we need and daily aggregates
  const hourly = ["temperature_2m", "precipitation", "wind_speed_10m", "cloudcover", "snowfall"].join(",");
  const daily = ["temperature_2m_max","temperature_2m_min","precipitation_sum","snowfall_sum","sunrise","sunset"].join(",");
  
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly,
    daily,
    timezone,
    forecast_days: String(Math.min(16, Math.max(1, forecastDays)))
  });
  console.log('Forecast request params:', params.toString());

  const url = `${FORECAST_API_URL}?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Forecast failed: ${response.status}`);

  const json = await response.json();

  // normalize hourly/daily arrays into objects
  const hourlyPoints = (json.hourly.time || []).map((t: string, i: number) => ({
    time: t,
    temperature_2m: json.hourly.temperature_2m?.[i],
    precipitation: json.hourly.precipitation?.[i],
    wind_speed_10m: json.hourly.wind_speed_10m?.[i],
    cloudcover: json.hourly.cloudcover?.[i],
    snowfall: json.hourly.snowfall?.[i]
  }));

  const dailyPoints = (json.daily.time || []).map((d: string, i: number) => ({
    date: d,
    temperature_2m_max: json.daily.temperature_2m_max?.[i],
    temperature_2m_min: json.daily.temperature_2m_min?.[i],
    precipitation_sum: json.daily.precipitation_sum?.[i],
    snowfall_sum: json.daily.snowfall_sum?.[i],
    sunrise: json.daily.sunrise?.[i],
    sunset: json.daily.sunset?.[i]
  }));

  return {
    latitude: json.latitude,
    longitude: json.longitude,
    timezone: json.timezone,
    hourly: hourlyPoints,
    daily: dailyPoints
  };
}

/**
 * Ranking algorithm:
 * For each activity produce a score 0..100.
 * - Skiing: prefers low temps (daily max <= 2C), snowfall > 0, low temps overnight. Penalize heavy rain or warm temp.
 * - Surfing: prefers mild temps, low precipitation, moderate to strong wind (wind_speed_10m >= 6 m/s helps waves). If location is inland this is imperfect but user can combine with marine API later.
 * - Outdoor sightseeing: prefers low precipitation, low cloudcover, temperature between 10..28C, low wind.
 * - Indoor sightseeing: prefers opposite of outdoor (rainy, extreme temps, high wind).
 *
 * We compute simplified features from daily aggregates:
 */
export function scoreActivitiesFromForecast(forecast: any) {
  // use the next 3 days as summary
  const days = forecast.daily.slice(0, 3);
  const hourly = forecast.hourly.slice(0, 72); // 72 hours
  // helpers
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0);

  const avgTemp = avg(days.map((day: any) => (day.temperature_2m_max + day.temperature_2m_min)/2));
  const totalPrecip = days.reduce((precip: any,day: any)=> precip + (day.precipitation_sum||0),0);
  const totalSnow = days.reduce((snow: any,day: any)=> snow + (day.snowfall_sum||0),0);
  const avgWind = avg(hourly.map((hour: any) => hour.wind_speed_10m||0));
  const avgCloud = avg(hourly.map((hour: any) => hour.cloudcover||0));
  const avgPrecipHourly = avg(hourly.map((hour: any) => hour.precipitation||0));

  // score helpers: map raw value -> 0..100
  const clamp = (v:number)=>Math.max(0, Math.min(100, v));
  const lerp = (x:number, x0:number, x1:number)=> {
    if (x1===x0) return x <= x0 ? 0 : 100;
    return clamp((x - x0) / (x1 - x0) * 100);
  };

  // Skiing:
  // prefer: totalSnow high OR daily max <= 2C and avgPrecipHourly > 0.1
  let skiScore = 0;
  if (totalSnow > 0.5) {
    skiScore = clamp(50 + Math.min(50, totalSnow * 10)); // snow gives big boost
  } else {
    // colder is better
    skiScore = 100 - lerp(avgTemp, -10, 10); // -10 -> 100, 10 -> 0
    // penalize if no precipitation
    skiScore = skiScore * (1 - Math.min(0.6, avgPrecipHourly*2));
  }

  // Surfing:
  // prefer: wind between 5..12 m/s (some wind), low precipitation, temp moderate
  const windSurf = clamp(100 - Math.abs(avgWind - 8) / 8 * 100); // peak at 8 m/s
  const precipPenaltySurf = clamp(100 - avgPrecipHourly*200); // heavy precip kills surfing
  const tempSurf = clamp(100 - Math.abs(avgTemp - 18)/18*100);
  let surfScore = (windSurf*0.5 + precipPenaltySurf*0.3 + tempSurf*0.2);
  surfScore = surfScore * (totalPrecip < 30 ? 1 : 0.6);

  // Outdoor sightseeing:
  // prefer: low precip, low cloud, temp between 10-28
  const tempOutdoor = 100 - Math.max(0, Math.abs(avgTemp - 19) / 19 * 100);
  const precipOutdoor = clamp(100 - (totalPrecip / 10) * 100); // 0..10mm scale
  const cloudOutdoor = clamp(100 - avgCloud);
  let outdoorScore = (tempOutdoor*0.45 + precipOutdoor*0.35 + cloudOutdoor*0.2);

  // Indoor sightseeing: complement of outdoor & increases with extreme temps or heavy precip
  const extremeTemp = Math.max(0, Math.abs(avgTemp - 19) - 8); // how far from comfy
  let indoorScore = clamp((100 - outdoorScore) * 0.7 + (Math.min(100, totalPrecip*5)) * 0.3 + extremeTemp*1.5);
  
  const normalize = (v:number)=> Number(clamp(v).toFixed(1));

  const reasons = (activity:string) => {
    switch(activity) {
      case "Skiing":
        return [`avgTemp=${avgTemp.toFixed(1)}°C`, `totalSnow=${totalSnow.toFixed(1)}mm`, `avgPrecipHourly=${avgPrecipHourly.toFixed(2)}mm`];
      case "Surfing":
        return [`avgWind=${avgWind.toFixed(1)}m/s`, `avgTemp=${avgTemp.toFixed(1)}°C`, `totalPrecip=${totalPrecip.toFixed(1)}mm`];
      case "Outdoor Sightseeing":
        return [`avgTemp=${avgTemp.toFixed(1)}°C`, `totalPrecip=${totalPrecip.toFixed(1)}mm`, `avgCloud=${avgCloud.toFixed(1)}%`];
      case "Indoor Sightseeing":
        return [`avgTemp=${avgTemp.toFixed(1)}°C`, `totalPrecip=${totalPrecip.toFixed(1)}mm`];
      default:
        return [];
    }
  };

  return [
    { activity: "Skiing", score: normalize(skiScore), reasons: reasons("Skiing") },
    { activity: "Surfing", score: normalize(surfScore), reasons: reasons("Surfing") },
    { activity: "Indoor Sightseeing", score: normalize(indoorScore), reasons: reasons("Indoor Sightseeing") },
    { activity: "Outdoor Sightseeing", score: normalize(outdoorScore), reasons: reasons("Outdoor Sightseeing") },
  ];
}
