import React, { useState, useMemo } from 'react';
import {
  Users,
  Clock,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Sliders,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Download,
  Filter,
  Info,
  UserPlus,
  UserCheck,
  Activity,
  MessageSquare,
  ChevronRight,
  Bot,
  HelpCircle,
  Flame,
  Check
} from 'lucide-react';
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
  Area,
  AreaChart,
  Legend,
  Cell
} from 'recharts';

// Dias da semana
const DAYS_OF_WEEK = [
  { key: 'seg', label: 'Segunda-feira', short: 'Seg' },
  { key: 'ter', label: 'Terça-feira', short: 'Ter' },
  { key: 'qua', label: 'Quarta-feira', short: 'Qua' },
  { key: 'qui', label: 'Quinta-feira', short: 'Qui' },
  { key: 'sex', label: 'Sexta-feira', short: 'Sex' },
  { key: 'sab', label: 'Sábado', short: 'Sáb' },
  { key: 'dom', label: 'Domingo', short: 'Dom' }
];

// Faixas horárias de análise
const HOURS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00', '22:00'
];

// Matriz de Dados de Densidade de Leads por Dia da Semana e Hora (Média semanal dos últimos 30 dias)
// volume: quantidade média de leads recebidos no intervalo de 1 hora
// waitTime: tempo médio de espera em minutos sem automação
// staffCurrent: quantidade atual de atendentes escalados
// staffRecommended: quantidade ideal recomendada para manter tempo de resposta < 2 min
// topInquiry: assunto mais comum naquele horário
interface HeatmapSlot {
  day: string;
  dayLabel: string;
  hour: string;
  volume: number;
  waitTime: number;
  staffCurrent: number;
  staffRecommended: number;
  aiHandledPct: number;
  topInquiry: string;
  severity: 'low' | 'medium' | 'high' | 'peak' | 'critical';
}

