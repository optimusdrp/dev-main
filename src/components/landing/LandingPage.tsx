import React, { useState } from 'react';
import { ViewMode } from '../../types';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  Bot,
  MessageSquare,
  Activity,
  ArrowRight,
  CheckCircle2,
  Users,
  Calendar,
  Zap,
  ChevronRight,
  FileText,
  Star,
  Building2,
  LogIn
} from 'lucide-react';

interface LandingPageProps {
  setViewMode: (mode: ViewMode) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setViewMode }) => {
  const [patientsPerMonth, setPatientsPerMonth] = useState(300);

  // ROI Calculator
  const estimatedRecoveredPatients = Math.round(patientsPerMonth * 0.18);
  const estimatedRevenueGain = estimatedRecoveredPatients * 250;

  return (
    <div className="bg-[#f8f9fc] text-slate-800 min-h-screen selection:bg-purple-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-purple-900 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            <span>CRM Médico 100% LGPD & Criptografia Ponta a Ponta</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Transforme Conversas no WhatsApp em <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">Agendamentos Médicos</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            O MediFlux é a plataforma CRM especializada para clínicas e hospitais que automatiza o histórico de atendimento, lê carteirinhas de convênio via IA e conecta perfeitamente ao seu Prontuário Eletrônico (PEP).
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setViewMode('crm')}
              className="w-full sm:w-auto bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              <span>Experimentar Demonstração do CRM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('login')}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-sm px-6 py-3.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-purple-700" />
              <span>Acessar Conta (Login)</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Criptografia AES-256
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Integração iClinic, Feegow & HiDoctor
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Conformidade CFM & TISS
            </span>
          </div>
        </div>

        {/* Dashboard Preview Frame matching Screenshots */}
        <div className="mt-12 relative max-w-5xl mx-auto rounded-2xl border border-slate-200 shadow-2xl overflow-hidden bg-white">
          <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-white text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-400 font-mono text-[11px] ml-2">
                app.mediflux.com.br/central-atendimentos
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> E2EE Conectado
            </span>
          </div>

          {/* Screenshot Teaser Overlay Click to Open */}
          <div className="relative group cursor-pointer" onClick={() => setViewMode('crm')}>
            <div className="p-6 bg-[#2e1065] text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-purple-300 bg-purple-900/80 px-2.5 py-1 rounded-full border border-purple-700">
                  SISTEMA COMPLETO EM OPERAÇÃO
                </span>
                <h3 className="text-2xl font-black">
                  Central de Atendimentos MediFlux com Agente IA Ativo
                </h3>
                <p className="text-xs text-purple-200 max-w-xl">
                  Veja a fila em tempo real, sugestões inteligentes de resposta para exames, verificação de elegibilidade Bradesco/SulAmérica e histórico de consultas.
                </p>
              </div>
              <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg transition-transform group-hover:scale-105 shrink-0">
                Abrir App ao Vivo →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Desenvolvido Especialmente para a Jornada do Paciente
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Tudo o que sua recepção e equipe comercial precisam para não perder nenhum atendimento e reduzir a taxa de absenteísmo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Inbox Unificado & Atribuição de Responsável
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralize WhatsApp, Telegram e Instagram. Atribua atendentes, acompanhe o tempo de espera e evite conversas duplicadas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xl">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Agente IA Copilot & Leitura de Carteirinhas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A IA lê fotos de carteirinhas de convênio automaticamente, confirma elegibilidade TISS e sugere respostas rápidas sobre procedimentos.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                100% LGPD & Log Imutável de Acessos
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Criptografia de ponta a ponta, registros auditáveis de consulta a dados médicos e canal direto para DPO em conformidade com a legislação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section className="py-16 bg-[#f8f9fc]">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              SIMULADOR DE IMPACTO FINANCEIRO
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Quanto sua clínica deixa de faturar por demorar a responder?
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Pacientes recebidos por mês via WhatsApp/Site:</span>
                <span className="text-purple-700 text-sm">{patientsPerMonth} pacientes</span>
              </div>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={patientsPerMonth}
                onChange={(e) => setPatientsPerMonth(Number(e.target.value))}
                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-center">
                <p className="text-xs font-bold text-purple-900">Pacientes Recuperados / Mês</p>
                <p className="text-3xl font-black text-purple-800 mt-1">
                  +{estimatedRecoveredPatients}
                </p>
                <p className="text-[10px] text-purple-600">
                  Com redução do SLA de 2h para 12 min
                </p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                <p className="text-xs font-bold text-emerald-900">Aumento Estimado na Receita</p>
                <p className="text-3xl font-black text-emerald-700 mt-1">
                  R$ {estimatedRevenueGain.toLocaleString('pt-BR')},00
                </p>
                <p className="text-[10px] text-emerald-600">
                  Considerando ticket médio de R$ 250,00
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="bg-slate-900 text-white py-12 px-4 border-t border-slate-800 text-center space-y-4">
        <h3 className="text-xl font-bold">
          Pronto para modernizar o atendimento médico da sua clínica?
        </h3>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Acesse a demonstração interativa agora mesmo sem necessidade de cadastro.
        </p>
        <button
          onClick={() => setViewMode('crm')}
          className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-6 py-3 rounded-xl shadow-lg transition-all"
        >
          Iniciar Demonstração MediFlux CRM →
        </button>
        <p className="text-[10px] text-slate-500 pt-6">
          © 2026 MediFlux CRM Health. Todos os direitos reservados. Em conformidade com LGPD & CFM.
        </p>
      </footer>
    </div>
  );
};
