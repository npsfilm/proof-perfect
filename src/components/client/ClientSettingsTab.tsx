import { SettingsLayout } from './settings/SettingsLayout';

interface ClientSettingsTabProps {
  client: any;
  userEmail: string;
}

export function ClientSettingsTab({ userEmail }: ClientSettingsTabProps) {
  return <SettingsLayout userEmail={userEmail} />;
}
