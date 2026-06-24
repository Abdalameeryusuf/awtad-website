"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Config } from "@/lib/types";

export interface UseConfigResult {
  config: Config | null;
  exists: boolean;
  loading: boolean;
  fromCache: boolean;
  error: Error | null;
}

export function useConfig(): UseConfigResult {
  const [state, setState] = useState<UseConfigResult>({
    config: null,
    exists: false,
    loading: true,
    fromCache: false,
    error: null,
  });

  useEffect(() => {
    const ref = doc(db, "config", "main");
    const unsub = onSnapshot(
      ref,
      { includeMetadataChanges: true },
      (snap) => {
        setState({
          config: snap.exists() ? (snap.data() as Config) : null,
          exists: snap.exists(),
          loading: false,
          fromCache: snap.metadata.fromCache,
          error: null,
        });
      },
      (error) => setState((s) => ({ ...s, loading: false, error })),
    );
    return () => unsub();
  }, []);

  return state;
}
