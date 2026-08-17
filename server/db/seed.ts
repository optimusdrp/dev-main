import { docClient } from './dynalite';
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

export const SEED_PATIENTS = [
  {
    id: 'p1',
    name: 'Ana Luíza Vasconcelos',
    phone: '(11) 98765-4321',
    insurance: 'Bradesco Saúde',
    planType: 'Topázio Nacional',
    cpf: '321.654.987-00',
    birthDate: '14/05/1988',
    status: 'pendente',
    stage: 'documentos',
    urgency: 'alta',
    lastMessage: 'Qual o valor do ecocardiograma caso o meu convênio não cubra totalmente?',
    lastMessageTime: '1h45',
    unreadCount: 1,
    assignedTo: 'Camila',
    slaWarning: 'Ação da clínica pendente há 1h45. O paciente fez uma pergunta. Meta de resposta: 30 minutos.',
    channel: 'WhatsApp',
    nextAction: 'Responder dúvida de cobertura',
    checklist: [
      { id: 'c1', label: 'Carteirinha validada', completed: true },
      { id: 'c2', label: 'Elegibilidade conferida', completed: true },
      { id: 'c3', label: 'Registrar condição informada', completed: false },
    ],
    internalNotes: [
      'Paciente prefere atendimento no período da tarde (Mariana Costa - Hoje, 10:20)',
    ],
    ehrSynced: true,
    ehrSystem: 'iClinic',
    ehrRecordId: 'PEP-2025-0892',
  },
  {
    id: 'p2',
    name: 'Carlos Eduardo Mendes',
    phone: '(11) 97123-8844',
    insurance: 'Particular',
    planType: 'Consulta Especializada',
    cpf: '189.445.672-11',
    birthDate: '22/11/1982',
    status: 'atendimento',
    stage: 'proposta',
    urgency: 'media',
    lastMessage: 'Vocês parcelam em quantas vezes sem juros para implante dentário?',
    lastMessageTime: '38min',
    unreadCount: 0,
    assignedTo: 'Mariana',
    channel: 'WhatsApp',
    nextAction: 'Enviar tabela de parcelamento e orçamento',
    checklist: [
      { id: 'c1', label: 'Anamnese preenchida', completed: true },
      { id: 'c2', label: 'Orçamento gerado', completed: true },
      { id: 'c3', label: 'Confirmação financeira', completed: false },
    ],
    internalNotes: ['Interesse em facetas de porcelana e implante'],
    ehrSynced: true,
    ehrSystem: 'Feegow',
    ehrRecordId: 'PEP-2025-1102',
  },
  {
    id: 'p3',
    name: 'Fernanda Lima Rocha',
    phone: '(11) 96543-2109',
    insurance: 'SulAmérica',
    planType: 'Exato 100',
    cpf: '455.990.123-88',
    birthDate: '03/09/1991',
    status: 'pendente',
    stage: 'triagem',
    urgency: 'media',
    lastMessage: 'Guia de ressonância ainda não foi autorizada pelo convênio?',
    lastMessageTime: '3d',
    unreadCount: 0,
    assignedTo: 'Fernanda',
    channel: 'WhatsApp',
    nextAction: 'Verificar portal SulAmérica TISS',
    checklist: [
      { id: 'c1', label: 'Pedido médico anexado', completed: true },
      { id: 'c2', label: 'Solicitação TISS enviada', completed: true },
      { id: 'c3', label: 'Retorno para paciente', completed: false },
    ],
    internalNotes: ['Aguardando liberação de senha de autorização'],
    ehrSynced: true,
    ehrSystem: 'HiDoctor',
    ehrRecordId: 'PEP-2025-0441',
  },
  {
    id: 'p4',
    name: 'João Victor',
    phone: '(11) 95544-3322',
    insurance: 'Bradesco Saúde',
    planType: 'Perfil Flex',
    cpf: '221.778.334-09',
    birthDate: '19/02/1995',
    status: 'agendado',
    stage: 'agendado',
    urgency: 'baixa',
    lastMessage: 'Consigo agendar para semana que vem a consulta de canal?',
    lastMessageTime: 'Ontem',
    assignedTo: 'Camila',
    channel: 'WhatsApp',
    checklist: [
      { id: 'c1', label: 'Horário selecionado', completed: true },
      { id: 'c2', label: 'Lembrete automático programado', completed: true },
    ],
    ehrSynced: true,
    ehrSystem: 'iClinic',
    ehrRecordId: 'PEP-2025-0990',
  },
  {
    id: 'p5',
    name: 'Beatriz Alves',
    phone: '(11) 94433-2211',
    insurance: 'Unimed',
    status: 'pendente',
    stage: 'triagem',
    urgency: 'media',
    lastMessage: 'Olá, gostaria de saber se atendem Unimed para ortodontia.',
    lastMessageTime: '1h20',
    assignedTo: 'Camila',
    channel: 'WhatsApp',
    checklist: [{ id: 'c1', label: 'Triagem inicial', completed: true }],
    ehrSynced: false,
  },
  {
    id: 'p6',
    name: 'Marta Silva',
    phone: '(11) 93322-1100',
    insurance: 'Amil',
    status: 'atendimento',
    stage: 'documentos',
    urgency: 'baixa',
    lastMessage: 'Enviei a foto da carteirinha e o pedido do clínico.',
    lastMessageTime: '28min',
    assignedTo: 'Mariana',
    channel: 'Telegram',
    checklist: [{ id: 'c1', label: 'Documentação recebida', completed: true }],
    ehrSynced: true,
    ehrSystem: 'TOTVS',
  },
  {
    id: 'p7',
    name: 'Juliana Rocha',
    phone: '(11) 92211-0099',
    insurance: 'Particular',
    status: 'agendado',
    stage: 'agendado',
    urgency: 'baixa',
    lastMessage: 'Confirmado para hoje às 09:00 para clareamento dental.',
    lastMessageTime: 'Hoje, 08:30',
    assignedTo: 'Dra. Juliana',
    channel: 'WhatsApp',
    checklist: [{ id: 'c1', label: 'Confirmado via IA', completed: true }],
    ehrSynced: true,
    ehrSystem: 'iClinic',
  },
];

