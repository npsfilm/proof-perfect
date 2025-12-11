export type TriggerEvent =
  | 'gallery_created'
  | 'gallery_sent_to_client'
  | 'gallery_review_submitted'
  | 'gallery_delivered'
  | 'booking_created'
  | 'staging_requested'
  | 'reopen_request_submitted'
  | 'reopen_request_approved'
  | 'client_created';

export type ActionType =
  | 'send_email'
  | 'send_webhook'
  | 'create_calendar_event'
  | 'create_gallery'
  | 'update_gallery_status'
  | 'notify_admin';

export type NodeType = 'trigger' | 'action' | 'delay' | 'condition' | 'end';

export type DelayUnit = 'minutes' | 'hours' | 'days';

export type ConditionOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains'
  | 'greater_than' 
  | 'less_than' 
  | 'is_empty' 
  | 'is_not_empty'
  | 'is_true'
  | 'is_false';

export interface TriggerDefinition {
  key: TriggerEvent;
  label: string;
  description: string;
  availableData: string[];
}

export interface ActionDefinition {
  key: ActionType;
  label: string;
  icon: string;
  description: string;
}

export interface NodeDefinition {
  type: NodeType;
  label: string;
  icon: string;
  description: string;
  color: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  trigger_event: TriggerEvent;
  is_active: boolean;
  conditions: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAction {
  id: string;
  workflow_id: string;
  action_type: ActionType;
  action_config: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface WorkflowNode {
  id: string;
  workflow_id: string;
  node_type: NodeType;
  action_type: ActionType | null;
  node_config: Record<string, unknown>;
  position_x: number;
  position_y: number;
  created_at: string;
}

export interface WorkflowEdge {
  id: string;
  workflow_id: string;
  source_node_id: string;
  target_node_id: string;
  edge_label: 'default' | 'true' | 'false';
  sort_order: number;
  created_at: string;
}

export interface ScheduledWorkflowStep {
  id: string;
  workflow_run_id: string;
  node_id: string;
  scheduled_for: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string | null;
  trigger_event: string;
  trigger_payload: Record<string, unknown> | null;
  status: 'pending' | 'running' | 'success' | 'failed';
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  current_node_id: string | null;
  execution_path: string[];
}

export interface WorkflowWithActions extends Workflow {
  workflow_actions: WorkflowAction[];
}

export interface WorkflowWithNodes extends Workflow {
  workflow_nodes: WorkflowNode[];
  workflow_edges: WorkflowEdge[];
}

// Trigger-Definitionen
export const TRIGGER_DEFINITIONS: TriggerDefinition[] = [
  {
    key: 'gallery_created',
    label: 'Galerie erstellt',
    description: 'Wird ausgelöst, wenn eine neue Galerie angelegt wird',
    availableData: ['gallery_id', 'gallery_name', 'address', 'company_id'],
  },
  {
    key: 'gallery_sent_to_client',
    label: 'Galerie an Kunde gesendet',
    description: 'Wird ausgelöst, wenn eine Galerie an Kunden versendet wird',
    availableData: ['gallery_id', 'client_emails', 'gallery_url', 'gallery_name'],
  },
  {
    key: 'gallery_review_submitted',
    label: 'Kundenauswahl abgeschlossen',
    description: 'Wird ausgelöst, wenn ein Kunde seine Fotoauswahl abschließt',
    availableData: ['gallery_id', 'selected_count', 'staging_count', 'blue_hour_count', 'feedback'],
  },
  {
    key: 'gallery_delivered',
    label: 'Galerie geliefert',
    description: 'Wird ausgelöst, wenn die finalen Fotos geliefert werden',
    availableData: ['gallery_id', 'download_link', 'file_count'],
  },
  {
    key: 'booking_created',
    label: 'Buchung eingegangen',
    description: 'Wird ausgelöst, wenn eine neue Buchung erstellt wird',
    availableData: ['booking_id', 'contact_email', 'contact_name', 'address', 'scheduled_date', 'package_type'],
  },
  {
    key: 'staging_requested',
    label: 'Staging angefordert',
    description: 'Wird ausgelöst, wenn ein Kunde virtuelles Staging anfordert',
    availableData: ['request_id', 'gallery_id', 'photo_count', 'staging_style'],
  },
  {
    key: 'reopen_request_submitted',
    label: 'Wiedereröffnung angefragt',
    description: 'Wird ausgelöst, wenn ein Kunde eine Wiedereröffnung anfragt',
    availableData: ['request_id', 'gallery_id', 'message', 'user_email'],
  },
  {
    key: 'reopen_request_approved',
    label: 'Wiedereröffnung genehmigt',
    description: 'Wird ausgelöst, wenn eine Wiedereröffnung genehmigt wird',
    availableData: ['request_id', 'gallery_id', 'user_email'],
  },
  {
    key: 'client_created',
    label: 'Kunde erstellt',
    description: 'Wird ausgelöst, wenn ein neuer Kunde angelegt wird',
    availableData: ['client_id', 'email', 'vorname', 'nachname', 'company_id'],
  },
];

// Aktions-Definitionen
export const ACTION_DEFINITIONS: ActionDefinition[] = [
  {
    key: 'send_email',
    label: 'E-Mail senden',
    icon: 'Mail',
    description: 'Versendet eine E-Mail basierend auf einem Template',
  },
  {
    key: 'send_webhook',
    label: 'Webhook senden',
    icon: 'Webhook',
    description: 'Sendet einen HTTP-Request an eine externe URL',
  },
  {
    key: 'create_calendar_event',
    label: 'Kalendereintrag erstellen',
    icon: 'Calendar',
    description: 'Erstellt einen neuen Kalendereintrag',
  },
  {
    key: 'create_gallery',
    label: 'Galerie erstellen',
    icon: 'Images',
    description: 'Erstellt automatisch eine neue Galerie',
  },
  {
    key: 'update_gallery_status',
    label: 'Galerie-Status ändern',
    icon: 'RefreshCw',
    description: 'Ändert den Status einer Galerie',
  },
  {
    key: 'notify_admin',
    label: 'Admin benachrichtigen',
    icon: 'Bell',
    description: 'Zeigt eine Benachrichtigung im Admin-Dashboard',
  },
];

// Node-Definitionen für visuellen Editor
export const NODE_DEFINITIONS: NodeDefinition[] = [
  {
    type: 'trigger',
    label: 'Trigger',
    icon: 'Zap',
    description: 'Start-Event des Workflows',
    color: 'hsl(var(--primary))',
  },
  {
    type: 'action',
    label: 'Aktion',
    icon: 'Play',
    description: 'Führt eine Aktion aus',
    color: 'hsl(142 76% 36%)',
  },
  {
    type: 'delay',
    label: 'Verzögerung',
    icon: 'Clock',
    description: 'Wartet eine bestimmte Zeit',
    color: 'hsl(38 92% 50%)',
  },
  {
    type: 'condition',
    label: 'Bedingung',
    icon: 'GitBranch',
    description: 'Verzweigt basierend auf Bedingung',
    color: 'hsl(262 83% 58%)',
  },
  {
    type: 'end',
    label: 'Ende',
    icon: 'CircleStop',
    description: 'Beendet den Workflow',
    color: 'hsl(0 0% 45%)',
  },
];

// Condition Operators
export const CONDITION_OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'equals', label: 'ist gleich' },
  { value: 'not_equals', label: 'ist nicht gleich' },
  { value: 'contains', label: 'enthält' },
  { value: 'not_contains', label: 'enthält nicht' },
  { value: 'greater_than', label: 'größer als' },
  { value: 'less_than', label: 'kleiner als' },
  { value: 'is_empty', label: 'ist leer' },
  { value: 'is_not_empty', label: 'ist nicht leer' },
  { value: 'is_true', label: 'ist wahr' },
  { value: 'is_false', label: 'ist falsch' },
];

// Delay Units
export const DELAY_UNITS: { value: DelayUnit; label: string }[] = [
  { value: 'minutes', label: 'Minuten' },
  { value: 'hours', label: 'Stunden' },
  { value: 'days', label: 'Tage' },
];

// Hilfsfunktion zum Abrufen eines Triggers
export function getTriggerDefinition(key: TriggerEvent): TriggerDefinition | undefined {
  return TRIGGER_DEFINITIONS.find((t) => t.key === key);
}

// Hilfsfunktion zum Abrufen einer Aktion
export function getActionDefinition(key: ActionType): ActionDefinition | undefined {
  return ACTION_DEFINITIONS.find((a) => a.key === key);
}

// Hilfsfunktion zum Abrufen einer Node-Definition
export function getNodeDefinition(type: NodeType): NodeDefinition | undefined {
  return NODE_DEFINITIONS.find((n) => n.type === type);
}
