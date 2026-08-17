import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
  Zap,
  CheckCircle2,
  Shield,
  ArrowRight,
  Stethoscope,
  ClipboardList,
  TrendingUp,
  Lock,
  UserCheck,
  Award,
  BookOpen,
  Star,
  RefreshCw
} from 'lucide-react';
import { CRMTab, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

export interface TourStep {
  targetSelector?: string;
  title: string;
  description: string;
  roleTip?: string; // Specific advice for the role
  tabRedirect?: CRMTab;
  position?: 'bottom' | 'top' | 'left' | 'right' | 'center';
}

export type LearningPathId = 'medico' | 'secretario' | 'gestor' | 'auditoria';

export interface LearningPath {
  id: LearningPathId;
  title: string;
  subtitle: string;
  targetRoleName: string;
  targetRoles: UserRole[];
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  borderColor: string;
  estimatedTime: string;
  description: string;
  steps: TourStep[];
}

const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'medico',
    title: 'Primeiros Passos para Médicos 🩺',
    subtitle: 'Foco no atendimento clínico, prontuário e apoio por IA',
    targetRoleName: 'Profissional de Saúde',
    targetRoles: ['Profissional de Saúde', 'Administrador'],
    icon: Stethoscope,
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    borderColor: 'hover:border-emerald-500',
    estimatedTime: '2 min (4 passos)',
    description: 'Aprenda a realizar atendimentos no chat, consultar o prontuário integrado, usar o copiloto Gemini e gerenciar laudos.',
    steps: [
      {
        targetSelector: '#sidebar-nav-atendimentos',
        title: 'Central de Atendimentos Omnichannel 💬',
        description: 'Seu ambiente principal de consulta. Converse com pacientes no WhatsApp, acesse historiais clínicos e utilize a IA para síntese de sintomas.',
        roleTip: '💡 Dica para Corpo Clínico: Ative o Copiloto Gemini na barra lateral do chat para gerar resumos de prontuário em um clique.',
        tabRedirect: 'atendimentos',
        position: 'right'
      },
      {
        targetSelector: '#sidebar-nav-jornadas',
        title: 'Evolução da Jornada do Paciente 📊',
        description: 'Acompanhe em qual estágio do tratamento cada paciente se encontra no quadro Kanban de saúde.',
        roleTip: '💡 Dica para Corpo Clínico: Mova cartões para "Consulta Realizada" para automatizar o envio da pesquisa de satisfação.',
        tabRedirect: 'jornadas',
        position: 'right'
      },
      {
        targetSelector: '#sidebar-nav-pendencias',
        title: 'Solicitações Clínicas & Pendências ⏳',
        description: 'Gerencie laudos pendentes, pedidos de exames e chamados da recepção com controle rígido de tempo limite (SLA).',
        roleTip: '💡 Dica para Corpo Clínico: Priorize pendências com tag "Alta Urgência" para manter o indicador de SLA zerado.',
        tabRedirect: 'pendencias',
        position: 'right'
      },
      {
        targetSelector: '#sidebar-nav-visao-geral',
        title: 'Resumo Diário de Consultas 📈',
        description: 'Visualize a lista de pacientes do dia, confirmações de presença e atalhos rápidos de prescrição.',
        roleTip: '💡 Dica para Corpo Clínico: Consulte os cards estatísticos no início do plantão para prever o volume de retornos.',
        tabRedirect: 'visao-geral',
        position: 'right'
      }
    ]
  },
  {
    id: 'secretario',
    title: 'Primeiros Passos para Secretários & Recepção 📋',
    subtitle: 'Foco em triagem rápida, recepção e agendamento',
    targetRoleName: 'Recepção',
    targetRoles: ['Recepção', 'Administrador'],
    icon: ClipboardList,
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    borderColor: 'hover:border-purple-500',
    estimatedTime: '2 min (4 passos)',
    description: 'Aprenda a fazer recepção de pacientes, controlar a fila de espera, enviar mensagens de pré-consulta e monitorar alertas.',
    steps: [
      {
        targetSelector: '#header-notifications-btn',
        title: 'Central de Alertas & Notificações 🔔',
        description: 'Sua linha direta para mensagens urgentes do WhatsApp e avisos de pacientes aguardando na recepção.',
        roleTip: '💡 Dica para Recepção: Ative as Notificações de Área de Trabalho para ouvir e ver alertas mesmo com a aba em segundo plano.',
        tabRedirect: 'visao-geral',
        position: 'bottom'
      },
      {
        targetSelector: '#sidebar-nav-atendimentos',
        title: 'Triagem & Atendimento Omnichannel 💬',
        description: 'Centralize conversas do WhatsApp, utilize respostas rápidas (templates) e faça o pré-cadastro de convênios.',
        roleTip: '💡 Dica para Recepção: Salve rascunhos de mensagens para continuar o atendimento mais tarde sem perder informações.',
        tabRedirect: 'atendimentos',
        position: 'right'
      },
      {
        targetSelector: '#sidebar-nav-jornadas',
        title: 'Gestão da Sala de Espera no Kanban 📊',
        description: 'Monitore pacientes desde a chegada no balcão até a entrada no consultório médico.',
        roleTip: '💡 Dica para Recepção: Arraste o paciente para "Em Atendimento" assim que ele entrar no consultório.',
        tabRedirect: 'jornadas',
        position: 'right'
      },
      {
        targetSelector: '#sidebar-nav-pendencias',
        title: 'Controle de SLAs da Recepção ⏳',
        description: 'Evite filas de espera monitorando os temporizadores de resposta ao paciente.',
        roleTip: '💡 Dica para Recepção: Filtre pendências por "Atribuição: Recepção" para resolver chamados do seu turno.',
        tabRedirect: 'pendencias',
        position: 'right'
      }
    ]
  },
  {
    id: 'gestor',
    title: 'Gestão Executiva & Financeira 📈',
    subtitle: 'Foco em indicadores, faturamento e gestão de equipe',
    targetRoleName: 'Gestão / Financeiro',
    targetRoles: ['Administrador', 'Contador (financeiro)', 'Terceirizado'],
    icon: TrendingUp,
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    borderColor: 'hover:border-blue-500',
    estimatedTime: '3 min (4 passos)',
    description: 'Explore relatórios de faturamento, gráficos de retenção de pacientes, automações 24/7 e gestão de acessos.',
    steps: [
      {
        targetSelector: '#sidebar-nav-visao-geral',
        title: 'DRE & Dashboard Executivo 📈',
        description: 'Acompanhe faturamento do mês, ticket médio das consultas, ocupação das salas e métricas operacionais.',
        roleTip: '💡 Dica para Gestão: Utilize o seletor de datas para comparar a taxa de conversão entre diferentes períodos.',
        tabRedirect: 'visao-geral',
        position: 'right'
      },
      {
        targetSelector: '#sidebar-nav-indicadores',
        title: 'Relatórios Avançados & Métricas 📊',
        description: 'Analise o custo de aquisição por canal, taxa de absenteísmo e exporte relatórios consolidados em CSV.',
        roleTip: '💡 Dica para Gestão: Monitore o tempo médio de espera para identificar necessidade de reforço na equipe médica.',
        tabRedirect: 'indicadores',
        position: 'right'
      },
      {
        targetSelector: '#sidebar-nav-automacoes',
        title: 'Agentes Virtuais de Agendamento 🤖',
        description: 'Configure robôs inteligentes para confirmação de consultas via WhatsApp 24h sem intervenção humana.',
        roleTip: '💡 Dica para Gestão: Ative a regra de reengajamento para pacientes que não realizam retornos há mais de 6 meses.',
        tabRedirect: 'automacoes',
        position: 'right'
      },
      {
        targetSelector: '#sidebar-nav-configuracoes',
        title: 'Controle de Acessos & RBAC ⚙️',
        description: 'Gerencie permissões de uso, adicione novos usuários e configure integrações de prontuário (EHR).',
        roleTip: '💡 Dica para Gestão: Atribua papéis restritos para estagiários e recepcionistas garantindo sigilo financeiro.',
        tabRedirect: 'configuracoes',
        position: 'right'
      }
    ]
  },
  {
    id: 'auditoria',
    title: 'Segurança & Conformidade LGPD 🛡️',
    subtitle: 'Foco em rastreabilidade imutável e proteção de dados',
    targetRoleName: 'Segurança & TI',
    targetRoles: ['Administrador', 'Terceirizado'],
    icon: Lock,
    badgeColor: 'bg-slate-100 text-slate-900 border-slate-300',
    borderColor: 'hover:border-slate-500',
    estimatedTime: '2 min (3 passos)',
    description: 'Entenda como o MediFlux registra acessos a dados sensíveis de pacientes conforme exigências da LGPD.',
    steps: [
      {
        targetSelector: '#sidebar-nav-auditoria',
        title: 'Logs de Auditoria LGPD 🛡️',
        description: 'Rastreabilidade total e imutável de quem visualizou, editou ou exportou prontuários médicos.',
        roleTip: '💡 Dica para Segurança: Filtre por eventos de "Exportação de Dados" para monitorar downloads de prontuários.',
        tabRedirect: 'auditoria',
        position: 'right'
      },
      {
        targetSelector: '#sidebar-nav-configuracoes',
        title: 'Matriz de Permissões RBAC ⚙️',
        description: 'Ajuste políticas de mínimo privilégio por perfil de usuário da clínica.',
        roleTip: '💡 Dica para Segurança: Revise as permissões de acesso ao faturamento a cada contratação ou desligamento.',
        tabRedirect: 'configuracoes',
        position: 'right'
      },
      {
        targetSelector: '#header-notifications-btn',
        title: 'Alertas de Acessos Anômalos 🔔',
        description: 'Monitore avisos de tentativas de login fora do horário de atendimento ou acessos não autorizados.',
        roleTip: '💡 Dica para Segurança: Configure alertas no WhatsApp dos administradores para bloqueio preventivo de acessos.',
        tabRedirect: 'visao-geral',
        position: 'bottom'
      }
    ]
  }
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: CRMTab) => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { user, hasPermission } = useAuth();
  const [selectedPathId, setSelectedPathId] = useState<LearningPathId>('medico');
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Automatically suggest best path based on user role when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsTourActive(false);
      setCurrentStepIndex(0);

      const userRole = user?.role || 'Recepção';
      if (userRole === 'Profissional de Saúde') {
        setSelectedPathId('medico');
      } else if (userRole === 'Recepção') {
        setSelectedPathId('secretario');
      } else if (userRole === 'Contador (financeiro)') {
        setSelectedPathId('gestor');
      } else {
        setSelectedPathId('gestor');
      }
    }
  }, [isOpen, user?.role]);

  const activePath = LEARNING_PATHS.find((p) => p.id === selectedPathId) || LEARNING_PATHS[0];

  // Filter steps in path based on user's actual RBAC permissions
  const allowedSteps = activePath.steps.filter((s) => !s.tabRedirect || hasPermission(s.tabRedirect));
  const step = allowedSteps[currentStepIndex];

  // Keyboard Navigation Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !isTourActive) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isTourActive, currentStepIndex, allowedSteps.length]);

  // Handle step updates & highlight placement
  useEffect(() => {
    if (!isOpen || !isTourActive || !step) return;

    if (step.tabRedirect && onNavigateTab) {
      onNavigateTab(step.tabRedirect);
    }

    const updateTargetPosition = () => {
      if (step.targetSelector) {
        const el = document.querySelector(step.targetSelector);
        if (el) {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
          return;
        }
      }
      setTargetRect(null);
    };

    const timeout = setTimeout(updateTargetPosition, 200);
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [currentStepIndex, isOpen, isTourActive, step]);

  if (!isOpen) return null;

  // SCREEN 1: PATH SELECTOR SCREEN (Choose Role-Based Path)
  if (!isTourActive) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-purple-100 space-y-6 relative max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-800 text-white flex items-center justify-center shadow-lg shrink-0">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">
                  Caminhos de Aprendizado MediFlux
                </h2>
                <span className="text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-amber-700" />
                  Personalizado
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Escolha o roteiro guiado ideal para a sua rotina e perfil de acesso na clínica.
              </p>
            </div>
          </div>

          {/* User Profile Recommendation Banner */}
          <div className="bg-purple-50 border border-purple-200/90 rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-200/80 text-purple-900 flex items-center justify-center font-black">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-600 font-medium">Seu Perfil Atual: </span>
                <strong className="text-purple-900 font-black">{user?.role || 'Usuário'}</strong>
                <p className="text-[11px] text-purple-700 font-bold">
                  Sugerimos o caminho de aprendizado recomendado para sua função.
                </p>
              </div>
            </div>

            <span className="text-[10px] bg-purple-200 text-purple-900 font-extrabold px-2.5 py-1 rounded-xl shrink-0 hidden sm:inline-block">
              RBAC Ativo
            </span>
          </div>

          {/* Learning Path Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {LEARNING_PATHS.map((path) => {
              const Icon = path.icon;
              const isSuggested = path.targetRoles.includes(user?.role as UserRole);
              const isSelected = selectedPathId === path.id;

              return (
                <button
                  key={path.id}
                  type="button"
                  onClick={() => setSelectedPathId(path.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-purple-900 text-white border-purple-700 shadow-xl ring-2 ring-purple-500/50 scale-[1.01]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {isSuggested && (
                    <span className={`absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-400 text-amber-950 border-amber-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      <Star className="w-2.5 h-2.5 text-amber-700 fill-amber-700" />
                      Sugerido
                    </span>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isSelected ? 'bg-purple-800 text-amber-300' : 'bg-purple-100 text-purple-800'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        isSelected ? 'bg-purple-800 text-purple-100 border-purple-700' : path.badgeColor
                      }`}>
                        {path.targetRoleName}
                      </span>
                    </div>

                    <h3 className={`text-sm font-extrabold leading-snug ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {path.title}
                    </h3>

                    <p className={`text-xs leading-relaxed ${isSelected ? 'text-purple-200' : 'text-slate-500'}`}>
                      {path.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-purple-800/40 flex items-center justify-between text-[10px] font-bold">
                    <span className={isSelected ? 'text-purple-300' : 'text-slate-400'}>
                      {path.estimatedTime}
                    </span>
                    <span className={isSelected ? 'text-amber-300 underline font-black' : 'text-purple-700'}>
                      {isSelected ? 'Selecionado ✓' : 'Escolher Roteiro'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold hover:underline cursor-pointer"
            >
              Navegar sem tutorial
            </button>

            <button
              type="button"
              onClick={() => {
                setIsTourActive(true);
                setCurrentStepIndex(0);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Iniciar Aprendizado: {activePath.title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 2: ACTIVE TOUR STEPS OVERLAY
  if (allowedSteps.length === 0) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
          <p className="text-xs font-bold text-slate-800">
            Nenhum módulo disponível para o perfil {user?.role} neste caminho de aprendizado.
          </p>
          <button
            type="button"
            onClick={() => setIsTourActive(false)}
            className="w-full bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer"
          >
            Escolher Outro Roteiro
          </button>
        </div>
      </div>
    );
  }

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === allowedSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
      setCurrentStepIndex(0);
      setIsTourActive(false);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Compute position for tooltip
  let tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999,
  };

  if (targetRect && step.position !== 'center') {
    const margin = 14;
    if (step.position === 'bottom') {
      tooltipStyle = {
        position: 'fixed',
        top: `${targetRect.bottom + margin}px`,
        left: `${Math.max(16, Math.min(window.innerWidth - 380, targetRect.left))}px`,
        zIndex: 9999,
      };
    } else if (step.position === 'right') {
      tooltipStyle = {
        position: 'fixed',
        top: `${Math.max(16, targetRect.top)}px`,
        left: `${targetRect.right + margin}px`,
        zIndex: 9999,
      };
    } else if (step.position === 'top') {
      tooltipStyle = {
        position: 'fixed',
        bottom: `${window.innerHeight - targetRect.top + margin}px`,
        left: `${Math.max(16, targetRect.left)}px`,
        zIndex: 9999,
      };
    }
  }

  return (
    <div className="fixed inset-0 z-[9990] pointer-events-auto">
      {/* Dark Overlay with cut-out hole effect */}
      {targetRect ? (
        <>
          <div
            className="fixed bg-slate-900/65 backdrop-blur-xs transition-all duration-300"
            style={{ top: 0, left: 0, width: '100vw', height: `${Math.max(0, targetRect.top - 6)}px` }}
          />
          <div
            className="fixed bg-slate-900/65 backdrop-blur-xs transition-all duration-300"
            style={{ top: `${targetRect.bottom + 6}px`, left: 0, width: '100vw', height: `${Math.max(0, window.innerHeight - targetRect.bottom - 6)}px` }}
          />
          <div
            className="fixed bg-slate-900/65 backdrop-blur-xs transition-all duration-300"
            style={{ top: `${Math.max(0, targetRect.top - 6)}px`, left: 0, width: `${Math.max(0, targetRect.left - 6)}px`, height: `${targetRect.height + 12}px` }}
          />
          <div
            className="fixed bg-slate-900/65 backdrop-blur-xs transition-all duration-300"
            style={{ top: `${Math.max(0, targetRect.top - 6)}px`, left: `${targetRect.right + 6}px`, width: `${Math.max(0, window.innerWidth - targetRect.right - 6)}px`, height: `${targetRect.height + 12}px` }}
          />

          {/* Glowing Target Ring */}
          <div
            className="fixed rounded-2xl border-2 border-purple-400 ring-4 ring-purple-500/50 pointer-events-none transition-all duration-300 animate-pulse"
            style={{
              top: `${targetRect.top - 6}px`,
              left: `${targetRect.left - 6}px`,
              width: `${targetRect.width + 12}px`,
              height: `${targetRect.height + 12}px`,
            }}
          />
        </>
      ) : (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs transition-opacity" />
      )}

      {/* Tooltip Card */}
      <div
        style={tooltipStyle}
        className="w-[330px] sm:w-[400px] bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-purple-200 animate-fadeIn space-y-4 text-slate-800"
      >
        {/* Top Path Badge & Close */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-purple-700" />
              {activePath.title.split(' ')[0]} {activePath.title.split(' ')[1]}
            </span>
            <span className="text-xs font-black text-slate-500">
              Passo {currentStepIndex + 1} de {allowedSteps.length}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setIsTourActive(false)}
              className="p-1 rounded-xl text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-0.5"
              title="Trocar Caminho de Aprendizado"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trocar</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Encerrar Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-base font-extrabold text-slate-900 leading-snug">
            {step.title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {step.description}
          </p>

          {/* Role Tip Callout */}
          {step.roleTip && (
            <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-2.5 text-[11px] text-amber-950 font-bold leading-relaxed mt-2 shadow-2xs">
              {step.roleTip}
            </div>
          )}
        </div>

        {/* Progress Dots & Controls */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            {allowedSteps.map((_, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-purple-700'
                    : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer text-xs font-bold"
                title="Voltar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs hover:shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isLastStep ? 'Concluir 🎉' : 'Próximo'}</span>
              {!isLastStep && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
