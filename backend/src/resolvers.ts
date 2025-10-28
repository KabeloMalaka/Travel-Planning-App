// src/resolvers.ts
import { ActivitiesRanking } from './interface/ActivitiesRanking.ts';
import { ActivitiesRankingArgs } from './interface/ActivitiesRankingArgs.ts';
import { CitySuggestion } from './interface/CitySuggestion.ts';
import { CitySuggestionsArgs } from './interface/CitySuggestionArg.ts';
import { WeatherByCoordsArgs } from './interface/WeatherByCoordsArgs.ts';
import { WeatherForecast } from './interface/WeatherForecast.ts';
import { getGeocode } from './services/geocodeService';
import { fetchForecast, scoreActivitiesFromForecast } from './services/forecastService';

export const resolvers = {
    Query: {
        citySuggestions: async ( _: any, { name, limit, language }: CitySuggestionsArgs): Promise<CitySuggestion[]> => {
            if (!name || name.length < 1) return [];

            const results = await getGeocode(name, limit, language);
            
            return results;
        },
        weatherByCoords: async (_:any, { latitude, longitude, timezone, forecastDays }: WeatherByCoordsArgs): Promise<WeatherForecast> => {
            return await fetchForecast(latitude, longitude, timezone, forecastDays);
        },
        activitiesRanking: async (_:any, { cityName, timezone, forecastDays }: ActivitiesRankingArgs): Promise<ActivitiesRanking> => {
            const cityResults = await getGeocode(cityName, 1);
            if (cityResults.length === 0) {
                throw new Error(`City with name ${cityName} not found`);
            }

            const city = cityResults[0];
            const forecast = await fetchForecast(city.latitude, city.longitude, timezone, forecastDays);
            
            const activityScores = scoreActivitiesFromForecast(forecast);
            return {
                cityName: city.name,
                generatedAt: new Date().toISOString(),
                activityScores,
            };
        }
    },
};