export const SEED_MESSAGES = [
  {
    id: 'm1',
    patientId: 'p1',
    sender: 'patient',
    text: 'Olá! Vocês aceitam Bradesco Saúde para consulta de cardiologia e exames?',
    timestamp: '10:05',
  },
  {
    id: 'm2',
    patientId: 'p1',
    sender: 'attendant',
    senderName: 'Camila Santos',
    text: 'Olá, Ana! Aceitamos sim. Para verificar sua cobertura, poderia enviar uma foto da carteirinha?',
    timestamp: '10:06',
  },
  {
    id: 'm3',
    patientId: 'p1',
    sender: 'patient',
    text: 'Carteirinha anexada:',
    timestamp: '10:12',
    attachment: {
      type: 'card',
      title: 'Carteirinha identificada',
      subtitle: 'Plano Topázio Nacional • Elegibilidade confirmada com Bradesco TISS',
      verified: true,
    },
  },
  {
    id: 'm4',
    patientId: 'p1',
    sender: 'patient',
    text: 'Qual o valor do ecocardiograma caso o meu convênio não cubra totalmente?',
    timestamp: '10:32',
  },
  {
    id: 'm5',
    patientId: 'p1',
    sender: 'ai',
    senderName: 'Sugestão da IA (MediFlux Copilot)',
    text: 'O valor particular do ecocardiograma é R$ 380,00. Também podemos verificar se há cobertura parcial ou possibilidade de reembolso pelo seu plano Bradesco Topázio.',
    timestamp: 'Agora',
  },
];

