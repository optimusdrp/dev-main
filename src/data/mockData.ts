import { Patient, ChatMessage, Appointment, PriorityRule, AutomationRule, AuditLog, EHRIntegration } from '../types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Ana Luíza Vasconcelos',
    phone: '(11) 98765-4321',
    insurance: 'Bradesco Saúde',
    specialty: 'Cardiologia',
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
      { id: 'c3', label: 'Registrar condição informada', completed: false }
    ],
    internalNotes: [
      'Paciente prefere atendimento no período da tarde (Mariana Costa - Hoje, 10:20)'
    ],
    tags: ['Urgent', 'Insurance Issue'],
    sentiment: 'anxious',
    ehrSynced: true,
    ehrSystem: 'iClinic',
    ehrRecordId: 'PEP-2025-0892',
    leadScore: {
      score: 82,
      tier: 'Ouro (Alta Conversão)',
      financialCategory: 'Particular (Rotina)',
      treatmentIntent: 'Consulta / Check-up Especializado',
      estimatedValueRange: 'R$ 680,00 - R$ 1.400,00',
      urgencyLevel: 'Alta (24-48h)',
      conversionProbability: 84,
      keyBuyingSignals: [
        'Disposta a complementar particular caso convênio não cubra',
        'Pediu valor de ecocardiograma com urgência',
        'Histórico de comparecimento pontual'
      ],
      smartRouting: {
        recommendedAttendant: 'Camila Santos (Top Closer Recepção)',
        conversionRate: 91,
        routingReason: 'Lead com propensão a coparticipação/particular imediata. Direcionado para atendimento humanizado ágil.',
        routingStatus: 'auto_routed',
        priorityQueue: true,
        assignedAt: 'Hoje, 10:06'
      },
      aiSummaryBriefing: 'Paciente com convênio Bradesco Topázio porém com alta disposição para exames particulares complementares. Converter na primeira resposta.',
      recommendedSalesPitch: 'Olá Ana! Temos vaga prioritária amanhã às 14h. Nosso ecocardiograma particular inclui laudo emitido em até 2 horas pela equipe do Dr. Roberto.',
      analyzedAt: '13/08/2026 10:06'
    }
  },
  {
    id: 'p2',
    name: 'Carlos Eduardo Mendes',
    phone: '(11) 97123-8844',
    insurance: 'Particular',
    specialty: 'Odontologia / Ortodontia',
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
      { id: 'c3', label: 'Confirmação financeira', completed: false }
    ],
    internalNotes: ['Interesse em facetas de porcelana e implante'],
    tags: ['Billing / Financial', 'Routine Request'],
    sentiment: 'satisfied',
    ehrSynced: true,
    ehrSystem: 'Feegow',
    ehrRecordId: 'PEP-2025-1102',
    leadScore: {
      score: 96,
      tier: 'VIP / Alto Valor',
      financialCategory: 'Particular (Alto Valor)',
      treatmentIntent: 'Procedimento Estético de Alto Valor',
      estimatedValueRange: 'R$ 8.500,00 - R$ 18.000,00',
      urgencyLevel: 'Alta (24-48h)',
      conversionProbability: 95,
      keyBuyingSignals: [
        'Interesse direto em Implantes e Facetas de Porcelana (Alto Ticket)',
        'Paciente 100% Particular sem restrição de convênio',
        'Perguntou diretamente por condições de parcelamento (Sinal Claro de Fechamento)',
        'Score máximo de engajamento no primeiro contato'
      ],
      smartRouting: {
        recommendedAttendant: 'Camila Santos (Top Closer / Concierge VIP)',
        conversionRate: 96,
        routingReason: 'LEAD VIP ALTO VALOR (Ticket > R$ 8.500). Roteamento inteligente ativado para o atendente com maior índice de fechamento estético.',
        routingStatus: 'auto_routed',
        priorityQueue: true,
        assignedAt: 'Hoje, 10:15'
      },
      aiSummaryBriefing: 'Lead de altíssimo valor para Implantes + Estética. Foco em apresentar o parcelamento em até 12x sem juros e agendar a avaliação presencial 3D.',
      recommendedSalesPitch: 'Olá Carlos! Parcelamos em até 12x sem juros no cartão ou via financiamento próprio. Podemos agendar sua avaliação com escaneamento 3D já nesta quinta-feira?',
      analyzedAt: '13/08/2026 10:15'
    }
  },
  {
    id: 'p3',
    name: 'Fernanda Lima Rocha',
    phone: '(11) 96543-2109',
    insurance: 'SulAmérica',
    specialty: 'Cirurgia Geral',
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
      { id: 'c3', label: 'Retorno para paciente', completed: false }
    ],
    internalNotes: ['Aguardando liberação de senha de autorização'],
    tags: ['Insurance Issue', 'Exam Results'],
    sentiment: 'frustrated',
    ehrSynced: true,
    ehrSystem: 'HiDoctor',
    ehrRecordId: 'PEP-2025-0441',
    leadScore: {
      score: 64,
      tier: 'Prata (Padrão)',
      financialCategory: 'Convênio Premium',
      treatmentIntent: 'Cirurgia / Procedimento Especializado',
      estimatedValueRange: 'R$ 2.400,00 (Guia TISS)',
      urgencyLevel: 'Moderada',
      conversionProbability: 68,
      keyBuyingSignals: [
        'Aguardando autorização da operadora SulAmérica',
        'Procedimento cirúrgico programado dependente de liberação de senha'
      ],
      smartRouting: {
        recommendedAttendant: 'Fernanda Lima (Especialista em Faturamento & TISS)',
        conversionRate: 85,
        routingReason: 'Lead de convênio com trava burocrática TISS. Direcionado para especialista em liberação de guias.',
        routingStatus: 'auto_routed',
        priorityQueue: false,
        assignedAt: 'Hoje, 09:30'
      },
      aiSummaryBriefing: 'Paciente ansiosa por senha de autorização de ressonância. Apresentar status da auditoria médica do convênio com empatia.',
      recommendedSalesPitch: 'Olá Fernanda! Estamos cobrando a auditoria da SulAmérica em regime prioritário e te atualizaremos até às 16h.',
      analyzedAt: '13/08/2026 09:30'
    }
  },
  {
    id: 'p4',
    name: 'João Victor',
    phone: '(11) 95544-3322',
    insurance: 'Bradesco Saúde',
    specialty: 'Odontologia / Ortodontia',
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
      { id: 'c2', label: 'Lembrete automático programado', completed: true }
    ],
    ehrSynced: true,
    ehrSystem: 'iClinic',
    ehrRecordId: 'PEP-2025-0990',
    leadScore: {
      score: 58,
      tier: 'Prata (Padrão)',
      financialCategory: 'Convênio Básico',
      treatmentIntent: 'Tratamento Continuado',
      estimatedValueRange: 'R$ 450,00 (Cobertura Plano)',
      urgencyLevel: 'Flexível',
      conversionProbability: 75,
      keyBuyingSignals: [
        'Consulta já agendada via autoatendimento da IA',
        'Uso contínuo de tratamento ortodôntico/canal'
      ],
      smartRouting: {
        recommendedAttendant: 'Mariana Costa (Recepção Geral)',
        conversionRate: 88,
        routingReason: 'Atendimento de rotina e confirmação de agenda padrão.',
        routingStatus: 'auto_routed',
        priorityQueue: false,
        assignedAt: 'Ontem, 16:40'
      },
      aiSummaryBriefing: 'Paciente frequente agendando continuidade de endodontia. Horário já confirmado.',
      recommendedSalesPitch: 'Olá João! Sua consulta está confirmada para quarta-feira às 15h. Qualquer dúvida estamos à disposição.',
      analyzedAt: '12/08/2026 16:40'
    }
  },
  {
    id: 'p5',
    name: 'Beatriz Alves',
    phone: '(11) 94433-2211',
    insurance: 'Unimed',
    specialty: 'Dermatologia',
    status: 'pendente',
    stage: 'triagem',
    urgency: 'media',
    lastMessage: 'Olá, gostaria de saber se atendem Unimed para ortodontia e estética facial.',
    lastMessageTime: '1h20',
    assignedTo: 'Camila',
    channel: 'WhatsApp',
    checklist: [
      { id: 'c1', label: 'Triagem inicial', completed: true }
    ],
    ehrSynced: false,
    leadScore: {
      score: 89,
      tier: 'Ouro (Alta Conversão)',
      financialCategory: 'Particular (Alto Valor)',
      treatmentIntent: 'Procedimento Estético de Alto Valor',
      estimatedValueRange: 'R$ 3.800,00 - R$ 7.200,00',
      urgencyLevel: 'Alta (24-48h)',
      conversionProbability: 88,
      keyBuyingSignals: [
        'Perguntou por procedimentos estéticos faciais (Harmonização / Botox)',
        'Unimed não cobre estética facial -> Alta propensão para fechamento Particular',
        'Primeiro contato com interesse explícito em avaliação'
      ],
      smartRouting: {
        recommendedAttendant: 'Camila Santos (Top Closer / Concierge VIP)',
        conversionRate: 94,
        routingReason: 'Lead com intenção de Estética Facial Particular (fora do convênio). Direcionada para o top atendente.',
        routingStatus: 'auto_routed',
        priorityQueue: true,
        assignedAt: 'Hoje, 11:20'
      },
      aiSummaryBriefing: 'Lead perguntou de Unimed para estética. Informar que estética facial é particular e oferecer condição especial de avaliação.',
      recommendedSalesPitch: 'Olá Beatriz! Atendemos Unimed para dermatologia clínica. Para a parte estética facial, trabalhamos com pacotes exclusivos com parcelamento facilitado.',
      analyzedAt: '13/08/2026 11:20'
    }
  },
  {
    id: 'p6',
    name: 'Marta Silva',
    phone: '(11) 93322-1100',
    insurance: 'Amil',
    specialty: 'Clínica Geral',
    status: 'atendimento',
    stage: 'documentos',
    urgency: 'baixa',
    lastMessage: 'Enviei a foto da carteirinha e o pedido do clínico.',
    lastMessageTime: '28min',
    assignedTo: 'Mariana',
    channel: 'Telegram',
    checklist: [
      { id: 'c1', label: 'Documentação recebida', completed: true }
    ],
    ehrSynced: true,
    ehrSystem: 'TOTVS',
    leadScore: {
      score: 42,
      tier: 'Bronze (Rotina/Dúvida)',
      financialCategory: 'Convênio Básico',
      treatmentIntent: 'Consulta Rotineira',
      estimatedValueRange: 'R$ 180,00 (TISS Amil)',
      urgencyLevel: 'Flexível',
      conversionProbability: 60,
      keyBuyingSignals: ['Envio de carteirinha do convênio Amil', 'Consulta de rotina simples'],
      smartRouting: {
        recommendedAttendant: 'Mariana Costa (Recepção Geral)',
        conversionRate: 82,
        routingReason: 'Fluxo operacional de convênio padrão.',
        routingStatus: 'auto_routed',
        priorityQueue: false,
        assignedAt: 'Hoje, 12:00'
      },
      aiSummaryBriefing: 'Envio de documentação simples para consulta básica de clínica geral.',
      recommendedSalesPitch: 'Olá Marta! Recebemos sua carteirinha Amil e validamos com sucesso. Enviaremos os horários disponíveis em instantes.',
      analyzedAt: '13/08/2026 12:00'
    }
  },
  {
    id: 'p7',
    name: 'Juliana Rocha',
    phone: '(11) 92211-0099',
    insurance: 'Particular',
    specialty: 'Odontologia Estética',
    status: 'agendado',
    stage: 'agendado',
    urgency: 'baixa',
    lastMessage: 'Confirmado para hoje às 09:00 para clareamento dental.',
    lastMessageTime: 'Hoje, 08:30',
    assignedTo: 'Camila',
    channel: 'WhatsApp',
    checklist: [
      { id: 'c1', label: 'Confirmado via IA', completed: true }
    ],
    ehrSynced: true,
    ehrSystem: 'iClinic',
    leadScore: {
      score: 93,
      tier: 'VIP / Alto Valor',
      financialCategory: 'Particular (Alto Valor)',
      treatmentIntent: 'Procedimento Estético de Alto Valor',
      estimatedValueRange: 'R$ 1.800,00 - R$ 4.200,00',
      urgencyLevel: 'Imediata / Hoje',
      conversionProbability: 98,
      keyBuyingSignals: [
        'Procedimento de Clareamento a Laser Particular',
        'Confirmação imediata e pontual',
        'Potencial para Upsell de facetas ou alinhadores invisíveis'
      ],
      smartRouting: {
        recommendedAttendant: 'Camila Santos (Top Closer / Concierge VIP)',
        conversionRate: 97,
        routingReason: 'Paciente VIP Particular já confirmada, alto potencial de expansão de tratamento estético.',
        routingStatus: 'auto_routed',
        priorityQueue: true,
        assignedAt: 'Hoje, 08:30'
      },
      aiSummaryBriefing: 'Paciente particular confirmada hoje para clareamento dental. Recepção VIP preparada.',
      recommendedSalesPitch: 'Olá Juliana! Já deixamos seu café especial e a sala do Dr. Roberto prontos para o seu clareamento!',
      analyzedAt: '13/08/2026 08:30'
    }
  }
];

