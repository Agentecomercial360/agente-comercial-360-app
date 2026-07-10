import { useCallback, useEffect, useState } from "react";

export type AcademiaStatus = "not_started" | "in_progress" | "completed";
export const ACADEMIA_STORAGE_KEY = "ac360.academia.progress.v1";

function load(): Record<string, AcademiaStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ACADEMIA_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function save(p: Record<string, AcademiaStatus>) {
  try {
    window.localStorage.setItem(ACADEMIA_STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

/**
 * Compartilha o mesmo localStorage usado por /ecommerce/academia
 * (STORAGE_KEY = ac360.academia.progress.v1).
 * Não altera Supabase.
 */
export function useAcademiaProgress() {
  const [progress, setProgress] = useState<Record<string, AcademiaStatus>>({});

  useEffect(() => {
    setProgress(load());
    const onStorage = (e: StorageEvent) => {
      if (e.key === ACADEMIA_STORAGE_KEY) setProgress(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setStatus = useCallback((id: string, status: AcademiaStatus) => {
    setProgress((prev) => {
      const next = { ...prev, [id]: status };
      save(next);
      return next;
    });
  }, []);

  return { progress, setStatus };
}