export const SEED_APPOINTMENTS = [
  {
    id: 'a1',
    time: '09:00',
    duration: '30 min',
    patientName: 'Juliana Rocha',
    procedure: 'Clareamento dental',
    status: 'Confirmado',
  },
  {
    id: 'a2',
    time: '10:30',
    duration: '60 min',
    patientName: 'Thiago Ferreira',
    procedure: 'Implante dentário',
    status: 'Confirmado',
  },
  {
    id: 'a3',
    time: '14:00',
    duration: '45 min',
    patientName: 'Mariana Costa',
    procedure: 'Avaliação ortodôntica',
    status: 'Confirmado',
  },
  {
    id: 'a4',
    time: '15:30',
    duration: '30 min',
    patientName: 'Carlos Eduardo',
    procedure: 'Clareamento dental',
    status: 'Pendente',
  },
  {
    id: 'a5',
    time: '17:00',
    duration: '30 min',
    patientName: 'Beatriz Oliveira',
    procedure: 'Facetas de porcelana',
    status: 'Confirmado',
  },
];

export const SEED_PRIORITY_RULES = [
  { id: 'pr1', title: 'Pergunta do paciente', slaLimit: 'Prazo: 30 min', count: 5 },
  { id: 'pr2', title: 'Documento ou guia recebido', slaLimit: 'Prazo: 2 horas', count: 3 },
  { id: 'pr3', title: 'Horários enviados', slaLimit: 'Prazo: 24 horas', count: 4 },
  { id: 'pr4', title: 'Paciente vai pensar', slaLimit: 'Prazo: 48 horas', count: 4 },
];

export const SEED_AUTOMATION_RULES = [
  { id: 'ar1', name: 'Confirmação de agendamento', trigger: 'Gatilho: 48h e 24h antes da consulta', successRate: '92% confirmados', status: 'Ativa' },
  { id: 'ar2', name: 'Follow-up de horários', trigger: 'Gatilho: 24h sem resposta do orçamento', successRate: '38% responderam', status: 'Ativa' },
  { id: 'ar3', name: 'Alerta de carteirinha', trigger: 'Gatilho: 2h aguardando documento', successRate: '17 lembretes hoje', status: 'Ativa' },
  { id: 'ar4', name: 'Pesquisa pós-atendimento', trigger: 'Gatilho: 2h após a consulta', successRate: '64% responderam', status: 'Pausada' },
];

export const SEED_EHR_INTEGRATIONS = [
  { id: 'ehr1', name: 'iClinic (Afya)', logo: '🏥', status: 'Conectado', lastSync: 'Há 2 minutos', recordsCount: 1420, type: 'Prontuário Eletrônico' },
  { id: 'ehr2', name: 'Feegow Clinic', logo: '🩺', status: 'Conectado', lastSync: 'Há 5 minutos', recordsCount: 980, type: 'Gestão de Clínicas' },
  { id: 'ehr3', name: 'HiDoctor', logo: '💻', status: 'Conectado', lastSync: 'Há 12 minutos', recordsCount: 750, type: 'Prontuário Eletrônico' },
  { id: 'ehr4', name: 'TOTVS Saúde / SIMS', logo: '🛡️', status: 'Pendente', lastSync: 'Aguardando token TISS', recordsCount: 0, type: 'Faturamento TISS' },
];

export const SEED_AUDIT_LOGS = [
  {
    id: 'log-101',
    timestamp: '10/08/2026 10:32:14',
    user: 'Camila Santos',
    role: 'Recepção 01',
    action: 'Visualização de Prontuário & Carteirinha',
    patientName: 'Ana Luíza Vasconcelos',
    recordId: 'PEP-2025-0892',
    ipAddress: '189.120.45.12 (HTTPS / TLS 1.3)',
    encryptionMethod: 'AES-256 E2E',
    status: 'Autorizado',
  },
  {
    id: 'log-102',
    timestamp: '10/08/2026 10:30:00',
    user: 'MediFlux AI Agent',
    role: 'Agente IA Autônomo',
    action: 'Identificação OCR Carteirinha Bradesco',
    patientName: 'Ana Luíza Vasconcelos',
    recordId: 'PEP-2025-0892',
    ipAddress: 'Interno (VPC Secreta)',
    encryptionMethod: 'KMS Tokenizado',
    status: 'Autorizado',
  },
  {
    id: 'log-103',
    timestamp: '10/08/2026 09:45:22',
    user: 'Dra. Juliana Martins',
    role: 'Médica / CRM 129481',
    action: 'Assinatura Digital de Receita TISS',
    patientName: 'Juliana Rocha',
    recordId: 'PEP-2025-0990',
    ipAddress: '177.89.201.05',
    encryptionMethod: 'Certificado ICP-Brasil A3',
    status: 'Autorizado',
  },
  {
    id: 'log-104',
    timestamp: '10/08/2026 08:12:05',
    user: 'Mariana Costa',
    role: 'Atendimento Comercial',
    action: 'Exportação de Histórico de Conversa',
    patientName: 'Carlos Eduardo Mendes',
    recordId: 'PEP-2025-1102',
    ipAddress: '189.120.45.18',
    encryptionMethod: 'AES-256 E2E',
    status: 'Autorizado',
  },
];