export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  p1: [
    {
      id: 'm1',
      sender: 'patient',
      text: 'Olá! Vocês aceitam Bradesco Saúde para consulta de cardiologia e exames?',
      timestamp: '10:05'
    },
    {
      id: 'm2',
      sender: 'attendant',
      senderName: 'Camila Santos',
      text: 'Olá, Ana! Aceitamos sim. Para verificar sua cobertura, poderia enviar uma foto da carteirinha?',
      timestamp: '10:06'
    },
    {
      id: 'm3',
      sender: 'patient',
      text: 'Carteirinha anexada:',
      timestamp: '10:12',
      attachment: {
        type: 'card',
        title: 'Carteirinha identificada',
        subtitle: 'Plano Topázio Nacional • Elegibilidade confirmada com Bradesco TISS',
        verified: true
      }
    },
    {
      id: 'm4',
      sender: 'patient',
      text: 'Qual o valor do ecocardiograma caso o meu convênio não cubra totalmente?',
      timestamp: '10:32'
    },
    {
      id: 'm5',
      sender: 'ai',
      senderName: 'Sugestão da IA (MediFlux Copilot)',
      text: 'O valor particular do ecocardiograma é R$ 380,00. Também podemos verificar se há cobertura parcial ou possibilidade de reembolso pelo seu plano Bradesco Topázio.',
      timestamp: 'Agora'
    }
  ],
  p2: [
    {
      id: 'm2_1',
      sender: 'patient',
      text: 'Olá, boa tarde! Gostaria de informações sobre implantes dentários e facetas de porcelana.',
      timestamp: '10:10'
    },
    {
      id: 'm2_2',
      sender: 'ai',
      senderName: 'IA MediFlux (Qualificador)',
      text: 'Olá Carlos Eduardo! Seja muito bem-vindo à Clínica Santa Helena. Somos referência em implantes guiados e estética do sorriso. Você já possui alguma radiografia panorâmica ou prefere realizar a avaliação completa conosco?',
      timestamp: '10:11'
    },
    {
      id: 'm2_3',
      sender: 'patient',
      text: 'Não tenho radiografia recente, gostaria de fazer tudo particular aí na clínica mesmo.',
      timestamp: '10:14'
    },
    {
      id: 'm2_4',
      sender: 'patient',
      text: 'Vocês parcelam em quantas vezes sem juros para implante dentário?',
      timestamp: '10:15'
    },
    {
      id: 'm2_5',
      sender: 'system',
      senderName: '⚡ Roteador Inteligente de Leads por IA',
      text: '🔥 LEAD SCORE: 96/100 (VIP Alto Valor • Particular • Implantes/Facetas). Direcionado prioritariamente para Camila Santos (Top Closer Recepção - 96% de conversão).',
      timestamp: '10:15',
      isInternalComment: true
    }
  ],
  p5: [
    {
      id: 'm5_1',
      sender: 'patient',
      text: 'Olá, gostaria de saber se atendem Unimed para ortodontia e estética facial.',
      timestamp: '11:15'
    },
    {
      id: 'm5_2',
      sender: 'system',
      senderName: '⚡ Roteador Inteligente de Leads por IA',
      text: '⭐ LEAD SCORE: 89/100 (Ouro • Particular • Estética Facial). Direcionado para Camila Santos.',
      timestamp: '11:16',
      isInternalComment: true
    }
  ]
};

