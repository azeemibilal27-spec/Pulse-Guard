import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ScanResult } from "@/lib/scanner";

const STORAGE_KEY = "pulseguard:state:v1";
const HISTORY_LIMIT = 50;

type Settings = {
  realTimeProtection: boolean;
  webProtection: boolean;
  wifiAlerts: boolean;
  appLockProtection: boolean;
};

type State = {
  history: ScanResult[];
  settings: Settings;
  lastFullScan: number | null;
};

type ContextValue = State & {
  addScan: (result: ScanResult) => void;
  clearHistory: () => void;
  toggleSetting: (key: keyof Settings) => void;
  markFullScan: () => void;
  threatCount: number;
  protectionScore: number;
  hydrated: boolean;
};

const defaultSettings: Settings = {
  realTimeProtection: true,
  webProtection: true,
  wifiAlerts: true,
  appLockProtection: false,
};

const SecurityContext = createContext<ContextValue | null>(null);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [lastFullScan, setLastFullScan] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<State>;
          if (Array.isArray(parsed.history)) setHistory(parsed.history);
          if (parsed.settings)
            setSettings({ ...defaultSettings, ...parsed.settings });
          if (typeof parsed.lastFullScan === "number")
            setLastFullScan(parsed.lastFullScan);
        }
      } catch (_e) {
        // ignore
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ history, settings, lastFullScan }),
    ).catch(() => {});
  }, [history, settings, lastFullScan, hydrated]);

  const addScan = useCallback((result: ScanResult) => {
    setHistory((prev) => [result, ...prev].slice(0, HISTORY_LIMIT));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const toggleSetting = useCallback((key: keyof Settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const markFullScan = useCallback(() => setLastFullScan(Date.now()), []);

  const threatCount = useMemo(
    () =>
      history.filter(
        (h) => h.verdict === "malicious" || h.verdict === "suspicious",
      ).length,
    [history],
  );

  const protectionScore = useMemo(() => {
    let score = 60;
    if (settings.realTimeProtection) score += 12;
    if (settings.webProtection) score += 10;
    if (settings.wifiAlerts) score += 6;
    if (settings.appLockProtection) score += 6;
    if (lastFullScan && Date.now() - lastFullScan < 1000 * 60 * 60 * 24 * 7)
      score += 6;
    score -= Math.min(40, threatCount * 8);
    return Math.max(0, Math.min(100, score));
  }, [settings, lastFullScan, threatCount]);

  const value: ContextValue = {
    history,
    settings,
    lastFullScan,
    addScan,
    clearHistory,
    toggleSetting,
    markFullScan,
    threatCount,
    protectionScore,
    hydrated,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error("useSecurity must be used inside SecurityProvider");
  return ctx;
}
