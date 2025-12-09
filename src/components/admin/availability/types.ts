export const DAYS = [
  { key: 'monday', label: 'Montag' },
  { key: 'tuesday', label: 'Dienstag' },
  { key: 'wednesday', label: 'Mittwoch' },
  { key: 'thursday', label: 'Donnerstag' },
  { key: 'friday', label: 'Freitag' },
  { key: 'saturday', label: 'Samstag' },
  { key: 'sunday', label: 'Sonntag' },
] as const;

export type DayKey = typeof DAYS[number]['key'];

export interface LocalSettings {
  [key: string]: boolean | string | number;
}

export interface NewBlockedDate {
  start_date: string;
  end_date: string;
  reason: string;
}

export const DEFAULT_SETTINGS: LocalSettings = {
  monday_enabled: true,
  monday_start: '08:00',
  monday_end: '18:00',
  tuesday_enabled: true,
  tuesday_start: '08:00',
  tuesday_end: '18:00',
  wednesday_enabled: true,
  wednesday_start: '08:00',
  wednesday_end: '18:00',
  thursday_enabled: true,
  thursday_start: '08:00',
  thursday_end: '18:00',
  friday_enabled: true,
  friday_start: '08:00',
  friday_end: '18:00',
  saturday_enabled: false,
  saturday_start: '09:00',
  saturday_end: '14:00',
  sunday_enabled: false,
  sunday_start: '09:00',
  sunday_end: '14:00',
  slot_interval: 30,
  buffer_before: 0,
  buffer_after: 15,
};
