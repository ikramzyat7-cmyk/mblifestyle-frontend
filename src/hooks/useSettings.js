import { useState, useEffect } from 'react';
import api from '../api/axios';

let cachedSettings = null;

export function useSettings() {
  const [settings, setSettings] = useState(cachedSettings || {});

  useEffect(() => {
    if (cachedSettings) return;
    api.get('/settings').then((res) => {
      cachedSettings = res.data;
      setSettings(res.data);
    });
  }, []);

  return settings;
}