const HEATMAP_DATA: Record<string, Record<string, HeatmapSlot>> = {
  seg: {
    '07:00': { day: 'seg', dayLabel: 'Segunda-feira', hour: '07:00', volume: 22, waitTime: 6.5, staffCurrent: 2, staffRecommended: 3, aiHandledPct: 85, topInquiry: 'Confirmação de Consulta do Dia', severity: 'medium' },
    '08:00': { day: 'seg', dayLabel: 'Segunda-feira', hour: '08:00', volume: 54, waitTime: 14.8, staffCurrent: 3, staffRecommended: 5, aiHandledPct: 78, topInquiry: 'Agendamento de Consulta Nova', severity: 'high' },
    '09:00': { day: 'seg', dayLabel: 'Segunda-feira', hour: '09:00', volume: 78, waitTime: 22.4, staffCurrent: 4, staffRecommended: 6, aiHandledPct: 72, topInquiry: 'Agendamento & Encaixe', severity: 'critical' },
    '10:00': { day: 'seg', dayLabel: 'Segunda-feira', hour: '10:00', volume: 86, waitTime: 26.0, staffCurrent: 4, staffRecommended: 7, aiHandledPct: 70, topInquiry: 'Agendamento & Urgência Pós-Fim de Semana', severity: 'critical' },
    '11:00': { day: 'seg', dayLabel: 'Segunda-feira', hour: '11:00', volume: 68, waitTime: 18.2, staffCurrent: 4, staffRecommended: 6, aiHandledPct: 75, topInquiry: 'Autorização de Convênio & Guias', severity: 'peak' },
    '12:00': { day: 'seg', dayLabel: 'Segunda-feira', hour: '12:00', volume: 48, waitTime: 15.0, staffCurrent: 2, staffRecommended: 4, aiHandledPct: 82, topInquiry: 'Dúvidas de Preparo de Exames', severity: 'high' },
    '13:00': { day: 'seg', dayLabel: 'Segunda-feira', hour: '13:00', volume: 38, waitTime: 8.5, staffCurrent: 3, staffRecommended: 4, aiHandledPct: 86, topInquiry: 'Resultado de Exames / Laudos', severity: 'medium' },
    '14:00': { day: 'seg', dayLabel: 'Segunda-feira', hour: '14:00', volume: 62, waitTime: 16.5, staffCurrent: 3, staffRecommended: 5, aiHandledPct: 76, topInquiry: 'Agendamento de Retorno', severity: 'peak' },
    '15:00': { day: 'seg', dayLabel: 'Segunda-feira', hour: '15:00', volume: 58, waitTime: 13.2, staffCurrent: 4, staffRecommended: 5, aiHandledPct: 80, topInquiry: 'Valores e Formas de Pagamento', severity: 'high' },
    '16:00': { day: 'seg', dayLabel: 'Segunda-feira', hour: '16:00', volume: 46, waitTime: 9.8, staffCurrent: 4, staffRecommended: 4, aiHandledPct: 84, topInquiry: 'Orientação Pós-Consulta', severity: 'medium' },
    '17:00': { day: 'seg', dayLabel: 'Segunda-feira', hour: '17:00', volume: 39, waitTime: 7.2, staffCurrent: 3, staffRecommended: 3, aiHandledPct: 88, topInquiry: 'Reagendamento de Horário', severity: 'medium' },
    '18:00': { day: 'seg', dayLabel: 'Segunda-feira', hour: '18:00', volume: 32, waitTime: 5.4, staffCurrent: 2, staffRecommended: 3, aiHandledPct: 90, topInquiry: 'Localização e Estacionamento', severity: 'low' },
    '19:00': { day: 'seg', dayLabel: 'Segunda-feira', hour: '19:00', volume: 28, waitTime: 3.1, staffCurrent: 1, staffRecommended: 2, aiHandledPct: 94, topInquiry: 'Agendamento Noturno (Leads Digitais)', severity: 'low' },
    '20:00': { day: 'seg', dayLabel: 'Segunda-feira', hour: '20:00', volume: 24, waitTime: 1.8, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 98, topInquiry: 'Agendamento Autônomo IA', severity: 'low' },
    '21:00': { day: 'seg', dayLabel: 'Segunda-feira', hour: '21:00', volume: 18, waitTime: 1.2, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 99, topInquiry: 'Dúvidas de Especialidades', severity: 'low' },
    '22:00': { day: 'seg', dayLabel: 'Segunda-feira', hour: '22:00', volume: 12, waitTime: 0.8, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Pré-Agendamento Fora do Horário', severity: 'low' }
  },
  ter: {
    '07:00': { day: 'ter', dayLabel: 'Terça-feira', hour: '07:00', volume: 19, waitTime: 5.0, staffCurrent: 2, staffRecommended: 2, aiHandledPct: 88, topInquiry: 'Confirmação de Consulta', severity: 'low' },
    '08:00': { day: 'ter', dayLabel: 'Terça-feira', hour: '08:00', volume: 48, waitTime: 11.2, staffCurrent: 3, staffRecommended: 4, aiHandledPct: 82, topInquiry: 'Agendamentos Gerais', severity: 'high' },
    '09:00': { day: 'ter', dayLabel: 'Terça-feira', hour: '09:00', volume: 72, waitTime: 19.5, staffCurrent: 4, staffRecommended: 6, aiHandledPct: 76, topInquiry: 'Consultas com Especialistas', severity: 'critical' },
    '10:00': { day: 'ter', dayLabel: 'Terça-feira', hour: '10:00', volume: 79, waitTime: 21.0, staffCurrent: 4, staffRecommended: 6, aiHandledPct: 74, topInquiry: 'Agendamentos & Checkup', severity: 'critical' },
    '11:00': { day: 'ter', dayLabel: 'Terça-feira', hour: '11:00', volume: 61, waitTime: 14.8, staffCurrent: 4, staffRecommended: 5, aiHandledPct: 79, topInquiry: 'Autorização de Convênio', severity: 'high' },
    '12:00': { day: 'ter', dayLabel: 'Terça-feira', hour: '12:00', volume: 42, waitTime: 12.0, staffCurrent: 2, staffRecommended: 3, aiHandledPct: 85, topInquiry: 'Instruções de Exames', severity: 'medium' },
    '13:00': { day: 'ter', dayLabel: 'Terça-feira', hour: '13:00', volume: 34, waitTime: 6.8, staffCurrent: 3, staffRecommended: 3, aiHandledPct: 88, topInquiry: 'Retirada de Laudos', severity: 'low' },
    '14:00': { day: 'ter', dayLabel: 'Terça-feira', hour: '14:00', volume: 56, waitTime: 13.5, staffCurrent: 3, staffRecommended: 5, aiHandledPct: 78, topInquiry: 'Consultas de Retorno', severity: 'high' },
    '15:00': { day: 'ter', dayLabel: 'Terça-feira', hour: '15:00', volume: 52, waitTime: 11.0, staffCurrent: 4, staffRecommended: 4, aiHandledPct: 82, topInquiry: 'Dúvidas de Medicação', severity: 'medium' },
    '16:00': { day: 'ter', dayLabel: 'Terça-feira', hour: '16:00', volume: 41, waitTime: 7.5, staffCurrent: 4, staffRecommended: 4, aiHandledPct: 86, topInquiry: 'Reagendamentos', severity: 'medium' },
    '17:00': { day: 'ter', dayLabel: 'Terça-feira', hour: '17:00', volume: 36, waitTime: 6.0, staffCurrent: 3, staffRecommended: 3, aiHandledPct: 89, topInquiry: 'Horários Disponíveis', severity: 'low' },
    '18:00': { day: 'ter', dayLabel: 'Terça-feira', hour: '18:00', volume: 29, waitTime: 4.2, staffCurrent: 2, staffRecommended: 2, aiHandledPct: 92, topInquiry: 'Preços Particulares', severity: 'low' },
    '19:00': { day: 'ter', dayLabel: 'Terça-feira', hour: '19:00', volume: 26, waitTime: 2.5, staffCurrent: 1, staffRecommended: 1, aiHandledPct: 95, topInquiry: 'Leads Noturnos / Instagram', severity: 'low' },
    '20:00': { day: 'ter', dayLabel: 'Terça-feira', hour: '20:00', volume: 21, waitTime: 1.5, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 98, topInquiry: 'Triagem IA', severity: 'low' },
    '21:00': { day: 'ter', dayLabel: 'Terça-feira', hour: '21:00', volume: 16, waitTime: 1.0, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Informações de Corpo Clínico', severity: 'low' },
    '22:00': { day: 'ter', dayLabel: 'Terça-feira', hour: '22:00', volume: 11, waitTime: 0.6, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Agendamento Automático', severity: 'low' }
  },
  qua: {
    '07:00': { day: 'qua', dayLabel: 'Quarta-feira', hour: '07:00', volume: 20, waitTime: 5.2, staffCurrent: 2, staffRecommended: 2, aiHandledPct: 87, topInquiry: 'Confirmação de Presença', severity: 'low' },
    '08:00': { day: 'qua', dayLabel: 'Quarta-feira', hour: '08:00', volume: 46, waitTime: 10.5, staffCurrent: 3, staffRecommended: 4, aiHandledPct: 81, topInquiry: 'Novas Consultas', severity: 'high' },
    '09:00': { day: 'qua', dayLabel: 'Quarta-feira', hour: '09:00', volume: 69, waitTime: 17.8, staffCurrent: 4, staffRecommended: 6, aiHandledPct: 77, topInquiry: 'Cardiologia & Dermatologia', severity: 'peak' },
    '10:00': { day: 'qua', dayLabel: 'Quarta-feira', hour: '10:00', volume: 74, waitTime: 19.2, staffCurrent: 4, staffRecommended: 6, aiHandledPct: 75, topInquiry: 'Agendamento & Encaixes', severity: 'critical' },
    '11:00': { day: 'qua', dayLabel: 'Quarta-feira', hour: '11:00', volume: 59, waitTime: 13.9, staffCurrent: 4, staffRecommended: 5, aiHandledPct: 80, topInquiry: 'Guias e Cobertura Bradesco/Unimed', severity: 'high' },
    '12:00': { day: 'qua', dayLabel: 'Quarta-feira', hour: '12:00', volume: 40, waitTime: 11.5, staffCurrent: 2, staffRecommended: 3, aiHandledPct: 86, topInquiry: 'Jejum e Preparo Ultrassom', severity: 'medium' },
    '13:00': { day: 'qua', dayLabel: 'Quarta-feira', hour: '13:00', volume: 33, waitTime: 6.2, staffCurrent: 3, staffRecommended: 3, aiHandledPct: 89, topInquiry: 'Envio de Resultados PDF', severity: 'low' },
    '14:00': { day: 'qua', dayLabel: 'Quarta-feira', hour: '14:00', volume: 53, waitTime: 12.0, staffCurrent: 3, staffRecommended: 4, aiHandledPct: 80, topInquiry: 'Agendamento de Retorno', severity: 'high' },
    '15:00': { day: 'qua', dayLabel: 'Quarta-feira', hour: '15:00', volume: 49, waitTime: 9.8, staffCurrent: 4, staffRecommended: 4, aiHandledPct: 83, topInquiry: 'Preços de Procedimentos', severity: 'medium' },
    '16:00': { day: 'qua', dayLabel: 'Quarta-feira', hour: '16:00', volume: 39, waitTime: 7.0, staffCurrent: 4, staffRecommended: 4, aiHandledPct: 87, topInquiry: 'Horários da Semana', severity: 'medium' },
    '17:00': { day: 'qua', dayLabel: 'Quarta-feira', hour: '17:00', volume: 34, waitTime: 5.5, staffCurrent: 3, staffRecommended: 3, aiHandledPct: 90, topInquiry: 'Localização & Recepção', severity: 'low' },
    '18:00': { day: 'qua', dayLabel: 'Quarta-feira', hour: '18:00', volume: 27, waitTime: 3.8, staffCurrent: 2, staffRecommended: 2, aiHandledPct: 93, topInquiry: 'Agendamento Noturno', severity: 'low' },
    '19:00': { day: 'qua', dayLabel: 'Quarta-feira', hour: '19:00', volume: 24, waitTime: 2.2, staffCurrent: 1, staffRecommended: 1, aiHandledPct: 96, topInquiry: 'Agendamento Autônomo IA', severity: 'low' },
    '20:00': { day: 'qua', dayLabel: 'Quarta-feira', hour: '20:00', volume: 19, waitTime: 1.3, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 99, topInquiry: 'Dúvidas de Especialidades', severity: 'low' },
    '21:00': { day: 'qua', dayLabel: 'Quarta-feira', hour: '21:00', volume: 14, waitTime: 0.9, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Pré-Triagem IA', severity: 'low' },
    '22:00': { day: 'qua', dayLabel: 'Quarta-feira', hour: '22:00', volume: 9, waitTime: 0.5, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Agendamento IA 24h', severity: 'low' }
  },
  qui: {
    '07:00': { day: 'qui', dayLabel: 'Quinta-feira', hour: '07:00', volume: 18, waitTime: 4.8, staffCurrent: 2, staffRecommended: 2, aiHandledPct: 89, topInquiry: 'Confirmação de Presença', severity: 'low' },
    '08:00': { day: 'qui', dayLabel: 'Quinta-feira', hour: '08:00', volume: 44, waitTime: 9.8, staffCurrent: 3, staffRecommended: 4, aiHandledPct: 83, topInquiry: 'Consultas & Agendamentos', severity: 'high' },
    '09:00': { day: 'qui', dayLabel: 'Quinta-feira', hour: '09:00', volume: 65, waitTime: 16.0, staffCurrent: 4, staffRecommended: 5, aiHandledPct: 78, topInquiry: 'Ginecologia & Ortopedia', severity: 'peak' },
    '10:00': { day: 'qui', dayLabel: 'Quinta-feira', hour: '10:00', volume: 71, waitTime: 18.0, staffCurrent: 4, staffRecommended: 6, aiHandledPct: 76, topInquiry: 'Encaixe de Consulta', severity: 'critical' },
    '11:00': { day: 'qui', dayLabel: 'Quinta-feira', hour: '11:00', volume: 55, waitTime: 12.5, staffCurrent: 4, staffRecommended: 5, aiHandledPct: 81, topInquiry: 'Liberação de Guia de Convênio', severity: 'high' },
    '12:00': { day: 'qui', dayLabel: 'Quinta-feira', hour: '12:00', volume: 38, waitTime: 10.0, staffCurrent: 2, staffRecommended: 3, aiHandledPct: 87, topInquiry: 'Preparo de Exames', severity: 'medium' },
    '13:00': { day: 'qui', dayLabel: 'Quinta-feira', hour: '13:00', volume: 31, waitTime: 5.5, staffCurrent: 3, staffRecommended: 3, aiHandledPct: 90, topInquiry: 'Status de Laudos', severity: 'low' },
    '14:00': { day: 'qui', dayLabel: 'Quinta-feira', hour: '14:00', volume: 50, waitTime: 11.0, staffCurrent: 3, staffRecommended: 4, aiHandledPct: 82, topInquiry: 'Consultas de Retorno', severity: 'high' },
    '15:00': { day: 'qui', dayLabel: 'Quinta-feira', hour: '15:00', volume: 46, waitTime: 8.9, staffCurrent: 4, staffRecommended: 4, aiHandledPct: 85, topInquiry: 'Valores e Agendamentos', severity: 'medium' },
    '16:00': { day: 'qui', dayLabel: 'Quinta-feira', hour: '16:00', volume: 37, waitTime: 6.5, staffCurrent: 4, staffRecommended: 4, aiHandledPct: 88, topInquiry: 'Orientação de Horários', severity: 'medium' },
    '17:00': { day: 'qui', dayLabel: 'Quinta-feira', hour: '17:00', volume: 32, waitTime: 5.0, staffCurrent: 3, staffRecommended: 3, aiHandledPct: 91, topInquiry: 'Reagendamentos', severity: 'low' },
    '18:00': { day: 'qui', dayLabel: 'Quinta-feira', hour: '18:00', volume: 25, waitTime: 3.5, staffCurrent: 2, staffRecommended: 2, aiHandledPct: 94, topInquiry: 'Informações de Convênios', severity: 'low' },
    '19:00': { day: 'qui', dayLabel: 'Quinta-feira', hour: '19:00', volume: 22, waitTime: 2.0, staffCurrent: 1, staffRecommended: 1, aiHandledPct: 97, topInquiry: 'Agendamento Noturno IA', severity: 'low' },
    '20:00': { day: 'qui', dayLabel: 'Quinta-feira', hour: '20:00', volume: 18, waitTime: 1.2, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 99, topInquiry: 'Triagem Autônoma', severity: 'low' },
    '21:00': { day: 'qui', dayLabel: 'Quinta-feira', hour: '21:00', volume: 13, waitTime: 0.8, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Dúvidas de Especialidades', severity: 'low' },
    '22:00': { day: 'qui', dayLabel: 'Quinta-feira', hour: '22:00', volume: 8, waitTime: 0.4, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Agendamento IA 24h', severity: 'low' }
  },
  sex: {
    '07:00': { day: 'sex', dayLabel: 'Sexta-feira', hour: '07:00', volume: 21, waitTime: 5.5, staffCurrent: 2, staffRecommended: 2, aiHandledPct: 86, topInquiry: 'Confirmação de Consulta', severity: 'low' },
    '08:00': { day: 'sex', dayLabel: 'Sexta-feira', hour: '08:00', volume: 47, waitTime: 11.5, staffCurrent: 3, staffRecommended: 4, aiHandledPct: 80, topInquiry: 'Agendamento para Próxima Semana', severity: 'high' },
    '09:00': { day: 'sex', dayLabel: 'Sexta-feira', hour: '09:00', volume: 64, waitTime: 16.2, staffCurrent: 4, staffRecommended: 5, aiHandledPct: 77, topInquiry: 'Encaixe de Última Hora', severity: 'peak' },
    '10:00': { day: 'sex', dayLabel: 'Sexta-feira', hour: '10:00', volume: 67, waitTime: 17.5, staffCurrent: 4, staffRecommended: 6, aiHandledPct: 75, topInquiry: 'Agendamentos & Exames', severity: 'critical' },
    '11:00': { day: 'sex', dayLabel: 'Sexta-feira', hour: '11:00', volume: 52, waitTime: 12.0, staffCurrent: 4, staffRecommended: 5, aiHandledPct: 82, topInquiry: 'Retirada de Guias & Convênios', severity: 'high' },
    '12:00': { day: 'sex', dayLabel: 'Sexta-feira', hour: '12:00', volume: 35, waitTime: 9.0, staffCurrent: 2, staffRecommended: 3, aiHandledPct: 88, topInquiry: 'Preparo de Exames Fim de Semana', severity: 'medium' },
    '13:00': { day: 'sex', dayLabel: 'Sexta-feira', hour: '13:00', volume: 28, waitTime: 4.8, staffCurrent: 3, staffRecommended: 3, aiHandledPct: 91, topInquiry: 'Laudos Urgentes', severity: 'low' },
    '14:00': { day: 'sex', dayLabel: 'Sexta-feira', hour: '14:00', volume: 44, waitTime: 9.5, staffCurrent: 3, staffRecommended: 4, aiHandledPct: 84, topInquiry: 'Agendamento de Retorno', severity: 'medium' },
    '15:00': { day: 'sex', dayLabel: 'Sexta-feira', hour: '15:00', volume: 38, waitTime: 7.2, staffCurrent: 4, staffRecommended: 3, aiHandledPct: 87, topInquiry: 'Dúvidas e Receitas', severity: 'medium' },
    '16:00': { day: 'sex', dayLabel: 'Sexta-feira', hour: '16:00', volume: 30, waitTime: 5.0, staffCurrent: 3, staffRecommended: 3, aiHandledPct: 90, topInquiry: 'Horários de Funcionamento', severity: 'low' },
    '17:00': { day: 'sex', dayLabel: 'Sexta-feira', hour: '17:00', volume: 24, waitTime: 3.5, staffCurrent: 2, staffRecommended: 2, aiHandledPct: 94, topInquiry: 'Plantão do Sábado', severity: 'low' },
    '18:00': { day: 'sex', dayLabel: 'Sexta-feira', hour: '18:00', volume: 20, waitTime: 2.2, staffCurrent: 1, staffRecommended: 1, aiHandledPct: 96, topInquiry: 'Agendamento Autônomo IA', severity: 'low' },
    '19:00': { day: 'sex', dayLabel: 'Sexta-feira', hour: '19:00', volume: 18, waitTime: 1.5, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 98, topInquiry: 'Triagem Noturna IA', severity: 'low' },
    '20:00': { day: 'sex', dayLabel: 'Sexta-feira', hour: '20:00', volume: 15, waitTime: 1.0, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Agendamentos Fim de Semana', severity: 'low' },
    '21:00': { day: 'sex', dayLabel: 'Sexta-feira', hour: '21:00', volume: 11, waitTime: 0.7, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Dúvidas Gerais', severity: 'low' },
    '22:00': { day: 'sex', dayLabel: 'Sexta-feira', hour: '22:00', volume: 7, waitTime: 0.3, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Atendimento Autônomo 24h', severity: 'low' }
  },
  sab: {
    '07:00': { day: 'sab', dayLabel: 'Sábado', hour: '07:00', volume: 14, waitTime: 3.0, staffCurrent: 1, staffRecommended: 1, aiHandledPct: 92, topInquiry: 'Exames de Sangue Sábado', severity: 'low' },
    '08:00': { day: 'sab', dayLabel: 'Sábado', hour: '08:00', volume: 32, waitTime: 7.5, staffCurrent: 2, staffRecommended: 3, aiHandledPct: 86, topInquiry: 'Coleta de Exames & Consultas', severity: 'medium' },
    '09:00': { day: 'sab', dayLabel: 'Sábado', hour: '09:00', volume: 45, waitTime: 11.2, staffCurrent: 2, staffRecommended: 3, aiHandledPct: 84, topInquiry: 'Agendamento para Semana', severity: 'high' },
    '10:00': { day: 'sab', dayLabel: 'Sábado', hour: '10:00', volume: 48, waitTime: 12.0, staffCurrent: 2, staffRecommended: 3, aiHandledPct: 82, topInquiry: 'Consultas Pediátricas e Clínico', severity: 'high' },
    '11:00': { day: 'sab', dayLabel: 'Sábado', hour: '11:00', volume: 36, waitTime: 8.0, staffCurrent: 2, staffRecommended: 2, aiHandledPct: 89, topInquiry: 'Preços e Convênios', severity: 'medium' },
    '12:00': { day: 'sab', dayLabel: 'Sábado', hour: '12:00', volume: 26, waitTime: 4.5, staffCurrent: 1, staffRecommended: 1, aiHandledPct: 94, topInquiry: 'Horário de Fechamento', severity: 'low' },
    '13:00': { day: 'sab', dayLabel: 'Sábado', hour: '13:00', volume: 18, waitTime: 2.0, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 98, topInquiry: 'Agendamento IA Fora de Horário', severity: 'low' },
    '14:00': { day: 'sab', dayLabel: 'Sábado', hour: '14:00', volume: 16, waitTime: 1.5, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Agendamento Autônomo IA', severity: 'low' },
    '15:00': { day: 'sab', dayLabel: 'Sábado', hour: '15:00', volume: 14, waitTime: 1.2, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Dúvidas Médicas / Triagem', severity: 'low' },
    '16:00': { day: 'sab', dayLabel: 'Sábado', hour: '16:00', volume: 12, waitTime: 1.0, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Agendamentos Online', severity: 'low' },
    '17:00': { day: 'sab', dayLabel: 'Sábado', hour: '17:00', volume: 11, waitTime: 0.8, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Localização e Telefones', severity: 'low' },
    '18:00': { day: 'sab', dayLabel: 'Sábado', hour: '18:00', volume: 9, waitTime: 0.5, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Triagem IA WhatsApp', severity: 'low' },
    '19:00': { day: 'sab', dayLabel: 'Sábado', hour: '19:00', volume: 8, waitTime: 0.4, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Agendamento Próxima Semana', severity: 'low' },
    '20:00': { day: 'sab', dayLabel: 'Sábado', hour: '20:00', volume: 6, waitTime: 0.3, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Agendamento IA 24h', severity: 'low' },
    '21:00': { day: 'sab', dayLabel: 'Sábado', hour: '21:00', volume: 5, waitTime: 0.2, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Autoatendimento', severity: 'low' },
    '22:00': { day: 'sab', dayLabel: 'Sábado', hour: '22:00', volume: 4, waitTime: 0.1, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Autoatendimento', severity: 'low' }
  },
  dom: {
    '07:00': { day: 'dom', dayLabel: 'Domingo', hour: '07:00', volume: 6, waitTime: 0.5, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Agendamento IA Domingo', severity: 'low' },
    '08:00': { day: 'dom', dayLabel: 'Domingo', hour: '08:00', volume: 10, waitTime: 0.8, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Dúvidas de Especialidades', severity: 'low' },
    '09:00': { day: 'dom', dayLabel: 'Domingo', hour: '09:00', volume: 16, waitTime: 1.2, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Agendamento Segunda-feira', severity: 'low' },
    '10:00': { day: 'dom', dayLabel: 'Domingo', hour: '10:00', volume: 22, waitTime: 1.8, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Consultas & Preços', severity: 'low' },
    '11:00': { day: 'dom', dayLabel: 'Domingo', hour: '11:00', volume: 20, waitTime: 1.5, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Agendamentos Online', severity: 'low' },
    '12:00': { day: 'dom', dayLabel: 'Domingo', hour: '12:00', volume: 15, waitTime: 1.0, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Instruções de Jejum', severity: 'low' },
    '13:00': { day: 'dom', dayLabel: 'Domingo', hour: '13:00', volume: 12, waitTime: 0.9, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Agendamento Autônomo', severity: 'low' },
    '14:00': { day: 'dom', dayLabel: 'Domingo', hour: '14:00', volume: 14, waitTime: 1.1, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Dúvidas de Convênios', severity: 'low' },
    '15:00': { day: 'dom', dayLabel: 'Domingo', hour: '15:00', volume: 16, waitTime: 1.3, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Agendamento para Segunda', severity: 'low' },
    '16:00': { day: 'dom', dayLabel: 'Domingo', hour: '16:00', volume: 19, waitTime: 1.6, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Encaixes e Consultas', severity: 'low' },
    '17:00': { day: 'dom', dayLabel: 'Domingo', hour: '17:00', volume: 22, waitTime: 1.8, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Agendamento Próxima Semana', severity: 'low' },
    '18:00': { day: 'dom', dayLabel: 'Domingo', hour: '18:00', volume: 25, waitTime: 2.1, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Triagem Noturna IA', severity: 'low' },
    '19:00': { day: 'dom', dayLabel: 'Domingo', hour: '19:00', volume: 28, waitTime: 2.4, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Pico de Agendamento Noturno Dom', severity: 'low' },
    '20:00': { day: 'dom', dayLabel: 'Domingo', hour: '20:00', volume: 30, waitTime: 2.6, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Preparativos para Segunda-feira', severity: 'medium' },
    '21:00': { day: 'dom', dayLabel: 'Domingo', hour: '21:00', volume: 24, waitTime: 2.0, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Agendamento IA 24h', severity: 'low' },
    '22:00': { day: 'dom', dayLabel: 'Domingo', hour: '22:00', volume: 15, waitTime: 1.2, staffCurrent: 0, staffRecommended: 0, aiHandledPct: 100, topInquiry: 'Atendimento Autônomo Noturno', severity: 'low' }
  }
};

// Dados consolidados por dia da semana para Recharts
const DAY_SUMMARY_DATA = [
  { dia: 'Segunda', leads: 604, pctTotal: 26.2, atendentesAtuais: 4, atendentesIdeal: 6, sobrecargaPct: 95, esperaMedia: 12.8, color: '#7e22ce' },
  { dia: 'Terça', leads: 529, pctTotal: 22.9, atendentesAtuais: 4, atendentesIdeal: 5, sobrecargaPct: 82, esperaMedia: 9.6, color: '#9333ea' },
  { dia: 'Quarta', leads: 489, pctTotal: 21.2, atendentesAtuais: 4, atendentesIdeal: 5, sobrecargaPct: 78, esperaMedia: 8.7, color: '#a855f7' },
  { dia: 'Quinta', leads: 457, pctTotal: 19.8, atendentesAtuais: 4, atendentesIdeal: 5, sobrecargaPct: 74, esperaMedia: 8.1, color: '#c084fc' },
  { dia: 'Sexta', leads: 421, pctTotal: 18.2, atendentesAtuais: 4, atendentesIdeal: 4, sobrecargaPct: 62, esperaMedia: 7.2, color: '#d8b4fe' },
  { dia: 'Sábado', leads: 248, pctTotal: 10.7, atendentesAtuais: 2, atendentesIdeal: 3, sobrecargaPct: 65, esperaMedia: 4.8, color: '#3b82f6' },
  { dia: 'Domingo', leads: 260, pctTotal: 11.3, atendentesAtuais: 0, atendentesIdeal: 0, sobrecargaPct: 0, esperaMedia: 1.5, color: '#10b981' } // 100% IA
];

// Curva de demanda horária agregada para Recharts (Média geral dos dias úteis)
const HOURLY_AGGREGATED_CURVE = [
  { hora: '07:00', demandaLeads: 20, capacidadeAtual: 18, capacidadeRecomendada: 25, esperaMin: 5.5, risco: 'Baixo' },
  { hora: '08:00', demandaLeads: 49, capacidadeAtual: 28, capacidadeRecomendada: 50, esperaMin: 11.8, risco: 'Alto' },
  { hora: '09:00', demandaLeads: 71, capacidadeAtual: 36, capacidadeRecomendada: 75, esperaMin: 19.0, risco: 'Crítico' },
  { hora: '10:00', demandaLeads: 77, capacidadeAtual: 36, capacidadeRecomendada: 80, esperaMin: 21.5, risco: 'Crítico' },
  { hora: '11:00', demandaLeads: 59, capacidadeAtual: 36, capacidadeRecomendada: 65, esperaMin: 14.5, risco: 'Alto' },
  { hora: '12:00', demandaLeads: 41, capacidadeAtual: 18, capacidadeRecomendada: 45, esperaMin: 12.0, risco: 'Alto' }, // Almoço da equipe
  { hora: '13:00', demandaLeads: 33, capacidadeAtual: 27, capacidadeRecomendada: 38, esperaMin: 6.8, risco: 'Moderado' },
  { hora: '14:00', demandaLeads: 54, capacidadeAtual: 27, capacidadeRecomendada: 58, esperaMin: 13.0, risco: 'Alto' },
  { hora: '15:00', demandaLeads: 49, capacidadeAtual: 36, capacidadeRecomendada: 52, esperaMin: 10.2, risco: 'Moderado' },
  { hora: '16:00', demandaLeads: 38, capacidadeAtual: 36, capacidadeRecomendada: 42, esperaMin: 7.2, risco: 'Baixo' },
  { hora: '17:00', demandaLeads: 33, capacidadeAtual: 27, capacidadeRecomendada: 35, esperaMin: 5.8, risco: 'Baixo' },
  { hora: '18:00', demandaLeads: 26, capacidadeAtual: 18, capacidadeRecomendada: 30, esperaMin: 4.2, risco: 'Baixo' },
  { hora: '19:00', demandaLeads: 23, capacidadeAtual: 9, capacidadeRecomendada: 25, esperaMin: 2.5, risco: 'IA Cobertura' },
  { hora: '20:00', demandaLeads: 19, capacidadeAtual: 0, capacidadeRecomendada: 20, esperaMin: 1.5, risco: '100% IA' },
  { hora: '21:00', demandaLeads: 14, capacidadeAtual: 0, capacidadeRecomendada: 15, esperaMin: 1.0, risco: '100% IA' },
  { hora: '22:00', demandaLeads: 9, capacidadeAtual: 0, capacidadeRecomendada: 10, esperaMin: 0.6, risco: '100% IA' }
];

// Definição dos 4 Turnos Operacionais da Clínica
interface ShiftPlan {
  id: string;
  name: string;
  timeRange: string;
  icon: any;
  leadsPct: number;
  avgVolume: number;
  currentStaff: number;
  suggestedStaff: number;
  aiAutomationRole: string;
  actionSummary: string;
  color: string;
  urgency: 'high' | 'medium' | 'low';
}

const DEFAULT_SHIFTS: ShiftPlan[] = [
  {
    id: 'shift_morning',
    name: 'Turno Manhã (Pico Crítico)',
    timeRange: '07:00 - 13:00',
    icon: Sunrise,
    leadsPct: 41.5,
    avgVolume: 325,
    currentStaff: 4,
    suggestedStaff: 6,
    aiAutomationRole: 'Triagem imediata e bloqueio de dúvidas repetitivas de preparo de exames',
    actionSummary: 'Adicionar +2 atendentes humanos entre 08h e 11h para erradicar fila de espera.',
    color: 'border-rose-300 bg-rose-50/50 text-rose-950',
    urgency: 'high'
  },
  {
    id: 'shift_afternoon',
    name: 'Turno Tarde (Fluxo Estável)',
    timeRange: '13:00 - 18:00',
    icon: Sun,
    leadsPct: 32.8,
    avgVolume: 210,
    currentStaff: 4,
    suggestedStaff: 4,
    aiAutomationRole: 'Confirmação de retornos e autorização automática de guias convênio',
    actionSummary: 'Quadro atual dimensionado adequadamente com suporte da IA para laudos.',
    color: 'border-amber-300 bg-amber-50/50 text-amber-950',
    urgency: 'medium'
  },
  {
    id: 'shift_evening',
    name: 'Turno Noturno / Pós-Expediente',
    timeRange: '18:00 - 22:00',
    icon: Sunset,
    leadsPct: 18.2,
    avgVolume: 115,
    currentStaff: 1,
    suggestedStaff: 2,
    aiAutomationRole: 'Fechamento de agendamentos para leads digitais (Instagram/Site)',
    actionSummary: 'Manter 1 atendente de plantão remoto + Agente IA 24h para captura instantânea.',
    color: 'border-purple-300 bg-purple-50/50 text-purple-950',
    urgency: 'low'
  },
  {
    id: 'shift_overnight',
    name: 'Plantão IA Madrugada & Domingo',
    timeRange: '22:00 - 07:00 & Dom',
    icon: Moon,
    leadsPct: 7.5,
    avgVolume: 65,
    currentStaff: 0,
    suggestedStaff: 0,
    aiAutomationRole: '100% Autônomo via Gemini 3.6 - Agendamentos, FAQs e Encaixes',
    actionSummary: 'Zero custo com horas extras. A IA atende e salva o agendamento no prontuário.',
    color: 'border-indigo-300 bg-indigo-50/50 text-indigo-950',
    urgency: 'low'
  }
];

export const LeadInquiriesStaffingReport: React.FC = () => {
  // Filters
  const [selectedDay, setSelectedDay] = useState<string>('seg');
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>('Todas');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('Todos os canais');
  
  // Interactive Cell Detail State
  const [selectedSlot, setSelectedSlot] = useState<HeatmapSlot | null>(HEATMAP_DATA['seg']['10:00']);

  // Staffing Simulator interactive sliders
  const [extraMorningStaff, setExtraMorningStaff] = useState<number>(2); // +2 staff in peak
  const [extraAfternoonStaff, setExtraAfternoonStaff] = useState<number>(0);
  const [aiAutoTriageLevel, setAiAutoTriageLevel] = useState<number>(85); // 85% AI triage efficiency

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Simulated metrics based on sliders
  const simulatedPeakWaitTime = useMemo(() => {
    // Base wait time is 22 mins in peak
    const staffReduction = (extraMorningStaff * 4.8);
    const aiReduction = ((aiAutoTriageLevel - 70) * 0.45);
    const result = Math.max(1.2, 22.4 - staffReduction - aiReduction);
    return result.toFixed(1);
  }, [extraMorningStaff, aiAutoTriageLevel]);

  const simulatedConversionRate = useMemo(() => {
    // Fast response leads to higher conversion
    const base = 62;
    const staffBonus = extraMorningStaff * 4.5;
    const aiBonus = (aiAutoTriageLevel - 70) * 0.4;
    return Math.min(94, Math.round(base + staffBonus + aiBonus));
  }, [extraMorningStaff, aiAutoTriageLevel]);

  const simulatedBurnoutRisk = useMemo(() => {
    if (extraMorningStaff >= 2 && aiAutoTriageLevel >= 80) return { label: 'Baixo (Saudável)', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    if (extraMorningStaff >= 1 || aiAutoTriageLevel >= 75) return { label: 'Moderado', color: 'text-amber-700 bg-amber-100 border-amber-300' };
    return { label: 'Crítico (Risco de Sobrecarga)', color: 'text-rose-700 bg-rose-100 border-rose-300' };
  }, [extraMorningStaff, aiAutoTriageLevel]);

  // Color generator for heatmap cell
  const getCellColorClass = (slot: HeatmapSlot) => {
    if (slot.volume >= 75) return 'bg-rose-600 text-white font-black hover:bg-rose-700 ring-1 ring-rose-700';
    if (slot.volume >= 55) return 'bg-purple-700 text-white font-extrabold hover:bg-purple-800 ring-1 ring-purple-800';
    if (slot.volume >= 40) return 'bg-purple-500 text-white font-bold hover:bg-purple-600';
    if (slot.volume >= 25) return 'bg-purple-300 text-purple-950 font-bold hover:bg-purple-400';
    if (slot.volume >= 15) return 'bg-purple-100 text-purple-900 font-semibold hover:bg-purple-200';
    return 'bg-slate-100 text-slate-600 font-medium hover:bg-slate-200';
  };

  const handleExportStaffingPlan = () => {
    showToast('Plano de Dimensionamento e Escalas exportado em PDF / Planilha!');
  };

  return (
    <div id="relatorio-picos-dimensionamento" className="bg-white rounded-3xl border border-purple-200/90 shadow-md p-5 lg:p-7 space-y-7 animate-fadeIn">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-purple-500/50 flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Badges and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black bg-purple-900 text-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 fill-amber-300 text-amber-300" />
              Análise de Picos & Horários
            </span>
            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-700" />
              Dimensionamento Inteligente de Equipe
            </span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
              Base: 2.309 leads analisados
            </span>
          </div>

          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-700" />
            Mapeamento de Demanda por Horários & Escalas de Atendimento
          </h2>
          <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
            Identifique com precisão os dias e faixas horárias com maior volume de solicitações de pacientes (leads) para equilibrar a escala da equipe de recepção física com a triagem autônoma por IA, eliminando gargalos de espera.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
          <button
            type="button"
            onClick={handleExportStaffingPlan}
            className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-purple-700" />
            <span>Exportar Escala de Apoio</span>
          </button>
        </div>
      </div>

      {/* Top 4 Staffing Impact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pico Semanal Máximo */}
        <div className="bg-gradient-to-br from-rose-50 to-purple-50/40 p-4 rounded-2xl border border-rose-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Pico Semanal Crítico</span>
            <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
              <Flame className="w-3.5 h-3.5 fill-white" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">Segundas • 10:00</p>
            <p className="text-[11px] font-bold text-rose-700 flex items-center gap-1 mt-0.5">
              <ArrowUpRight className="w-3 h-3" />
              86 leads/hora (+180% vs média)
            </p>
          </div>
          <p className="text-[10px] text-slate-500 pt-1 border-t border-rose-200/60">
            Fila chega a 26 min sem reforço de escala
          </p>
        </div>

        {/* Card 2: Janela de Maior Volume */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/40 p-4 rounded-2xl border border-purple-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Janela Mais Movimentada</span>
            <div className="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">08:00 às 11:30</p>
            <p className="text-[11px] font-bold text-purple-700 flex items-center gap-1 mt-0.5">
              <Users className="w-3 h-3" />
              Concentra 41.5% dos contatos diários
            </p>
          </div>
          <p className="text-[10px] text-slate-500 pt-1 border-t border-purple-200/60">
            Recomendado: 6 atendentes + IA Ativa
          </p>
        </div>

        {/* Card 3: Oportunidade Fora do Expediente */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50/40 p-4 rounded-2xl border border-indigo-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Demanda Noturna & Fim de Semana</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold">
              <Moon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">32.8% do Total</p>
            <p className="text-[11px] font-bold text-indigo-700 flex items-center gap-1 mt-0.5">
              <Bot className="w-3 h-3 text-indigo-600" />
              758 leads fora do horário comercial
            </p>
          </div>
          <p className="text-[10px] text-slate-500 pt-1 border-t border-indigo-200/60">
            100% capturados e agendados por IA
          </p>
        </div>

        {/* Card 4: Gaps de Cobertura no Almoço */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Gargalo no Almoço</span>
            <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">12:00 às 13:30</p>
            <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              Espera sobe para 15 min (troca de turno)
            </p>
          </div>
          <p className="text-[10px] text-slate-500 pt-1 border-t border-amber-200/60">
            Escalar turnos intercalados de almoço
          </p>
        </div>
      </div>

      {/* SECTION 1: HEATMAP DE DENSIDADE (DIAS DA SEMANA X HORÁRIOS) */}
      <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold bg-purple-200 text-purple-900 px-2 py-0.2 rounded uppercase tracking-wider">
                Matriz de Calor
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">
                Densidade de Inflow de Pacientes (Heatmap 7 Dias x 16 Faixas Horárias)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Clique em qualquer célula para ver detalhes da demanda, assuntos mais frequentes e dimensionamento recomendado.
            </p>
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 flex-wrap">
            <span>Intensidade:</span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-slate-200 inline-block border border-slate-300" /> &lt;15 leads
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-purple-300 inline-block" /> 25-40
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-purple-500 inline-block" /> 40-55
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-purple-700 inline-block" /> 55-75
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-rose-600 inline-block" /> &gt;75 (Pico Crítico)
            </span>
          </div>
        </div>

        {/* Heatmap Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse min-w-[760px]">
            <thead>
              <tr>
                <th className="p-2 text-left font-bold text-slate-500 text-[11px] w-24">
                  Dia / Hora
                </th>
                {HOURS.map((hr) => (
                  <th key={hr} className="p-1.5 font-bold text-slate-600 text-[10px]">
                    {hr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS_OF_WEEK.map((dayObj) => {
                const isSelectedDay = selectedDay === dayObj.key;
                return (
                  <tr key={dayObj.key} className="border-t border-slate-200/60">
                    <td className="p-2 text-left">
                      <button
                        type="button"
                        onClick={() => setSelectedDay(dayObj.key)}
                        className={`text-xs font-bold text-left px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center justify-between w-full ${
                          isSelectedDay
                            ? 'bg-purple-900 text-amber-300 shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{dayObj.label}</span>
                        {dayObj.key === 'seg' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse ml-1" />
                        )}
                      </button>
                    </td>

                    {HOURS.map((hr) => {
                      const slot = HEATMAP_DATA[dayObj.key]?.[hr] || {
                        day: dayObj.key,
                        dayLabel: dayObj.label,
                        hour: hr,
                        volume: 0,
                        waitTime: 0,
                        staffCurrent: 0,
                        staffRecommended: 0,
                        aiHandledPct: 100,
                        topInquiry: 'Sem demanda',
                        severity: 'low'
                      };

                      const isSelectedSlot =
                        selectedSlot?.day === slot.day && selectedSlot?.hour === slot.hour;

                      return (
                        <td key={hr} className="p-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSlot(slot);
                              setSelectedDay(slot.day);
                            }}
                            className={`w-full py-2 px-1 rounded-lg transition-all text-[11px] cursor-pointer relative ${getCellColorClass(
                              slot
                            )} ${
                              isSelectedSlot
                                ? 'ring-2 ring-amber-400 ring-offset-2 scale-105 shadow-md z-10'
                                : ''
                            }`}
                            title={`${dayObj.label} às ${hr}: ${slot.volume} leads | Espera: ${slot.waitTime} min | Principal: ${slot.topInquiry}`}
                          >
                            <span>{slot.volume}</span>
                            {slot.volume >= 75 && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Slot Detailed Deep Dive Panel */}
        {selectedSlot && (
          <div className="bg-white p-4 rounded-2xl border-2 border-purple-400 shadow-md animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-900 text-amber-300 rounded-xl font-bold font-mono text-sm">
                  {selectedSlot.hour}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900">
                      Diagnóstico: {selectedSlot.dayLabel} às {selectedSlot.hour}
                    </h4>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
                        selectedSlot.severity === 'critical'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : selectedSlot.severity === 'peak' || selectedSlot.severity === 'high'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {selectedSlot.severity === 'critical'
                        ? '🔥 Sobrecarga Crítica'
                        : selectedSlot.severity === 'peak'
                        ? '⚡ Pico Elevado'
                        : selectedSlot.severity === 'high'
                        ? '⚠️ Demanda Alta'
                        : '✅ Fluxo Controlado'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Volume médio no horário: <strong>{selectedSlot.volume} pacientes simultâneos</strong>
                  </p>
                </div>
              </div>

              {/* Staffing Status Pill */}
              <div className="flex items-center gap-2">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-500 block text-[10px]">Quadro Atual:</span>
                  <span className="font-extrabold text-slate-800">{selectedSlot.staffCurrent} atendentes</span>
                </div>
                <div className="bg-purple-50 p-2 rounded-xl border border-purple-200 text-xs">
                  <span className="text-purple-800 block text-[10px] font-bold">Ideal Recomendado:</span>
                  <span className="font-extrabold text-purple-950">{selectedSlot.staffRecommended} atendentes</span>
                </div>
                {selectedSlot.staffRecommended > selectedSlot.staffCurrent && (
                  <div className="bg-rose-50 text-rose-900 p-2 rounded-xl border border-rose-200 text-xs font-bold">
                    <span>+{selectedSlot.staffRecommended - selectedSlot.staffCurrent} reforço</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics in Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Tempo Médio de Espera</span>
                <p className="text-base font-black text-slate-900 mt-0.5">{selectedSlot.waitTime} minutos</p>
                <span className="text-[10px] text-slate-400">
                  {selectedSlot.waitTime > 10 ? '🚨 Acima do limite aceitável de 5 min' : 'Tempo de resposta satisfatório'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Triagem Absorvida por IA</span>
                <p className="text-base font-black text-purple-700 mt-0.5">{selectedSlot.aiHandledPct}% dos casos</p>
                <span className="text-[10px] text-slate-400">
                  {Math.round((selectedSlot.volume * selectedSlot.aiHandledPct) / 100)} pacientes resolvidos sem fila
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Principal Motivo de Contato</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{selectedSlot.topInquiry}</p>
                <span className="text-[10px] text-purple-700 font-medium">Recomenda automação com resposta rápida</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: CHARTS RECHARTS (DEMANDA HORÁRIA VS CAPACIDADE DA EQUIPE & VOLUME POR DIA) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Curva de Inflow Horário vs Capacidade da Equipe */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-700" />
                <span>Curva de Demanda Horária vs Capacidade de Atendimento</span>
              </h3>
              <p className="text-xs text-slate-400">
                Volume de leads recebidos/hora vs. Capacidade máxima suportada pela equipe humana atual
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={HOURLY_AGGREGATED_CURVE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hora" tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      const gap = d.demandaLeads - d.capacidadeAtual;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1">
                          <p className="font-extrabold text-purple-300 border-b border-slate-700 pb-1">Horário: {label}</p>
                          <p className="text-purple-300 font-bold">Demanda de Leads: {d.demandaLeads} msgs/h</p>
                          <p className="text-slate-300">Capacidade da Equipe Atual: {d.capacidadeAtual} atendimentos/h</p>
                          <p className="text-emerald-400 font-semibold">Capacidade Recomendada: {d.capacidadeRecomendada} atendimentos/h</p>
                          {gap > 0 ? (
                            <p className="text-rose-400 font-black pt-1 border-t border-slate-800">
                              ⚠️ Déficit de Capacidade: {gap} pacientes em espera ({d.esperaMin} min média)
                            </p>
                          ) : (
                            <p className="text-emerald-400 font-bold pt-1 border-t border-slate-800">
                              ✅ Capacidade Suficiente
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                
                {/* Area of Incoming Lead Inflow */}
                <Area
                  type="monotone"
                  dataKey="demandaLeads"
                  name="Demanda de Leads (Pacientes)"
                  fill="#c084fc"
                  stroke="#7e22ce"
                  strokeWidth={2}
                  fillOpacity={0.3}
                />

                {/* Line of Current Staff Capacity */}
                <Line
                  type="stepAfter"
                  dataKey="capacidadeAtual"
                  name="Capacidade Equipe Atual"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={false}
                />

                {/* Line of Ideal Staff Capacity */}
                <Line
                  type="monotone"
                  dataKey="capacidadeRecomendada"
                  name="Capacidade Ideal com IA + Reforço"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Volume Total por Dia da Semana & Sobrecarga */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-700" />
                <span>Volume Semanal por Dia & Índice de Sobrecarga</span>
              </h3>
              <p className="text-xs text-slate-400">
                Distribuição comparativa de volume e dias com maior índice de pressão sobre a recepção
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DAY_SUMMARY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dia" tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1">
                          <p className="font-extrabold text-purple-300 border-b border-slate-700 pb-1">{item.dia}</p>
                          <p className="text-purple-300 font-bold">Volume Total: {item.leads} leads ({item.pctTotal}% da semana)</p>
                          <p className="text-slate-300">Equipe Atual: {item.atendentesAtuais} atendentes</p>
                          <p className="text-emerald-400 font-semibold">Equipe Ideal: {item.atendentesIdeal} atendentes</p>
                          <p className="text-amber-300">Tempo Médio de Espera: {item.esperaMedia} min</p>
                          <p className="text-rose-400 font-bold pt-0.5">Índice de Sobrecarga: {item.sobrecargaPct}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="leads" name="Volume Total de Leads" radius={[6, 6, 0, 0]} maxBarSize={36}>
                  {DAY_SUMMARY_DATA.map((entry, index) => (
                    <Cell
                      key={`day-cell-${index}`}
                      fill={entry.dia === 'Segunda' ? '#e11d48' : entry.dia === 'Terça' ? '#7e22ce' : entry.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 3: PLANO OPERACIONAL DOS 4 TURNOS & RECOMENDAÇÕES DA COORDENAÇÃO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-700" />
              <span>Plano de Escalas por Turno Operacional (Recomendação Estratégica)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Distribuição ótima de postos de trabalho para garantir resposta em &lt; 2 minutos em todos os períodos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEFAULT_SHIFTS.map((shift) => {
            const Icon = shift.icon;
            return (
              <div
                key={shift.id}
                className={`p-4 rounded-2xl border-2 shadow-2xs space-y-3 transition-all ${shift.color}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white text-purple-900 border border-slate-200 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{shift.name}</h4>
                      <span className="text-[11px] font-bold text-purple-800 font-mono">{shift.timeRange}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 block">{shift.leadsPct}% dos leads</span>
                    <span className="text-[10px] text-slate-500">~{shift.avgVolume} contatos/semana</span>
                  </div>
                </div>

                {/* Staff Headcount Comparison Bar */}
                <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Dimensionamento Humano:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-normal">Atual: <strong className="text-slate-800">{shift.currentStaff}</strong></span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-purple-900 font-extrabold bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                        Recomendado: {shift.suggestedStaff}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1">
                    <p className="flex items-start gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <span><strong>Papel da IA no Turno:</strong> {shift.aiAutomationRole}</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Ação Recomendada:</strong> {shift.actionSummary}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: SIMULADOR INTERATIVO DE OTIMIZAÇÃO DE ESCALAS & IMPACTO NO SLA */}
      <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white p-5 lg:p-6 rounded-3xl border border-purple-800/80 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/60 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-amber-400 text-purple-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Simulador Preditivo
              </span>
              <span className="text-[10px] font-bold bg-purple-800 text-purple-200 px-2 py-0.5 rounded-full">
                SLA & Conversão
              </span>
            </div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              Simulador de Ajuste de Escalas & Redução de Tempo de Espera
            </h3>
            <p className="text-xs text-purple-200">
              Ajuste as variáveis de alocação de atendentes no pico e nível de triagem por IA para projetar a redução no tempo de espera e o aumento na taxa de conversão.
            </p>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Slider 1: Reforço Matutino */}
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-white flex items-center gap-1.5">
                <Sunrise className="w-4 h-4 text-amber-400" />
                Reforço Manhã (08h-12h)
              </label>
              <span className="font-mono font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
                +{extraMorningStaff} atendentes
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={4}
              step={1}
              value={extraMorningStaff}
              onChange={(e) => setExtraMorningStaff(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-purple-900 rounded-lg"
            />
            <p className="text-[10px] text-purple-200">
              Elimina o estrangulamento das Segundas e Terças matutinas.
            </p>
          </div>

          {/* Slider 2: Reforço Vespertino */}
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-white flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                Reforço Tarde (13h-17h)
              </label>
              <span className="font-mono font-black text-purple-300 bg-purple-400/20 px-2 py-0.5 rounded border border-purple-400/30">
                +{extraAfternoonStaff} atendentes
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={extraAfternoonStaff}
              onChange={(e) => setExtraAfternoonStaff(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer h-2 bg-purple-900 rounded-lg"
            />
            <p className="text-[10px] text-purple-200">
              Mantém o fluxo estável durante consultas de retorno e laudos.
            </p>
          </div>

          {/* Slider 3: Cobertura e Triagem IA */}
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-white flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-emerald-400" />
                Eficiência da Triagem IA
              </label>
              <span className="font-mono font-black text-emerald-300 bg-emerald-400/20 px-2 py-0.5 rounded border border-emerald-400/30">
                {aiAutoTriageLevel}%
              </span>
            </div>
            <input
              type="range"
              min={60}
              max={98}
              step={2}
              value={aiAutoTriageLevel}
              onChange={(e) => setAiAutoTriageLevel(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-purple-900 rounded-lg"
            />
            <p className="text-[10px] text-purple-200">
              Absorve dúvidas frequentes, preparo de exames e agendamentos diretos.
            </p>
          </div>
        </div>

        {/* Projected Outcomes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Outcome 1: Projected Peak Wait Time */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                Tempo Médio no Pico Projetado
              </span>
              <p className="text-2xl font-black text-amber-300 mt-0.5">
                {simulatedPeakWaitTime} <span className="text-xs font-normal text-white">minutos</span>
              </p>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <ArrowDownRight className="w-3 h-3" />
                -{(22.4 - parseFloat(simulatedPeakWaitTime)).toFixed(1)} min de redução
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Outcome 2: Conversion Rate */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                Taxa de Conversão em Agendamento
              </span>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">
                {simulatedConversionRate}% <span className="text-xs font-normal text-white">de conversão</span>
              </p>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <ArrowUpRight className="w-3 h-3" />
                +{(simulatedConversionRate - 62)}% ganho em novos pacientes
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Outcome 3: Burnout & Overload Index */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                Índice de Sobrecarga da Equipe
              </span>
              <p className="text-sm font-black text-white mt-1">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${simulatedBurnoutRisk.color}`}>
                  {simulatedBurnoutRisk.label}
                </span>
              </p>
              <span className="text-[10px] text-purple-200 block mt-1">
                Equilíbrio sustentável de atendimento
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-400/20 text-purple-300 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
