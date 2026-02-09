import { useState, useCallback, useEffect } from 'react';

export type DashboardSection =
  | 'kpis'
  | 'revenueTrends'
  | 'occupancyByProperty'
  | 'revenueByChannel'
  | 'upcomingEvents'
  | 'topProperties'
  | 'servicesRevenue'
  | 'guestOrigins'
  | 'priorityTasks';

export interface DashboardPreferences {
  visibleSections: Record<DashboardSection, boolean>;
  sectionOrder: DashboardSection[];
}

const STORAGE_KEY = 'str-dashboard-preferences';

const DEFAULT_PREFERENCES: DashboardPreferences = {
  visibleSections: {
    kpis: true,
    revenueTrends: true,
    occupancyByProperty: true,
    revenueByChannel: true,
    upcomingEvents: true,
    topProperties: true,
    servicesRevenue: true,
    guestOrigins: true,
    priorityTasks: true,
  },
  sectionOrder: [
    'kpis',
    'revenueTrends',
    'occupancyByProperty',
    'revenueByChannel',
    'upcomingEvents',
    'topProperties',
    'servicesRevenue',
    'guestOrigins',
    'priorityTasks',
  ],
};

export const SECTION_LABELS: Record<DashboardSection, string> = {
  kpis: 'Key Metrics',
  revenueTrends: 'Revenue Trends',
  occupancyByProperty: 'Occupancy by Property',
  revenueByChannel: 'Revenue by Channel',
  upcomingEvents: 'Upcoming Check-ins/outs',
  topProperties: 'Top Properties',
  servicesRevenue: 'Services Revenue',
  guestOrigins: 'Guest Origins',
  priorityTasks: 'Priority Tasks',
};

export interface UseDashboardPreferencesReturn {
  preferences: DashboardPreferences;
  isSectionVisible: (section: DashboardSection) => boolean;
  toggleSection: (section: DashboardSection) => void;
  setSectionVisible: (section: DashboardSection, visible: boolean) => void;
  resetToDefaults: () => void;
  showAllSections: () => void;
  hideAllSections: () => void;
}

function loadPreferences(): DashboardPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;

    const parsed = JSON.parse(stored) as Partial<DashboardPreferences>;

    // Merge with defaults to handle any new sections
    return {
      visibleSections: {
        ...DEFAULT_PREFERENCES.visibleSections,
        ...parsed.visibleSections,
      },
      sectionOrder: parsed.sectionOrder?.length
        ? parsed.sectionOrder
        : DEFAULT_PREFERENCES.sectionOrder,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function savePreferences(preferences: DashboardPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function useDashboardPreferences(): UseDashboardPreferencesReturn {
  const [preferences, setPreferences] = useState<DashboardPreferences>(loadPreferences);

  // Save to localStorage whenever preferences change
  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  const isSectionVisible = useCallback((section: DashboardSection): boolean => {
    return preferences.visibleSections[section] ?? true;
  }, [preferences.visibleSections]);

  const toggleSection = useCallback((section: DashboardSection): void => {
    setPreferences(prev => ({
      ...prev,
      visibleSections: {
        ...prev.visibleSections,
        [section]: !prev.visibleSections[section],
      },
    }));
  }, []);

  const setSectionVisible = useCallback((section: DashboardSection, visible: boolean): void => {
    setPreferences(prev => ({
      ...prev,
      visibleSections: {
        ...prev.visibleSections,
        [section]: visible,
      },
    }));
  }, []);

  const resetToDefaults = useCallback((): void => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  const showAllSections = useCallback((): void => {
    setPreferences(prev => ({
      ...prev,
      visibleSections: Object.fromEntries(
        Object.keys(prev.visibleSections).map(key => [key, true])
      ) as Record<DashboardSection, boolean>,
    }));
  }, []);

  const hideAllSections = useCallback((): void => {
    // Keep at least KPIs visible
    setPreferences(prev => ({
      ...prev,
      visibleSections: Object.fromEntries(
        Object.keys(prev.visibleSections).map(key => [key, key === 'kpis'])
      ) as Record<DashboardSection, boolean>,
    }));
  }, []);

  return {
    preferences,
    isSectionVisible,
    toggleSection,
    setSectionVisible,
    resetToDefaults,
    showAllSections,
    hideAllSections,
  };
}
