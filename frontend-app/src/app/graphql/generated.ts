import { gql } from '@apollo/client';
import { skipToken, useLazyQuery, useQuery, useSuspenseQuery, type LazyQueryHookOptions, type QueryHookOptions, type QueryResult, type SkipToken, type SuspenseQueryHookOptions } from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type ActivitiesRanking = {
  __typename?: 'ActivitiesRanking';
  activityScores: Array<ActivityScore>;
  cityName: Scalars['String']['output'];
  generatedAt: Scalars['String']['output'];
};

export type ActivityScore = {
  __typename?: 'ActivityScore';
  activity: Scalars['String']['output'];
  reasons?: Maybe<Array<Scalars['String']['output']>>;
  score: Scalars['Float']['output'];
};

export type CitySuggestion = {
  __typename?: 'CitySuggestion';
  admin1?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  distanceKm?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  timezone?: Maybe<Scalars['String']['output']>;
};

export type DailyPoint = {
  __typename?: 'DailyPoint';
  date: Scalars['String']['output'];
  precipitation_sum?: Maybe<Scalars['Float']['output']>;
  snowfall_sum?: Maybe<Scalars['Float']['output']>;
  sunrise?: Maybe<Scalars['String']['output']>;
  sunset?: Maybe<Scalars['String']['output']>;
  temperature_2m_max?: Maybe<Scalars['Float']['output']>;
  temperature_2m_min?: Maybe<Scalars['Float']['output']>;
};

export type HourlyPoint = {
  __typename?: 'HourlyPoint';
  cloudcover?: Maybe<Scalars['Float']['output']>;
  precipitation?: Maybe<Scalars['Float']['output']>;
  snowfall?: Maybe<Scalars['Float']['output']>;
  temperature_2m?: Maybe<Scalars['Float']['output']>;
  time: Scalars['String']['output'];
  wind_speed_10m?: Maybe<Scalars['Float']['output']>;
};

export type Query = {
  __typename?: 'Query';
  activitiesRanking: ActivitiesRanking;
  citySuggestions: Array<CitySuggestion>;
  weatherByCoords: WeatherForecast;
};


