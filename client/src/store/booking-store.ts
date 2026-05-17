import { create } from "zustand";

import { defaultSearch, trainJourneys } from "@/data/mock-trains";
import type {
  ClientTripSearchItem,
  FareOption,
  SearchCriteria,
  TrainJourney,
} from "@/types/train";

interface BookingState {
  criteria: SearchCriteria;
  selectedTrain: TrainJourney;
  selectedFare: FareOption;
  searchResults: ClientTripSearchItem[];
  searchMeta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  setCriteria: (criteria: SearchCriteria) => void;
  setSearchResults: (
    results: ClientTripSearchItem[],
    meta: { total: number; page: number; limit: number; totalPages: number },
  ) => void;
  selectTrain: (train: TrainJourney) => void;
  selectFare: (fare: FareOption) => void;
}

const initialTrain = trainJourneys[0];
const initialFare = initialTrain.fares[1];

export const useBookingStore = create<BookingState>((set) => ({
  criteria: defaultSearch,
  selectedTrain: initialTrain,
  selectedFare: initialFare,
  searchResults: [],
  searchMeta: null,
  setCriteria: (criteria) => set({ criteria }),
  setSearchResults: (searchResults, searchMeta) =>
    set({ searchResults, searchMeta }),
  selectTrain: (selectedTrain) =>
    set({
      selectedTrain,
      selectedFare:
        selectedTrain.fares.find((fare) => fare.remaining > 0) ??
        selectedTrain.fares[0],
    }),
  selectFare: (selectedFare) => set({ selectedFare }),
}));
