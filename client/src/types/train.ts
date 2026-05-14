export type SeatClass = "soft-seat" | "sleeper-4" | "sleeper-6";

export type TrainStatus = "available" | "limited" | "sold-out";

export interface StationStop {
  name: string;
  code: string;
  time: string;
  platform?: string;
  active?: boolean;
}

export interface FareOption {
  id: string;
  label: string;
  seatClass: SeatClass;
  price: number;
  remaining: number;
}

export interface TrainJourney {
  id: string;
  code: string;
  operator: string;
  from: StationStop;
  to: StationStop;
  duration: string;
  distance: string;
  status: TrainStatus;
  stops: StationStop[];
  fares: FareOption[];
  punctuality: number;
  amenities: string[];
}

export interface SearchCriteria {
  from: string;
  to: string;
  departDate: string;
  passengers: number;
}
