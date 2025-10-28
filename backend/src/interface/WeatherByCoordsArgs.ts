export interface WeatherByCoordsArgs {
    latitude: number;
    longitude: number;
    timezone?: string;
    forecastDays?: number;
}
