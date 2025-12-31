const SETTINGS_KEY = "aic_settings";
const SESSION_KEY = "aic_session";

export const saveSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getSettings = () => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const saveSession = (patch) => {
  const prev = loadSession() || {};
  const next = { ...prev, ...patch };
  localStorage.setItem(SESSION_KEY, JSON.stringify(next));
};

export const loadSession = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};