export const SEED_ROLE_PERMISSIONS = [
  {
    role: 'Administrador',
    allowedTabs: [
      'visao-geral',
      'atendimentos',
      'jornadas',
      'pendencias',
      'automacoes',
      'indicadores',
      'configuracoes',
      'auditoria',
    ],
  },
  {
    role: 'Recepção',
    allowedTabs: ['atendimentos', 'jornadas', 'pendencias'],
  },
  {
    role: 'Contador (financeiro)',
    allowedTabs: ['visao-geral', 'pendencias', 'indicadores'],
  },
  {
    role: 'Terceirizado',
    allowedTabs: ['pendencias'],
  },
  {
    role: 'Profissional de Saúde',
    allowedTabs: [
      'visao-geral',
      'atendimentos',
      'jornadas',
      'pendencias',
      'auditoria',
    ],
  },
];

export const SEED_WEBHOOKS = [
  {
    id: 'wh1',
    name: 'N8N - Notificação de Mudança de Etapa em Prontuários',
    url: 'https://n8n.mediflux.com.br/webhook/patient-stage-update',
    secret: 'whsec_n8n_8f9a23b1029c',
    events: ['patient.created', 'patient.stage_changed', 'ehr.synced'],
    status: 'Ativo',
    lastTriggered: 'Há 12 min',
    lastStatusCode: 200,
    lastTestSuccess: true,
    lastTestDate: 'Hoje, 10:15',
    lastTestStatusCode: 200,
    lastTestLatencyMs: 42,
    failureCount: 0,
    createdAt: '10/08/2026 09:00',
  },
  {
    id: 'wh2',
    name: 'Zapier - Nova Mensagem de Paciente no WhatsApp',
    url: 'https://hooks.zapier.com/hooks/catch/91823/mediflux-chat',
    secret: 'whsec_zap_3d8172ea0011',
    events: ['chat.message_received', 'triage.completed'],
    status: 'Ativo',
    lastTriggered: 'Há 35 min',
    lastStatusCode: 200,
    lastTestSuccess: true,
    lastTestDate: 'Hoje, 09:40',
    lastTestStatusCode: 200,
    lastTestLatencyMs: 85,
    failureCount: 0,
    createdAt: '10/08/2026 08:30',
  },
  {
    id: 'wh3',
    name: 'iClinic PEP Bridge - Sincronização Eletrônica',
    url: 'https://api.iclinic.com.br/v2/webhooks/mediflux-sync',
    secret: 'whsec_iclinic_712893ac8801',
    events: ['ehr.synced', 'appointment.scheduled'],
    status: 'Inativo',
    lastTriggered: 'Ontem, 18:20',
    lastStatusCode: 504,
    lastTestSuccess: false,
    lastTestDate: 'Ontem, 18:20',
    lastTestStatusCode: 504,
    lastTestLatencyMs: 3012,
    failureCount: 3,
    createdAt: '09/08/2026 14:20',
  },
  {
    id: 'wh4',
    name: 'Make.com - Disparo de Pesquisa NPS Pós-Consulta',
    url: 'https://hook.us1.make.com/883719283712893',
    secret: 'whsec_make_441290aa9128',
    events: ['appointment.scheduled'],
    status: 'Ativo',
    lastTriggered: 'Há 2 horas',
    lastStatusCode: 500,
    lastTestSuccess: false,
    lastTestDate: 'Hoje, 07:15',
    lastTestStatusCode: 500,
    lastTestLatencyMs: 1250,
    failureCount: 1,
    createdAt: '11/08/2026 11:00',
  },
];

