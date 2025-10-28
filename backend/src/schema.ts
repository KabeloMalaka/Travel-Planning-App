export const typeDefs = `#graphql
    type CitySuggestion {
        id: ID!                # internal id: e.g. "place_lat_lon" or open-meteo place id
        name: String!
        country: String
        admin1: String
        latitude: Float!
        longitude: Float!
        timezone: String
        distanceKm: Float
    }

    type HourlyPoint {
        time: String!
        temperature_2m: Float
        precipitation: Float
        wind_speed_10m: Float
        cloudcover: Float
        snowfall: Float
    }

    type DailyPoint {
        date: String!
        temperature_2m_max: Float
        temperature_2m_min: Float
        precipitation_sum: Float
        snowfall_sum: Float
        sunrise: String
        sunset: String
    }

    type WeatherForecast {
        latitude: Float!
        longitude: Float!
        timezone: String!
        hourly: [HourlyPoint!]!
        daily: [DailyPoint!]!
    }

    type ActivityScore {
        activity: String!
        score: Float!          # normalized 0..100
        reasons: [String!]     # short explanation (for transparency)
    }

    type ActivitiesRanking {
        cityName: String!
        generatedAt: String!
        activityScores: [ActivityScore!]!
    }

    type Query {
        # city suggestions from partial input
        citySuggestions(name: String!, limit: Int = 10, language: String = "en"): [CitySuggestion!]!
        weatherByCoords(latitude: Float!, longitude: Float!, timezone: String = "auto", forecastDays: Int = 7): WeatherForecast!
        # ranking activities for a cityName (uses forecastFrom -> ranking algorithm)
        activitiesRanking(cityName: String!, timezone: String = "auto", forecastDays: Int = 7): ActivitiesRanking!
    }
    
`;