export const TODAY_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    time: '09:00',
    duration: '30 min',
    patientName: 'Juliana Rocha',
    procedure: 'Clareamento dental',
    status: 'Confirmado'
  },
  {
    id: 'a2',
    time: '10:30',
    duration: '60 min',
    patientName: 'Thiago Ferreira',
    procedure: 'Implante dentário',
    status: 'Confirmado'
  },
  {
    id: 'a3',
    time: '14:00',
    duration: '45 min',
    patientName: 'Mariana Costa',
    procedure: 'Avaliação ortodôntica',
    status: 'Confirmado'
  },
  {
    id: 'a4',
    time: '15:30',
    duration: '30 min',
    patientName: 'Carlos Eduardo',
    procedure: 'Clareamento dental',
    status: 'Pendente'
  },
  {
    id: 'a5',
    time: '17:00',
    duration: '30 min',
    patientName: 'Beatriz Oliveira',
    procedure: 'Facetas de porcelana',
    status: 'Confirmado'
  }
];

export const PRIORITY_RULES: PriorityRule[] = [
  { id: 'pr1', title: 'Pergunta do paciente', slaLimit: 'Prazo: 30 min', count: 5 },
  { id: 'pr2', title: 'Documento ou guia recebido', slaLimit: 'Prazo: 2 horas', count: 3 },
  { id: 'pr3', title: 'Horários enviados', slaLimit: 'Prazo: 24 horas', count: 4 },
  { id: 'pr4', title: 'Paciente vai pensar', slaLimit: 'Prazo: 48 horas', count: 4 }
];

