import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ShieldAlert,
  UserCheck,
  Check,
  Bug,
  Activity,
  RefreshCw,
  Terminal,
  AlertOctagon,
  ShieldX,
  UserX,
  Database,
  Zap,
  FileSpreadsheet,
  LockKeyhole,
  Play,
  XCircle,
  Info,
  SlidersHorizontal,
  BellRing,
  Award,
  Sparkles,
  Send,
  FileCheck2,
  FileClock,
  HelpCircle,
  TrendingUp,
  Shield,
  Pill,
  Microscope,
  User,
  Filter,
  Search,
  Printer,
  ArrowRight,
  FileCode,
  Stethoscope,
  Layers
} from 'lucide-react';
import { AUDIT_LOGS } from '../../data/mockData';
import { sentryTelemetry, TelemetryErrorEvent } from '../../services/sentryTelemetry';
import { apiService } from '../../services/api';
import { AuditLog } from '../../types';

export interface SensitiveDataIncident {
  id: string;
  timestamp: string;
  type: 'mass_export' | 'unauthorized_access' | 'after_hours_access' | 'anonymization_violation';
  title: string;
  user: string;
  role: string;
  ipAddress: string;
  location: string;
  recordsAffectedCount: number;
  patientsInvolved: string[];
  severity: 'critical' | 'high' | 'medium';
  actionTaken: 'blocked_automatically' | 'flagged_dpo' | 'pending_review' | 'resolved';
  lgpdArticle: string;
  details: string;
}

