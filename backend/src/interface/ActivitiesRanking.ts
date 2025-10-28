export interface ActivitiesRanking {
    cityName: string;
    generatedAt: string;
    activityScores: ActivityScore[];
}

export interface ActivityScore {
    activity: string;
    score: number;
    reasons: string[];
}
