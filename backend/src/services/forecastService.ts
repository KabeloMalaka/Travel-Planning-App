import dotenv from 'dotenv';
dotenv.config();

const FORECAST_API_URL = process.env.FORECAST_API_URL;

export async function fetchForecast(
    latitude: number,
    longitude: number,
    timezone = "auto",
    forecastDays = 7
) {
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

    const url = `${FORECAST_API_URL}?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Forecast failed: ${response.status}`);

    const json = await response.json();

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

export function scoreActivitiesFromForecast(forecast: any) {
    const days = forecast.daily.slice(0, 3);
    const hourly = forecast.hourly.slice(0, 72);

    const avg = (arr: number[]) => (arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0);
    const avgTemp = avg(days.map((day: any) => (day.temperature_2m_max + day.temperature_2m_min)/2));
    const totalPrecip = days.reduce((precip: any,day: any)=> precip + (day.precipitation_sum||0),0);
    const totalSnow = days.reduce((snow: any,day: any)=> snow + (day.snowfall_sum||0),0);
    const avgWind = avg(hourly.map((hour: any) => hour.wind_speed_10m||0));
    const avgCloud = avg(hourly.map((hour: any) => hour.cloudcover||0));
    const avgPrecipHourly = avg(hourly.map((hour: any) => hour.precipitation||0));
    
    const clamp = (v:number)=>Math.max(0, Math.min(100, v));
    const lerp = (x:number, x0:number, x1:number)=> {

        if (x1===x0) {
            return x <= x0 ? 0 : 100;
        }
        return clamp((x - x0) / (x1 - x0) * 100);
    };

    let skiScore = 0;
    if (totalSnow > 0.5) {
        skiScore = clamp(50 + Math.min(50, totalSnow * 10));
    } else {
        skiScore = 100 - lerp(avgTemp, -10, 10);
        skiScore = skiScore * (1 - Math.min(0.6, avgPrecipHourly*2));
    }

    const windSurf = clamp(100 - Math.abs(avgWind - 8) / 8 * 100);
    const precipPenaltySurf = clamp(100 - avgPrecipHourly*200);
    const tempSurf = clamp(100 - Math.abs(avgTemp - 18)/18*100);

    let surfScore = (windSurf*0.5 + precipPenaltySurf*0.3 + tempSurf*0.2);
    surfScore = surfScore * (totalPrecip < 30 ? 1 : 0.6);

    const tempOutdoor = 100 - Math.max(0, Math.abs(avgTemp - 19) / 19 * 100);
    const precipOutdoor = clamp(100 - (totalPrecip / 10) * 100);
    const cloudOutdoor = clamp(100 - avgCloud);

    let outdoorScore = (tempOutdoor*0.45 + precipOutdoor*0.35 + cloudOutdoor*0.2);

    const extremeTemp = Math.max(0, Math.abs(avgTemp - 19) - 8);

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
