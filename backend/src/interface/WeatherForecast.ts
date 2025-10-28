export interface WeatherForecast {
    latitude: number;
    longitude: number;
    timezone: string;
    hourly: HourlyPoint[];
    daily: DailyPoint[];
}

export interface HourlyPoint {
    time: string;
    temperature_2m: number | null;
    precipitation: number | null;
    wind_speed_10m: number | null;
    cloudcover: number | null;
    snowfall: number | null;
}

export interface DailyPoint {
    date: string;
    temperature_2m_max: number | null;
    temperature_2m_min: number | null;
    precipitation_sum: number | null;
    snowfall_sum: number | null;
    sunrise: string | null;
    sunset: string | null;
}