export const AUTOMATION_RULES: AutomationRule[] = [
  { id: 'ar1', name: 'Confirmação de agendamento', trigger: 'Gatilho: 48h e 24h antes da consulta', successRate: '92% confirmados', status: 'Ativa' },
  { id: 'ar2', name: 'Follow-up de horários', trigger: 'Gatilho: 24h sem resposta do orçamento', successRate: '38% responderam', status: 'Ativa' },
  { id: 'ar3', name: 'Alerta de carteirinha', trigger: 'Gatilho: 2h aguardando documento', successRate: '17 lembretes hoje', status: 'Ativa' },
  { id: 'ar5', name: 'Alerta de Precisão da IA (Triagem < 95%)', trigger: 'Gatilho: Webhook se assertividade da IA cair do limite', successRate: '98.6% atual (SLA OK)', status: 'Ativa' },
  { id: 'ar4', name: 'Pesquisa pós-atendimento', trigger: 'Gatilho: 2h após a consulta', successRate: '64% responderam', status: 'Pausada' }
];

export const EHR_INTEGRATIONS: EHRIntegration[] = [
  { id: 'ehr1', name: 'iClinic (Afya)', logo: '🏥', status: 'Conectado', lastSync: 'Há 2 minutos', recordsCount: 1420, type: 'Prontuário Eletrônico' },
  { id: 'ehr2', name: 'Feegow Clinic', logo: '🩺', status: 'Conectado', lastSync: 'Há 5 minutos', recordsCount: 980, type: 'Gestão de Clínicas' },
  { id: 'ehr3', name: 'HiDoctor', logo: '💻', status: 'Conectado', lastSync: 'Há 12 minutos', recordsCount: 750, type: 'Prontuário Eletrônico' },
  { id: 'ehr4', name: 'TOTVS Saúde / SIMS', logo: '🛡️', status: 'Pendente', lastSync: 'Aguardando token TISS', recordsCount: 0, type: 'Faturamento TISS' }
];