export const AuditoriaLgpdView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('todos');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todas');
  const [inspectingLog, setInspectingLog] = useState<AuditLog | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sentryEvents, setSentryEvents] = useState<TelemetryErrorEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'sensitive_data' | 'audit' | 'sentry'>('sensitive_data');
  const [selectedEvent, setSelectedEvent] = useState<TelemetryErrorEvent | null>(null);

  // Sensitive Data Incidents State
  const [incidents, setIncidents] = useState<SensitiveDataIncident[]>([
    {
      id: 'inc-901',
      timestamp: '13/08/2026 09:42:10',
      type: 'mass_export',
      title: 'Tentativa de Exportação em Massa de Prontuários (DLP Intercepted)',
      user: 'Marcos Silva',
      role: 'Estagiário de Atendimento',
      ipAddress: '189.120.45.99 (Conexão Externa)',
      location: 'São Paulo, BR',
      recordsAffectedCount: 58,
      patientsInvolved: ['Ana Luíza Vasconcelos', 'Carlos Eduardo Mendes', 'Juliana Rocha', 'e mais 55 pacientes'],
      severity: 'critical',
      actionTaken: 'blocked_automatically',
      lgpdArticle: 'Art. 46 & 48 LGPD (Prevenção e Vazamento de Dados Sensíveis)',
      details: 'O usuário tentou realizar download simultâneo de 58 prontuários no formato CSV contendo diagnósticos e CPFs em menos de 30 segundos. O motor de segurança DLP bloqueou o arquivo e desativou temporariamente o token de exportação.'
    },
    {
      id: 'inc-902',
      timestamp: '13/08/2026 08:15:33',
      type: 'unauthorized_access',
      title: 'Acesso Não Autorizado a Laudo Psiquiátrico Restrito',
      user: 'Recepção Unidade 02',
      role: 'Recepção / Atendimento',
      ipAddress: '177.89.201.12 (REDE_INTERNA_CLINICA)',
      location: 'Unidade Jardins',
      recordsAffectedCount: 1,
      patientsInvolved: ['Fernanda Lima Rocha'],
      severity: 'high',
      actionTaken: 'flagged_dpo',
      lgpdArticle: 'Art. 7º, I & Art. 11 LGPD (Tratamento de Dados Sensíveis de Saúde)',
      details: 'Perfil sem credencial médica tentou abrir anexo criptografado de consulta psicológica sem solicitação ou agendamento ativo para o dia. Acesso negado e alerta emitido para o DPO.'
    },
    {
      id: 'inc-903',
      timestamp: '12/08/2026 23:14:02',
      type: 'after_hours_access',
      title: 'Acesso a Prontuário Fora do Horário Comercial (23h14)',
      user: 'Mariana Costa',
      role: 'Atendimento Comercial',
      ipAddress: '201.88.102.44 (VPN Home Office)',
      location: 'Campinas, BR',
      recordsAffectedCount: 3,
      patientsInvolved: ['Beatriz Oliveira', 'João Victor Silva'],
      severity: 'medium',
      actionTaken: 'pending_review',
      lgpdArticle: 'Art. 6º, VII LGPD (Princípio da Segurança e Controle de Horário)',
      details: 'Consulta ao histórico de exames de 3 pacientes realizada fora do horário de expediente sem ordem de plantão registrada.'
    }
  ]);

  // DLP Security Policies Toggles State
  const [dlpPolicies, setDlpPolicies] = useState({
    massExportBlock: true,
    zeroTrustSensitiveRecords: true,
    dataAnonymization: true,
    afterHoursAlert: true,
    autoReportDpo: true,
  });

  // LGPD Consent & Compliance Score State
  const [totalPatientsCount, setTotalPatientsCount] = useState(420);
  const [signedConsentCount, setSignedConsentCount] = useState(398); // 398/420 signed
  const [isSendingConsentReminders, setIsSendingConsentReminders] = useState(false);

  // Dynamic LGPD Score Computations (Scale 0-100)
  const consentCoveragePercentage = Math.round((signedConsentCount / totalPatientsCount) * 100);
  const pendingConsentCount = Math.max(0, totalPatientsCount - signedConsentCount);

  // Security Score calculation (max 50 pts)
  const securityScore =
    (dlpPolicies.massExportBlock ? 12 : 0) +
    (dlpPolicies.zeroTrustSensitiveRecords ? 12 : 0) +
    (dlpPolicies.dataAnonymization ? 12 : 0) +
    (dlpPolicies.afterHoursAlert ? 7 : 0) +
    7; // AES-256 base encryption

  // Consent Score calculation (max 50 pts)
  const consentScore = Math.round((consentCoveragePercentage / 100) * 50);

  // Total LGPD Compliance Score (0-100)
  const totalLgpdScore = Math.min(100, securityScore + consentScore);

  const handleSendConsentReminders = () => {
    if (pendingConsentCount === 0) {
      showToast('Todos os pacientes já possuem termo de consentimento assinado!');
      return;
    }
    setIsSendingConsentReminders(true);
    setTimeout(() => {
      setSignedConsentCount(totalPatientsCount);
      setIsSendingConsentReminders(false);
      showToast(`📲 Lembretes via WhatsApp enviados! Todos os ${pendingConsentCount} termos pendentes foram validados.`);
    }, 1200);
  };

  const [inspectingIncident, setInspectingIncident] = useState<SensitiveDataIncident | null>(null);

  // Load audit logs from Dynalite API
  useEffect(() => {
    async function loadLogs() {
      const data = await apiService.getAuditLogs();
      if (data && data.length > 0) {
        setLogs(data);
      }
    }
    loadLogs();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadSentryEvents = async () => {
    try {
      const localEvents = sentryTelemetry.getEvents();
      const res = await fetch('/api/telemetry/errors');
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        const combined = [...localEvents, ...data.events];
        const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());
        setSentryEvents(unique);
      } else {
        setSentryEvents(localEvents);
      }
    } catch (e) {
      setSentryEvents(sentryTelemetry.getEvents());
    }
  };

  useEffect(() => {
    loadSentryEvents();
    const interval = setInterval(loadSentryEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerTestError = async () => {
    try {
      const res = await fetch('/api/telemetry/test-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@clinicasantahelena.com.br' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Exceção de teste gerada e capturada pelo Sentry!');
        await loadSentryEvents();
      }
    } catch (e) {
      sentryTelemetry.captureException(new Error('Sentry Client Simulation Error'));
      showToast('Exceção simulada no cliente capturada no Sentry!');
      await loadSentryEvents();
    }
  };

  // Live Incident Simulators
  const simulateMassExportAttempt = () => {
    const newInc: SensitiveDataIncident = {
      id: `inc-${Date.now().toString().substring(7)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      type: 'mass_export',
      title: '🚨 TENTATIVA DE EXPORTAÇÃO EM MASSA DETECTADA (Simulação DLP)',
      user: 'Operador Teste (Simulado)',
      role: 'Atendente Nível 1',
      ipAddress: '189.220.10.45 (Rede Externa)',
      location: 'São Paulo, BR',
      recordsAffectedCount: 42,
      patientsInvolved: ['Ana Luíza', 'Mariana Oliveira', 'Juliana Rocha', 'e mais 39 registros'],
      severity: 'critical',
      actionTaken: 'blocked_automatically',
      lgpdArticle: 'Art. 46 LGPD (Medidas de Segurança para Dados Sensíveis de Saúde)',
      details: 'O motor de monitoramento detectou requisição de download de 42 prontuários em 12 segundos. Ação: Download cancelado e alerta enviado ao DPO.'
    };

    setIncidents(prev => [newInc, ...prev]);
    showToast('🚨 SIMULAÇÃO: Alerta crítico de exportação em massa gerado e bloqueado!');
  };

  const simulateUnauthorizedAccess = () => {
    const newInc: SensitiveDataIncident = {
      id: `inc-${Date.now().toString().substring(7)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      type: 'unauthorized_access',
      title: '🔒 TENTATIVA DE ACESSO NÃO AUTORIZADO (Zero Trust)',
      user: 'Usuário Convidado / Recepção',
      role: 'Recepção',
      ipAddress: '177.100.80.22',
      location: 'Terminal Interno 04',
      recordsAffectedCount: 1,
      patientsInvolved: ['Carlos Eduardo Mendes'],
      severity: 'high',
      actionTaken: 'flagged_dpo',
      lgpdArticle: 'Art. 11 LGPD (Proteção de Prontuários e Dados de Saúde)',
      details: 'Usuário sem nível de acesso médico solicitou abertura de exames sigilosos de oncologia. O sistema bloqueou o acesso e notificou a governança.'
    };

    setIncidents(prev => [newInc, ...prev]);
    showToast('🔒 SIMULAÇÃO: Tentativa de acesso não autorizado interceptada!');
  };

  const handleResolveIncident = (incId: string) => {
    setIncidents(prev =>
      prev.map(item => item.id === incId ? { ...item, actionTaken: 'resolved' } : item)
    );
    showToast('✅ Incidente resolvido e arquivado com registro no diário do DPO.');
  };

  const handleBlockUserAccount = (userName: string) => {
    showToast(`🚫 Credencial de "${userName}" bloqueada no sistema por violação de segurança LGPD.`);
  };

  const handleSendAnpdReport = (inc: SensitiveDataIncident) => {
    showToast(`📑 Relatório do Incidente ${inc.id} gerado no padrão ANPD (Art. 48) com assinatura digital.`);
  };

  const uniqueUsers = Array.from(new Set(logs.map(l => l.user)));

  const filteredLogs = logs.filter((l) => {
    const matchesUser = selectedUserFilter === 'todos' || l.user === selectedUserFilter;
    const matchesCategory = selectedCategoryFilter === 'todas' || l.category === selectedCategoryFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      l.patientName.toLowerCase().includes(term) ||
      l.user.toLowerCase().includes(term) ||
      l.action.toLowerCase().includes(term) ||
      (l.details && l.details.toLowerCase().includes(term)) ||
      (l.recordId && l.recordId.toLowerCase().includes(term));

    return matchesUser && matchesCategory && matchesSearch;
  });

  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      showToast('⚠️ Nenhum log de auditoria encontrado com os filtros atuais.');
      return;
    }

    const headers = [
      'ID Log',
      'Data e Hora',
      'Usuário',
      'Cargo / Perfil',
      'Ação no Prontuário',
      'Categoria',
      'Paciente',
      'Prontuário PEP',
      'IP Origem',
      'Criptografia',
      'Status',
      'Detalhamento / Justificativa',
      'Registro Anterior',
      'Novo Registro'
    ];

    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.user.replace(/"/g, '""')}"`,
      `"${l.role.replace(/"/g, '""')}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.category || 'geral'}"`,
      `"${l.patientName.replace(/"/g, '""')}"`,
      `"${l.recordId}"`,
      `"${l.ipAddress}"`,
      `"${l.encryptionMethod}"`,
      `"${l.status}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${(l.previousValue || '').replace(/"/g, '""')}"`,
      `"${(l.newValue || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const userSuffix = selectedUserFilter !== 'todos' ? `_${selectedUserFilter.toLowerCase().replace(/\s+/g, '_')}` : '';
    const dateStr = new Date().toISOString().split('T')[0];

    link.href = url;
    link.setAttribute('download', `auditoria_prontuarios${userSuffix}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`📊 Exportação concluída! ${filteredLogs.length} logs exportados em formato CSV.`);
  };

  const handleExportPdfReport = () => {
    showToast(`📄 Relatório de Auditoria Assinado para ${filteredLogs.length} registros (Hash DPO gerado).`);
  };

  const renderCategoryBadge = (category?: string) => {
    switch (category) {
      case 'medicamentos':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300/80 px-2.5 py-0.5 rounded-full shrink-0">
            <Pill className="w-3 h-3 text-emerald-700" />
            Medicamentos
          </span>
        );
      case 'exames':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300/80 px-2.5 py-0.5 rounded-full shrink-0">
            <Microscope className="w-3 h-3 text-blue-700" />
            Exames / PACS
          </span>
        );
      case 'atestado':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-purple-100 text-purple-900 border border-purple-300/80 px-2.5 py-0.5 rounded-full shrink-0">
            <FileCheck2 className="w-3 h-3 text-purple-700" />
            Receita / ICP
          </span>
        );
      case 'anamnese':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300/80 px-2.5 py-0.5 rounded-full shrink-0">
            <Stethoscope className="w-3 h-3 text-amber-700" />
            Anamnese
          </span>
        );
      case 'exportacao':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300/80 px-2.5 py-0.5 rounded-full shrink-0">
            <FileSpreadsheet className="w-3 h-3 text-rose-700" />
            Exportação DLP
          </span>
        );
      case 'prontuario':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300/80 px-2.5 py-0.5 rounded-full shrink-0">
            <FileText className="w-3 h-3 text-slate-600" />
            Prontuário PEP
          </span>
        );
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-[#f8f9fc] min-h-screen relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-purple-500/40 flex items-center gap-3 text-xs font-bold animate-fadeIn">
          <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
              Auditoria & Monitoramento de Dados Sensíveis LGPD
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lei Geral de Proteção de Dados (Lei nº 13.709/2018) • Prevenção de Vazamentos (DLP) & Telemetria Sentry
          </p>
        </div>

        <button
          onClick={() => showToast('Relatório de Conformidade DPO / ANS assinado digitalmente!')}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Relatório ANS / DPO</span>
        </button>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-950 to-slate-900 text-white p-4.5 rounded-2xl border border-purple-800/80 shadow-md space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider">
              Monitor DLP de Dados Sensíveis
            </span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-white">{incidents.length} Alertas Ativos</p>
          <p className="text-[11px] text-purple-200 leading-snug">
            {incidents.filter(i => i.severity === 'critical').length} críticos bloqueados automaticamente
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Criptografia de Prontuários
            </span>
            <Lock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-slate-900">E2EE AES-256-GCM</p>
          <p className="text-[11px] text-slate-500">
            Prontuários e anexos cifrados no banco
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Consentimento de Pacientes
            </span>
            <UserCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-black text-slate-900">100% Opt-in Ativo</p>
          <p className="text-[11px] text-slate-500">
            Termos de uso registrados via WhatsApp
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Encarregado DPO & ANPD
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-slate-900">Dr. Roberto Andrade (DPO)</p>
          <p className="text-[10px] text-slate-500 font-mono truncate">
            dpo@clinicasantahelena.com.br
          </p>
        </div>
      </div>

      {/* VISUAL LGPD COMPLIANCE SCORE CARD */}
      <div id="secao-score-conformidade-lgpd" className="bg-white p-5 lg:p-6 rounded-3xl border border-purple-200/90 shadow-md space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black bg-purple-900 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                Score de Governança & Conformidade ANPD
              </span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                totalLgpdScore >= 90
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : totalLgpdScore >= 75
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {totalLgpdScore >= 90
                  ? 'Nível A+ • Excelente Adequação'
                  : totalLgpdScore >= 75
                  ? 'Nível B • Conformidade Intermediária'
                  : 'Nível C • Pendências Críticas'}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-700" />
              Índice de Conformidade LGPD da Clínica
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Avaliação dinâmica baseada na análise de políticas de segurança técnico-organizacionais (DLP, E2EE, Zero Trust) e na cobertura dos termos de consentimento (opt-in) dos pacientes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast('Audit trail de conformidade LGPD atualizado com sucesso!')}
              className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-700" />
              <span>Recalcular Score</span>
            </button>
          </div>
        </div>

        {/* Score Grid: Donut Gauge + Pilar 1 (Segurança) + Pilar 2 (Consentimento) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Gauge Column (4 cols) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-purple-950 via-slate-900 to-purple-900 text-white p-5 rounded-3xl border border-purple-800/90 shadow-lg flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl" />

            <span className="text-[10px] font-black tracking-widest uppercase text-purple-300">
              Conformidade Global
            </span>

            {/* Circular Progress Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={totalLgpdScore >= 90 ? '#10b981' : totalLgpdScore >= 75 ? '#f59e0b' : '#f43f5e'}
                  strokeWidth="8"
                  strokeDasharray={`${(totalLgpdScore / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black tracking-tight text-white font-mono">
                  {totalLgpdScore}<span className="text-base font-semibold text-purple-300">%</span>
                </span>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">
                  ANPD Ready
                </span>
              </div>
            </div>

            <div className="space-y-1 w-full pt-1 border-t border-purple-800/80">
              <div className="flex justify-between text-[11px] text-purple-200">
                <span>Segurança & DLP:</span>
                <strong className="text-white font-mono">{securityScore} / 50 pts</strong>
              </div>
              <div className="flex justify-between text-[11px] text-purple-200">
                <span>Termos de Consentimento:</span>
                <strong className="text-white font-mono">{consentScore} / 50 pts</strong>
              </div>
            </div>
          </div>

          {/* Pillar 1: Security & DLP Policies Analysis (4 cols) */}
          <div className="lg:col-span-4 bg-slate-50 p-5 rounded-3xl border border-slate-200/90 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-purple-700" />
                  Pilar 1: Segurança Técnico-Organizacional
                </span>
                <span className="text-[10px] font-mono font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                  {securityScore}/50 pts
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Rule 1 */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-800 text-[11px]">Criptografia E2EE AES-256</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700">+7 pts</span>
                </div>

                {/* Rule 2 */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${dlpPolicies.massExportBlock ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span className="font-bold text-slate-800 text-[11px]">Bloqueio Exportação em Massa</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${dlpPolicies.massExportBlock ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {dlpPolicies.massExportBlock ? '+12 pts' : '0 pts'}
                  </span>
                </div>

                {/* Rule 3 */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${dlpPolicies.zeroTrustSensitiveRecords ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span className="font-bold text-slate-800 text-[11px]">Protocolo Zero Trust CRM</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${dlpPolicies.zeroTrustSensitiveRecords ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {dlpPolicies.zeroTrustSensitiveRecords ? '+12 pts' : '0 pts'}
                  </span>
                </div>

                {/* Rule 4 */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${dlpPolicies.dataAnonymization ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span className="font-bold text-slate-800 text-[11px]">Mascaramento (Anonymizer)</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${dlpPolicies.dataAnonymization ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {dlpPolicies.dataAnonymization ? '+12 pts' : '0 pts'}
                  </span>
                </div>

                {/* Rule 5 */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${dlpPolicies.afterHoursAlert ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span className="font-bold text-slate-800 text-[11px]">Alerta Acesso Fora de Horário</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${dlpPolicies.afterHoursAlert ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {dlpPolicies.afterHoursAlert ? '+7 pts' : '0 pts'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 italic pt-2 border-t border-slate-200">
              *Altere as chaves DLP abaixo para recalcular o score do Pilar de Segurança.
            </p>
          </div>

          {/* Pillar 2: Consent Terms & Patient Opt-in Status (4 cols) */}
          <div className="lg:col-span-4 bg-slate-50 p-5 rounded-3xl border border-slate-200/90 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Pilar 2: Termos de Consentimento (Opt-in)
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {consentScore}/50 pts
                </span>
              </div>

              {/* Progress & Stats */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Cobertura de Termos Assinados</span>
                  <span className="font-extrabold text-purple-900 font-mono">{consentCoveragePercentage}%</span>
                </div>

                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${consentCoveragePercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600">
                  <span>Assinados: <strong className="text-emerald-700 font-bold">{signedConsentCount}</strong> / {totalPatientsCount}</span>
                  {pendingConsentCount > 0 ? (
                    <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {pendingConsentCount} pendentes
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3" /> 100% Regularizado
                    </span>
                  )}
                </div>
              </div>

              {/* Legal Framing Badges */}
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Art. 7º, I (Aceite Prévio de Triagem)</span>
                  <span className="text-[10px] font-bold text-emerald-700">Validados via WhatsApp</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Art. 18 (Direitos de Revogação)</span>
                  <span className="text-[10px] font-bold text-purple-800">Canal DPO Disponível</span>
                </div>
              </div>
            </div>

            {/* Quick Action: Remind Pending Patients */}
            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                disabled={isSendingConsentReminders || pendingConsentCount === 0}
                onClick={handleSendConsentReminders}
                className="w-full px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className={`w-3.5 h-3.5 ${isSendingConsentReminders ? 'animate-spin' : ''}`} />
                <span>
                  {isSendingConsentReminders
                    ? 'Disparando Notificações...'
                    : pendingConsentCount > 0
                    ? `Enviar Lembretes via WhatsApp (${pendingConsentCount} Pendentes)`
                    : 'Todos os Termos em Dia'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sensitive_data')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'sensitive_data'
              ? 'border-purple-700 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Monitoramento de Dados Sensíveis & Alertas LGPD</span>
          <span className="bg-rose-100 text-rose-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-200">
            {incidents.filter(i => i.actionTaken !== 'resolved').length} Ativos
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-purple-700 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Trilha de Auditoria PEP & Acessos</span>
        </button>

        <button
          onClick={() => setActiveTab('sentry')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'sentry'
              ? 'border-purple-700 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bug className="w-4 h-4 text-purple-600" />
          <span>Sentry Telemetria & Erros</span>
          <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            {sentryEvents.length} Eventos
          </span>
        </button>
      </div>

      {/* TAB 1: SENSITIVE DATA MONITORING & LGPD ALERTS */}
      {activeTab === 'sensitive_data' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Live Incident Simulator Toolbar */}
          <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-purple-950 p-5 rounded-3xl text-white shadow-xl border border-purple-800/80 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold bg-amber-400 text-purple-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Motor de Prevenção a Vazamentos (DLP)
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    ● Proteção Ativa em Tempo Real
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-400" />
                  Detector Automático de Acessos Não Autorizados e Exportações em Massa
                </h2>
                <p className="text-xs text-purple-200/90 max-w-3xl leading-relaxed">
                  Analisa requisições de download de prontuários, tentativas de vazamento em lote e acessos sem credencial médica. Emite alertas ao DPO e bloqueia sessões automaticamente.
                </p>
              </div>

              {/* Simulation Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <button
                  type="button"
                  onClick={simulateMassExportAttempt}
                  className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Simular Exportação em Massa</span>
                </button>

                <button
                  type="button"
                  onClick={simulateUnauthorizedAccess}
                  className="bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs px-3.5 py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LockKeyhole className="w-4 h-4" />
                  <span>Simular Acesso Negado</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Incidents Feed */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-800" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Central de Incidentes & Alertas de Segurança LGPD
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                Exibindo {incidents.length} alertas monitorados
              </span>
            </div>

            <div className="space-y-3">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    inc.severity === 'critical'
                      ? 'bg-rose-50/40 border-rose-200/80'
                      : inc.severity === 'high'
                      ? 'bg-amber-50/40 border-amber-200/80'
                      : 'bg-slate-50/80 border-slate-200/80'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Severity Badge */}
                        {inc.severity === 'critical' ? (
                          <span className="text-[9px] font-black bg-rose-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            CRÍTICO • BLOQUEADO
                          </span>
                        ) : inc.severity === 'high' ? (
                          <span className="text-[9px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                            ALTO • NOTIFICADO DPO
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                            MÉDIO • EM REVISÃO
                          </span>
                        )}

                        <span className="text-xs font-black text-slate-900">{inc.title}</span>

                        <span className="text-[10px] font-mono text-slate-400">
                          ID: {inc.id} • {inc.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {inc.details}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap pt-1">
                        <span className="font-bold text-purple-950">
                          Usuário: <span className="font-normal">{inc.user} ({inc.role})</span>
                        </span>
                        <span>•</span>
                        <span className="font-mono">IP: {inc.ipAddress} ({inc.location})</span>
                        <span>•</span>
                        <span className="font-bold text-rose-800">
                          {inc.recordsAffectedCount} prontuário(s) envolvido(s)
                        </span>
                        <span>•</span>
                        <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.2 rounded font-bold">
                          {inc.lgpdArticle}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                      <button
                        type="button"
                        onClick={() => setInspectingIncident(inc)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detalhes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBlockUserAccount(inc.user)}
                        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Bloquear credenciais do operador imediatamente"
                      >
                        <UserX className="w-3.5 h-3.5 text-rose-700" />
                        <span>Bloquear Conta</span>
                      </button>

                      {inc.actionTaken !== 'resolved' ? (
                        <button
                          type="button"
                          onClick={() => handleResolveIncident(inc.id)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aprovar/Resolver</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Arquivado</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DLP Security Policies Configuration Grid */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-purple-800" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Políticas de Prevenção a Vazamentos (DLP Rules Engine)
                </h3>
              </div>
              <span className="text-xs text-purple-800 font-bold bg-purple-50 px-2.5 py-1 rounded-lg">
                Conformidade ANPD 100%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Policy 1: Mass Export Limits */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-extrabold text-slate-900 block">
                    1. Bloqueio Automático de Exportação em Massa (&gt;10 PEPs/min)
                  </span>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Interrompe downloads em lote e bloqueia a emissão de CSVs ou PDFs quando ultrapassado o limite por usuário.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDlpPolicies(p => ({ ...p, massExportBlock: !p.massExportBlock }));
                    showToast('Regra de bloqueio de exportação em massa atualizada!');
                  }}
                  className={`mt-1 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    dlpPolicies.massExportBlock ? 'bg-purple-800' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      dlpPolicies.massExportBlock ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Policy 2: Zero Trust Confidential Records */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-extrabold text-slate-900 block">
                    2. Protocolo Zero Trust para Prontuários Sigilosos
                  </span>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Exige autenticação de duplo fator e confirmação do CRM médico para visualizar laudos psiquiátricos ou sensíveis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDlpPolicies(p => ({ ...p, zeroTrustSensitiveRecords: !p.zeroTrustSensitiveRecords }));
                    showToast('Protocolo Zero Trust atualizado!');
                  }}
                  className={`mt-1 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    dlpPolicies.zeroTrustSensitiveRecords ? 'bg-purple-800' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      dlpPolicies.zeroTrustSensitiveRecords ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Policy 3: Data Anonymization for Reception */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-extrabold text-slate-900 block">
                    3. Mascaramento Automático de CPF e Telefone (Anonymizer)
                  </span>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Oculta dígitos centrais do CPF e telefone para atendedores sem nível médico na recepção.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDlpPolicies(p => ({ ...p, dataAnonymization: !p.dataAnonymization }));
                    showToast('Regra de mascaramento de dados atualizada!');
                  }}
                  className={`mt-1 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    dlpPolicies.dataAnonymization ? 'bg-purple-800' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      dlpPolicies.dataAnonymization ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Policy 4: After hours access alert */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-extrabold text-slate-900 block">
                    4. Alerta de Acesso Fora do Horário Comercial (22h - 06h)
                  </span>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Notifica o DPO imediatamente se houver visualizações de exames durante a madrugada via IP externo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDlpPolicies(p => ({ ...p, afterHoursAlert: !p.afterHoursAlert }));
                    showToast('Alerta de horário comercial atualizado!');
                  }}
                  className={`mt-1 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    dlpPolicies.afterHoursAlert ? 'bg-purple-800' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      dlpPolicies.afterHoursAlert ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Incident Details Modal */}
          {inspectingIncident && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Inspecionar Incidente LGPD • {inspectingIncident.id}
                      </h3>
                      <p className="text-[11px] text-slate-400">Registrado às {inspectingIncident.timestamp}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectingIncident(null)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
                    <span className="font-extrabold text-rose-950 block">Diagnóstico de Anomalia:</span>
                    <p className="text-rose-900 font-medium leading-relaxed">{inspectingIncident.details}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[11px]">
                    <div>
                      <span className="font-bold text-slate-500 block">Usuário Responsável:</span>
                      <span className="font-extrabold text-slate-900">{inspectingIncident.user} ({inspectingIncident.role})</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 block">IP & Origem:</span>
                      <span className="font-mono text-slate-900">{inspectingIncident.ipAddress}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 block">Prontuários Afetados:</span>
                      <span className="font-bold text-rose-700">{inspectingIncident.recordsAffectedCount} registro(s)</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 block">Enquadramento Legal:</span>
                      <span className="font-bold text-purple-900">{inspectingIncident.lgpdArticle}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 block">Pacientes Envolvidos na Requisição:</span>
                    <div className="p-2.5 bg-slate-100 rounded-xl font-mono text-[11px] text-slate-700">
                      {inspectingIncident.patientsInvolved.join(' • ')}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleSendAnpdReport(inspectingIncident);
                      setInspectingIncident(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Notificar ANPD (Art. 48)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectingIncident(null)}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    Concluir Inspeção
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SENTRY TELEMETRY */}
      {activeTab === 'sentry' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Sentry Live Stream Toolbar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-600 animate-pulse" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Sentry Live Telemetry Exception Stream
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Captura silenciosa de erros de autenticação, exceções não tratadas e stack traces em tempo real.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerTestError}
                  className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Bug className="w-3.5 h-3.5 text-rose-600" />
                  <span>Simular Exceção Sentry</span>
                </button>

                <button
                  onClick={loadSentryEvents}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Atualizar Stream</span>
                </button>
              </div>
            </div>

            {sentryEvents.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="text-xs font-bold text-slate-800">Nenhum Erro no Runtime Capturado</h3>
                <p className="text-[11px] text-slate-500">
                  O sistema Sentry está ativo e monitorando a aplicação em busca de falhas silenciosas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-3">Data / Hora</th>
                      <th className="py-3 px-3">Tipo / Severidade</th>
                      <th className="py-3 px-3">Mensagem do Erro</th>
                      <th className="py-3 px-3">Usuário Afetado</th>
                      <th className="py-3 px-3">Trace ID</th>
                      <th className="py-3 px-3">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sentryEvents.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          {evt.timestamp}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                evt.severity === 'fatal' || evt.severity === 'error'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {evt.severity || 'ERROR'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{evt.type}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs truncate">
                          {evt.message}
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                          {evt.email || 'Anônimo / Visitante'}
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] text-purple-700">{evt.id}</td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => setSelectedEvent(evt)}
                            className="bg-purple-100 hover:bg-purple-200 text-purple-900 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Terminal className="w-3 h-3" />
                            <span>Inspecionar</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detailed Sentry Event Modal */}
          {selectedEvent && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Bug className="w-5 h-5 text-rose-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Detalhes do Log Sentry • {selectedEvent.id}
                      </h3>
                      <p className="text-[11px] text-slate-400">Capturado às {selectedEvent.timestamp}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="bg-rose-50 border border-rose-200 text-rose-950 p-3 rounded-2xl text-xs space-y-1">
                    <span className="font-extrabold block">Mensagem:</span>
                    <p className="font-mono text-[11px] leading-relaxed">{selectedEvent.message}</p>
                  </div>

                  {selectedEvent.stackTrace && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-700">Stack Trace Sentry:</span>
                      <pre className="bg-slate-950 text-slate-200 p-3 rounded-2xl font-mono text-[10px] overflow-x-auto max-h-40 whitespace-pre-wrap border border-slate-800">
                        {selectedEvent.stackTrace}
                      </pre>
                    </div>
                  )}

                  {selectedEvent.breadcrumbs && selectedEvent.breadcrumbs.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-700">Linha do Tempo de Breadcrumbs:</span>
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1 max-h-36 overflow-y-auto">
                        {selectedEvent.breadcrumbs.map((b, idx) => (
                          <div key={idx} className="text-[11px] flex items-center gap-2 font-mono text-slate-600 border-b border-slate-200/50 pb-1">
                            <span className="text-[10px] text-purple-700 font-bold">[{b.timestamp}]</span>
                            <span className="bg-purple-100 text-purple-900 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">{b.category}</span>
                            <span className="truncate">{b.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL TABLE */}
      {activeTab === 'audit' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Top Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                Logs Selecionados
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">{filteredLogs.length}</span>
                <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">
                  {selectedUserFilter === 'todos' ? 'Todos Usuários' : selectedUserFilter}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                Alterações de Medicamentos
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-800">
                  {logs.filter(l => l.category === 'medicamentos').length}
                </span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <Pill className="w-3 h-3" />
                  Rastreamento PEP
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                Visualização de Exames
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-blue-800">
                  {logs.filter(l => l.category === 'exames').length}
                </span>
                <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <Microscope className="w-3 h-3" />
                  Laudos PACS
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                Segurança & Criptografia
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-purple-950">100%</span>
                <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  SHA-256 Imutável
                </span>
              </div>
            </div>
          </div>

          {/* Main Table Container */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            {/* Header & Controls Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-100 pb-4 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-800" />
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Log de Auditoria Imutável de Ações em Prontuários
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rastreamento completo de modificações em medicamentos, laudos visualizados, receitas emitidas e acessos por usuário.
                </p>
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  title="Exportar dados filtrados em planilha CSV com codificação UTF-8"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exportar Log CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPdfReport}
                  className="bg-purple-900 hover:bg-purple-950 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  title="Imprimir relatório assinado pelo DPO"
                >
                  <Printer className="w-4 h-4" />
                  <span>Relatório Oficial DPO</span>
                </button>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                {/* User Filter Dropdown */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
                  <User className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span className="font-bold text-slate-600 shrink-0">Usuário:</span>
                  <select
                    value={selectedUserFilter}
                    onChange={(e) => setSelectedUserFilter(e.target.value)}
                    className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="todos">Todos os Usuários ({uniqueUsers.length})</option>
                    {uniqueUsers.map(usr => (
                      <option key={usr} value={usr}>{usr}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter Dropdown */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
                  <Filter className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span className="font-bold text-slate-600 shrink-0">Ação / Categoria:</span>
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="todas">Todas as Categoria de Ações</option>
                    <option value="medicamentos">💊 Alteração de Medicamentos</option>
                    <option value="exames">📑 Visualização de Exames (PACS)</option>
                    <option value="atestado">📜 Receita & Atestados (ICP)</option>
                    <option value="anamnese">🩺 Anamnese & Alergias</option>
                    <option value="prontuario">📂 Acesso ao Prontuário</option>
                    <option value="exportacao">📤 Exportação DLP</option>
                  </select>
                </div>
              </div>

              {/* Keyword Search Input */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar paciente, PEP, acao..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-medium"
                />
              </div>
            </div>

            {/* Audit Logs Table */}
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Info className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-xs font-bold text-slate-700">Nenhum log encontrado para o filtro selecionado</h3>
                <p className="text-[11px] text-slate-500">
                  Tente alterar o usuário ou categoria de ação selecionados no painel acima.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserFilter('todos');
                    setSelectedCategoryFilter('todas');
                    setSearchTerm('');
                  }}
                  className="mt-2 text-xs font-bold text-purple-800 hover:text-purple-950 underline cursor-pointer"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-3">Data / Hora</th>
                      <th className="py-3 px-3">Usuário / Perfil</th>
                      <th className="py-3 px-3">Categoria</th>
                      <th className="py-3 px-3">Ação no Prontuário</th>
                      <th className="py-3 px-3">Paciente & PEP</th>
                      <th className="py-3 px-3">IP / Criptografia</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Rastrear</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-purple-50/30 transition-colors group">
                        <td className="py-3.5 px-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                          {log.timestamp}
                        </td>

                        <td className="py-3.5 px-3">
                          <p className="font-extrabold text-slate-900 group-hover:text-purple-950 transition-colors">
                            {log.user}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">{log.role}</p>
                        </td>

                        <td className="py-3.5 px-3">
                          {renderCategoryBadge(log.category)}
                        </td>

                        <td className="py-3.5 px-3 max-w-xs">
                          <p className="font-extrabold text-slate-900">{log.action}</p>
                          {log.details && (
                            <p className="text-[11px] text-slate-500 truncate font-medium mt-0.5">
                              {log.details}
                            </p>
                          )}
                          {(log.previousValue || log.newValue) && (
                            <div className="flex items-center gap-1 text-[10px] text-purple-800 font-mono mt-1">
                              <span className="bg-purple-100 text-purple-900 px-1.5 py-0.2 rounded">
                                Contém modificação
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          <p className="font-bold text-purple-950">{log.patientName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{log.recordId}</p>
                        </td>

                        <td className="py-3.5 px-3 text-[11px] font-mono text-slate-600">
                          <div>{log.ipAddress}</div>
                          <span className="text-[10px] text-emerald-700 font-semibold">{log.encryptionMethod}</span>
                        </td>

                        <td className="py-3.5 px-3">
                          {log.status === 'Autorizado' ? (
                            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Autorizado
                            </span>
                          ) : log.status === 'Bloqueado' ? (
                            <span className="text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Bloqueado
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Alertado
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setInspectingLog(log)}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl text-xs font-bold border border-purple-200/80 inline-flex items-center gap-1 cursor-pointer transition-all hover:shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-700" />
                            <span>Detalhes</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Log Detailed Inspection Modal */}
          {inspectingLog && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-fadeIn">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-purple-800" />
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        Rastreamento da Ação no Prontuário • {inspectingLog.id}
                      </h3>
                      <p className="text-[11px] text-slate-500">Registrado às {inspectingLog.timestamp}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectingLog(null)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>

                {/* Patient & User Header Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Profissional / Usuário</span>
                    <span className="font-extrabold text-slate-900 block">{inspectingLog.user}</span>
                    <span className="text-[11px] text-purple-900">{inspectingLog.role}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Paciente Envolvido</span>
                    <span className="font-extrabold text-purple-950 block">{inspectingLog.patientName}</span>
                    <span className="text-[11px] font-mono text-slate-500">{inspectingLog.recordId}</span>
                  </div>
                </div>

                {/* Category & Status Row */}
                <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600">Categoria:</span>
                    {renderCategoryBadge(inspectingLog.category)}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600">Segurança:</span>
                    <span className="font-mono text-[11px] text-emerald-700 font-bold">
                      {inspectingLog.encryptionMethod}
                    </span>
                  </div>
                </div>

                {/* Action Details & Modificações (Diff) */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                    <span className="font-extrabold text-slate-900 block">Descrição / Ação Efetuada:</span>
                    <p className="text-slate-700 font-semibold leading-relaxed">{inspectingLog.action}</p>
                    {inspectingLog.details && (
                      <p className="text-slate-500 text-[11px] leading-relaxed pt-1 border-t border-slate-200/60 mt-1">
                        {inspectingLog.details}
                      </p>
                    )}
                  </div>

                  {/* Previous vs New Value Diff */}
                  {(inspectingLog.previousValue || inspectingLog.newValue) && (
                    <div className="space-y-2">
                      <span className="font-extrabold text-slate-900 text-xs block">
                        Histórico do Registro (Comparativo / Diff):
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                        <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-1">
                          <span className="text-[10px] font-extrabold text-rose-900 uppercase block">
                            🔴 Registro Anterior
                          </span>
                          <p className="font-mono text-rose-950 leading-relaxed font-medium">
                            {inspectingLog.previousValue || 'Nenhum registro anterior'}
                          </p>
                        </div>

                        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-1">
                          <span className="text-[10px] font-extrabold text-emerald-900 uppercase block">
                            🟢 Novo Registro Atualizado
                          </span>
                          <p className="font-mono text-emerald-950 leading-relaxed font-medium">
                            {inspectingLog.newValue || inspectingLog.action}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cryptographic Hash Verification */}
                  <div className="p-3 bg-purple-950 text-purple-100 rounded-2xl font-mono text-[10px] space-y-1">
                    <div className="flex items-center justify-between text-purple-300">
                      <span className="font-bold uppercase">Assinatura de Auditoria Imutável (SHA-256)</span>
                      <span className="text-emerald-400 font-bold">VÁLIDA</span>
                    </div>
                    <p className="break-all text-purple-200/90 font-mono">
                      8f9b231a4e7c012d99f81a209b552e1aef709b119284ca903b118a772c91a021
                    </p>
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`📄 Certificado de Auditoria #${inspectingLog.id} baixado em PDF.`);
                      setInspectingLog(null);
                    }}
                    className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Comprovante DPO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectingLog(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

