import type { SearchCriteria, TrainJourney } from "@/types/train";

export const defaultSearch: SearchCriteria = {
  from: "Ha Noi",
  to: "Ho Chi Minh",
  departDate: "2026-05-24",
  passengers: 2,
};

export const trainJourneys: TrainJourney[] = [
  {
    id: "se1",
    code: "SE1",
    operator: "Vietnam Railways",
    from: { name: "Ha Noi", code: "HAN", time: "19:30", platform: "Ga 1", active: true },
    to: { name: "Sai Gon", code: "SGN", time: "05:45", platform: "Ga 3" },
    duration: "34h 15m",
    distance: "1,726 km",
    status: "available",
    punctuality: 94,
    amenities: ["Wifi", "Dining car", "Power outlet", "Quiet cabin"],
    stops: [
      { name: "Ha Noi", code: "HAN", time: "19:30", active: true },
      { name: "Vinh", code: "VIN", time: "01:18" },
      { name: "Da Nang", code: "DAD", time: "13:05" },
      { name: "Nha Trang", code: "NTR", time: "22:10" },
      { name: "Sai Gon", code: "SGN", time: "05:45" },
    ],
    fares: [
      { id: "se1-soft", label: "Soft seat", seatClass: "soft-seat", price: 856000, remaining: 18 },
      { id: "se1-s4", label: "Sleeper 4", seatClass: "sleeper-4", price: 1640000, remaining: 6 },
      { id: "se1-s6", label: "Sleeper 6", seatClass: "sleeper-6", price: 1320000, remaining: 12 },
    ],
  },
  {
    id: "se3",
    code: "SE3",
    operator: "Vietnam Railways",
    from: { name: "Ha Noi", code: "HAN", time: "22:00", platform: "Ga 2", active: true },
    to: { name: "Sai Gon", code: "SGN", time: "06:20", platform: "Ga 2" },
    duration: "32h 20m",
    distance: "1,726 km",
    status: "limited",
    punctuality: 91,
    amenities: ["Meal service", "Power outlet", "Luggage rack"],
    stops: [
      { name: "Ha Noi", code: "HAN", time: "22:00", active: true },
      { name: "Dong Hoi", code: "DOH", time: "07:42" },
      { name: "Hue", code: "HUE", time: "10:54" },
      { name: "Nha Trang", code: "NTR", time: "23:38" },
      { name: "Sai Gon", code: "SGN", time: "06:20" },
    ],
    fares: [
      { id: "se3-soft", label: "Soft seat", seatClass: "soft-seat", price: 790000, remaining: 4 },
      { id: "se3-s4", label: "Sleeper 4", seatClass: "sleeper-4", price: 1580000, remaining: 2 },
      { id: "se3-s6", label: "Sleeper 6", seatClass: "sleeper-6", price: 1250000, remaining: 8 },
    ],
  },
  {
    id: "se5",
    code: "SE5",
    operator: "Vietnam Railways",
    from: { name: "Ha Noi", code: "HAN", time: "15:30", platform: "Ga 4", active: true },
    to: { name: "Sai Gon", code: "SGN", time: "04:50", platform: "Ga 1" },
    duration: "37h 20m",
    distance: "1,726 km",
    status: "sold-out",
    punctuality: 88,
    amenities: ["Cafe counter", "Luggage rack"],
    stops: [
      { name: "Ha Noi", code: "HAN", time: "15:30", active: true },
      { name: "Thanh Hoa", code: "THO", time: "18:10" },
      { name: "Hue", code: "HUE", time: "08:22" },
      { name: "Dieu Tri", code: "DTR", time: "17:35" },
      { name: "Sai Gon", code: "SGN", time: "04:50" },
    ],
    fares: [
      { id: "se5-soft", label: "Soft seat", seatClass: "soft-seat", price: 710000, remaining: 0 },
      { id: "se5-s4", label: "Sleeper 4", seatClass: "sleeper-4", price: 1490000, remaining: 0 },
      { id: "se5-s6", label: "Sleeper 6", seatClass: "sleeper-6", price: 1190000, remaining: 0 },
    ],
  },
];
