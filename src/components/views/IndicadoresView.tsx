import React, { useState, useMemo } from 'react';
import {
  Download,
  Filter,
  Clock,
  Percent,
  DollarSign,
  Check,
  BarChart3,
  Calendar,
  Sparkles,
  Zap,
  ArrowDownRight,
  ArrowUpRight,
  MessageSquare,
  Bot,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  ShieldCheck,
  Activity,
  Calculator,
  Coins,
  Wallet,
  PiggyBank,
  Smile,
  Frown,
  Meh,
  Heart,
  SmilePlus,
  ThumbsUp,
  Play,
  RefreshCw,
  FileText,
  Users,
  Flame,
  UserCheck,
  Sunrise,
  Sunset
} from 'lucide-react';
import { apiService } from '../../services/api';
import { LeadInquiriesStaffingReport } from '../LeadInquiriesStaffingReport';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Legend,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// 30 Days mock performance data
const DAILY_30DAYS_DATA = [
  { date: '15/Jul', fullDate: '15 de Julho', volume: 28, tempoResposta: 14.2, atendimentosIa: 12, agendamentos: 11 },
  { date: '16/Jul', fullDate: '16 de Julho', volume: 34, tempoResposta: 12.8, atendimentosIa: 15, agendamentos: 14 },
  { date: '17/Jul', fullDate: '17 de Julho', volume: 39, tempoResposta: 11.5, atendimentosIa: 19, agendamentos: 16 },
  { date: '18/Jul', fullDate: '18 de Julho', volume: 42, tempoResposta: 10.2, atendimentosIa: 22, agendamentos: 18 },
  { date: '19/Jul', fullDate: '19 de Julho', volume: 31, tempoResposta: 13.0, atendimentosIa: 14, agendamentos: 12 },
  { date: '20/Jul', fullDate: '20 de Julho', volume: 18, tempoResposta: 16.5, atendimentosIa: 8, agendamentos: 5 },
  { date: '21/Jul', fullDate: '21 de Julho', volume: 15, tempoResposta: 18.0, atendimentosIa: 7, agendamentos: 4 },
  { date: '22/Jul', fullDate: '22 de Julho', volume: 45, tempoResposta: 12.1, atendimentosIa: 24, agendamentos: 19 },
  { date: '23/Jul', fullDate: '23 de Julho', volume: 48, tempoResposta: 11.0, atendimentosIa: 26, agendamentos: 21 },
  { date: '24/Jul', fullDate: '24 de Julho', volume: 52, tempoResposta: 9.8, atendimentosIa: 30, agendamentos: 23 },
  { date: '25/Jul', fullDate: '25 de Julho', volume: 50, tempoResposta: 9.5, atendimentosIa: 28, agendamentos: 22 },
  { date: '26/Jul', fullDate: '26 de Julho', volume: 38, tempoResposta: 11.2, atendimentosIa: 18, agendamentos: 15 },
  { date: '27/Jul', fullDate: '27 de Julho', volume: 22, tempoResposta: 15.0, atendimentosIa: 10, agendamentos: 8 },
  { date: '28/Jul', fullDate: '28 de Julho', volume: 19, tempoResposta: 17.2, atendimentosIa: 9, agendamentos: 6 },
  { date: '29/Jul', fullDate: '29 de Julho', volume: 47, tempoResposta: 10.8, atendimentosIa: 25, agendamentos: 20 },
  { date: '30/Jul', fullDate: '30 de Julho', volume: 51, tempoResposta: 9.2, atendimentosIa: 29, agendamentos: 22 },
  { date: '31/Jul', fullDate: '31 de Julho', volume: 56, tempoResposta: 8.5, atendimentosIa: 33, agendamentos: 26 },
  { date: '01/Ago', fullDate: '01 de Agosto', volume: 58, tempoResposta: 8.0, atendimentosIa: 35, agendamentos: 27 },
  { date: '02/Ago', fullDate: '02 de Agosto', volume: 43, tempoResposta: 10.4, atendimentosIa: 21, agendamentos: 18 },
  { date: '03/Ago', fullDate: '03 de Agosto', volume: 24, tempoResposta: 14.8, atendimentosIa: 11, agendamentos: 9 },
  { date: '04/Ago', fullDate: '04 de Agosto', volume: 21, tempoResposta: 16.1, atendimentosIa: 10, agendamentos: 7 },
  { date: '05/Ago', fullDate: '05 de Agosto', volume: 61, tempoResposta: 7.8, atendimentosIa: 38, agendamentos: 29 },
  { date: '06/Ago', fullDate: '06 de Agosto', volume: 64, tempoResposta: 7.2, atendimentosIa: 40, agendamentos: 31 },
  { date: '07/Ago', fullDate: '07 de Agosto', volume: 62, tempoResposta: 7.5, atendimentosIa: 39, agendamentos: 30 },
  { date: '08/Ago', fullDate: '08 de Agosto', volume: 59, tempoResposta: 8.1, atendimentosIa: 36, agendamentos: 28 },
  { date: '09/Ago', fullDate: '09 de Agosto', volume: 41, tempoResposta: 11.0, atendimentosIa: 20, agendamentos: 17 },
  { date: '10/Ago', fullDate: '10 de Agosto', volume: 25, tempoResposta: 15.2, atendimentosIa: 12, agendamentos: 10 },
  { date: '11/Ago', fullDate: '11 de Agosto', volume: 66, tempoResposta: 6.9, atendimentosIa: 42, agendamentos: 32 },
  { date: '12/Ago', fullDate: '12 de Agosto', volume: 68, tempoResposta: 6.5, atendimentosIa: 44, agendamentos: 34 },
  { date: '13/Ago', fullDate: '13 de Agosto', volume: 72, tempoResposta: 6.1, atendimentosIa: 47, agendamentos: 36 },
];