export const AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: '13/08/2026 10:32:14',
    user: 'Dra. Juliana Martins',
    role: 'Médica Cardiologista / CRM 129481',
    action: 'Alteração de Posologia de Medicamento',
    category: 'medicamentos',
    patientName: 'Ana Luíza Vasconcelos',
    recordId: 'PEP-2025-0892',
    ipAddress: '177.89.201.05 (REDE_MEDICA_CLINICA)',
    encryptionMethod: 'AES-256 GCM (KMS)',
    status: 'Autorizado',
    details: 'Aumento da dosagem de anti-hipertensivo devido a pico pressórico registrado na consulta.',
    previousValue: 'Enalapril 10mg - 1 comprimido via oral de 12/12h',
    newValue: 'Enalapril 20mg - 1 comprimido via oral de 12/12h + Hidroclorotiazida 25mg/dia'
  },
  {
    id: 'log-102',
    timestamp: '13/08/2026 10:15:00',
    user: 'Dr. Roberto Andrade',
    role: 'Cirurgião Vascular / CRM 188220',
    action: 'Visualização & Download de Laudo de Exame',
    category: 'exames',
    patientName: 'Carlos Eduardo Mendes',
    recordId: 'PEP-2025-1102',
    ipAddress: '201.88.102.14 (VPN Hospital)',
    encryptionMethod: 'TLS 1.3 Tokenizado',
    status: 'Autorizado',
    details: 'Acesso completo ao laudo e imagens PACS de Angiotomografia de Membros Inferiores em formato PDF com laudo assinado.',
    previousValue: 'Status PACS: Não Visualizado',
    newValue: 'Status PACS: Visualizado e Anexado ao Prontuário por Dr. Roberto Andrade'
  },
  {
    id: 'log-103',
    timestamp: '13/08/2026 09:45:22',
    user: 'Dra. Juliana Martins',
    role: 'Médica Cardiologista / CRM 129481',
    action: 'Assinatura Digital de Receita e Atestado TISS',
    category: 'atestado',
    patientName: 'Juliana Rocha',
    recordId: 'PEP-2025-0990',
    ipAddress: '177.89.201.05',
    encryptionMethod: 'Certificado ICP-Brasil A3',
    status: 'Autorizado',
    details: 'Emissão de Receita de Controle Especial (Clonazepam 0.5mg) e Atestado Médico de 2 dias com validação ICP-Brasil.',
    previousValue: 'Sem receita emitida no dia',
    newValue: 'Receita Eletrônica com QR Code de validação gerado (#REC-88492)'
  },
  {
    id: 'log-104',
    timestamp: '13/08/2026 09:12:05',
    user: 'Mariana Costa',
    role: 'Atendimento Comercial',
    action: 'Exportação de Prontuário via PDF (DLP Verificado)',
    category: 'exportacao',
    patientName: 'Carlos Eduardo Mendes',
    recordId: 'PEP-2025-1102',
    ipAddress: '189.120.45.18',
    encryptionMethod: 'AES-256 E2E',
    status: 'Autorizado',
    details: 'Exportação de cópia de prontuário solicitada pelo próprio paciente com assinatura de consentimento LGPD.',
    previousValue: 'Solicitação de Cópia: Pendente',
    newValue: 'PDF de Prontuário Criptografado gerado e enviado via E-mail Seguro'
  },
  {
    id: 'log-105',
    timestamp: '13/08/2026 08:50:33',
    user: 'Camila Santos',
    role: 'Recepção / Atendimento',
    action: 'Visualização de Carteirinha & Elegibilidade TISS',
    category: 'prontuario',
    patientName: 'Ana Luíza Vasconcelos',
    recordId: 'PEP-2025-0892',
    ipAddress: '189.120.45.12',
    encryptionMethod: 'AES-256 E2E',
    status: 'Autorizado',
    details: 'Conferência de validade e número da carteirinha Bradesco Saúde Topázio via API TISS.',
    previousValue: 'Elegibilidade: Não Verificada',
    newValue: 'Elegibilidade: Confirmada (#TOKEN-891032)'
  },
  {
    id: 'log-106',
    timestamp: '12/08/2026 17:30:11',
    user: 'Dr. Roberto Andrade',
    role: 'Cirurgião Vascular / CRM 188220',
    action: 'Inclusão de Alergia Crítica na Anamnese',
    category: 'anamnese',
    patientName: 'Fernanda Lima Rocha',
    recordId: 'PEP-2025-0441',
    ipAddress: '177.89.201.12',
    encryptionMethod: 'KMS Tokenizado',
    status: 'Autorizado',
    details: 'Registro de choque anafilático prévio com contraste iodado e dipirona.',
    previousValue: 'Alergias: Nenhuma informada',
    newValue: 'Alergias Registradas: Contraste Iodado (Grave - Anafilaxia) e Dipirona (Urticária)'
  },
  {
    id: 'log-107',
    timestamp: '12/08/2026 16:10:44',
    user: 'MediFlux AI Agent',
    role: 'Agente IA Autônomo (Triagem)',
    action: 'Transcrição e Indexação de Exame de Sangue',
    category: 'exames',
    patientName: 'Beatriz Oliveira',
    recordId: 'PEP-2025-0321',
    ipAddress: 'Interno (VPC Secreta)',
    encryptionMethod: 'KMS Tokenizado',
    status: 'Autorizado',
    details: 'Processamento de OCR por IA de laudo de Hemograma e Glicemia em Jejum para inserção em gráficos de tendência do PEP.',
    previousValue: 'Exames Anteriores: 0 anexos',
    newValue: 'Anexo Indexado: Hemograma Completo (Glicemia: 92 mg/dL - Normal)'
  },
  {
    id: 'log-108',
    timestamp: '12/08/2026 14:22:18',
    user: 'Marcos Silva',
    role: 'Estagiário de Atendimento',
    action: 'Tentativa de Exportação em Massa de Prontuários',
    category: 'exportacao',
    patientName: 'Multi-Pacientes (58 registros)',
    recordId: 'LOTE-EXP-901',
    ipAddress: '189.120.45.99 (Conexão Externa)',
    encryptionMethod: 'DLP Intercepted',
    status: 'Bloqueado',
    details: 'O operador tentou baixar 58 prontuários contendo diagnósticos e CPFs em lote. A regra de segurança DLP bloqueou o arquivo automaticamente.',
    previousValue: 'Download Solicitado',
    newValue: 'Sessão Bloqueada e Notificação enviada ao DPO (Art. 46 LGPD)'
  }
];

