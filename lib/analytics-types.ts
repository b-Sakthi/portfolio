export interface DailyVisitStat {
  date: string;
  visitors: number;
  views: number;
}

export interface PageVisitStat {
  path: string;
  visitors: number;
  views: number;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  totalPageViews: number;
  todayVisitors: number;
  todayPageViews: number;
  last7DaysVisitors: number;
  last7DaysPageViews: number;
  days: number;
  daily: DailyVisitStat[];
  topPages: PageVisitStat[];
}

export interface RecordVisitPayload {
  path: string;
  referrer?: string;
  visitorId?: string;
}
