export interface AddApplicationType {
  category: string;
  id: number;
  img: string;
  name: string;
}

export interface ReportType {
  AppName: string;
  StartDate: string;
  EndDate: string;
  TotalCount: number;
  WeeklyReport: number[];
  Top5Locations: string;
}

export interface AppDataType {
  appId: number;
  appName: string;
  image: string;
}

export interface CoordinateType {
  latitude: number;
  longitude: number;
}

export interface DataPointType {
  app: AppDataType;
  coordinate: CoordinateType;
}

export interface ClusterType {
  latitude: number;
  longitude: number;
  app?: AppDataType;
  count: number;
}
