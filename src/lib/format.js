export const formatDate = (iso) =>
  new Date(iso).toLocaleString('uz-UZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const timeAgo = (iso) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'hozirgina';
  if (s < 3600) return `${Math.floor(s / 60)} daqiqa oldin`;
  if (s < 86400) return `${Math.floor(s / 3600)} soat oldin`;
  return formatDate(iso);
};

export const formatDuration = (sec = 0) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h ? `${h} soat ${m} daq` : `${m} daq`;
};

export const initials = (name = '') =>
  name.split(' ').map((p) => p[0] || '').join('').slice(0, 2).toUpperCase() || '?';

export const hueFor = (s = '') => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
