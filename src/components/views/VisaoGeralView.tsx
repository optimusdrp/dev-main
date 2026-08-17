import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  ArrowUpRight,
  Plus,
  X,
  Check,
  FileText,
  Stethoscope,
  ExternalLink,
  RefreshCw,
  Database,
  FileCheck,
  Activity,
  Sparkles,
  User,
  ShieldCheck,
  Info,
  Lock,
  Search,
  Wifi,
  WifiOff,
  HardDrive,
  Save
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import { TODAY_APPOINTMENTS, INITIAL_PATIENTS } from '../../data/mockData';
import { CRMTab } from '../../types';
import { apiService } from '../../services/api';

const MONTHLY_DATA = [
  { month: 'Dez/24', faturamento: 26000, agendamentos: 18, conversao: 20 },
  { month: 'Jan/25', faturamento: 32000, agendamentos: 22, conversao: 21 },
  { month: 'Fev/25', faturamento: 41000, agendamentos: 28, conversao: 25 },
  { month: 'Mar/25', faturamento: 52000, agendamentos: 35, conversao: 31 },
  { month: 'Abr/25', faturamento: 58000, agendamentos: 40, conversao: 28 },
  { month: 'Mai/25', faturamento: 68000, agendamentos: 45, conversao: 29 },
];

interface VisaoGeralViewProps {
  onOpenPatientChat?: (patientId: string) => void;
  onNavigateTab?: (tab: CRMTab) => void;
}