const HOURLY_RESPONSE_TIME = [
  { hora: '08:00', volume: 18, tempoResposta: 5.2 },
  { hora: '10:00', volume: 42, tempoResposta: 8.5 },
  { hora: '12:00', volume: 31, tempoResposta: 12.1 },
  { hora: '14:00', volume: 55, tempoResposta: 9.4 },
  { hora: '16:00', volume: 48, tempoResposta: 7.8 },
  { hora: '18:00', volume: 26, tempoResposta: 6.0 },
  { hora: '20:00', volume: 14, tempoResposta: 4.8 },
];

// Taxa de Sucesso das Automações de IA por Categoria
const AI_AUTOMATION_SUCCESS_DATA = [
  { categoria: 'Agendamento e Encaixe', resolvidasIa: 420, transbordoHumano: 8, taxaSucesso: 98.1 },
  { categoria: 'Preparo de Exames/Guias', resolvidasIa: 380, transbordoHumano: 2, taxaSucesso: 99.5 },
  { categoria: 'Triagem Pós-Cirúrgica', resolvidasIa: 215, transbordoHumano: 8, taxaSucesso: 96.4 },
  { categoria: 'Dúvidas de Posologia', resolvidasIa: 185, transbordoHumano: 14, taxaSucesso: 93.0 },
  { categoria: 'Consultas de Convênio', resolvidasIa: 160, transbordoHumano: 18, taxaSucesso: 89.9 },
  { categoria: 'Laudos e Resultados', resolvidasIa: 290, transbordoHumano: 6, taxaSucesso: 98.0 },
];

// Tempo Médio de Resposta por Categoria de Atendimento (Comparativo Com IA vs Sem IA)
const RESPONSE_TIME_BY_CATEGORY_DATA = [
  { categoria: 'Urgência Pós-Cirúrgica', tempoComIA: 0.8, tempoSemIA: 18.5, reducao: '95.6%' },
  { categoria: 'Dúvidas de Posologia', tempoComIA: 1.2, tempoSemIA: 22.0, reducao: '94.5%' },
  { categoria: 'Agendamentos', tempoComIA: 0.5, tempoSemIA: 12.4, reducao: '96.0%' },
  { categoria: 'Autorização Convênio', tempoComIA: 2.1, tempoSemIA: 35.0, reducao: '94.0%' },
  { categoria: 'Laudos/Resultados', tempoComIA: 0.9, tempoSemIA: 15.2, reducao: '94.1%' },
  { categoria: 'Informações Gerais', tempoComIA: 0.4, tempoSemIA: 8.5, reducao: '95.3%' },
];

