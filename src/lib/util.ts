import { DateTime } from 'luxon';

export function nowIsoString() {
  return DateTime.now().toUTC().toISO();
}
