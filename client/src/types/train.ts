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
  fromStationId: string;
  toStationId: string;
  serviceDate: string;
  departureTime: string;
  passengers: number;
}

export interface ClientStationOption {
  id: string;
  code: string;
  name: string;
  city: string | null;
  address: string | null;
}

export interface ClientTripStop {
  stationId: string;
  code: string;
  name: string;
  scheduledArrivalAt: string | null;
  scheduledDepartureAt: string | null;
  stopOrder: number;
}

export interface ClientTripSearchItem {
  id: string;
  code: string;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  train: {
    id: string;
    code: string;
    name: string;
  };
  route: {
    id: string;
    code: string;
    name: string;
  };
  from: {
    stationId: string;
    code: string;
    name: string;
    city: string | null;
    scheduledDepartureAt: string | null;
  };
  to: {
    stationId: string;
    code: string;
    name: string;
    city: string | null;
    scheduledArrivalAt: string | null;
  };
  durationMinutes: number | null;
  distanceKm: string;
  stops: ClientTripStop[];
}
