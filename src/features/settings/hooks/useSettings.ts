import { useCallback, useEffect, useState } from 'react';
import { readSettings, saveSettings } from '../utils/settingsStorage';
import type { UserSettings } from '../types';

type SettingsPatch = Partial<UserSettings>;

export function useSettings() {
  const [settings, setSettingsState] = useState<UserSettings>(() => readSettings());

  const updateSettings = useCallback((patch: SettingsPatch) => {
    setSettingsState(current => {
      const next = { ...current, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    const next = readSettings();
    setSettingsState(next);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.themeMode;
    document.documentElement.lang = settings.language;
  }, [settings.language, settings.themeMode]);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}