export const DEFAULT_RESPONSE_TEMPLATES = [
  {
    id: 'tpl-1',
    title: 'Preparo para Exame de Sangue / Jejum',
    category: 'Preparo de Exames' as const,
    shortcut: '/jejum',
    targetRole: 'Todos' as const,
    createdByName: 'Dra. Juliana Martins',
    usageCount: 142,
    updatedAt: '12/08/2026',
    content: 'Olá, {nome_paciente}! Para a realização do seu exame de sangue agendado, é necessário manter jejum absoluto de 8 horas (apenas água é permitida). Por favor, traga documento oficial com foto e a carteirinha do convênio {convenio}. Ficamos à disposição!'
  },
  {
    id: 'tpl-2',
    title: 'Orientações Cuidados Pós-Operatório',
    category: 'Pós-Operatório' as const,
    shortcut: '/posop',
    targetRole: 'Médicos' as const,
    createdByName: 'Dr. Roberto Andrade',
    usageCount: 89,
    updatedAt: '10/08/2026',
    content: 'Olá, {nome_paciente}! Esperamos que esteja se recuperando bem. Lembre-se de manter a região operada limpa e seca, aplicar a pomada prescrita 2x ao dia e tomar a medicação nos horários exatos. Em caso de dor intensa, febre ou sangramento, avise-nos imediatamente neste canal.'
  },
  {
    id: 'tpl-3',
    title: 'Confirmação de Agendamento com Localização',
    category: 'Agendamento' as const,
    shortcut: '/agendar',
    targetRole: 'Recepção' as const,
    createdByName: 'Camila Santos (Recepção)',
    usageCount: 310,
    updatedAt: '11/08/2026',
    content: 'Olá, {nome_paciente}! Confirmamos sua consulta para {data_consulta} às {horario} com {medico_responsavel}. Nosso endereço: Av. Brigadeiro Faria Lima, 2200 - Cj. 81 (Unidade Jardins). Dispomos de estacionamento no local com manobrista.'
  },
  {
    id: 'tpl-4',
    title: 'Orientações sobre Guia TISS e Cobertura',
    category: 'Convênios & Guias' as const,
    shortcut: '/tiss',
    targetRole: 'Recepção' as const,
    createdByName: 'Mariana Costa',
    usageCount: 67,
    updatedAt: '09/08/2026',
    content: 'Olá, {nome_paciente}! Verificamos que o seu convênio {convenio} exige autorização prévia de guia TISS para este procedimento. Nossa equipe já encaminhou o pedido e acompanhamos a liberação. Assim que aprovado pelo convênio, entraremos em contato!'
  },
  {
    id: 'tpl-5',
    title: 'Solicitação de Retorno com Resultados de Exames',
    category: 'Orientação Médica' as const,
    shortcut: '/retorno',
    targetRole: 'Médicos' as const,
    createdByName: 'Dra. Juliana Martins',
    usageCount: 104,
    updatedAt: '13/08/2026',
    content: 'Olá, {nome_paciente}! Assim que você estiver com os laudos e imagens dos exames solicitados em mãos, favor nos enviar em formato PDF por aqui ou agendar o seu retorno em até 30 dias para avaliação do plano terapêutico.'
  },
  {
    id: 'tpl-6',
    title: 'Aviso de Atraso do Médico Plantonista',
    category: 'Informações Gerais' as const,
    shortcut: '/atraso',
    targetRole: 'Todos' as const,
    createdByName: 'Equipe de Recepção',
    usageCount: 45,
    updatedAt: '08/08/2026',
    content: 'Olá, {nome_paciente}! Informamos que o dr. responsável teve uma urgência cirúrgica imprevista e o atendimento sofrerá um pequeno atraso estimado em 20 minutos. Pedimos desculpas pelo transtorno e agradecemos a compreensão!'
  }
];