export const VisaoGeralView: React.FC<VisaoGeralViewProps> = ({
  onOpenPatientChat,
  onNavigateTab
}) => {
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [procedure, setProcedure] = useState('Consulta Inicial');
  const [appointmentTime, setAppointmentTime] = useState('14:00');
  const [appointmentsList, setAppointmentsList] = useState(TODAY_APPOINTMENTS);
  const [toast, setToast] = useState<string | null>(null);

  // Interactive EHR Calendar & Prontuário API State
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(23);
  const [selectedDayName, setSelectedDayName] = useState<string>('Sexta, 23/05 (Hoje)');
  const [activeEHRRecord, setActiveEHRRecord] = useState<any>(null);
  const [isEHRModalOpen, setIsEHRModalOpen] = useState<boolean>(false);
  const [isEHRFetching, setIsEHRFetching] = useState<boolean>(false);
  const [selectedAppInfo, setSelectedAppInfo] = useState<{ name: string; procedure: string; time: string } | null>(null);

  // Offline LocalStorage Persistence State
  const [isForceOffline, setIsForceOffline] = useState<boolean>(false);
  const [cachedEHRRecords, setCachedEHRRecords] = useState<any[]>(() => apiService.getAllCachedEHRRecords());

  const calendarDays = [
    { day: 19, name: 'Seg', fullDate: 'Segunda, 19/05', count: 4 },
    { day: 20, name: 'Ter', fullDate: 'Terça, 20/05', count: 6 },
    { day: 21, name: 'Qua', fullDate: 'Quarta, 21/05', count: 5 },
    { day: 22, name: 'Qui', fullDate: 'Quinta, 22/05', count: 8 },
    { day: 23, name: 'Sex', fullDate: 'Sexta, 23/05 (Hoje)', count: appointmentsList.length, isToday: true },
    { day: 24, name: 'Sáb', fullDate: 'Sábado, 24/05', count: 3 },
    { day: 25, name: 'Dom', fullDate: 'Domingo, 25/05', count: 0 },
  ];

  const handleOpenEHRRecord = async (patientId: string, patientName: string, procedureName: string, timeStr: string) => {
    setSelectedAppInfo({ name: patientName, procedure: procedureName, time: timeStr });
    setIsEHRFetching(true);
    setIsEHRModalOpen(true);

    try {
      const ehrRecord = await apiService.getEHRRecord(patientId || 'p1', isForceOffline);
      setActiveEHRRecord(ehrRecord);
      // Update local state of cached records
      setCachedEHRRecords(apiService.getAllCachedEHRRecords());
    } catch (err) {
      console.error(err);
    } finally {
      setIsEHRFetching(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateAppointment = () => {
    if (!patientName.trim()) return;
    const newApp = {
      id: `app_${Date.now()}`,
      time: appointmentTime,
      patientName: patientName,
      procedure: procedure,
      status: 'Confirmado' as const,
      duration: '30 min'
    };
    setAppointmentsList([newApp, ...appointmentsList]);
    setPatientName('');
    setIsNewAppointmentOpen(false);
    showToast(`Agendamento criado com sucesso para ${patientName}!`);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-[#f8f9fc] min-h-screen relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-purple-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-purple-700 flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
            Bom dia, <span className="text-purple-700">Juliana</span>
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-0.5">
            Aqui está o resumo do que acontece na sua clínica hoje.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <Calendar className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-semibold text-slate-700">
            23 de maio de 2025
          </span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Novos contatos */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('atendimentos')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> ↑ 20% vs. ontem
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium text-slate-500">Novos contatos</p>
            <p className="text-2xl font-black text-slate-900 mt-1">24</p>
          </div>
        </div>

        {/* Agendamentos */}
        <div
          onClick={() => setIsNewAppointmentOpen(true)}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> ↑ 15% vs. ontem
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium text-slate-500">Agendamentos</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{appointmentsList.length + 34}</p>
          </div>
        </div>

        {/* Conversões */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('jornadas')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Filter className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              ↑ 3 p.p. vs. ontem
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium text-slate-500">Conversões</p>
            <p className="text-2xl font-black text-slate-900 mt-1">18%</p>
          </div>
        </div>

        {/* Faturamentos hoje */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('indicadores')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> ↑ 12% vs. ontem
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium text-slate-500">Faturamentos hoje</p>
            <p className="text-2xl font-black text-slate-900 mt-1">R$ 12.840,00</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Funil + Agendamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funil de Atendimento (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900">Funil de atendimento</h2>
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('jornadas')}
              className="text-xs text-purple-700 font-bold bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Ver Funis em Jornadas →
            </button>
          </div>

          {/* Kanban Columns Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 overflow-x-auto">
            {/* Novo contato */}
            <div
              onClick={() => onNavigateTab && onNavigateTab('jornadas')}
              className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 min-w-[130px] cursor-pointer hover:bg-purple-50/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-900">Novo contato</span>
                <span className="text-[10px] font-extrabold bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded">34</span>
              </div>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] shadow-2xs">
                  <p className="font-bold text-slate-800">Ana Paula Silva</p>
                  <p className="text-slate-400 text-[10px]">Aparelho ortodôntico</p>
                  <span className="text-[9px] text-purple-600 mt-1 block">Hoje, 09:15</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] shadow-2xs">
                  <p className="font-bold text-slate-800">Carlos Eduardo</p>
                  <p className="text-slate-400 text-[10px]">Clareamento dental</p>
                  <span className="text-[9px] text-purple-600 mt-1 block">Hoje, 08:47</span>
                </div>
              </div>
            </div>

            {/* Qualificação */}
            <div
              onClick={() => onNavigateTab && onNavigateTab('jornadas')}
              className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 min-w-[130px] cursor-pointer hover:bg-purple-50/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-900">Qualificação</span>
                <span className="text-[10px] font-extrabold bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded">15</span>
              </div>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] shadow-2xs">
                  <p className="font-bold text-slate-800">Lucas Mendes</p>
                  <p className="text-slate-400 text-[10px]">Avaliação geral</p>
                  <span className="text-[9px] text-indigo-600 mt-1 block">Hoje, 08:30</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] shadow-2xs">
                  <p className="font-bold text-slate-800">Beatriz Oliveira</p>
                  <p className="text-slate-400 text-[10px]">Facetas porcelana</p>
                  <span className="text-[9px] text-indigo-600 mt-1 block">Ontem, 17:45</span>
                </div>
              </div>
            </div>

            {/* Proposta */}
            <div
              onClick={() => onNavigateTab && onNavigateTab('jornadas')}
              className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 min-w-[130px] cursor-pointer hover:bg-purple-50/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-900">Proposta</span>
                <span className="text-[10px] font-extrabold bg-cyan-200 text-cyan-800 px-1.5 py-0.5 rounded">10</span>
              </div>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] shadow-2xs">
                  <p className="font-bold text-slate-800">João Victor</p>
                  <p className="text-slate-400 text-[10px]">Implante dentário</p>
                  <span className="text-[9px] text-cyan-600 mt-1 block">Ontem, 15:10</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] shadow-2xs">
                  <p className="font-bold text-slate-800">Patricia Alves</p>
                  <p className="text-slate-400 text-[10px]">Aparelho ortodôntico</p>
                  <span className="text-[9px] text-cyan-600 mt-1 block">Ontem, 14:20</span>
                </div>
              </div>
            </div>

            {/* Agendado */}
            <div
              onClick={() => onNavigateTab && onNavigateTab('jornadas')}
              className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 min-w-[130px] cursor-pointer hover:bg-purple-50/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900">Agendado</span>
                <span className="text-[10px] font-extrabold bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">8</span>
              </div>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] shadow-2xs">
                  <p className="font-bold text-slate-800">Juliana Rocha</p>
                  <p className="text-slate-400 text-[10px]">Clareamento</p>
                  <span className="text-[9px] text-emerald-600 mt-1 block">Hoje, 10:00</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] shadow-2xs">
                  <p className="font-bold text-slate-800">Thiago Ferreira</p>
                  <p className="text-slate-400 text-[10px]">Implante dentário</p>
                  <span className="text-[9px] text-emerald-600 mt-1 block">Hoje, 10:30</span>
                </div>
              </div>
            </div>

            {/* Tratamento */}
            <div
              onClick={() => onNavigateTab && onNavigateTab('jornadas')}
              className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 min-w-[130px] cursor-pointer hover:bg-purple-50/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-900">Tratamento</span>
                <span className="text-[10px] font-extrabold bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded">14</span>
              </div>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] shadow-2xs">
                  <p className="font-bold text-slate-800">Gabriela Martins</p>
                  <p className="text-slate-400 text-[10px]">Ortodontia ativa</p>
                  <span className="text-[9px] text-purple-600 mt-1 block">Em tratamento</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] shadow-2xs">
                  <p className="font-bold text-slate-800">André Luiz</p>
                  <p className="text-slate-400 text-[10px]">Dentística</p>
                  <span className="text-[9px] text-purple-600 mt-1 block">Em tratamento</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agendamentos & Calendário com Integração de Prontuário Eletrônico (PEP via API) */}
        <div className="bg-white p-5 rounded-2xl border border-purple-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Header with Title & API Status Badge + Offline Simulation Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-700" />
                    Calendário de Agendamentos
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      const nextMode = !isForceOffline;
                      setIsForceOffline(nextMode);
                      showToast(nextMode ? '⚡ Falha de rede simulada: Sistema operando em Modo Offline (Cache Local)' : '🌐 Conexão restabelecida: Sincronização via API ativada');
                    }}
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 cursor-pointer transition-all ${
                      isForceOffline
                        ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {isForceOffline ? (
                      <>
                        <WifiOff className="w-3 h-3 text-amber-700" />
                        Modo Offline (Cache Local)
                      </>
                    ) : (
                      <>
                        <Wifi className="w-3 h-3 text-emerald-600" />
                        API PEP Conectada
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {selectedDayName}
                </p>
              </div>

              <button
                onClick={() => onNavigateTab && onNavigateTab('atendimentos')}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <span>Agenda</span> <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Interactive Day Tabs Navigation */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {calendarDays.map((cd) => (
                <button
                  key={cd.day}
                  type="button"
                  onClick={() => {
                    setSelectedCalendarDay(cd.day);
                    setSelectedDayName(cd.fullDate);
                    showToast(`Calendário alterado para ${cd.fullDate}`);
                  }}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-xl min-w-[42px] cursor-pointer transition-all border ${
                    selectedCalendarDay === cd.day
                      ? 'bg-purple-700 text-white border-purple-700 font-bold shadow-2xs scale-105'
                      : cd.isToday
                      ? 'bg-purple-50 text-purple-900 border-purple-200 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider">{cd.name}</span>
                  <span className="text-xs font-black font-mono">{cd.day}</span>
                  {cd.count > 0 && (
                    <span className={`text-[8px] px-1 rounded-full font-bold mt-0.5 ${
                      selectedCalendarDay === cd.day ? 'bg-purple-900 text-purple-200' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {cd.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Appointments List for Selected Day */}
            <div className="space-y-2.5 pt-1 max-h-[310px] overflow-y-auto pr-0.5">
              {appointmentsList.map((app, idx) => (
                <div
                  key={app.id}
                  className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-purple-50/60 border border-slate-200/80 transition-all flex flex-col space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="text-center bg-white border border-slate-200 px-2 py-1 rounded-lg shrink-0">
                        <span className="text-xs font-extrabold text-slate-900 font-mono block">
                          {app.time}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium block">
                          {app.duration}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 truncate flex items-center gap-1">
                          {app.patientName}
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                              app.status === 'Confirmado'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {app.status}
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-500 truncate font-medium">{app.procedure}</p>
                      </div>
                    </div>
                  </div>

                  {/* API Prontuário Sync & Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-[10px] text-purple-900 font-bold flex items-center gap-1">
                      <Database className="w-3 h-3 text-purple-600" />
                      {idx % 2 === 0 ? 'iClinic' : 'Feegow'} PEP
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenEHRRecord(`p${(idx % 4) + 1}`, app.patientName, app.procedure, app.time)}
                      className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <FileText className="w-3 h-3 text-purple-200" />
                      <span>Abrir Ficha Clínica (API)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Cached Records for Offline Access List */}
            {cachedEHRRecords.length > 0 && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/90 space-y-1.5 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-amber-600" />
                    Prontuários Salvos em Cache Local ({cachedEHRRecords.length})
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    LocalStorage
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {cachedEHRRecords.map((rec, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleOpenEHRRecord(rec.patientId || 'p1', rec.patientName, 'Consulta Geral', 'Offline')}
                      className="text-left bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 p-1.5 rounded-lg shrink-0 min-w-[120px] cursor-pointer transition-all shadow-2xs"
                    >
                      <p className="text-[10px] font-bold text-slate-900 truncate">{rec.patientName}</p>
                      <p className="text-[8.5px] text-slate-500 flex items-center gap-1 font-mono">
                        <Save className="w-2.5 h-2.5 text-amber-600" />
                        {rec.cachedAt || '10:00'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsNewAppointmentOpen(true)}
            className="w-full mt-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo agendamento no dia</span>
          </button>
        </div>
      </div>

      {/* Bottom Grid: Desempenho Mensal Chart + Conversas Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Desempenho mensal</h2>
              <p className="text-xs text-slate-400">
                Faturamento (R$), Agendamentos e Conversão (%)
              </p>
            </div>
            <select
              onChange={(e) => showToast(`Período do gráfico alterado para: ${e.target.value}`)}
              className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 font-medium text-slate-700 cursor-pointer"
            >
              <option>Últimos 6 meses</option>
              <option>Este ano (2025)</option>
            </select>
          </div>

          {/* Chart Container */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => `R$${val / 1000}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11px',
                  }}
                />
                <Bar yAxisId="left" dataKey="faturamento" fill="#7e22ce" radius={[6, 6, 0, 0]} name="Faturamento (R$)" />
                <Bar yAxisId="left" dataKey="agendamentos" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Agendamentos" />
                <Line yAxisId="right" type="monotone" dataKey="conversao" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} name="Conversão (%)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversas Recentes (1 Col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Conversas recentes</h2>
            <button
              onClick={() => onNavigateTab && onNavigateTab('atendimentos')}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {INITIAL_PATIENTS.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => onOpenPatientChat ? onOpenPatientChat(p.id) : (onNavigateTab && onNavigateTab('atendimentos'))}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-50/50 transition-colors cursor-pointer border border-transparent hover:border-purple-200"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center shrink-0">
                    {p.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{p.lastMessage}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-[10px] text-slate-400 block">{p.lastMessageTime}</span>
                  {p.unreadCount && p.unreadCount > 0 ? (
                    <span className="text-[9px] bg-purple-700 text-white font-bold w-4 h-4 rounded-full flex items-center justify-center ml-auto mt-0.5">
                      {p.unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Appointment Modal */}
      {isNewAppointmentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Novo Agendamento na Agenda
              </h3>
              <button
                onClick={() => setIsNewAppointmentOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nome do Paciente
                </label>
                <input
                  type="text"
                  placeholder="Ex: Amanda Guimarães"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Procedimento / Especialidade
                </label>
                <select
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                >
                  <option>Consulta Inicial</option>
                  <option>Ecocardiograma</option>
                  <option>Avaliação Estética</option>
                  <option>Revisão de Exames</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Horário
                </label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setIsNewAppointmentOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAppointment}
                className="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-xs"
              >
                Confirmar Agendamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EHR Record Modal (Ficha Clínica de Paciente Agendado via API REST Sync) */}
      {isEHRModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-purple-200 space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    Ficha Clínica / PEP Eletrônico
                    <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md border border-purple-200">
                      API Sync
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Sincronização em tempo real com o sistema de prontuários
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEHRModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {isEHRFetching ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  Consultando API REST de Prontuário Eletrônico (PEP)...
                </p>
                <p className="text-[11px] text-slate-400">
                  Carregando ficha de {selectedAppInfo?.name || 'paciente'}...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status Bar (Cloud Sync vs LocalStorage Offline Cache) */}
                {activeEHRRecord?.isOfflineCache || isForceOffline ? (
                  <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-3 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center space-x-2.5">
                      <HardDrive className="w-5 h-5 text-amber-700 shrink-0 animate-pulse" />
                      <div>
                        <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          Ficha Carregada do Cache Local (Offline)
                          <span className="text-[9px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.2 rounded font-mono">
                            LocalStorage
                          </span>
                        </p>
                        <p className="text-[10px] text-amber-800">
                          Salvo localmente em: {activeEHRRecord?.cachedAt || activeEHRRecord?.syncedAt || 'Hoje'} • Acesso garantido sem internet
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-white text-amber-900 px-2.5 py-1 rounded-xl border border-amber-200 shrink-0 flex items-center gap-1">
                      <Save className="w-3 h-3 text-amber-600" />
                      Offline
                    </span>
                  </div>
                ) : (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-emerald-900">
                          {activeEHRRecord?.status || 'Ficha clínica sincronizada com sucesso'}
                        </p>
                        <p className="text-[10px] text-emerald-700">
                          Sincronizado via API • Cópia salva no Cache Local (LocalStorage) para acesso offline
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-xl shadow-2xs border border-emerald-200 shrink-0 flex items-center gap-1">
                      <Save className="w-3 h-3 text-emerald-600" />
                      Salvo
                    </span>
                  </div>
                )}

                {/* Patient Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Paciente Agendado</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5">{selectedAppInfo?.name || activeEHRRecord?.patientName}</p>
                    <p className="text-[10px] font-semibold text-purple-700 mt-1">{selectedAppInfo?.procedure}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Convênio / Plano</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{activeEHRRecord?.insurance || 'Bradesco Saúde'}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Horário: <span className="font-bold text-slate-800">{selectedAppInfo?.time || '10:00'}</span></p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Identificação / CPF</p>
                    <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">{activeEHRRecord?.cpf || '321.654.987-00'}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Status: <span className="font-bold text-emerald-600">Confirmado</span></p>
                  </div>
                </div>

                {/* Anamnese & Clinical Summary Box */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-600" />
                      Histórico Clínico & Anamnese Recente
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Extraído via API Rest</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">
                    {activeEHRRecord?.summary || 'Anamnese preenchida. Sem restrições medicamentosas conhecidas. Histórico de exames gerais em dia e documentação TISS validada.'}
                  </p>
                </div>

                {/* Patient Checklist Steps */}
                <div className="border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">Checklist de Liberação para Atendimento</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 bg-emerald-50/50 p-2 rounded-xl text-emerald-900 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Elegibilidade TISS confirmada</span>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50/50 p-2 rounded-xl text-emerald-900 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Prontuário Unificado PEP</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsEHRModalOpen(false);
                  if (onOpenPatientChat) onOpenPatientChat('p1');
                }}
                className="w-full sm:w-auto bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span>Abrir Chat com Paciente</span>
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    showToast('Guia TISS e Ficha Clínica enviadas para impressão!');
                  }}
                  className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Imprimir Guia
                </button>
                <button
                  type="button"
                  onClick={() => setIsEHRModalOpen(false)}
                  className="flex-1 sm:flex-none bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

