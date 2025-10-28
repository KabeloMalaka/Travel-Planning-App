import { gql } from "@apollo/client";

const GET_CITY_SUGGESTIONS = gql`
  query GetCitySuggestions($name: String!) {
    citySuggestions(name: $name) {
        id
        name
        country
        longitude
        latitude
    }
  }
`;

const GET_WEATHER_BY_COORDS = gql`
  query WeatherByCoords($latitude: Float!, $longitude: Float!, $timezone: String) {
    weatherByCoords(latitude: $latitude, longitude: $longitude, timezone: $timezone) {
      latitude
      longitude
      timezone
      daily {
        date
        temperature_2m_max
        temperature_2m_min
        precipitation_sum
        snowfall_sum
        sunrise
        sunset
      }
      hourly {
        time
        temperature_2m
        precipitation
        wind_speed_10m
        cloudcover
        snowfall
      }
    }
  }
`;


// Activities Ranking Query
const ACTIVITY_RANKING_QUERY = gql`
    query ActivitiesRanking($cityName: String!, $timezone: String) {
        activitiesRanking(cityName: $cityName, timezone: $timezone) {
            cityName
            generatedAt
            activityScores {
            activity
            score
            reasons
            }
        }
    }
`;

export { GET_CITY_SUGGESTIONS, GET_WEATHER_BY_COORDS, ACTIVITY_RANKING_QUERY };