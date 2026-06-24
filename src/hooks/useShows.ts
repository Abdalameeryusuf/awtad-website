"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Show } from "@/lib/types";

export interface UseShowsResult {
  shows: Show[];
  loading: boolean;
  fromCache: boolean;
  hasPendingWrites: boolean;
  lastUpdated: Date | null;
  error: Error | null;
}

export function useShows(): UseShowsResult {
  const [state, setState] = useState<UseShowsResult>({
    shows: [],
    loading: true,
    fromCache: false,
    hasPendingWrites: false,
    lastUpdated: null,
    error: null,
  });

  useEffect(() => {
    const q = query(collection(db, "shows"), orderBy("order"));
    const unsub = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snap) => {
        const shows = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Show,
        );
        setState((prev) => ({
          shows,
          loading: false,
          fromCache: snap.metadata.fromCache,
          hasPendingWrites: snap.metadata.hasPendingWrites,
          // Only bump "last updated" when fresh data arrives from the server.
          lastUpdated: snap.metadata.fromCache ? prev.lastUpdated : new Date(),
          error: null,
        }));
      },
      (error) => setState((s) => ({ ...s, loading: false, error })),
    );
    return () => unsub();
  }, []);

  return state;
}
