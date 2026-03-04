import moment from 'moment-timezone';

/**
 * Detects IANA timezone string based on country and city.
 * In a real-world scenario, you might use a geo-data library or API like Google Maps/GeoNames.
 * For this MVP, we'll provide a simplified mapping or use a default if not found.
 */
export const getTimezone = (country: string, city: string): string => {
  // Mapping logic would go here. For now, let's assume some common mappings
  // and default to UTC or a generic one if not found.
  
  const cityTimezone = moment.tz.names().find(tz => tz.toLowerCase().includes(city.toLowerCase().replace(' ', '_')));
  
  if (cityTimezone) return cityTimezone;

  // Fallback map
  const fallbackMap: Record<string, string> = {
    'USA': 'America/New_York',
    'United States': 'America/New_York',
    'India': 'Asia/Kolkata',
    'UK': 'Europe/London',
    'United Kingdom': 'Europe/London',
    'Germany': 'Europe/Berlin',
    'France': 'Europe/Paris',
    'Australia': 'Australia/Sydney',
  };

  return fallbackMap[country] || 'UTC';
};

export const getNext10AMUTC = (timezone: string): Date => {
  return getNext10AMUTCForDay(timezone, 0);
};

/**
 * Converts local 10 AM in a specific timezone to the UTC timestamp after X relative days.
 */
export const getNext10AMUTCForDay = (timezone: string, waitDays: number): Date => {
  const localTime = moment.tz(timezone).hour(10).minute(0).second(0).millisecond(0).add(waitDays, 'days');
  
  // If 10 AM has already passed today and waitDays is 0, schedule for tomorrow
  if (waitDays === 0 && localTime.isBefore(moment.tz(timezone))) {
    localTime.add(1, 'day');
  }

  return localTime.utc().toDate();
};
