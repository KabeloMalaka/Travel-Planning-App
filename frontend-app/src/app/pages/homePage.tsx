
import { useState } from 'react';
import { Box, Typography, Autocomplete, TextField, Container, Paper, Divider } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/Sunny';
import GrainIcon from '@mui/icons-material/Grain';
import CloudIcon from '@mui/icons-material/Cloud';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { useGetCitySuggestionsQuery, useWeatherByCoordsQuery, useActivitiesRankingQuery } from '../graphql/generated';
import type { CitySuggestion } from '../graphql/generated';

const HomePage = () => {
    const [inputValue, setInputValue] = useState('');
    const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null);

    const { data } = useGetCitySuggestionsQuery({
        variables: { name: inputValue },
        skip: !inputValue,
    });

    const { data: weatherData, loading: weatherLoading, error: weatherError } = useWeatherByCoordsQuery({
        variables: {
            latitude: selectedCity ? selectedCity.latitude : 0,
            longitude: selectedCity ? selectedCity.longitude : 0,
            timezone: selectedCity ? selectedCity.timezone || '' : '',
        },
        skip: !selectedCity,
    });

    const { data: activitiesData, loading: activitiesLoading, error: activitiesError } = useActivitiesRankingQuery({
        variables: {
            cityName: selectedCity ? selectedCity.name : '',
            timezone: selectedCity ? selectedCity.timezone || '' : '',
        },
        skip: !selectedCity,
    });

    const cities = data?.citySuggestions || [];

    return (
        <Container maxWidth="sm">
            <Box textAlign="center" mb={4}>
                <Typography variant="h4" fontWeight={600} gutterBottom>
                    Travel Planner
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Find your next destination
                </Typography>
            </Box>
            <Autocomplete
                options={cities}
                getOptionLabel={(option) => option.name}
                value={selectedCity}
                onChange={(_, newValue) => setSelectedCity(newValue)}
                onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
                renderInput={(params) => (
                    <TextField {...params} label="Search for a city" variant="outlined" fullWidth />
                )}
                renderOption={(props, option) => (
                    <li {...props}>
                        {option.name} ({option.country})
                    </li>
                )}
            />

            {selectedCity && (
                <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {selectedCity.name}, {selectedCity.country}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Latitude: {selectedCity.latitude}, Longitude: {selectedCity.longitude}
                    </Typography>
                    {selectedCity.admin1 && (
                        <Typography variant="body2" color="text.secondary">
                            Region: {selectedCity.admin1}
                        </Typography>
                    )}
                    {selectedCity.timezone && (
                        <Typography variant="body2" color="text.secondary">
                            Timezone: {selectedCity.timezone}
                        </Typography>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {weatherLoading && <Typography>Loading weather forecast...</Typography>}
                    {weatherError && <Typography color="error">Failed to load weather data.</Typography>}
                    {weatherData && weatherData.weatherByCoords && (
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Weather Forecast
                            </Typography>
                            <Typography variant="body2">
                                Timezone: {weatherData.weatherByCoords.timezone}
                            </Typography>
                            <Box mt={2}>
                                {weatherData.weatherByCoords.daily.slice(0, 3).map((day: any) => {
                                    // Simple weather icon logic
                                    let WeatherIcon = WbSunnyIcon;
                                    if ((day.snowfall_sum ?? 0) > 0) {
                                        WeatherIcon = AcUnitIcon;
                                    } else if ((day.precipitation_sum ?? 0) > 2) {
                                        WeatherIcon = GrainIcon;
                                    } else if ((day.temperature_2m_max ?? 0) < 15) {
                                        WeatherIcon = CloudIcon;
                                    }
                                    return (
                                        <Box key={day.date} mb={1}>
                                            <WeatherIcon sx={{ mr: 1 }} />
                                            <Typography variant="body2">
                                                <b>{day.date}</b>: {day.temperature_2m_min}°C - {day.temperature_2m_max}°C, Precip: {day.precipitation_sum}mm
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {activitiesLoading && <Typography>Loading activities ranking...</Typography>}
                    {activitiesError && <Typography color="error">Failed to load activities ranking.</Typography>}
                    {activitiesData && activitiesData.activitiesRanking && (
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Top Activities
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Generated at: {activitiesData.activitiesRanking.generatedAt}
                            </Typography>
                            <Box mt={2}>
                                {activitiesData.activitiesRanking.activityScores.slice(0, 5).map((score: any, idx: number) => (
                                    <Box key={idx} mb={1}>
                                        <Typography variant="body2">
                                            <b>{score.activity}</b>: {score.score.toFixed(1)}
                                            {score.reasons && score.reasons.length > 0 && (
                                                <>
                                                    {' '}(
                                                    {score.reasons.join(', ')}
                                                    )
                                                </>
                                            )}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Paper>
            )}
        </Container>
    );
};

export default HomePage;

