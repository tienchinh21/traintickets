import { create } from "zustand";

import { defaultSearch, trainJourneys } from "@/data/mock-trains";
import type { FareOption, SearchCriteria, TrainJourney } from "@/types/train";

interface BookingState {
  criteria: SearchCriteria;
  selectedTrain: TrainJourney;
  selectedFare: FareOption;
  setCriteria: (criteria: SearchCriteria) => void;
  selectTrain: (train: TrainJourney) => void;
  selectFare: (fare: FareOption) => void;
}

const initialTrain = trainJourneys[0];
const initialFare = initialTrain.fares[1];

export const useBookingStore = create<BookingState>((set) => ({
  criteria: defaultSearch,
  selectedTrain: initialTrain,
  selectedFare: initialFare,
  setCriteria: (criteria) => set({ criteria }),
  selectTrain: (selectedTrain) =>
    set({
      selectedTrain,
      selectedFare: selectedTrain.fares.find((fare) => fare.remaining > 0) ?? selectedTrain.fares[0],
    }),
  selectFare: (selectedFare) => set({ selectedFare }),
}));
