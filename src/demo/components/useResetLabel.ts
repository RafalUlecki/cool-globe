import { useMemo } from "react";
import type { PlaygroundMode } from "../hooks/usePlaygroundState";

export function useResetLabel(
  mode: PlaygroundMode,
  preselectedCountry: string,
): string {
  return useMemo(() => {
    if (mode === "uncontrolled" && preselectedCountry) {
      return `Reset to ${preselectedCountry}`;
    }
    return "Reset globe";
  }, [mode, preselectedCountry]);
}
