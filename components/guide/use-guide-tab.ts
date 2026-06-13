"use client";

import { useEffect, useState } from "react";
import {
  resolveInitialTab,
  GUIDE_TAB_IDS,
  DEFAULT_GUIDE_TAB,
  GUIDE_TAB_STORAGE_KEY,
} from "@/lib/guide/guide-tabs";

/**
 * Manages the active protocol tab.
 * - Initial render uses the default (SSR-safe, avoids hydration mismatch).
 * - After mount, resolves from URL hash > localStorage > default.
 * - Tab changes write the URL hash (replaceState) and localStorage.
 * - Browser back/forward (hashchange) moves between tabs.
 */
export function useGuideTab(): readonly [string, (id: string) => void] {
  const [active, setActiveState] = useState<string>(DEFAULT_GUIDE_TAB);

  useEffect(() => {
    // Resolve the real tab from hash/localStorage only after mount. SSR renders
    // the default to avoid a hydration mismatch, so this one sync setState on
    // mount is intentional (a one-time reconciliation, not a render loop).
    const stored = window.localStorage.getItem(GUIDE_TAB_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveState(
      resolveInitialTab(
        { hash: window.location.hash, stored },
        GUIDE_TAB_IDS,
        DEFAULT_GUIDE_TAB,
      ),
    );
  }, []);

  useEffect(() => {
    function onHashChange() {
      const id = window.location.hash.replace(/^#/, "");
      if (GUIDE_TAB_IDS.includes(id)) setActiveState(id);
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setActive = (id: string) => {
    setActiveState(id);
    try {
      window.localStorage.setItem(GUIDE_TAB_STORAGE_KEY, id);
    } catch {
      // ignore storage failures (private mode, quota)
    }
    window.history.replaceState(null, "", `#${id}`);
  };

  return [active, setActive] as const;
}
