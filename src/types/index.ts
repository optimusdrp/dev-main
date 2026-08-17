export type ViewMode = 'landing' | 'login' | 'crm';

export type UserRole =
  | 'Administrador'
  | 'Recepção'
  | 'Contador (financeiro)'
  | 'Terceirizado'
  | 'Profissional de Saúde';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  unit: string;
  token: string;
  allowedTabs: CRMTab[];
}

export interface RolePermissions {
  role: UserRole;
  allowedTabs: CRMTab[];
  canEditSettings: boolean;
  canExportAudit: boolean;
}

export type CRMTab = 
  | 'visao-geral'
  | 'atendimentos'
  | 'jornadas'
  | 'pendencias'
  | 'automacoes'
  | 'indicadores'
  | 'configuracoes'
  | 'auditoria';

export type LeadTier = 'VIP / Alto Valor' | 'Ouro (Alta Conversão)' | 'Prata (Padrão)' | 'Bronze (Rotina/Dúvida)';
export type FinancialDisposition = 'Particular (Alto Valor)' | 'Particular (Rotina)' | 'Convênio Premium' | 'Convênio Básico' | 'Indefinido';
export type TreatmentIntentType = 
  | 'Procedimento Estético de Alto Valor'
  | 'Cirurgia / Procedimento Especializado'
  | 'Tratamento Continuado'
  | 'Consulta / Check-up Especializado'
  | 'Consulta Rotineira'
  | 'Dúvida Administrativa / Cobertura';

export interface SmartRoutingInfo {
  recommendedAttendant: string;
  attendantAvatar?: string;
  conversionRate: number;
  routingReason: string;
  routingStatus: 'auto_routed' | 'manual_assigned' | 'ai_handled';
  priorityQueue: boolean;
  assignedAt?: string;
}

export interface LeadScoreData {
  score: number;
  tier: LeadTier;
  financialCategory: FinancialDisposition;
  treatmentIntent: TreatmentIntentType;
  estimatedValueRange: string;
  urgencyLevel: 'Imediata / Hoje' | 'Alta (24-48h)' | 'Moderada' | 'Flexível';
  conversionProbability: number;
  keyBuyingSignals: string[];
  smartRouting: SmartRoutingInfo;
  aiSummaryBriefing: string;
  recommendedSalesPitch: string;
  analyzedAt: string;
  sourceChannel?: string;
}

export interface Patient {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  insurance: string; // e.g. "Bradesco Saúde", "SulAmérica", "Particular", "Unimed"
  specialty?: string; // e.g. "Cardiologia", "Odontologia / Ortodontia", "Dermatologia", "Ginecologia", "Cirurgia Geral"
  planType?: string; // e.g. "Topázio Nacional"
  cpf?: string;
  birthDate?: string;
  status: 'atendimento' | 'pendente' | 'agendado' | 'resolvido';
  stage: 'triagem' | 'documentos' | 'proposta' | 'agendado' | 'tratamento';
  urgency: 'alta' | 'media' | 'baixa';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  assignedTo: string; // e.g. "Camila", "Mariana", "Fernanda"
  slaWarning?: string;
  channel: 'WhatsApp' | 'Telegram' | 'Instagram' | 'Site';
  nextAction?: string;
  checklist: { id: string; label: string; completed: boolean }[];
  internalNotes?: string[];
  tags?: string[];
  sentiment?: 'frustrated' | 'anxious' | 'neutral' | 'satisfied';
  ehrSynced?: boolean;
  ehrSystem?: 'iClinic' | 'Feegow' | 'HiDoctor' | 'TOTVS';
  ehrRecordId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  leadScore?: LeadScoreData;
}

export interface ChatMessage {
  id: string;
  sender: 'patient' | 'system' | 'attendant' | 'ai';
  senderName?: string;
  text: string;
  timestamp: string;
  attachment?: {
    type: 'card' | 'document' | 'image';
    title: string;
    subtitle?: string;
    verified?: boolean;
  };
  isInternalComment?: boolean;
  isPendingSync?: boolean;
}

export interface Appointment {
  id: string;
  time: string;
  duration: string;
  patientName: string;
  patientAvatar?: string;
  procedure: string;
  status: 'Confirmado' | 'Pendente' | 'Cancelado' | 'Concluído';
}

export interface PriorityRule {
  id: string;
  title: string;
  slaLimit: string;
  count: number;
  active?: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  successRate: string;
  status: 'Ativa' | 'Pausada';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  patientName: string;
  recordId: string;
  ipAddress: string;
  encryptionMethod: string;
  status: 'Autorizado' | 'Alertado' | 'Bloqueado';
  category?: 'medicamentos' | 'exames' | 'atestado' | 'anamnese' | 'prontuario' | 'exportacao' | 'outro';
  details?: string;
  previousValue?: string;
  newValue?: string;
}

export interface EHRIntegration {
  id: string;
  name: string;
  logo: string;
  status: 'Conectado' | 'Pendente' | 'Desconectado';
  lastSync: string;
  recordsCount: number;
  type: 'Prontuário Eletrônico' | 'Gestão de Clínicas' | 'Faturamento TISS';
}

export type WebhookEvent =
  | 'patient.created'
  | 'patient.stage_changed'
  | 'chat.message_received'
  | 'ehr.synced'
  | 'triage.completed'
  | 'appointment.scheduled'
  | 'triage.accuracy_alert';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  status: 'Ativo' | 'Inativo';
  lastTriggered?: string;
  lastStatusCode?: number;
  lastTestSuccess?: boolean;
  lastTestDate?: string;
  lastTestStatusCode?: number;
  lastTestLatencyMs?: number;
  failureCount: number;
  createdAt: string;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  webhookName: string;
  event: WebhookEvent | 'webhook.test';
  timestamp: string;
  statusCode: number;
  latencyMs: number;
  requestPayload: string;
  responseBody: string;
  success: boolean;
}

export interface ResponseTemplate {
  id: string;
  title: string;
  category: 'Preparo de Exames' | 'Agendamento' | 'Pós-Operatório' | 'Convênios & Guias' | 'Orientação Médica' | 'Informações Gerais';
  content: string;
  shortcut?: string; // e.g. "/jejum", "/agendar", "/posop"
  targetRole?: 'Todos' | 'Médicos' | 'Recepção';
  usageCount?: number;
  createdByName?: string;
  updatedAt?: string;
}

