export const STAGING_STYLES = [
  'Modern',
  'Scandi',
  'Industrial',
  'Boho',
  'Minimalistisch',
  'Klassisch',
] as const;

export type StagingStyle = typeof STAGING_STYLES[number];