// Evolução Histórica de Sentimento do Paciente nos Atendimentos de IA
const SENTIMENT_EVOLUTION_DATA = [
  { data: '15/Jul', scoreMedia: 72, satisfeitoPct: 75, neutroPct: 18, frustradoPct: 7, reversaoPct: 88 },
  { data: '18/Jul', scoreMedia: 75, satisfeitoPct: 78, neutroPct: 16, frustradoPct: 6, reversaoPct: 90 },
  { data: '21/Jul', scoreMedia: 78, satisfeitoPct: 80, neutroPct: 14, frustradoPct: 6, reversaoPct: 91 },
  { data: '24/Jul', scoreMedia: 81, satisfeitoPct: 82, neutroPct: 13, frustradoPct: 5, reversaoPct: 92 },
  { data: '27/Jul', scoreMedia: 84, satisfeitoPct: 85, neutroPct: 11, frustradoPct: 4, reversaoPct: 93 },
  { data: '30/Jul', scoreMedia: 86, satisfeitoPct: 87, neutroPct: 9, frustradoPct: 4, reversaoPct: 94 },
  { data: '02/Ago', scoreMedia: 88, satisfeitoPct: 89, neutroPct: 8, frustradoPct: 3, reversaoPct: 95 },
  { data: '05/Ago', scoreMedia: 90, satisfeitoPct: 91, neutroPct: 7, frustradoPct: 2, reversaoPct: 96 },
  { data: '08/Ago', scoreMedia: 89, satisfeitoPct: 90, neutroPct: 8, frustradoPct: 2, reversaoPct: 95 },
  { data: '11/Ago', scoreMedia: 92, satisfeitoPct: 93, neutroPct: 5, frustradoPct: 2, reversaoPct: 97 },
  { data: '13/Ago', scoreMedia: 94, satisfeitoPct: 95, neutroPct: 4, frustradoPct: 1, reversaoPct: 98 },
];

// Amostras de conversas para classificação de sentimento em tempo real via Gemini API
const PATIENT_CHAT_SAMPLES = [
  {
    id: 'sample_1',
    patientName: 'Ana Luíza Vasconcelos',
    summary: 'Atraso na liberação de guia TISS para ressonância',
    messages: [
      { sender: 'paciente', text: 'Boa tarde! Estou há 2 horas esperando a liberação da guia do meu exame de ressonância!', time: '14:00' },
      { sender: 'ia', text: 'Olá Ana Luíza! Peço desculpas pela espera. Estou consultando o portal do convênio Bradesco agora mesmo para acelerar sua autorização.', time: '14:01' },
      { sender: 'paciente', text: 'Espero que não cancelem, o exame é amanhã cedo!', time: '14:02' },
      { sender: 'ia', text: 'Notícia excelente: a guia acaba de ser autorizada no sistema! Já enviei o comprovante em PDF aqui no seu WhatsApp.', time: '14:03' },
      { sender: 'paciente', text: 'Nossa, que alívio! Muito obrigada pela agilidade e pelo carinho!', time: '14:04' }
    ]
  },
  {
    id: 'sample_2',
    patientName: 'Carlos Eduardo',
    summary: 'Dúvida de preparo e jejum de exame ultrassom',
    messages: [
      { sender: 'paciente', text: 'Olá, preciso saber se posso tomar água antes do ultrassom abdominal de amanhã.', time: '08:15' },
      { sender: 'ia', text: 'Bom dia Carlos! Para o ultrassom abdominal total, é necessário jejum de 8 horas, mas você deve tomar 4 copos de água 1 hora antes do exame.', time: '08:16' },
      { sender: 'paciente', text: 'Entendi perfeitamente. Posso tomar meus remédios contínuos de manhã?', time: '08:17' },
      { sender: 'ia', text: 'Sim, pode tomar com um pequeno gole de água. Quer que eu envie o lembrete de preparo por SMS?', time: '08:18' },
      { sender: 'paciente', text: 'Por favor! Muito explicativo e rápido, parabéns!', time: '08:19' }
    ]
  },
  {
    id: 'sample_3',
    patientName: 'Mariana Silva',
    summary: 'Reagendamento de emergência de consulta médica',
    messages: [
      { sender: 'paciente', text: 'Preciso cancelar minha consulta de hoje com a Dra. Helena, tive um imprevisto grave!', time: '10:30' },
      { sender: 'ia', text: 'Compreendo perfeitamente Mariana. Já cancelei a sessão de hoje para não gerar cobrança. Quer encaixar para esta quinta-feira às 15h?', time: '10:31' },
      { sender: 'paciente', text: 'Quinta às 15h seria perfeito!', time: '10:32' },
      { sender: 'ia', text: 'Reagendado com sucesso para Quinta-feira 15:00 com a Dra. Helena Martins.', time: '10:33' },
      { sender: 'paciente', text: 'Sensacional, atendimento nota 10!', time: '10:34' }
    ]
  }
];

