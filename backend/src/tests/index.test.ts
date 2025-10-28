import { fetchForecast, scoreActivitiesFromForecast } from "../services/forecastService";
import { getGeocode } from "../services/geocodeService";


(global as any).fetch = jest.fn();

describe('getGeocode', () => {
    beforeEach(() => {
        (fetch as jest.Mock).mockClear();
    });

    it('returns city suggestions from API', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                results: [
                    { id: 1, name: 'Test City', country: 'Testland', admin1: 'Test Region', latitude: 1, longitude: 2, timezone: 'UTC', distanceKm: 10 }
                ]
            })
        });

        const res = await getGeocode('Test');
        
        expect(res[0].name).toBe('Test City');
        expect(res[0].country).toBe('Testland');
    });

    it('throws on API error', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });
        await expect(getGeocode('Test')).rejects.toThrow('Geocoding failed: 500');
    });
});

describe('fetchForecast', () => {
    beforeEach(() => {
        (fetch as jest.Mock).mockClear();
    });

    it('returns normalized forecast data', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                latitude: 1, longitude: 2, timezone: 'UTC',
                hourly: { time: ['t1'], temperature_2m: [10], precipitation: [0], wind_speed_10m: [5], cloudcover: [20], snowfall: [0] },
                daily: { time: ['d1'], temperature_2m_max: [15], temperature_2m_min: [5], precipitation_sum: [0], snowfall_sum: [0], sunrise: ['s1'], sunset: ['s2'] }
            })
        });

        const res = await fetchForecast(1,2);

        expect(res.latitude).toBe(1);
        expect(res.hourly[0].temperature_2m).toBe(10);
        expect(res.daily[0].temperature_2m_max).toBe(15);
    });

    it('throws on API error', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });
        await expect(fetchForecast(1,2)).rejects.toThrow('Forecast failed: 404');
    });
});

describe('scoreActivitiesFromForecast', () => {
    it('returns scores for activities', () => {
        const forecast = {
            daily: [
                { temperature_2m_max: 2, temperature_2m_min: -2, precipitation_sum: 0, snowfall_sum: 5, sunrise: '', sunset: '', date: '' },
                { temperature_2m_max: 1, temperature_2m_min: -3, precipitation_sum: 0, snowfall_sum: 2, sunrise: '', sunset: '', date: '' },
                { temperature_2m_max: 0, temperature_2m_min: -4, precipitation_sum: 0, snowfall_sum: 1, sunrise: '', sunset: '', date: '' }
            ],
            hourly: Array(72).fill({ wind_speed_10m: 8, cloudcover: 20, precipitation: 0 })
        };

        const scores = scoreActivitiesFromForecast(forecast);
        expect(scores).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ activity: 'Skiing' }),
                expect.objectContaining({ activity: 'Surfing' }),
                expect.objectContaining({ activity: 'Indoor Sightseeing' }),
                expect.objectContaining({ activity: 'Outdoor Sightseeing' })
            ])
        );
    });

    it('gives high skiing score for cold and snowy forecast', () => {
        const forecast = {
            daily: [
                { temperature_2m_max: -5, temperature_2m_min: -10, precipitation_sum: 0, snowfall_sum: 20, sunrise: '', sunset: '', date: '' },
                { temperature_2m_max: -6, temperature_2m_min: -11, precipitation_sum: 0, snowfall_sum: 10, sunrise: '', sunset: '', date: '' },
                { temperature_2m_max: -7, temperature_2m_min: -12, precipitation_sum: 0, snowfall_sum: 5, sunrise: '', sunset: '', date: '' }
            ],
            hourly: Array(72).fill({ wind_speed_10m: 5, cloudcover: 50, precipitation: 0 })
        };

        const scores = scoreActivitiesFromForecast(forecast);
        const ski = scores.find(s => s.activity === 'Skiing');

        expect(ski?.score).toBeGreaterThan(80);
    });

    it('gives high surfing score for warm, windy, dry forecast', () => {
        const forecast = {
            daily: [
                { temperature_2m_max: 25, temperature_2m_min: 20, precipitation_sum: 0, snowfall_sum: 0, sunrise: '', sunset: '', date: '' },
                { temperature_2m_max: 24, temperature_2m_min: 19, precipitation_sum: 0, snowfall_sum: 0, sunrise: '', sunset: '', date: '' },
                { temperature_2m_max: 26, temperature_2m_min: 21, precipitation_sum: 0, snowfall_sum: 0, sunrise: '', sunset: '', date: '' }
            ],
            hourly: Array(72).fill({ wind_speed_10m: 10, cloudcover: 10, precipitation: 0 })
        };

        const scores = scoreActivitiesFromForecast(forecast);
        const surf = scores.find(s => s.activity === 'Surfing');

        expect(surf?.score).toBeGreaterThan(70);
    });

    it('gives high outdoor sightseeing score for mild, clear, dry forecast', () => {
        const forecast = {
            daily: [
                { temperature_2m_max: 22, temperature_2m_min: 18, precipitation_sum: 0, snowfall_sum: 0, sunrise: '', sunset: '', date: '' },
                { temperature_2m_max: 21, temperature_2m_min: 17, precipitation_sum: 0, snowfall_sum: 0, sunrise: '', sunset: '', date: '' },
                { temperature_2m_max: 23, temperature_2m_min: 19, precipitation_sum: 0, snowfall_sum: 0, sunrise: '', sunset: '', date: '' }
            ],
            hourly: Array(72).fill({ wind_speed_10m: 5, cloudcover: 5, precipitation: 0 })
        };

        const scores = scoreActivitiesFromForecast(forecast);
        const outdoor = scores.find(s => s.activity === 'Outdoor Sightseeing');

        expect(outdoor?.score).toBeGreaterThan(80);
    });

    it('gives high indoor sightseeing score for rainy/extreme weather', () => {
        const forecast = {
            daily: [
                { temperature_2m_max: 35, temperature_2m_min: 30, precipitation_sum: 50, snowfall_sum: 0, sunrise: '', sunset: '', date: '' },
                { temperature_2m_max: 36, temperature_2m_min: 31, precipitation_sum: 60, snowfall_sum: 0, sunrise: '', sunset: '', date: '' },
                { temperature_2m_max: 37, temperature_2m_min: 32, precipitation_sum: 70, snowfall_sum: 0, sunrise: '', sunset: '', date: '' }
            ],
            hourly: Array(72).fill({ wind_speed_10m: 15, cloudcover: 90, precipitation: 2 })
        };

        const scores = scoreActivitiesFromForecast(forecast);
        const indoor = scores.find(s => s.activity === 'Indoor Sightseeing');
        
        expect(indoor?.score).toBeGreaterThan(70);
    });
});
