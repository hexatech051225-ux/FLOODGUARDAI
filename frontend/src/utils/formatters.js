export const formatWaterLevel = (meters) => {
  if (meters === undefined || meters === null) return '0.00 m';
  return `${Number(meters).toFixed(2)} m`;
};

export const formatRainfall = (mmPerHour) => {
  if (mmPerHour === undefined || mmPerHour === null) return '0.0 mm/h';
  return `${Number(mmPerHour).toFixed(1)} mm/h`;
};

export const formatFlow = (velocity, discharge) => {
  if (velocity === undefined) return '0.00 m/s';
  if (discharge !== undefined) {
    return `${Number(velocity).toFixed(2)} m/s (${Number(discharge).toFixed(1)} m³/s)`;
  }
  return `${Number(velocity).toFixed(2)} m/s`;
};

export const formatRateOfRise = (rate) => {
  if (rate === undefined || rate === null) return '+0.0 cm/h';
  const sign = rate > 0 ? '+' : '';
  return `${sign}${Number(rate).toFixed(1)} cm/h`;
};

export const formatTimestamp = (isoString) => {
  if (!isoString) return '--:--:--';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const formatDateFull = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (isoString) => {
  if (!isoString) return 'just now';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ${diffMin % 60}m ago`;
};