export const IndicadoresView: React.FC = () => {
  const [activeIndicadoresTab, setActiveIndicadoresTab] = useState<'geral' | 'staffing' | 'ia_roi' | 'todos'>('geral');
  const [period, setPeriod] = useState<'30' | '14' | '7'>('30');
  const [unit, setUnit] = useState('Todas as unidades');
  const [channel, setChannel] = useState('Todos os canais');
  const [chartView, setChartView] = useState<'combined' | 'volume' | 'time'>('combined');
  const [toast, setToast] = useState<string | null>(null);

  // Projeção de Economia Financeira (Calculadora de ROI da IA) State
  const [hourlyRate, setHourlyRate] = useState<number>(35); // R$ 35,00/hora
  const [minutesSavedPerService, setMinutesSavedPerService] = useState<number>(15); // 15 min salvos/atendimento
  const platformMonthlyCost = 890; // R$ 890,00 custo licença IA

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = () => {
    showToast('Relatório Gerencial (PDF / CSV) gerado com sucesso!');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Filter data according to selected period
  const filteredData = useMemo(() => {
    const days = parseInt(period, 10);
    return DAILY_30DAYS_DATA.slice(-days);
  }, [period]);

  // Dynamic calculated KPIs
  const totalVolume = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.volume, 0);
  }, [filteredData]);

  const avgTempoResposta = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const sum = filteredData.reduce((acc, curr) => acc + curr.tempoResposta, 0);
    return (sum / filteredData.length).toFixed(1);
  }, [filteredData]);

  const totalIaAutomated = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.atendimentosIa, 0);
  }, [filteredData]);

  const totalAgendamentos = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.agendamentos, 0);
  }, [filteredData]);

  // Computes daily and cumulative savings based on actual AI automated interactions and hourly rate
  const savingsProjectionData = useMemo(() => {
    let cumulative = 0;
    return filteredData.map((item) => {
      const iaCount = item.atendimentosIa || 0;
      const hoursSaved = (iaCount * minutesSavedPerService) / 60;
      const dailySavings = hoursSaved * hourlyRate;
      cumulative += dailySavings;

      return {
        date: item.date,
        fullDate: item.fullDate,
        atendimentosIa: iaCount,
        horasEconomizadas: parseFloat(hoursSaved.toFixed(1)),
        economiaDia: parseFloat(dailySavings.toFixed(2)),
        economiaAcumulada: parseFloat(cumulative.toFixed(2)),
      };
    });
  }, [filteredData, hourlyRate, minutesSavedPerService]);

  const totalHoursSaved = useMemo(() => {
    return savingsProjectionData.reduce((acc, curr) => acc + curr.horasEconomizadas, 0);
  }, [savingsProjectionData]);

  const totalFinancialSavings = useMemo(() => {
    return savingsProjectionData.reduce((acc, curr) => acc + curr.economiaDia, 0);
  }, [savingsProjectionData]);

  const projectedRoiPercentage = useMemo(() => {
    if (platformMonthlyCost <= 0) return 0;
    const netSavings = totalFinancialSavings - platformMonthlyCost;
    return Math.max(0, Math.round((netSavings / platformMonthlyCost) * 100));
  }, [totalFinancialSavings, platformMonthlyCost]);

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 backdrop-blur-md">
          <p className="font-extrabold text-purple-300 border-b border-slate-700 pb-1 flex items-center justify-between gap-4">
            <span>{dataPoint.fullDate || label}</span>
            <span className="text-[10px] text-slate-400 font-normal">MediFlux Analytics</span>
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4 text-emerald-300 font-bold">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Volume de Atendimentos:
              </span>
              <span>{dataPoint.volume} pacientes</span>
            </div>

            <div className="flex items-center justify-between gap-4 text-amber-300 font-bold">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Tempo Médio de Resposta:
              </span>
              <span>{dataPoint.tempoResposta} min</span>
            </div>

            {dataPoint.atendimentosIa !== undefined && (
              <div className="flex items-center justify-between gap-4 text-purple-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                  Triados por IA:
                </span>
                <span>{dataPoint.atendimentosIa} ({Math.round((dataPoint.atendimentosIa / dataPoint.volume) * 100)}%)</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
              Indicadores & Métricas de Atendimento
            </h1>
            <span className="text-[10px] font-extrabold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Recharts Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Análise temporal detalhada de volume de demandas, picos de atendimento e dimensionamento de equipe da clínica.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="bg-white border border-slate-200 hover:bg-purple-50 hover:border-purple-300 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-purple-700" />
          <span>Exportar Relatório em PDF</span>
        </button>
      </div>

      {/* Sub-Tabs Selector for Indicadores Sections */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setActiveIndicadoresTab('geral')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeIndicadoresTab === 'geral'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Visão Geral & Volume</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveIndicadoresTab('staffing')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
            activeIndicadoresTab === 'staffing'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Picos de Demanda & Dimensionamento de Equipe</span>
          <span className="text-[9px] font-black bg-amber-400 text-purple-950 px-1.5 py-0.2 rounded-full uppercase tracking-tight">
            NOVO
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveIndicadoresTab('ia_roi')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeIndicadoresTab === 'ia_roi'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
          }`}
        >
          <Coins className="w-4 h-4 text-emerald-500" />
          <span>Automação IA & ROI Financeiro</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveIndicadoresTab('todos')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeIndicadoresTab === 'todos'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Ver Todos os Painéis</span>
        </button>
      </div>

      {/* Subheader Filters Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">
              PAINEL OPERACIONAL DA CLÍNICA
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Desempenho dos Últimos {period} Dias
            </h2>
          </div>

          {/* Period Quick Selector */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto border border-slate-200/70">
            <button
              onClick={() => setPeriod('30')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === '30'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Últimos 30 Dias
            </button>
            <button
              onClick={() => setPeriod('14')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === '14'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 Dias
            </button>
            <button
              onClick={() => setPeriod('7')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === '7'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Dias
            </button>
          </div>
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold mr-1">
            <Filter className="w-3.5 h-3.5 text-purple-700" />
            <span>Filtros:</span>
          </div>

          <select
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value);
              showToast(`Unidade alterada para: ${e.target.value}`);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          >
            <option>Todas as unidades</option>
            <option>Unidade Jardins</option>
            <option>Unidade Moema</option>
          </select>

          <select
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value);
              showToast(`Canal alterado para: ${e.target.value}`);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          >
            <option>Todos os canais</option>
            <option>WhatsApp</option>
            <option>Instagram</option>
            <option>Telegram</option>
          </select>
        </div>
      </div>

      {/* SECTION 1: VISÃO GERAL & VOLUME (KPIs, Gráfico Principal, Tempo por Horário e Canais) */}
      {(activeIndicadoresTab === 'geral' || activeIndicadoresTab === 'todos') && (
        <>
          {/* Top 4 KPI Row (Dynamically computed from period data) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Volume Total */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Volume de Atendimentos</span>
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{totalVolume} <span className="text-xs font-normal text-slate-500">atendimentos</span></p>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 mt-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+18.4% vs. período anterior</span>
                </div>
              </div>
            </div>

            {/* KPI 2: Tempo Médio de Resposta */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Tempo Médio de Resposta</span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{avgTempoResposta} <span className="text-xs font-normal text-slate-500">minutos</span></p>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 mt-0.5">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>-32% (Redução com IA)</span>
                </div>
              </div>
            </div>

            {/* KPI 3: Atendimentos Resolvidos por IA */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Resolução por Agente IA</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{totalIaAutomated} <span className="text-xs font-normal text-slate-500">pacientes</span></p>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>{Math.round((totalIaAutomated / (totalVolume || 1)) * 100)}% de automação direta</span>
                </div>
              </div>
            </div>

            {/* KPI 4: Consultas Agendadas */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Consultas Agendadas</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{totalAgendamentos} <span className="text-xs font-normal text-slate-500">confirmados</span></p>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 mt-0.5">
                  <Percent className="w-3.5 h-3.5" />
                  <span>{Math.round((totalAgendamentos / (totalVolume || 1)) * 100)}% de taxa de conversão</span>
                </div>
              </div>
            </div>
          </div>

      {/* MAIN RECHARTS CHART: Volume de Atendimentos & Tempo Médio de Resposta */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-700" />
              <span>Evolução do Volume e Tempo de Resposta ({period} dias)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Barras roxas indicam volume de atendimentos / Linha âmbar representa o tempo médio de resposta (minutos)
            </p>
          </div>

          {/* Chart Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto border border-slate-200/80">
            <button
              onClick={() => setChartView('combined')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartView === 'combined'
                  ? 'bg-white text-purple-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visão Combinada
            </button>
            <button
              onClick={() => setChartView('volume')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartView === 'volume'
                  ? 'bg-white text-purple-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Apenas Volume
            </button>
            <button
              onClick={() => setChartView('time')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartView === 'time'
                  ? 'bg-white text-purple-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Apenas Tempo
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              />

              {/* Y-Axis Left for Volume */}
              {(chartView === 'combined' || chartView === 'volume') && (
                <YAxis
                  yAxisId="volumeAxis"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#6b21a8', fontWeight: 700 }}
                  label={{ value: 'Volume', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#6b21a8' } }}
                />
              )}

              {/* Y-Axis Right for Response Time */}
              {(chartView === 'combined' || chartView === 'time') && (
                <YAxis
                  yAxisId="timeAxis"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#d97706', fontWeight: 700 }}
                  tickFormatter={(val) => `${val}m`}
                  label={{ value: 'Tempo (min)', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#d97706' } }}
                />
              )}

              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />

              {/* Volume Bars */}
              {(chartView === 'combined' || chartView === 'volume') && (
                <Bar
                  yAxisId="volumeAxis"
                  dataKey="volume"
                  name="Volume de Atendimentos"
                  fill="#7e22ce"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              )}

              {/* AI Auto-handled Volume Area Overlay */}
              {chartView === 'combined' && (
                <Bar
                  yAxisId="volumeAxis"
                  dataKey="atendimentosIa"
                  name="Triados por IA"
                  fill="#c084fc"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              )}

              {/* Tempo de Resposta Line */}
              {(chartView === 'combined' || chartView === 'time') && (
                <Line
                  yAxisId={chartView === 'time' ? 'timeAxis' : 'timeAxis'}
                  type="monotone"
                  dataKey="tempoResposta"
                  name="Tempo Médio de Resposta (min)"
                  stroke="#d97706"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#d97706', strokeWidth: 1, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#b45309' }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid 2 Secondary Charts: Conversão por Canal & Tempo de Resposta por Horário */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Tempo Médio de Resposta por Horário do Dia */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Tempo de Resposta por Horário do Dia</span>
              </h3>
              <p className="text-xs text-slate-400">Identificação de picos de espera na clínica</p>
            </div>
            <span className="text-xs text-amber-700 font-extrabold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
              Pico às 12:00
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_RESPONSE_TIME} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hora" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val}m`} />
                <Tooltip
                  formatter={(value: any) => [`${value} minutos`, 'Tempo de Resposta']}
                  labelFormatter={(label) => `Faixa Horária: ${label}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="tempoResposta" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Tempo de Resposta (min)">
                  {HOURLY_RESPONSE_TIME.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.tempoResposta > 10 ? '#ef4444' : entry.tempoResposta > 7 ? '#f59e0b' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversão por canal */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-700" />
              <span>Taxa de Conversão de Atendimento por Canal</span>
            </h3>
            <span className="text-xs text-slate-400">Últimos 30 dias</span>
          </div>

          <div className="space-y-4 text-xs font-semibold pt-1">
            {/* WhatsApp */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-800 font-bold">WhatsApp Business</span>
                <span className="text-purple-700 font-extrabold">76% (482/634)</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-700 rounded-full" style={{ width: '76%' }} />
              </div>
            </div>

            {/* Telegram */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-800 font-bold">Telegram Bot</span>
                <span className="text-purple-700 font-extrabold">52% (140/269)</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '52%' }} />
              </div>
            </div>

            {/* Instagram Direct */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-800 font-bold">Instagram Direct</span>
                <span className="text-purple-700 font-extrabold">39% (98/251)</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: '39%' }} />
              </div>
            </div>

            {/* Site / Portal */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-800 font-bold">Portal da Clínica (Site)</span>
                <span className="text-purple-700 font-extrabold">64% (102/159)</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '64%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staffing Quick Recommendation Banner (shown in General view) */}
      {activeIndicadoresTab === 'geral' && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 rounded-3xl border border-purple-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <Flame className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-amber-400 text-purple-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Novo Painel Estratégico
                </span>
                <span className="text-xs text-purple-300 font-medium">Dimensionamento de Equipe</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                Heatmap de Picos de Pacientes & Otimizador de Escalas
              </h3>
              <p className="text-xs text-slate-300">
                Identifique horários críticos (10h-12h e 14h-16h) e reduza o abandono de leads com alocação inteligente da equipe.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveIndicadoresTab('staffing')}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Ver Análise de Dimensionamento</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  )}

  {/* SECTION 2: PAINEL DEDICADO DE PICOS DE DEMANDA & DIMENSIONAMENTO DE EQUIPE */}
  {(activeIndicadoresTab === 'staffing' || activeIndicadoresTab === 'todos') && (
    <LeadInquiriesStaffingReport />
  )}

  {/* SECTION 3: PAINEL RECHARTS DE PERFORMANCE DE IA & PROJEÇÃO DE ROI */}
  {(activeIndicadoresTab === 'ia_roi' || activeIndicadoresTab === 'todos') && (
    <>
      {/* SECTION 3: PAINEL RECHARTS DE PERFORMANCE DE IA & AUTOMACÕES POR CATEGORIA */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-5 lg:p-6 rounded-3xl shadow-xl border border-slate-800 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Métricas de Inteligência Artificial
              </span>
              <span className="text-[10px] font-extrabold bg-purple-800 text-purple-200 px-2 py-0.5 rounded-full">
                Gemini 3.6 Engine
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-1 flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              Taxa de Sucesso & Tempo de Resposta por Categoria
            </h2>
            <p className="text-xs text-slate-300">
              Mapeamento de efetividade da triagem autônoma de IA e redução no tempo de espera do paciente.
            </p>
          </div>

          {/* Quick Summary Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>95.8% Sucesso Autônomo</span>
            </div>
            <div className="bg-purple-500/15 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>18.4 min economizados/atendimento</span>
            </div>
          </div>
        </div>

        {/* 2-Column Recharts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CHART 1: Taxa de Sucesso das Automações de IA por Categoria */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-xs font-extrabold text-purple-200 flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Taxa de Sucesso da IA por Categoria (%)
                </h3>
                <p className="text-[11px] text-slate-400">Pacientes atendidos sem necessidade de intervenção humana</p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                Meta: &gt;90%
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={AI_AUTOMATION_SUCCESS_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="categoria" type="category" tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 600 }} width={120} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-700 text-xs text-white space-y-1 shadow-2xl">
                            <p className="font-extrabold text-purple-300 border-b border-slate-800 pb-1">{data.categoria}</p>
                            <p className="text-emerald-400 font-bold">Taxa de Sucesso: {data.taxaSucesso}%</p>
                            <p className="text-slate-300 text-[11px]">Resolvidos por IA: {data.resolvidasIa} atendimentos</p>
                            <p className="text-amber-300 text-[11px]">Transbordo Humano: {data.transbordoHumano} casos</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="taxaSucesso" fill="#10b981" radius={[0, 6, 6, 0]} name="Taxa de Sucesso (%)">
                    {AI_AUTOMATION_SUCCESS_DATA.map((entry, index) => (
                      <Cell
                        key={`success-cell-${index}`}
                        fill={entry.taxaSucesso > 95 ? '#10b981' : entry.taxaSucesso > 90 ? '#a855f7' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 2: Tempo Médio de Resposta por Categoria (Com IA vs Sem IA) */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Tempo de Resposta por Categoria (minutos)
                </h3>
                <p className="text-[11px] text-slate-400">Comparação: Atendimento Autônomo com IA vs Atendimento Manual</p>
              </div>
              <span className="text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded-md">
                ~95% Mais Rápido
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={RESPONSE_TIME_BY_CATEGORY_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis
                    dataKey="categoria"
                    tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                    interval={0}
                    tickFormatter={(val) => val.split(' ')[0]}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `${val}m`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-700 text-xs text-white space-y-1 shadow-2xl">
                            <p className="font-extrabold text-amber-300 border-b border-slate-800 pb-1">{data.categoria}</p>
                            <p className="text-purple-300 font-bold">Com Agente IA: {data.tempoComIA} minutos</p>
                            <p className="text-slate-400">Sem IA (Manual): {data.tempoSemIA} minutos</p>
                            <p className="text-emerald-400 font-extrabold text-[11px] pt-0.5">Redução de tempo: {data.reducao}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
                  <Bar dataKey="tempoComIA" fill="#a855f7" name="Com Agente IA (min)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  <Bar dataKey="tempoSemIA" fill="#475569" name="Atendimento Manual (min)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: PROJEÇÃO DE ECONOMIA FINANCEIRA GERADA PELA AUTOMAÇÃO COM IA (RECHARTS CARD) */}
      <div id="secao-projecao-economia-ia" className="bg-white p-5 lg:p-6 rounded-3xl border border-emerald-200/90 shadow-md space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black bg-emerald-800 text-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-300" />
                Calculadora de ROI & Custo Evitado
              </span>
              <span className="text-[10px] font-extrabold bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                {totalIaAutomated} Atendimentos Autônomos
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-600" />
              Projeção de Economia Financeira com Automação de IA
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Gráfico Recharts projetando a economia financeira acumulada e diária obtida ao converter o tempo economizado no atendimento por IA em valor hora da equipe de recepção.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 shrink-0">
            <div className="text-right">
              <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Economia no Período</p>
              <p className="text-xl font-black text-emerald-950 font-mono">{formatCurrency(totalFinancialSavings)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Interactive Simulation Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/90">
          {/* Control 1: Hourly Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                Valor Hora do Atendente (R$/h)
              </label>
              <span className="font-extrabold text-emerald-900 font-mono bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                {formatCurrency(hourlyRate)}/h
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={100}
              step={5}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>Presets:</span>
              <div className="flex gap-1">
                {[25, 35, 50, 75].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setHourlyRate(val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                      hourlyRate === val ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    R$ {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Control 2: Minutes Saved per Interaction */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                Tempo Poupado por Atendimento
              </label>
              <span className="font-extrabold text-purple-900 font-mono bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                {minutesSavedPerService} minutos
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={minutesSavedPerService}
              onChange={(e) => setMinutesSavedPerService(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>Presets:</span>
              <div className="flex gap-1">
                {[10, 15, 20, 25].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMinutesSavedPerService(val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                      minutesSavedPerService === val ? 'bg-purple-700 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val} min
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* KPI Summary Block */}
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Horas de Trabalho Poupadas:</span>
              <strong className="text-slate-900 font-extrabold">{totalHoursSaved.toFixed(1)} hrs</strong>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Economia por Atendimento:</span>
              <strong className="text-emerald-700 font-extrabold">{formatCurrency((minutesSavedPerService / 60) * hourlyRate)}</strong>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>ROI Estimado da Plataforma:</span>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                +{projectedRoiPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Chart: Projeção de Economia Financeira */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Evolução Diária & Acumulada de Economia (R$)</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block" /> Economia Diária (R$)
              </span>
              <span className="flex items-center gap-1 text-purple-700">
                <span className="w-3 h-3 bg-purple-600 rounded-sm inline-block" /> Acumulado no Período (R$)
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={savingsProjectionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                />

                {/* Y-Axis Left for Daily Savings */}
                <YAxis
                  yAxisId="leftAxis"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#059669', fontWeight: 700 }}
                  tickFormatter={(val) => `R$${val}`}
                />

                {/* Y-Axis Right for Cumulative Savings */}
                <YAxis
                  yAxisId="rightAxis"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#7e22ce', fontWeight: 700 }}
                  tickFormatter={(val) => `R$${val}`}
                />

                <Tooltip
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-1.5 backdrop-blur-md">
                          <p className="font-extrabold text-emerald-300 border-b border-slate-700 pb-1 flex items-center justify-between gap-4">
                            <span>{data.fullDate || label}</span>
                            <span className="text-[10px] text-slate-400 font-normal">ROI AI Engine</span>
                          </p>
                          <div className="space-y-1 text-[11px]">
                            <p className="text-purple-300 font-semibold">
                              Triados por IA: <strong className="text-white">{data.atendimentosIa} pacientes</strong>
                            </p>
                            <p className="text-amber-300 font-semibold">
                              Tempo Poupado: <strong className="text-white">{data.horasEconomizadas} horas</strong>
                            </p>
                            <p className="text-emerald-400 font-black text-xs pt-1 border-t border-slate-800">
                              Economia no Dia: {formatCurrency(data.economiaDia)}
                            </p>
                            <p className="text-purple-400 font-black text-xs">
                              Acumulado até a Data: {formatCurrency(data.economiaAcumulada)}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Bar
                  yAxisId="leftAxis"
                  dataKey="economiaDia"
                  name="Economia Diária (R$)"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />

                <Line
                  yAxisId="rightAxis"
                  type="monotone"
                  dataKey="economiaAcumulada"
                  name="Economia Acumulada (R$)"
                  stroke="#9333ea"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#9333ea', strokeWidth: 1, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#7e22ce' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  )}
</div>
  );
};

