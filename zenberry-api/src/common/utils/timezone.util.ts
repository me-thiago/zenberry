/**
 * Timezone utility functions
 * Provides validation and management for timezone strings used in cron jobs
 */

/**
 * List of commonly used timezones for validation
 * Using IANA timezone identifiers
 */
export const COMMON_TIMEZONES = [
  // UTC and GMT
  'UTC',
  'GMT',
  
  // Americas
  'America/Sao_Paulo',    // Brazil (UTC-3, with DST)
  'America/Manaus',       // Brazil West (UTC-4)
  'America/Recife',       // Brazil Northeast (UTC-3)
  'America/New_York',     // US Eastern
  'America/Chicago',      // US Central
  'America/Denver',       // US Mountain
  'America/Los_Angeles',  // US Pacific
  'America/Mexico_City',  // Mexico
  'America/Argentina/Buenos_Aires', // Argentina
  
  // Europe
  'Europe/London',        // UK
  'Europe/Paris',         // France/Germany/Italy
  'Europe/Madrid',        // Spain
  'Europe/Lisbon',        // Portugal
  'Europe/Moscow',        // Russia
  
  // Asia
  'Asia/Tokyo',           // Japan
  'Asia/Shanghai',        // China
  'Asia/Kolkata',         // India
  'Asia/Dubai',           // UAE
  
  // Australia
  'Australia/Sydney',     // Australia East
  'Australia/Perth',      // Australia West
  
  // Africa
  'Africa/Cairo',         // Egypt
  'Africa/Johannesburg',  // South Africa
] as const;

/**
 * Validates if a timezone string is valid using Intl API
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    // Use Intl.DateTimeFormat to validate timezone
    new Intl.DateTimeFormat('en', { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets all supported timezones from the system
 * Note: This requires Node.js 16+ for Intl.supportedValuesOf
 */
export function getSupportedTimezones(): string[] {
  try {
    // Check if supportedValuesOf exists (Node.js 16+)
    const intlWithSupport = Intl as any;
    if (typeof intlWithSupport.supportedValuesOf === 'function') {
      return intlWithSupport.supportedValuesOf('timeZone');
    }
    
    // Fallback to our common list
    return [...COMMON_TIMEZONES];
  } catch (error) {
    // Fallback to our common list
    return [...COMMON_TIMEZONES];
  }
}

/**
 * Normalizes timezone input (handles case sensitivity and aliases)
 */
export function normalizeTimezone(timezone: string): string {
  if (!timezone) {
    return 'UTC';
  }

  // Handle common aliases
  const aliases: Record<string, string> = {
    'gmt': 'GMT',
    'utc': 'UTC',
    'est': 'America/New_York',
    'pst': 'America/Los_Angeles',
    'cst': 'America/Chicago',
    'mst': 'America/Denver',
    'brasilia': 'America/Sao_Paulo',
    'sao_paulo': 'America/Sao_Paulo',
    'sp': 'America/Sao_Paulo',
  };

  const normalized = aliases[timezone.toLowerCase()] || timezone;
  
  // Validate the normalized timezone
  if (isValidTimezone(normalized)) {
    return normalized;
  }
  
  // Return UTC as fallback
  return 'UTC';
}

/**
 * Gets current time in a specific timezone
 */
export function getCurrentTimeInTimezone(timezone: string): Date {
  const normalizedTz = normalizeTimezone(timezone);
  
  try {
    // Create a date formatter for the timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: normalizedTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date());
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
    const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');

    return new Date(year, month, day, hour, minute, second);
  } catch (error) {
    // Fallback to current UTC time
    return new Date();
  }
}

/**
 * Formats timezone offset for display (e.g., "UTC-3", "UTC+0")
 */
export function getTimezoneOffset(timezone: string): string {
  const normalizedTz = normalizeTimezone(timezone);
  
  try {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: normalizedTz }));
    
    const offsetMs = utcDate.getTime() - tzDate.getTime();
    const offsetHours = offsetMs / (1000 * 60 * 60);
    
    if (offsetHours === 0) {
      return 'UTC+0';
    } else if (offsetHours > 0) {
      return `UTC+${offsetHours}`;
    } else {
      return `UTC${offsetHours}`;
    }
  } catch (error) {
    return 'UTC+0';
  }
}

/**
 * Default timezone for the application
 */
export const DEFAULT_TIMEZONE = 'UTC';

/**
 * Brazilian timezone (most common)
 */
export const BRAZIL_TIMEZONE = 'America/Sao_Paulo'; 