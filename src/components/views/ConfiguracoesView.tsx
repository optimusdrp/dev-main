import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Clock, CheckSquare, Kanban, Link2, ArrowRight, ShieldCheck, RefreshCw, Key, Check, X, Plus, Save, Lock, Shield, Settings2, Bell, BellRing, AlertTriangle, Volume2, Smartphone, Mail, Send, ShieldAlert, SlidersHorizontal, Info, CheckCircle2, XCircle, Wifi, WifiOff, Webhook, Globe, Play, Trash2, Copy, Edit2, ExternalLink, Hand, Zap } from 'lucide-react';
import { EHR_INTEGRATIONS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { CRMTab, UserRole, WebhookConfig, WebhookEvent } from '../../types';
import { apiService } from '../../services/api';
import { QuickReplyManager } from '../QuickReplyManager';

export interface CriticalNotificationRule {
  id: string;
  eventName: string;
  category: string;
  description: string;
  enabled: boolean;
  soundAlert: boolean;
  popupAlert: boolean;
  whatsappGroupAlert: boolean;
  emailAlert: boolean;
  severity: 'critical' | 'high' | 'medium';
  rolesNotified: UserRole[];
}

export const ConfiguracoesView: React.FC = () => {
  const { user, rolePermissions, updateRolePermissions, resetPermissionsToDefault } = useAuth();
  const [integrations, setIntegrations] = useState(EHR_INTEGRATIONS);
  const [selectedEhr, setSelectedEhr] = useState<string | null>(null);
  const [activeModalCard, setActiveModalCard] = useState<string | null>(null);
  const [selectedRoleToEdit, setSelectedRoleToEdit] = useState<UserRole>('Recepção');
  const [webhookToken, setWebhookToken] = useState('mediflux_live_sec_token_993817');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Critical Patient Notifications State
  const [criticalRules, setCriticalRules] = useState<CriticalNotificationRule[]>(() => {
    const saved = localStorage.getItem('mediflux_critical_notification_rules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'cn_1',
        eventName: 'Triagem Crítica (Manchester Vermelho ou Laranja)',
        category: 'Atendimento de Emergência',
        description: 'Paciente relata dor no peito, febre pós-op, falta de ar ou sintomas graves avaliados pelo Agente de IA.',
        enabled: true,
        soundAlert: true,
        popupAlert: true,
        whatsappGroupAlert: true,
        emailAlert: false,
        severity: 'critical',
        rolesNotified: ['Profissional de Saúde', 'Recepção', 'Administrador'],
      },
      {
        id: 'cn_2',
        eventName: 'Estouro de Limite de SLA de Atendimento (> 15 min)',
        category: 'Qualidade & Tempo de Resposta',
        description: 'Paciente aguardando atendimento humano na fila com tempo de espera excedendo o SLA da clínica.',
        enabled: true,
        soundAlert: true,
        popupAlert: true,
        whatsappGroupAlert: false,
        emailAlert: true,
        severity: 'high',
        rolesNotified: ['Recepção', 'Administrador'],
      },
      {
        id: 'cn_3',
        eventName: 'Glosa / Rejeição de Guia de Convênio TISS',
        category: 'Faturamento TISS & Convênios',
        description: 'Incompatibilidade na elegibilidade do paciente ou negativa de autorização enviada pela operadora.',
        enabled: true,
        soundAlert: false,
        popupAlert: true,
        whatsappGroupAlert: true,
        emailAlert: true,
        severity: 'high',
        rolesNotified: ['Contador (financeiro)', 'Administrador'],
      },
      {
        id: 'cn_4',
        eventName: 'Cancelamento Urgente de Consulta (< 2h de antecedência)',
        category: 'Agenda & Escala Médica',
        description: 'Paciente cancela consulta médica no mesmo dia com menos de 2 horas de antecedência.',
        enabled: true,
        soundAlert: true,
        popupAlert: true,
        whatsappGroupAlert: false,
        emailAlert: false,
        severity: 'medium',
        rolesNotified: ['Recepção', 'Profissional de Saúde'],
      },
      {
        id: 'cn_5',
        eventName: 'Exame de Emergência / Laudo Alterado via PEP Sync',
        category: 'Prontuário & Laboratório',
        description: 'Integração com iClinic/Feegow importa laudo com marcação de alteração crítica ou valor de pânico.',
        enabled: true,
        soundAlert: true,
        popupAlert: true,
        whatsappGroupAlert: true,
        emailAlert: true,
        severity: 'critical',
        rolesNotified: ['Profissional de Saúde', 'Administrador'],
      },
      {
        id: 'cn_6',
        eventName: 'Mensagem de Queixa em Pós-Operatório',
        category: 'Jornada Pós-Atendimento',
        description: 'Paciente na etapa de pós-op relata dor intensa, sangramento ou dúvida farmacológica.',
        enabled: true,
        soundAlert: true,
        popupAlert: true,
        whatsappGroupAlert: true,
        emailAlert: false,
        severity: 'critical',
        rolesNotified: ['Profissional de Saúde', 'Recepção'],
      },
    ];
  });

  // Urgent Pendency WhatsApp & SMS External Alert Settings
  const [urgentAlertSettings, setUrgentAlertSettings] = useState(() => {
    const saved = localStorage.getItem('mediflux_urgent_pendency_alert_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      enabled: true,
      channel: 'both', // 'whatsapp', 'sms', 'both'
      doctorPhone: '+55 (11) 98765-4321',
      doctorName: 'Dr. Roberto Andrade',
      repeatIntervalMinutes: 10,
      notifyOnManchesterRedOrange: true,
      notifyOnAlteredExam: true,
      notifyOnPostOpComplication: true,
      notifyOnSlaBreach: true,
      apiProvider: 'WhatsApp Business API + Twilio SMS Gateway',
      apiStatus: 'Conectado (Online)',
      quietHoursActive: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '06:00',
      overrideQuietHoursForCritical: true, // Urgent pendencies bypass quiet hours
    };
  });
  const [showTestDispatchModal, setShowTestDispatchModal] = useState(false);

  const handleSaveUrgentAlertSettings = (newSettings?: typeof urgentAlertSettings) => {
    const toSave = newSettings || urgentAlertSettings;
    setUrgentAlertSettings(toSave);
    localStorage.setItem('mediflux_urgent_pendency_alert_settings', JSON.stringify(toSave));
    showToast('📱 Configurações de Notificações WhatsApp/SMS de Pendências Urgentes salvas!');
  };

  // Offline Draft Sync Policy State
  const [draftSyncPolicy, setDraftSyncPolicy] = useState<'realtime' | 'ondemand' | 'wifi_only'>(() => {
    const saved = localStorage.getItem('mediflux_draft_sync_policy');
    return (saved as any) || 'realtime';
  });

  const [autoSaveInterval, setAutoSaveInterval] = useState<number>(() => {
    const saved = localStorage.getItem('mediflux_draft_auto_save_interval');
    return saved ? Number(saved) : 3;
  });

  const [cacheRetentionDays, setCacheRetentionDays] = useState<number>(() => {
    const saved = localStorage.getItem('mediflux_offline_cache_retention_days');
    return saved ? Number(saved) : 14;
  });

  const [autoSyncOnWifi, setAutoSyncOnWifi] = useState<boolean>(() => {
    const saved = localStorage.getItem('mediflux_auto_sync_on_wifi');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const handleSaveDraftSyncPolicy = (newPolicy?: 'realtime' | 'ondemand' | 'wifi_only') => {
    const selectedPolicy = newPolicy || draftSyncPolicy;
    setDraftSyncPolicy(selectedPolicy);
    localStorage.setItem('mediflux_draft_sync_policy', selectedPolicy);
    localStorage.setItem('mediflux_draft_auto_save_interval', String(autoSaveInterval));
    localStorage.setItem('mediflux_offline_cache_retention_days', String(cacheRetentionDays));
    localStorage.setItem('mediflux_auto_sync_on_wifi', JSON.stringify(autoSyncOnWifi));

    const policyLabels = {
      realtime: 'Tempo Real (Sincronização Automática Instantânea)',
      ondemand: 'Sob Demanda (Sincronização Manual sob Comando)',
      wifi_only: 'Por Conexão Wi-Fi (Sincronização Restrita ao Wi-Fi)'
    };

    showToast(`⚡ Política de Sincronização de Rascunhos salva: ${policyLabels[selectedPolicy]}`);
  };

  const handleClearDraftsAndCache = () => {
    localStorage.removeItem('mediflux_message_drafts');
    localStorage.removeItem('mediflux_pending_queue');
    showToast('🧹 Rascunhos e fila de envio offline zerados com sucesso!');
  };

  const handleSimulateExternalDispatch = () => {
    setShowTestDispatchModal(true);
  };

  // Fetch EHR Integrations & Webhooks from API
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [isAddWebhookModalOpen, setIsAddWebhookModalOpen] = useState(false);
  const [newWhName, setNewWhName] = useState('');
  const [newWhUrl, setNewWhUrl] = useState('');
  const [newWhEvents, setNewWhEvents] = useState<WebhookEvent[]>(['patient.created', 'triage.completed']);

  const DEFAULT_WEBHOOKS: WebhookConfig[] = [
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

  useEffect(() => {
    async function loadData() {
      const [ehrData, whData] = await Promise.all([
        apiService.getEHRIntegrations(),
        apiService.getWebhooks(),
      ]);
      if (ehrData && ehrData.length > 0) {
        setIntegrations(ehrData);
      }
      if (whData && whData.length > 0) {
        setWebhooks(whData);
      } else {
        setWebhooks(DEFAULT_WEBHOOKS);
      }
    }
    loadData();
  }, []);

  const handleTestWebhookConnection = async (id: string, forceSuccess?: boolean) => {
    setTestingWebhookId(id);
    const target = webhooks.find(w => w.id === id);

    try {
      const res = await apiService.testWebhook(id);
      let updated: WebhookConfig;
      if (res && res.webhook) {
        updated = res.webhook;
      } else {
        const currSuccess = target?.lastTestSuccess;
        const isOk = forceSuccess !== undefined ? forceSuccess : (currSuccess === false ? true : false);
        updated = {
          ...target!,
          lastTestSuccess: isOk,
          lastTestStatusCode: isOk ? 200 : 504,
          lastTestDate: 'Agora mesmo',
          lastTestLatencyMs: isOk ? 48 : 3100,
          lastTriggered: 'Agora mesmo',
        };
      }

      if (forceSuccess !== undefined) {
        updated.lastTestSuccess = forceSuccess;
        updated.lastTestStatusCode = forceSuccess ? 200 : 504;
        updated.lastTestDate = 'Agora mesmo';
        updated.lastTestLatencyMs = forceSuccess ? 52 : 2850;
      }

      setWebhooks(prev => prev.map(w => w.id === id ? updated : w));

      if (updated.lastTestSuccess) {
        showToast(`🟢 Teste de Conexão com "${updated.name}" BEM-SUCEDIDO (HTTP 200 OK)!`);
      } else {
        showToast(`🔴 FALHA no Teste de Conexão com "${updated.name}" (HTTP ${updated.lastTestStatusCode || 504})!`);
      }
    } catch (err) {
      showToast('⚠️ Erro ao testar conexão do webhook.');
    } finally {
      setTestingWebhookId(null);
    }
  };

  const handleCreateNewWebhook = async () => {
    if (!newWhName || !newWhUrl) {
      showToast('⚠️ Informe o nome e a URL do endpoint.');
      return;
    }
    const created = await apiService.createWebhook({
      name: newWhName,
      url: newWhUrl,
      events: newWhEvents,
      status: 'Ativo',
      lastTestSuccess: true,
      lastTestStatusCode: 200,
      lastTestDate: 'Agora mesmo',
      lastTestLatencyMs: 42,
    });

    if (created) {
      setWebhooks(prev => [created, ...prev]);
    } else {
      const localWh: WebhookConfig = {
        id: `wh_${Date.now()}`,
        name: newWhName,
        url: newWhUrl,
        secret: `whsec_${Math.random().toString(36).substring(2, 10)}`,
        events: newWhEvents,
        status: 'Ativo',
        lastTestSuccess: true,
        lastTestStatusCode: 200,
        lastTestDate: 'Agora mesmo',
        lastTestLatencyMs: 42,
        failureCount: 0,
        createdAt: new Date().toLocaleDateString('pt-BR'),
      };
      setWebhooks(prev => [localWh, ...prev]);
    }

    setNewWhName('');
    setNewWhUrl('');
    setIsAddWebhookModalOpen(false);
    showToast('✅ Novo Webhook cadastrado com sucesso!');
  };

  const handleDeleteWebhookItem = async (id: string) => {
    await apiService.deleteWebhook(id);
    setWebhooks(prev => prev.filter(w => w.id !== id));
    showToast('🗑️ Webhook removido.');
  };

  const handleToggleWebhookItemStatus = async (id: string) => {
    const target = webhooks.find(w => w.id === id);
    if (!target) return;
    const nextStatus = target.status === 'Ativo' ? 'Inativo' : 'Ativo';
    await apiService.updateWebhook(id, { status: nextStatus });
    setWebhooks(prev => prev.map(w => w.id === id ? { ...w, status: nextStatus } : w));
    showToast(`Webhook alterado para ${nextStatus}.`);
  };

  // Settings State
  const [teamMembers, setTeamMembers] = useState([
    { id: 't1', name: 'Camila Santos', role: 'Recepção' as UserRole, email: 'recepcao@clinicasantahelena.com.br', active: true },
    { id: 't2', name: 'Marcos Vinícius', role: 'Contador (financeiro)' as UserRole, email: 'financeiro@clinicasantahelena.com.br', active: true },
    { id: 't3', name: 'Dr. Roberto Andrade', role: 'Profissional de Saúde' as UserRole, email: 'saude@clinicasantahelena.com.br', active: true },
    { id: 't4', name: 'Lucas Ferreira', role: 'Terceirizado' as UserRole, email: 'terceirizado@clinicasantahelena.com.br', active: true },
    { id: 't5', name: 'Dra. Helena Martins', role: 'Administrador' as UserRole, email: 'admin@clinicasantahelena.com.br', active: true },
  ]);

  const allTabs: { id: CRMTab; label: string; group: string }[] = [
    { id: 'visao-geral', label: 'Visão Geral Executiva', group: 'OPERAÇÃO' },
    { id: 'atendimentos', label: 'Central de Atendimentos', group: 'OPERAÇÃO' },
    { id: 'jornadas', label: 'Jornadas & Funis', group: 'OPERAÇÃO' },
    { id: 'pendencias', label: 'Central de Pendências', group: 'OPERAÇÃO' },
    { id: 'automacoes', label: 'Automações com Agente IA', group: 'GESTÃO' },
    { id: 'indicadores', label: 'Indicadores & Faturamento TISS', group: 'GESTÃO' },
    { id: 'configuracoes', label: 'Configurações & Permissões', group: 'GESTÃO' },
    { id: 'auditoria', label: 'Auditoria LGPD & Criptografia', group: 'GESTÃO' },
  ];

  const [slaRules, setSlaRules] = useState([
    { id: 's1', name: 'Dúvidas e Urgências', time: '15 minutos' },
    { id: 's2', name: 'Orçamentos Particulares', time: '30 minutos' },
    { id: 's3', name: 'Confirmação de Agendamento', time: '1 hora' }
  ]);

  const cards = [
    {
      id: 'respostas_rapidas',
      title: 'Repositório de Respostas Rápidas (Quick Replies)',
      desc: 'Crie e gerencie modelos com variáveis customizadas ({{patient_name}}, {{doctor_name}}) acionáveis por / no chat.',
      icon: Zap,
      highlight: true
    },
    {
      id: 'sincronizacao_offline',
      title: 'Política de Rascunhos & Offline',
      desc: 'Sincronização em tempo real, sob demanda ou por Wi-Fi para mensagens e rascunhos.',
      icon: Wifi,
      highlight: false
    },
    {
      id: 'equipe',
      title: 'Equipe e permissões',
      desc: 'Perfis de recepção, comercial, financeiro, profissionais e gestores.',
      icon: Users
    },
    {
      id: 'alertas_externos',
      title: 'Alertas WhatsApp & SMS (Pendências Urgentes)',
      desc: 'Notificações em tempo real via WhatsApp e SMS para alertar médicos fora da plataforma sobre pendências urgentes.',
      icon: Smartphone,
      highlight: true
    },
    {
      id: 'notificacoes',
      title: 'Notificações Críticas Globais',
      desc: 'Eventos de pacientes que disparam alertas sonoros, pop-ups e grupos de emergência.',
      icon: BellRing,
      highlight: false
    },
    {
      id: 'canais',
      title: 'Canais de atendimento',
      desc: 'WhatsApp, Telegram, Instagram e outros canais centralizados.',
      icon: MessageSquare
    },
    {
      id: 'sla',
      title: 'Regras de SLA',
      desc: 'Prazos diferentes conforme demanda, responsável e etapa.',
      icon: Clock
    },
    {
      id: 'campos',
      title: 'Campos obrigatórios',
      desc: 'Checklists e registros que bloqueiam a conclusão de etapas.',
      icon: CheckSquare
    },
    {
      id: 'jornadas',
      title: 'Jornadas e funis',
      desc: 'Fluxos próprios para particular, convênio, comercial e pós-atendimento.',
      icon: Kanban
    },
    {
      id: 'integracoes',
      title: 'Integrações (Prontuários & TISS)',
      desc: 'Agenda, prontuário (iClinic, Feegow, HiDoctor), financeiro e TISS/TUSS.',
      icon: Link2
    }
  ];

  const playTestAlertSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
      showToast('🔊 Som de Alerta Crítico executado!');
    } catch (e) {
      showToast('🔊 Som de Alerta Crítico simulação executada!');
    }
  };

  const handleSaveNotificationRules = () => {
    localStorage.setItem('mediflux_critical_notification_rules', JSON.stringify(criticalRules));
    showToast('⚡ Regras de Notificações Críticas salvas com sucesso!');
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(webhookToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-[#f8f9fc] min-h-screen relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-purple-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-purple-700 flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
          Configurações
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Terça-feira, 5 de agosto
        </p>
      </div>

      {/* Subheader */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
        <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">
          PERSONALIZAÇÃO
        </span>
        <h2 className="text-base font-bold text-slate-900">
          Configurações da operação
        </h2>
        <p className="text-xs text-slate-500">
          Defina usuários, canais, SLAs, campos obrigatórios e integrações por unidade.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              onClick={() => {
                if (c.id === 'integracoes') {
                  setSelectedEhr('ehr1');
                } else {
                  setActiveModalCard(c.id);
                }
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                c.highlight
                  ? 'bg-purple-900 text-white border-purple-800 shadow-md hover:bg-purple-950'
                  : 'bg-white hover:bg-purple-50/40 border-slate-200/80 shadow-2xs'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                    c.highlight
                      ? 'bg-purple-800 text-white'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3
                    className={`text-sm font-bold ${
                      c.highlight ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {c.title}
                  </h3>
                  <p
                    className={`text-xs mt-0.5 ${
                      c.highlight ? 'text-purple-200' : 'text-slate-500'
                    }`}
                  >
                    {c.desc}
                  </p>
                </div>
              </div>
              <ArrowRight
                className={`w-5 h-5 shrink-0 transition-transform group-hover:translate-x-1 ${
                  c.highlight ? 'text-purple-300' : 'text-slate-400'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Quick Reply Manager Modal Popup */}
      {activeModalCard === 'respostas_rapidas' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <QuickReplyManager
            onClose={() => setActiveModalCard(null)}
            showToast={showToast}
            isModal={true}
          />
        </div>
      )}

      {/* Settings Modal Popups */}
      {activeModalCard && activeModalCard !== 'respostas_rapidas' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 capitalize">
                {cards.find((c) => c.id === activeModalCard)?.title}
              </h3>
              <button
                onClick={() => setActiveModalCard(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body depending on card */}
            {activeModalCard === 'equipe' && (
              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                {/* Active User Notice */}
                <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-purple-950 block">Sessão Atual de Configuração:</span>
                    <span className="text-[11px] text-purple-800">{user?.name} ({user?.role})</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    Acesso Admin Total
                  </span>
                </div>

                {/* Section 1: Team Members List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    1. USUÁRIOS & PERFIS CADASTRADOS:
                  </span>
                  <div className="space-y-1.5">
                    {teamMembers.map((m) => (
                      <div key={m.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{m.name}</p>
                          <p className="text-[10px] text-purple-700 font-semibold">{m.role} • {m.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setTeamMembers(teamMembers.map(item => item.id === m.id ? { ...item, active: !item.active } : item));
                            showToast(`Status de ${m.name} alterado`);
                          }}
                          className={`px-2 py-0.5 rounded-lg font-bold text-[10px] cursor-pointer ${m.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}
                        >
                          {m.active ? 'Ativo' : 'Inativo'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: RBAC Matrix / Next-Auth Permissions */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wider block">
                      2. MATRIZ DE PERMISSÕES DE ACESSO (RBAC / NEXT-AUTH):
                    </span>
                    <button
                      onClick={() => {
                        resetPermissionsToDefault();
                        showToast('Permissões restauradas para o padrão!');
                      }}
                      className="text-[10px] text-purple-700 hover:underline font-bold"
                    >
                      Resetar Padrão
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Selecione o perfil da equipe para definir quais páginas e funcionalidades estarão liberadas:
                  </p>

                  {/* Profile Selector */}
                  <div className="flex flex-wrap gap-1">
                    {(['Administrador', 'Recepção', 'Contador (financeiro)', 'Terceirizado', 'Profissional de Saúde'] as UserRole[]).map((roleName) => (
                      <button
                        key={roleName}
                        onClick={() => setSelectedRoleToEdit(roleName)}
                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          selectedRoleToEdit === roleName
                            ? 'bg-purple-800 text-white border-purple-800 shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                      >
                        {roleName}
                      </button>
                    ))}
                  </div>

                  {/* Checkboxes for allowed tabs for selectedRoleToEdit */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 mt-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-xs font-bold text-slate-900">
                        Módulos Liberados para <span className="text-purple-800 underline">{selectedRoleToEdit}</span>:
                      </span>
                      <span className="text-[10px] font-bold text-purple-700">
                        {(rolePermissions[selectedRoleToEdit] || []).length} de 8 liberados
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                      {allTabs.map((tabInfo) => {
                        const currentAllowed = rolePermissions[selectedRoleToEdit] || [];
                        const isChecked = currentAllowed.includes(tabInfo.id);

                        return (
                          <label
                            key={tabInfo.id}
                            className={`p-2 rounded-xl border flex items-center space-x-2 transition-colors cursor-pointer select-none ${
                              isChecked
                                ? 'bg-purple-100/70 border-purple-300 text-purple-950 font-semibold'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={selectedRoleToEdit === 'Administrador'} // Admin always has full access
                              onChange={(e) => {
                                const checked = e.target.checked;
                                let updated: CRMTab[];
                                if (checked) {
                                  updated = [...currentAllowed, tabInfo.id];
                                } else {
                                  updated = currentAllowed.filter((t) => t !== tabInfo.id);
                                }
                                updateRolePermissions(selectedRoleToEdit, updated);
                                showToast(`Permissões do perfil ${selectedRoleToEdit} atualizadas!`);
                              }}
                              className="rounded text-purple-700 focus:ring-purple-500"
                            />
                            <span className="text-[11px] truncate">{tabInfo.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveModalCard(null);
                    showToast('Configurações de equipe e permissões salvas com sucesso!');
                  }}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Regras de Permissão</span>
                </button>
              </div>
            )}

            {activeModalCard === 'notificacoes' && (
              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-purple-950 space-y-1">
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>Configuração de Disparos em Tempo Real:</span>
                    <button
                      onClick={playTestAlertSound}
                      className="text-[10px] bg-purple-800 text-white px-2 py-0.5 rounded-lg flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      Testar Som
                    </button>
                  </div>
                  <p className="text-[11px] text-purple-800">
                    Defina quais eventos críticos acionam sinal sonoro e pop-ups instantâneos para os usuários logados no sistema.
                  </p>
                </div>

                <div className="space-y-2">
                  {criticalRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">{rule.eventName}</span>
                        <button
                          onClick={() => {
                            const updated = criticalRules.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r);
                            setCriticalRules(updated);
                          }}
                          className={`px-2 py-0.5 rounded-lg font-bold text-[10px] ${
                            rule.enabled ? 'bg-purple-800 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {rule.enabled ? 'Ativo' : 'Desativado'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-slate-500">{rule.category}</span>
                        <span>•</span>
                        <span className="font-bold text-purple-800">
                          Canais: {[rule.soundAlert && 'Som', rule.popupAlert && 'Pop-up', rule.whatsappGroupAlert && 'WhatsApp', rule.emailAlert && 'E-mail'].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    handleSaveNotificationRules();
                    setActiveModalCard(null);
                  }}
                  className="w-full bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Regras Globais</span>
                </button>
              </div>
            )}

            {activeModalCard === 'alertas_externos' && (
              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-1">
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-700" />
                      Integração WhatsApp & SMS (Plantão Médico)
                    </span>
                    <span className="bg-emerald-200 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      {urgentAlertSettings.apiStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-snug">
                    Garante que o médico responsável receba disparos imediatos em seu smartphone pessoal quando uma pendência for classificada como 'Urgente' (ex: Manchester Vermelho, Complicação Pós-Op ou Laudo Crítico).
                  </p>
                </div>

                <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">Notificações Externas Ativas</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...urgentAlertSettings, enabled: !urgentAlertSettings.enabled };
                        setUrgentAlertSettings(updated);
                      }}
                      className={`px-3 py-1 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                        urgentAlertSettings.enabled ? 'bg-emerald-700 text-white' : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {urgentAlertSettings.enabled ? 'Ativo' : 'Desativado'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Canal Preferencial de Envio Externa
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'whatsapp', label: '🟢 WhatsApp', desc: 'Mensagem com botão de ação' },
                        { id: 'sms', label: '💬 SMS Direto', desc: 'Sem dependência de internet' },
                        { id: 'both', label: '⚡ Ambos', desc: 'WhatsApp + SMS Redundante' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            const updated = { ...urgentAlertSettings, channel: opt.id };
                            setUrgentAlertSettings(updated);
                          }}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            urgentAlertSettings.channel === opt.id
                              ? 'bg-purple-800 text-white border-purple-800 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="block text-xs">{opt.label}</span>
                          <span className={`block text-[9px] ${urgentAlertSettings.channel === opt.id ? 'text-purple-200' : 'text-slate-400'}`}>
                            {opt.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Médico em Sobreaviso / Plantonista
                      </label>
                      <input
                        type="text"
                        value={urgentAlertSettings.doctorName}
                        onChange={(e) => setUrgentAlertSettings({ ...urgentAlertSettings, doctorName: e.target.value })}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Celular / WhatsApp do Médico
                      </label>
                      <input
                        type="text"
                        value={urgentAlertSettings.doctorPhone}
                        onChange={(e) => setUrgentAlertSettings({ ...urgentAlertSettings, doctorPhone: e.target.value })}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Intervalo de Reenvio de Alerta
                    </label>
                    <select
                      value={urgentAlertSettings.repeatIntervalMinutes}
                      onChange={(e) => setUrgentAlertSettings({ ...urgentAlertSettings, repeatIntervalMinutes: Number(e.target.value) })}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value={5}>Reenviar a cada 5 minutos (Urgência Máxima)</option>
                      <option value={10}>Reenviar a cada 10 minutos (Recomendado)</option>
                      <option value={15}>Reenviar a cada 15 minutos</option>
                      <option value={30}>Reenviar a cada 30 minutos</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                      Gatilhos de Pendências Urgentes:
                    </span>
                    {[
                      { key: 'notifyOnManchesterRedOrange', label: '🚨 Triagem Manchester Vermelha / Laranja (Emergência)' },
                      { key: 'notifyOnAlteredExam', label: '🔬 Exame com Valor de Pânico no PEP' },
                      { key: 'notifyOnPostOpComplication', label: '🩸 Complicação / Queixa em Pós-Operatório' },
                      { key: 'notifyOnSlaBreach', label: '⏱️ Estouro de SLA de Atendimento Humano (> 15 min)' }
                    ].map((trig) => (
                      <label key={trig.key} className="flex items-center space-x-2 p-1.5 bg-white rounded-lg border border-slate-200 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(urgentAlertSettings as any)[trig.key]}
                          onChange={(e) => setUrgentAlertSettings({ ...urgentAlertSettings, [trig.key]: e.target.checked })}
                          className="rounded text-purple-700 focus:ring-purple-500"
                        />
                        <span className="font-semibold text-slate-800">{trig.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSimulateExternalDispatch}
                    className="px-3.5 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-purple-700" />
                    <span>Simular Alerta no Celular</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSaveUrgentAlertSettings();
                      setActiveModalCard(null);
                    }}
                    className="px-5 py-2 bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Configuração</span>
                  </button>
                </div>
              </div>
            )}

            {activeModalCard === 'sincronizacao_offline' && (
              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-amber-950 text-xs space-y-1">
                  <span className="font-extrabold block text-amber-900">⚡ Política de Rascunhos e Modo Offline</span>
                  <p className="text-[11px] text-amber-800">
                    Defina como o MediFlux deve tratar rascunhos de mensagens e a fila de envio quando a conexão de internet for instável ou reestabelecida.
                  </p>
                </div>

                {/* Option Selector */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Modo de Sincronização de Rascunhos:
                  </span>

                  {[
                    {
                      id: 'realtime',
                      label: '⚡ Tempo Real (Automática Instantânea)',
                      desc: 'Sincroniza automaticamente todos os rascunhos e mensagens offline no exato momento em que a internet reconectar.',
                      badge: 'Recomendado'
                    },
                    {
                      id: 'ondemand',
                      label: '🖐️ Sob Demanda (Sincronização Manual)',
                      desc: 'Mantém mensagens na fila local até que você clique manualmente em "Sincronizar Agora" na tela de Atendimentos.',
                      badge: 'Controle Manual'
                    },
                    {
                      id: 'wifi_only',
                      label: '📶 Por Conexão Wi-Fi (Economia de Dados)',
                      desc: 'Aguarda conexão Wi-Fi ativa para sincronizar, evitando consumo acidental do plano de dados móveis (4G/5G).',
                      badge: 'Economia de Dados'
                    }
                  ].map((option) => (
                    <div
                      key={option.id}
                      onClick={() => handleSaveDraftSyncPolicy(option.id as any)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                        draftSyncPolicy === option.id
                          ? 'bg-purple-900 text-white border-purple-700 shadow-md'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs flex items-center gap-1.5">
                          {option.label}
                        </span>
                        {draftSyncPolicy === option.id ? (
                          <span className="bg-amber-400 text-amber-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                            {option.badge} (Ativo)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">
                            Clique para ativar
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] leading-relaxed ${draftSyncPolicy === option.id ? 'text-purple-200' : 'text-slate-500'}`}>
                        {option.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Additional Settings */}
                <div className="space-y-3 pt-3 border-t border-slate-200 text-xs">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Parâmetros Locais de Cache:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Intervalo de Auto-Salvamento
                      </label>
                      <select
                        value={autoSaveInterval}
                        onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                      >
                        <option value={1}>A cada 1 segundo (Instantâneo)</option>
                        <option value={3}>A cada 3 segundos (Padrão)</option>
                        <option value={5}>A cada 5 segundos</option>
                        <option value={10}>A cada 10 segundos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Retenção de Cache Offline
                      </label>
                      <select
                        value={cacheRetentionDays}
                        onChange={(e) => setCacheRetentionDays(Number(e.target.value))}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                      >
                        <option value={7}>7 dias de mensagens mantidas</option>
                        <option value={14}>14 dias de mensagens (Padrão)</option>
                        <option value={30}>30 dias de mensagens</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Limpeza de Rascunhos Locais</span>
                      <span className="text-[10px] text-slate-500">Apaga rascunhos em progresso e zera a fila de envio pendente do navegador</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearDraftsAndCache}
                      className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Limpar Fila
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveDraftSyncPolicy();
                      setActiveModalCard(null);
                    }}
                    className="w-full py-2.5 bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Política de Sincronização</span>
                  </button>
                </div>
              </div>
            )}

            {activeModalCard === 'sla' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Configure os prazos máximos de resposta para cada tipo de atendimento.
                </p>
                <div className="space-y-2">
                  {slaRules.map((rule, idx) => (
                    <div key={rule.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{rule.name}</span>
                      <input
                        type="text"
                        value={rule.time}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSlaRules(slaRules.map(s => s.id === rule.id ? { ...s, time: val } : s));
                        }}
                        className="w-28 text-right bg-white border border-slate-200 px-2 py-1 rounded-lg text-xs font-mono font-bold text-purple-900"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setActiveModalCard(null);
                    showToast('Regras de SLA salvas com sucesso');
                  }}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações de SLA</span>
                </button>
              </div>
            )}

            {activeModalCard !== 'equipe' && activeModalCard !== 'sla' && activeModalCard !== 'notificacoes' && activeModalCard !== 'alertas_externos' && (
              <div className="space-y-4 text-xs text-slate-600">
                <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-100 text-purple-950 space-y-2">
                  <p className="font-bold">Configurações Avançadas da Unidade Jardins</p>
                  <p className="text-[11px] text-purple-800">
                    Sua conta possui permissão de Administrador Geral. Todas as alterações serão auditadas no Log de Conformidade LGPD.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">Parâmetro Padrão</label>
                  <input
                    type="text"
                    defaultValue="Configuração Ativa e Sincronizada"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>
                <button
                  onClick={() => {
                    setActiveModalCard(null);
                    showToast('Configurações atualizadas');
                  }}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Configuração</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBSECTION: REPOSITORIO DE RESPOSTAS RAPIDAS (QUICK REPLIES) */}
      <div id="secao-respostas-rapidas" className="space-y-4">
        <QuickReplyManager showToast={showToast} isModal={false} />
      </div>

      {/* SUBSECTION: POLITICA DE SINCRONIZACAO DE RASCUNHOS OFFLINE */}
      <div id="secao-politica-rascunhos-offline" className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Wifi className="w-3 h-3 text-purple-700" />
                Persistência & Conectividade
              </span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                {draftSyncPolicy === 'realtime' ? '⚡ Tempo Real' : draftSyncPolicy === 'ondemand' ? '🖐️ Sob Demanda' : '📶 Wi-Fi Apenas'}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-700" />
              Política de Sincronização de Rascunhos Offline
            </h3>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Defina o comportamento do sistema para envio e sincronização de mensagens rascunhadas ou enviadas em áreas de instabilidade de internet.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleSaveDraftSyncPolicy()}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Política</span>
          </button>
        </div>

        {/* 3 Main Mode Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: 'realtime',
              label: 'Sincronização em Tempo Real',
              badge: 'Automática Instantânea',
              desc: 'Envia mensagens da fila local e sincroniza rascunhos imediatamente assim que a rede reconecta.',
              icon: RefreshCw,
              color: 'emerald'
            },
            {
              id: 'ondemand',
              label: 'Sob Demanda (Manual)',
              badge: 'Aguardar Comando',
              desc: 'Acumula rascunhos e envios pendentes até o clique explícito no botão "Sincronizar Agora".',
              icon: Hand,
              color: 'amber'
            },
            {
              id: 'wifi_only',
              label: 'Por Conexão Wi-Fi',
              badge: 'Economia de Dados',
              desc: 'Sincroniza apenas sob conexão Wi-Fi ativa, pausando envios em redes móveis (4G/5G).',
              icon: Wifi,
              color: 'purple'
            }
          ].map((mode) => {
            const isSelected = draftSyncPolicy === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => handleSaveDraftSyncPolicy(mode.id as any)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                  isSelected
                    ? 'bg-purple-900 text-white border-purple-800 shadow-md ring-2 ring-purple-600/50'
                    : 'bg-slate-50 hover:bg-slate-100/80 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {mode.badge}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  )}
                </div>

                <h4 className={`text-sm font-extrabold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {mode.label}
                </h4>

                <p className={`text-xs leading-relaxed ${isSelected ? 'text-purple-200' : 'text-slate-500'}`}>
                  {mode.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Secondary Parameters Bar */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Intervalo de Auto-Salvamento do Rascunho</label>
            <select
              value={autoSaveInterval}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAutoSaveInterval(val);
                localStorage.setItem('mediflux_draft_auto_save_interval', String(val));
                showToast(`Intervalo de auto-salvamento alterado para ${val}s`);
              }}
              className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none"
            >
              <option value={1}>1 segundo (Instantâneo)</option>
              <option value={3}>3 segundos (Padrão Recomendado)</option>
              <option value={5}>5 segundos</option>
              <option value={10}>10 segundos</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Retenção de Histórico Offline</label>
            <select
              value={cacheRetentionDays}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCacheRetentionDays(val);
                localStorage.setItem('mediflux_offline_cache_retention_days', String(val));
                showToast(`Retenção de cache alterada para ${val} dias`);
              }}
              className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none"
            >
              <option value={7}>7 dias de retenção</option>
              <option value={14}>14 dias de retenção (Padrão)</option>
              <option value={30}>30 dias de retenção</option>
            </select>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div>
              <span className="font-bold text-slate-900 block">Fila e Cache do Navegador</span>
              <span className="text-[10px] text-slate-500">Limpa rascunhos mantidos no `localStorage`</span>
            </div>
            <button
              type="button"
              onClick={handleClearDraftsAndCache}
              className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Limpar Rascunhos
            </button>
          </div>
        </div>
      </div>

      {/* SUBSECTION: INTEGRACAO NOTIFICACOES WHATSAPP & SMS PARA PENDENCIAS URGENTES */}
      <div id="secao-alertas-whatsapp-sms" className="bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white p-5 lg:p-6 rounded-3xl border border-purple-800 shadow-xl space-y-5 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-slate-950" />
                Alerta Médico Fora da Plataforma
              </span>
              <span className="text-[10px] font-bold bg-purple-800/80 text-purple-200 border border-purple-700 px-2 py-0.5 rounded-full">
                {urgentAlertSettings.enabled ? '🟢 Notificações Ativas' : '🔴 Inativo'}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-400" />
              Notificações de Pendências Urgentes via WhatsApp & SMS
            </h3>
            <p className="text-xs text-purple-200 max-w-2xl leading-relaxed">
              Garante o alerta imediato ao médico responsável em seu celular pessoal quando ocorrerem pendências marcadas como 'Urgentes' na clínica, permitindo ação rápida mesmo sem estar logado no sistema.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSimulateExternalDispatch}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Smartphone className="w-4 h-4" />
              <span>Simular Alerta no Celular</span>
            </button>

            <button
              onClick={() => handleSaveUrgentAlertSettings()}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md border border-purple-500"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Configuração</span>
            </button>
          </div>
        </div>

        {/* Configuration Panel Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Box 1: Channel & Status */}
          <div className="bg-purple-900/60 p-4 rounded-2xl border border-purple-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-purple-300">
                1. CANAL DE ENVIO EXTERNA
              </span>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                {urgentAlertSettings.apiStatus}
              </span>
            </div>

            <div className="space-y-1.5">
              {[
                { id: 'whatsapp', label: '🟢 WhatsApp Business API', desc: 'Mensagem formatada com botões interativos' },
                { id: 'sms', label: '💬 SMS Direto de Emergência', desc: 'Garantia de entrega sem internet' },
                { id: 'both', label: '⚡ Ambos (Redundância Máxima)', desc: 'Envio simultâneo via WhatsApp + SMS' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    const updated = { ...urgentAlertSettings, channel: opt.id };
                    setUrgentAlertSettings(updated);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                    urgentAlertSettings.channel === opt.id
                      ? 'bg-purple-800 border-amber-400 text-white font-bold shadow-sm'
                      : 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{opt.label}</span>
                    {urgentAlertSettings.channel === opt.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-purple-300 block font-normal">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Box 2: Doctor Contact & Intervals */}
          <div className="bg-purple-900/60 p-4 rounded-2xl border border-purple-800/90 space-y-3">
            <span className="text-xs font-black uppercase text-purple-300 block">
              2. MÉDICO PLANTONISTA & INTERVALOS
            </span>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  Nome do Médico Responsável
                </label>
                <input
                  type="text"
                  value={urgentAlertSettings.doctorName}
                  onChange={(e) => setUrgentAlertSettings({ ...urgentAlertSettings, doctorName: e.target.value })}
                  className="w-full text-xs p-2 bg-purple-950/80 border border-purple-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  Número de Celular com DDD (+55)
                </label>
                <input
                  type="text"
                  value={urgentAlertSettings.doctorPhone}
                  onChange={(e) => setUrgentAlertSettings({ ...urgentAlertSettings, doctorPhone: e.target.value })}
                  className="w-full text-xs p-2 bg-purple-950/80 border border-purple-700 text-amber-300 font-mono rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  Reenviar Alerta se a Pendência não for resolvida
                </label>
                <select
                  value={urgentAlertSettings.repeatIntervalMinutes}
                  onChange={(e) => setUrgentAlertSettings({ ...urgentAlertSettings, repeatIntervalMinutes: Number(e.target.value) })}
                  className="w-full text-xs p-2 bg-purple-950/80 border border-purple-700 text-white rounded-xl focus:outline-none"
                >
                  <option value={5}>A cada 5 minutos (Urgência Máxima)</option>
                  <option value={10}>A cada 10 minutos (Recomendado)</option>
                  <option value={15}>A cada 15 minutos</option>
                  <option value={30}>A cada 30 minutos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Box 3: Trigger Rules for Urgent Pendencies */}
          <div className="bg-purple-900/60 p-4 rounded-2xl border border-purple-800/90 space-y-3">
            <span className="text-xs font-black uppercase text-purple-300 block">
              3. REGULAGEM DE PENDÊNCIAS URGENTES
            </span>

            <div className="space-y-1.5">
              {[
                { key: 'notifyOnManchesterRedOrange', label: '🚨 Triagem Manchester Vermelha / Laranja' },
                { key: 'notifyOnAlteredExam', label: '🔬 Exame / Laudo com Valor de Pânico no PEP' },
                { key: 'notifyOnPostOpComplication', label: '🩸 Queixa Grave de Pós-Operatório' },
                { key: 'notifyOnSlaBreach', label: '⏱️ Estouro de SLA de Atendimento Humano (> 15 min)' }
              ].map((trig) => (
                <label key={trig.key} className="flex items-center space-x-2.5 p-2 bg-purple-950/60 rounded-xl border border-purple-800/80 text-xs cursor-pointer hover:bg-purple-950">
                  <input
                    type="checkbox"
                    checked={(urgentAlertSettings as any)[trig.key]}
                    onChange={(e) => setUrgentAlertSettings({ ...urgentAlertSettings, [trig.key]: e.target.checked })}
                    className="rounded text-amber-400 focus:ring-amber-400 bg-purple-900 border-purple-700"
                  />
                  <span className="font-semibold text-purple-100">{trig.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-2 border-t border-purple-800/60 flex items-center justify-between text-[10px] text-purple-300">
              <span>Provedor: {urgentAlertSettings.apiProvider}</span>
              <span className="text-emerald-400 font-bold">24h / 7 dias ativado</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUBSECTION: NOTIFICAÇÕES CRÍTICAS GLOBAIS DE PACIENTES */}
      <div id="secao-notificacoes-criticas" className="bg-white p-5 lg:p-6 rounded-3xl border border-purple-200/90 shadow-md space-y-5 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-rose-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <BellRing className="w-3 h-3 text-white" />
                Disparo Global de Emergência
              </span>
              <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full">
                {criticalRules.filter(r => r.enabled).length} de {criticalRules.length} Eventos Ativos
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-700" />
              Gatilhos de Notificações Críticas Globais por Eventos de Pacientes
            </h3>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Defina quais acontecimentos da jornada do paciente (como triagens Manchester de urgência, estouros de SLA, glosas de convênio ou laudos alterados) devem soar alarme no sistema, disparar pop-ups e enviar alertas aos plantonistas.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={playTestAlertSound}
              className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Testar como o som de alarme crítico soa no navegador"
            >
              <Volume2 className="w-4 h-4 text-purple-700 animate-pulse" />
              <span>Testar Som de Alerta</span>
            </button>

            <button
              onClick={handleSaveNotificationRules}
              className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Regras de Notificação</span>
            </button>
          </div>
        </div>

        {/* List of Notification Event Rules */}
        <div className="space-y-3">
          {criticalRules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-2xl border transition-all ${
                rule.enabled
                  ? 'bg-gradient-to-r from-purple-50/70 via-white to-white border-purple-200/90 shadow-2xs'
                  : 'bg-slate-50/60 border-slate-200/80 opacity-70'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Toggle & Info */}
                <div className="flex items-start space-x-3.5 min-w-0">
                  {/* Active Toggle Switch */}
                  <button
                    onClick={() => {
                      const updated = criticalRules.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r);
                      setCriticalRules(updated);
                      showToast(`Status do evento "${rule.eventName}" alterado`);
                    }}
                    className={`mt-1 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      rule.enabled ? 'bg-purple-700' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        rule.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-slate-900">{rule.eventName}</span>

                      {/* Category Chip */}
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                        {rule.category}
                      </span>

                      {/* Severity Chip */}
                      {rule.severity === 'critical' ? (
                        <span className="text-[9px] font-black bg-rose-100 text-rose-900 border border-rose-300 px-2 py-0.2 rounded-full uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                          🚨 Severidade Crítica
                        </span>
                      ) : rule.severity === 'high' ? (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.2 rounded-full uppercase">
                          ⚠️ Severidade Alta
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.2 rounded-full uppercase">
                          ℹ️ Severidade Média
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{rule.description}</p>
                  </div>
                </div>

                {/* Right: Notification Channels & Target Roles */}
                <div className="flex flex-wrap items-center gap-3 lg:justify-end border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0">
                  {/* Channels selection for this rule */}
                  <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80 text-[11px]">
                    <span className="text-[10px] font-bold text-slate-500 px-1">Canais:</span>

                    {/* Sound Channel Toggle */}
                    <button
                      disabled={!rule.enabled}
                      onClick={() => {
                        const updated = criticalRules.map(r => r.id === rule.id ? { ...r, soundAlert: !r.soundAlert } : r);
                        setCriticalRules(updated);
                      }}
                      className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        rule.soundAlert && rule.enabled
                          ? 'bg-purple-800 text-white shadow-2xs'
                          : 'bg-white text-slate-400 hover:text-slate-600'
                      }`}
                      title="Disparar Alerta Sonoro no Navegador"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Som</span>
                    </button>

                    {/* Popup Channel Toggle */}
                    <button
                      disabled={!rule.enabled}
                      onClick={() => {
                        const updated = criticalRules.map(r => r.id === rule.id ? { ...r, popupAlert: !r.popupAlert } : r);
                        setCriticalRules(updated);
                      }}
                      className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        rule.popupAlert && rule.enabled
                          ? 'bg-purple-800 text-white shadow-2xs'
                          : 'bg-white text-slate-400 hover:text-slate-600'
                      }`}
                      title="Pop-up em Tela Cheia no Dashboard"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Pop-up</span>
                    </button>

                    {/* WhatsApp Group Toggle */}
                    <button
                      disabled={!rule.enabled}
                      onClick={() => {
                        const updated = criticalRules.map(r => r.id === rule.id ? { ...r, whatsappGroupAlert: !r.whatsappGroupAlert } : r);
                        setCriticalRules(updated);
                      }}
                      className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        rule.whatsappGroupAlert && rule.enabled
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-white text-slate-400 hover:text-slate-600'
                      }`}
                      title="Notificar Grupo de WhatsApp do Plantão"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    {/* Email Toggle */}
                    <button
                      disabled={!rule.enabled}
                      onClick={() => {
                        const updated = criticalRules.map(r => r.id === rule.id ? { ...r, emailAlert: !r.emailAlert } : r);
                        setCriticalRules(updated);
                      }}
                      className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        rule.emailAlert && rule.enabled
                          ? 'bg-purple-800 text-white shadow-2xs'
                          : 'bg-white text-slate-400 hover:text-slate-600'
                      }`}
                      title="Enviar E-mail Urgente aos Responsáveis"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>E-mail</span>
                    </button>
                  </div>

                  {/* Target Roles Badges */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400 mr-1">Notificar:</span>
                    {rule.rolesNotified.map((role) => (
                      <span
                        key={role}
                        className="text-[9px] font-bold bg-purple-100 text-purple-900 border border-purple-200 px-1.5 py-0.5 rounded-md"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUBSECTION: WEBHOOKS & ENDPOINTS DE INTEGRAÇÃO HTTP (STATUS VISUAL VERDE / VERMELHO) */}
      <div id="secao-webhooks-lista" className="bg-white p-5 lg:p-6 rounded-3xl border border-purple-200/90 shadow-md space-y-5 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black bg-purple-900 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Webhook className="w-3 h-3 text-purple-200" />
                Sincronização Ativa via Webhooks
              </span>
              <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {webhooks.filter(w => w.lastTestSuccess === true).length} Conexões OK (Verde)
              </span>
              <span className="text-[10px] font-extrabold bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <XCircle className="w-3 h-3 text-rose-600" />
                {webhooks.filter(w => w.lastTestSuccess === false).length} Com Falha (Vermelho)
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-700" />
              Lista de Webhooks & Monitor de Conectividade
            </h3>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Ícones de status visual (verde/vermelho) indicam o resultado do último teste de conexão com os endpoints externos (N8N, Zapier, Make, iClinic PEP). Clique em "Testar Conexão Agora" para validar a resposta em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddWebhookModalOpen(true)}
              className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Webhook</span>
            </button>
          </div>
        </div>

        {/* Webhooks Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {webhooks.map((wh) => {
            const isSuccess = wh.lastTestSuccess === true;
            const isFailure = wh.lastTestSuccess === false;
            const isPending = wh.lastTestSuccess === undefined;

            return (
              <div
                key={wh.id}
                className={`p-4 rounded-2xl border transition-all space-y-3.5 relative ${
                  isSuccess
                    ? 'bg-slate-50/70 border-emerald-200/90 shadow-2xs hover:border-emerald-300'
                    : isFailure
                    ? 'bg-rose-50/20 border-rose-200/90 shadow-2xs hover:border-rose-300'
                    : 'bg-slate-50/50 border-slate-200'
                }`}
              >
                {/* Name, Status & URL */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-xs text-slate-900 truncate">
                        {wh.name}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          wh.status === 'Ativo'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {wh.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 bg-white/80 p-1.5 rounded-lg border border-slate-200/80 truncate">
                      <Globe className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="truncate">{wh.url}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleWebhookItemStatus(wh.id)}
                      className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                    >
                      {wh.status === 'Ativo' ? 'Pausar' : 'Ativar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteWebhookItem(wh.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Remover Webhook"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* VISUAL STATUS INDICATOR CARD (VERDE / VERMELHO) */}
                <div
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSuccess
                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-2xs'
                      : isFailure
                      ? 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-2xs'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Status Icon Badge */}
                    {isSuccess && (
                      <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-400 shadow-2xs">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      </div>
                    )}
                    {isFailure && (
                      <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-700 flex items-center justify-center shrink-0 border border-rose-400 shadow-2xs">
                        <XCircle className="w-5 h-5 text-rose-700" />
                      </div>
                    )}
                    {isPending && (
                      <div className="w-9 h-9 rounded-2xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                    )}

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-black text-xs">
                        {isSuccess && (
                          <span className="text-emerald-900 flex items-center gap-1">
                            🟢 Conexão Bem-Sucedida (HTTP {wh.lastTestStatusCode || 200} OK)
                          </span>
                        )}
                        {isFailure && (
                          <span className="text-rose-900 flex items-center gap-1">
                            🔴 Falha no Teste de Conexão (HTTP {wh.lastTestStatusCode || 504})
                          </span>
                        )}
                        {isPending && (
                          <span className="text-slate-700">
                            ⚪ Teste de Conexão Pendente
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] opacity-90 leading-tight">
                        {isSuccess && `Latência: ${wh.lastTestLatencyMs || 42}ms • Testado em: ${wh.lastTestDate || 'Hoje'}`}
                        {isFailure && `Timeout de Gateway / Erro HTTP • ${wh.failureCount || 1} falhas registradas • Testado: ${wh.lastTestDate || 'Ontem'}`}
                        {isPending && 'Clique no botão abaixo para rodar o teste inicial de pacotes.'}
                      </p>
                    </div>
                  </div>

                  {/* Pulsing Dot */}
                  <div className="shrink-0">
                    {isSuccess && (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    )}
                    {isFailure && (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Subscribed Events Tags */}
                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                  <span className="text-slate-400 font-bold mr-1">Eventos Ativos:</span>
                  {wh.events.map((evt) => (
                    <span
                      key={evt}
                      className="bg-purple-50 text-purple-900 font-mono text-[9px] px-2 py-0.5 rounded-md border border-purple-100"
                    >
                      {evt}
                    </span>
                  ))}
                </div>

                {/* Actions Row */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={testingWebhookId === wh.id}
                    onClick={() => handleTestWebhookConnection(wh.id)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingWebhookId === wh.id ? 'animate-spin text-purple-300' : ''}`} />
                    <span>{testingWebhookId === wh.id ? 'Testando...' : 'Testar Conexão Agora'}</span>
                  </button>

                  {/* Quick Status Simulation Buttons */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-bold mr-1 hidden sm:inline">Simular:</span>
                    <button
                      type="button"
                      onClick={() => handleTestWebhookConnection(wh.id, true)}
                      className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-extrabold rounded-lg cursor-pointer transition-colors"
                      title="Forçar status Verde (200 OK)"
                    >
                      🟢 Verde
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTestWebhookConnection(wh.id, false)}
                      className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 text-[10px] font-extrabold rounded-lg cursor-pointer transition-colors"
                      title="Forçar status Vermelho (504 Timeout)"
                    >
                      🔴 Vermelho
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EHR Systems Live Connectors Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Prontuários Eletrônicos (PEP) & Conectores TISS
            </h3>
          </div>
          <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Criptografia E2EE AES-256 Ativa
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((ehr) => (
            <div
              key={ehr.id}
              className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{ehr.logo}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      ehr.status === 'Conectado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ehr.status}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900">{ehr.name}</p>
                <p className="text-[10px] text-slate-500">{ehr.type}</p>
                <p className="text-[10px] text-slate-400 mt-2">
                  Sincronizado: {ehr.lastSync}
                </p>
              </div>

              <button
                onClick={() => setSelectedEhr(ehr.id)}
                className="w-full bg-white hover:bg-purple-700 hover:text-white border border-slate-200 text-purple-900 font-bold text-xs py-1.5 rounded-xl transition-all shadow-2xs"
              >
                Gerenciar Conexão
              </button>
            </div>
          ))}
        </div>

        {/* Selected EHR Webhook Config Modal */}
        {selectedEhr && (
          <div className="bg-purple-950 text-white p-5 rounded-2xl space-y-3 mt-4 border border-purple-800 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                Chave de Conexão Direct API & Webhook (iClinic / Feegow / HiDoctor)
              </h4>
              <button
                onClick={() => setSelectedEhr(null)}
                className="text-xs text-purple-300 hover:text-white"
              >
                Fechar
              </button>
            </div>

            <p className="text-xs text-purple-200">
              Cole esta chave no seu software de Prontuário Eletrônico para permitir a busca de histórico de consultas, prescrições e validação automática de guias TISS.
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={webhookToken}
                className="flex-1 bg-purple-900/80 border border-purple-700 text-xs font-mono px-3 py-2 rounded-xl text-purple-100 focus:outline-none"
              />
              <button
                onClick={handleCopyToken}
                className="bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : 'Copiar Token'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SIMULATION MODAL FOR EXTERNAL DISPATCH (WHATSAPP / SMS) */}
      {showTestDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-purple-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Simulação de Alerta no Celular do Médico
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTestDispatchModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-900 text-slate-100 rounded-2xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                <span>📱 {urgentAlertSettings.doctorPhone} ({urgentAlertSettings.doctorName})</span>
                <span className="text-emerald-400 font-bold">100% ONLINE</span>
              </div>

              {/* WhatsApp Mock Message */}
              {(urgentAlertSettings.channel === 'whatsapp' || urgentAlertSettings.channel === 'both') && (
                <div className="p-3 bg-[#075e54] text-white rounded-2xl space-y-1.5 font-sans border border-emerald-500/30">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-200">
                    <span>💬 MediFlux Bot (WhatsApp Business)</span>
                    <span>Agora</span>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed">
                    🚨 <strong>ALERTA DE PENDÊNCIA URGENTE!</strong>
                    <br />
                    <strong>Paciente:</strong> Ana Luíza Vasconcelos
                    <br />
                    <strong>Motivo:</strong> Triagem Manchester Laranja - Dor no Peito Pós-Op
                    <br />
                    <strong>SLA Limite:</strong> 15 min (Pendente há 8 min)
                  </p>
                  <div className="pt-1.5 flex gap-1 text-[10px]">
                    <span className="bg-white text-[#075e54] px-2 py-1 rounded-lg font-bold">
                      📲 Abrir Prontuário no App
                    </span>
                    <span className="bg-emerald-800 text-white px-2 py-1 rounded-lg font-bold">
                      ✅ Assumir Atendimento
                    </span>
                  </div>
                </div>
              )}

              {/* SMS Mock Message */}
              {(urgentAlertSettings.channel === 'sms' || urgentAlertSettings.channel === 'both') && (
                <div className="p-3 bg-slate-800 text-slate-100 rounded-2xl space-y-1 font-sans border border-slate-700">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>💬 SMS Emergência (28282)</span>
                    <span>Agora</span>
                  </div>
                  <p className="text-[11px] leading-snug">
                    [MEDIFLUX URGENTE] Dr. Roberto, paciente Ana Luíza em triagem de ALTA severidade aguardando conduta. Acesse: mediflux.app/p/9932
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Disparo teste simulado com sucesso!
              </span>
              <button
                type="button"
                onClick={() => setShowTestDispatchModal(false)}
                className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Concluir Teste
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ADD NEW WEBHOOK MODAL */}
      {isAddWebhookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-purple-700" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Cadastrar Novo Webhook de Saída
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddWebhookModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome da Integração / Endpoint
                </label>
                <input
                  type="text"
                  placeholder="Ex: N8N Workflow / Zapier Chat Sync"
                  value={newWhName}
                  onChange={(e) => setNewWhName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL de Destino (HTTPS)
                </label>
                <input
                  type="text"
                  placeholder="https://n8n.minhaclinica.com.br/webhook/..."
                  value={newWhUrl}
                  onChange={(e) => setNewWhUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Eventos Assinados
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                  {[
                    { id: 'patient.created', label: 'Novo Paciente Cadastrado' },
                    { id: 'patient.stage_changed', label: 'Mudança de Etapa/Funil' },
                    { id: 'chat.message_received', label: 'Mensagem do WhatsApp' },
                    { id: 'triage.completed', label: 'Triagem de IA Concluída' },
                    { id: 'ehr.synced', label: 'Prontuário Eletrônico Sincronizado' },
                    { id: 'appointment.scheduled', label: 'Consulta Agendada' },
                  ].map((evt) => (
                    <label key={evt.id} className="flex items-center gap-1.5 font-medium text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newWhEvents.includes(evt.id as WebhookEvent)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWhEvents([...newWhEvents, evt.id as WebhookEvent]);
                          } else {
                            setNewWhEvents(newWhEvents.filter(x => x !== evt.id));
                          }
                        }}
                        className="rounded text-purple-700 focus:ring-purple-500"
                      />
                      <span className="truncate">{evt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddWebhookModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateNewWebhook}
                className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                <span>Salvar e Testar Webhook</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