export const SEED_WEBHOOK_LOGS = [
  {
    id: 'whlog-1',
    webhookId: 'wh1',
    webhookName: 'N8N - Notificação de Mudança de Etapa em Prontuários',
    event: 'patient.stage_changed',
    timestamp: '10/08/2026 10:20:15',
    statusCode: 200,
    latencyMs: 42,
    requestPayload: JSON.stringify({
      event: 'patient.stage_changed',
      timestamp: '2026-08-10T10:20:15.000Z',
      patient: {
        id: 'p1',
        name: 'Ana Luíza Vasconcelos',
        insurance: 'Bradesco Saúde',
        stage: 'documentos',
        urgency: 'alta'
      }
    }, null, 2),
    responseBody: JSON.stringify({ success: true, message: 'Workflow N8N iniciado' }),
    success: true,
  },
  {
    id: 'whlog-2',
    webhookId: 'wh2',
    webhookName: 'Zapier - Nova Mensagem de Paciente no WhatsApp',
    event: 'chat.message_received',
    timestamp: '10/08/2026 09:55:02',
    statusCode: 200,
    latencyMs: 88,
    requestPayload: JSON.stringify({
      event: 'chat.message_received',
      timestamp: '2026-08-10T09:55:02.000Z',
      chat: {
        patientId: 'p1',
        sender: 'patient',
        text: 'Qual o valor do ecocardiograma?'
      }
    }, null, 2),
    responseBody: JSON.stringify({ status: 'success', zap_id: 'zap-908123' }),
    success: true,
  },
];

export async function seedDatabase(force = false) {
  try {
    // Check if patients already seeded
    if (!force) {
      const scanRes = await docClient.send(new ScanCommand({ TableName: 'Patients', Limit: 1 }));
      if (scanRes.Items && scanRes.Items.length > 0) {
        console.log('[Dynalite Seed] Database already contains seed data. Skipping auto-seed.');
        return;
      }
    }

    console.log('[Dynalite Seed] Seeding database with initial mock data...');

    // Seed Patients
    for (const p of SEED_PATIENTS) {
      await docClient.send(new PutCommand({ TableName: "Patients", Item: p }));
    }

    // Seed Messages
    for (const msg of SEED_MESSAGES) {
      await docClient.send(new PutCommand({ TableName: "ChatMessages", Item: msg }));
    }

    // Seed Appointments
    for (const appt of SEED_APPOINTMENTS) {
      await docClient.send(new PutCommand({ TableName: "Appointments", Item: appt }));
    }

    // Seed Priority Rules
    for (const pr of SEED_PRIORITY_RULES) {
      await docClient.send(new PutCommand({ TableName: "PriorityRules", Item: pr }));
    }

    // Seed Automation Rules
    for (const ar of SEED_AUTOMATION_RULES) {
      await docClient.send(new PutCommand({ TableName: "AutomationRules", Item: ar }));
    }

    // Seed EHR Integrations
    for (const ehr of SEED_EHR_INTEGRATIONS) {
      await docClient.send(new PutCommand({ TableName: "EHRIntegrations", Item: ehr }));
    }

    // Seed Audit Logs
    for (const log of SEED_AUDIT_LOGS) {
      await docClient.send(new PutCommand({ TableName: "AuditLogs", Item: log }));
    }

    // Seed Role Permissions
    for (const perm of SEED_ROLE_PERMISSIONS) {
      await docClient.send(new PutCommand({ TableName: "RolePermissions", Item: perm }));
    }

    // Seed Webhooks
    for (const wh of SEED_WEBHOOKS) {
      await docClient.send(new PutCommand({ TableName: "Webhooks", Item: wh }));
    }

    // Seed Webhook Logs
    for (const whlog of SEED_WEBHOOK_LOGS) {
      await docClient.send(new PutCommand({ TableName: "WebhookLogs", Item: whlog }));
    }

    console.log('[Dynalite Seed] Seeding completed successfully!');
  } catch (err) {
    console.error('[Dynalite Seed] Error seeding database:', err);
  }
}