export type QueryActivitiesRankingArgs = {
  cityName: Scalars['String']['input'];
  forecastDays?: InputMaybe<Scalars['Int']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCitySuggestionsArgs = {
  language?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
};


export type QueryWeatherByCoordsArgs = {
  forecastDays?: InputMaybe<Scalars['Int']['input']>;
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
  timezone?: InputMaybe<Scalars['String']['input']>;
};

export type WeatherForecast = {
  __typename?: 'WeatherForecast';
  daily: Array<DailyPoint>;
  hourly: Array<HourlyPoint>;
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  timezone: Scalars['String']['output'];
};

export type GetCitySuggestionsQueryVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type GetCitySuggestionsQuery = { __typename?: 'Query', citySuggestions: Array<{ __typename?: 'CitySuggestion', id: string, name: string, country?: string | null, longitude: number, latitude: number }> };

export type WeatherByCoordsQueryVariables = Exact<{
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
  timezone?: InputMaybe<Scalars['String']['input']>;
}>;


export type WeatherByCoordsQuery = { __typename?: 'Query', weatherByCoords: { __typename?: 'WeatherForecast', latitude: number, longitude: number, timezone: string, daily: Array<{ __typename?: 'DailyPoint', date: string, temperature_2m_max?: number | null, temperature_2m_min?: number | null, precipitation_sum?: number | null, snowfall_sum?: number | null, sunrise?: string | null, sunset?: string | null }>, hourly: Array<{ __typename?: 'HourlyPoint', time: string, temperature_2m?: number | null, precipitation?: number | null, wind_speed_10m?: number | null, cloudcover?: number | null, snowfall?: number | null }> } };

export type ActivitiesRankingQueryVariables = Exact<{
  cityName: Scalars['String']['input'];
  timezone?: InputMaybe<Scalars['String']['input']>;
}>;


export type ActivitiesRankingQuery = { __typename?: 'Query', activitiesRanking: { __typename?: 'ActivitiesRanking', cityName: string, generatedAt: string, activityScores: Array<{ __typename?: 'ActivityScore', activity: string, score: number, reasons?: Array<string> | null }> } };


export const GetCitySuggestionsDocument = gql`
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

/**
 * __useGetCitySuggestionsQuery__
 *
 * To run a query within a React component, call `useGetCitySuggestionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCitySuggestionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCitySuggestionsQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useGetCitySuggestionsQuery(baseOptions: QueryHookOptions<GetCitySuggestionsQuery, GetCitySuggestionsQueryVariables> & ({ variables: GetCitySuggestionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetCitySuggestionsQuery, GetCitySuggestionsQueryVariables>(GetCitySuggestionsDocument, options);
      }
export function useGetCitySuggestionsLazyQuery(baseOptions?: LazyQueryHookOptions<GetCitySuggestionsQuery, GetCitySuggestionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetCitySuggestionsQuery, GetCitySuggestionsQueryVariables>(GetCitySuggestionsDocument, options);
        }
export function useGetCitySuggestionsSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetCitySuggestionsQuery, GetCitySuggestionsQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetCitySuggestionsQuery, GetCitySuggestionsQueryVariables>(GetCitySuggestionsDocument, options);
        }
export type GetCitySuggestionsQueryHookResult = ReturnType<typeof useGetCitySuggestionsQuery>;
export type GetCitySuggestionsLazyQueryHookResult = ReturnType<typeof useGetCitySuggestionsLazyQuery>;
export type GetCitySuggestionsSuspenseQueryHookResult = ReturnType<typeof useGetCitySuggestionsSuspenseQuery>;
export type GetCitySuggestionsQueryResult = QueryResult<GetCitySuggestionsQuery, GetCitySuggestionsQueryVariables>;
export const WeatherByCoordsDocument = gql`
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

/**
 * __useWeatherByCoordsQuery__
 *
 * To run a query within a React component, call `useWeatherByCoordsQuery` and pass it any options that fit your needs.
 * When your component renders, `useWeatherByCoordsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWeatherByCoordsQuery({
 *   variables: {
 *      latitude: // value for 'latitude'
 *      longitude: // value for 'longitude'
 *      timezone: // value for 'timezone'
 *   },
 * });
 */
export function useWeatherByCoordsQuery(baseOptions: QueryHookOptions<WeatherByCoordsQuery, WeatherByCoordsQueryVariables> & ({ variables: WeatherByCoordsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<WeatherByCoordsQuery, WeatherByCoordsQueryVariables>(WeatherByCoordsDocument, options);
      }
export function useWeatherByCoordsLazyQuery(baseOptions?: LazyQueryHookOptions<WeatherByCoordsQuery, WeatherByCoordsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<WeatherByCoordsQuery, WeatherByCoordsQueryVariables>(WeatherByCoordsDocument, options);
        }
export function useWeatherByCoordsSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<WeatherByCoordsQuery, WeatherByCoordsQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<WeatherByCoordsQuery, WeatherByCoordsQueryVariables>(WeatherByCoordsDocument, options);
        }
export type WeatherByCoordsQueryHookResult = ReturnType<typeof useWeatherByCoordsQuery>;
export type WeatherByCoordsLazyQueryHookResult = ReturnType<typeof useWeatherByCoordsLazyQuery>;
export type WeatherByCoordsSuspenseQueryHookResult = ReturnType<typeof useWeatherByCoordsSuspenseQuery>;
export type WeatherByCoordsQueryResult = QueryResult<WeatherByCoordsQuery, WeatherByCoordsQueryVariables>;
export const ActivitiesRankingDocument = gql`
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

/**
 * __useActivitiesRankingQuery__
 *
 * To run a query within a React component, call `useActivitiesRankingQuery` and pass it any options that fit your needs.
 * When your component renders, `useActivitiesRankingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useActivitiesRankingQuery({
 *   variables: {
 *      cityName: // value for 'cityName'
 *      timezone: // value for 'timezone'
 *   },
 * });
 */
export function useActivitiesRankingQuery(baseOptions: QueryHookOptions<ActivitiesRankingQuery, ActivitiesRankingQueryVariables> & ({ variables: ActivitiesRankingQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<ActivitiesRankingQuery, ActivitiesRankingQueryVariables>(ActivitiesRankingDocument, options);
      }
export function useActivitiesRankingLazyQuery(baseOptions?: LazyQueryHookOptions<ActivitiesRankingQuery, ActivitiesRankingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<ActivitiesRankingQuery, ActivitiesRankingQueryVariables>(ActivitiesRankingDocument, options);
        }
export function useActivitiesRankingSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<ActivitiesRankingQuery, ActivitiesRankingQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<ActivitiesRankingQuery, ActivitiesRankingQueryVariables>(ActivitiesRankingDocument, options);
        }
export type ActivitiesRankingQueryHookResult = ReturnType<typeof useActivitiesRankingQuery>;
export type ActivitiesRankingLazyQueryHookResult = ReturnType<typeof useActivitiesRankingLazyQuery>;
export type ActivitiesRankingSuspenseQueryHookResult = ReturnType<typeof useActivitiesRankingSuspenseQuery>;
export type ActivitiesRankingQueryResult = QueryResult<ActivitiesRankingQuery, ActivitiesRankingQueryVariables>;