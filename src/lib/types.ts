import type { Timestamp } from "firebase/firestore";

export type Mode = "registration" | "live";

export interface Config {
  eventName: string;
  logoUrl: string;
  description: string;
  postSubmitMessage: string;
  mode: Mode;
  registrationOpen: boolean;
  currentShowId: string | null;
}

export interface Show {
  id: string;
  name: string;
  order: number;
  capacity: number;
  seatsRemaining: number;
}

export interface ResponseDoc {
  id: string;
  createdAt: Timestamp | null;
  [key: string]: unknown;
}
