import React, { useState, useRef, useEffect } from 'react';
import { ViewMode, CRMTab } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiService } from '../../services/api';
import {
  Search,
  Bell,
  ShieldCheck,
  User,
  Activity,
  LogIn,
  LogOut,
  Globe,
  Menu,
  X,
  Plus,
  ArrowRight,
  ChevronDown,
  MessageSquare,
  AlertTriangle,
  Calendar,
  Sparkles,
  CheckCheck,
  Trash2,
  Filter,
  Compass
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'mensagem' | 'pendencia' | 'agendamento';
  title: string;
  sender: string;
  message: string;
  time: string;
  read: boolean;
  urgent?: boolean;
  tabRedirect: CRMTab;
  patientId?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    type: 'mensagem',
    title: 'Nova Mensagem WhatsApp',
    sender: 'Ana Luíza Vasconcelos',
    message: 'SLA de resposta prestes a vencer. Pergunta sobre preparo de exame.',
    time: 'Há 2 min',
    read: false,
    urgent: true,
    tabRedirect: 'atendimentos',
    patientId: 'p1',
  },
  {
    id: 'notif_2',
    type: 'pendencia',
    title: 'SLA de Validação TISS Urgente',
    sender: 'Bradesco Saúde / Central',
    message: 'Guia #9940 aguardando envio da carteirinha do paciente.',
    time: 'Há 5 min',
    read: false,
    urgent: true,
    tabRedirect: 'pendencias',
  },
  {
    id: 'notif_3',
    type: 'agendamento',
    title: 'Consulta Confirmada',
    sender: 'Beatriz Alves',
    message: 'Confirmou presença para amanhã às 14:00 na Unidade Jardins.',
    time: 'Há 18 min',
    read: false,
    urgent: false,
    tabRedirect: 'visao-geral',
    patientId: 'p2',
  },
  {
    id: 'notif_4',
    type: 'mensagem',
    title: 'Foto Enviada no Chat',
    sender: 'Carlos Eduardo Mendes',
    message: 'Enviou comprovante de transferência bancária.',
    time: 'Há 35 min',
    read: false,
    urgent: false,
    tabRedirect: 'atendimentos',
    patientId: 'p3',
  },
];

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  activeTab: CRMTab;
  setActiveTab: (tab: CRMTab) => void;
  unreadCount?: number;
  onNewAttendanceClick?: () => void;
  onToggleMobileSidebar?: () => void;
  onStartTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  activeTab,
  setActiveTab,
  onNewAttendanceClick,
  onToggleMobileSidebar,
  onStartTour,
}) => {
  const { user, logout } = useAuth();
  const { showInfo, showWarning, showSuccess } = useToast();

  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLgpdPopover, setShowLgpdPopover] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [notifFilter, setNotifFilter] = useState<'todas' | 'mensagens' | 'pendencias'>('todas');

  const userName = user?.name || 'Camila Santos';
  const userRole = user?.role || 'Recepção';
  const userUnit = user?.unit || 'Unidade Jardins';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const notificationsRef = useRef<HTMLDivElement>(null);
  const lgpdRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Automatically trigger a simulated real-time Toast + Notification after 3.5 seconds
  useEffect(() => {
    if (viewMode !== 'crm') return;

    const timer = setTimeout(() => {
      const simulatedMsg: NotificationItem = {
        id: `notif_auto_${Date.now()}`,
        type: 'mensagem',
        title: 'Nova Mensagem de Paciente',
        sender: 'Mariana Costa (WhatsApp)',
        message: 'Olá! Consegue confirmar se minha guia de convênio foi autorizada?',
        time: 'Agora',
        read: false,
        urgent: true,
        tabRedirect: 'atendimentos',
        patientId: 'p4',
      };

      setNotifications((prev) => [simulatedMsg, ...prev]);
      showInfo(
        '💬 Nova Mensagem de Paciente',
        'Mariana Costa: "Olá! Consegue confirmar se minha guia de convênio foi autorizada?"'
      );
    }, 3500);

    return () => clearTimeout(timer);
  }, [viewMode]);

  // Fetch real urgent patients from backend API to initialize critical pendencies notifications
  useEffect(() => {
    async function loadUrgentNotifications() {
      try {
        const patients = await apiService.getPatients();
        if (patients && Array.isArray(patients) && patients.length > 0) {
          const urgentPatients = patients.filter(
            (p) => p.urgency === 'alta' || p.slaWarning || p.status === 'pendente'
          );

          if (urgentPatients.length > 0) {
            const urgentNotifs: NotificationItem[] = urgentPatients.map((p) => ({
              id: `api_pend_${p.id}`,
              type: 'pendencia',
              title: `⚠️ SLA Urgente: ${p.name}`,
              sender: `${p.name} (${p.insurance || 'Particular'})`,
              message: p.slaWarning || p.lastMessage || 'Atendimento urgente com tempo limite de SLA excedido.',
              time: p.lastMessageTime || 'Há 15 min',
              read: false,
              urgent: true,
              tabRedirect: 'atendimentos',
              patientId: p.id,
            }));

            setNotifications((prev) => {
              const existingIds = new Set(prev.map((n) => n.id));
              const fresh = urgentNotifs.filter((n) => !existingIds.has(n.id));
              return fresh.length > 0 ? [...fresh, ...prev] : prev;
            });
          }
        }
      } catch (err) {
        console.warn('[Header] Error loading urgent patients:', err);
      }
    }

    if (viewMode === 'crm') {
      loadUrgentNotifications();
    }
  }, [viewMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        lgpdRef.current &&
        !lgpdRef.current.contains(event.target as Node)
      ) {
        setShowLgpdPopover(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setViewMode('login');
    setShowProfileMenu(false);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showSuccess('Notificações lidas', 'Todas as notificações foram marcadas como lidas.');
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    showInfo('Notificações limpas', 'O histórico de notificações foi limpo.');
  };

  const handleSimulateNewAlert = () => {
    const isUrgentPending = Math.random() > 0.5;
    const newId = `notif_sim_${Date.now()}`;

    if (isUrgentPending) {
      const names = ['Fernanda Lima', 'Gabriel Souza', 'Luciana Pereira', 'Dr. Roberto Andrade'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const newNotif: NotificationItem = {
        id: newId,
        type: 'pendencia',
        title: '⚠️ Pendência SLA Crítica',
        sender: randomName,
        message: 'Atendimento retido na Triagem por mais de 15 minutos sem resposta.',
        time: 'Agora',
        read: false,
        urgent: true,
        tabRedirect: 'pendencias',
      };
      setNotifications((prev) => [newNotif, ...prev]);
      showWarning(
        '⚠️ Alerta de Pendência SLA Urgente',
        `Tempo limite de resposta excedido para ${randomName}.`
      );
    } else {
      const names = ['Patrícia Ramos', 'Rodrigo Santoro', 'Helena Becker', 'Marcelo Rios'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const newNotif: NotificationItem = {
        id: newId,
        type: 'mensagem',
        title: '💬 Nova Mensagem de Paciente',
        sender: randomName,
        message: 'Poderia me enviar a chave Pix para pagamento do orçamento?',
        time: 'Agora',
        read: false,
        urgent: false,
        tabRedirect: 'atendimentos',
      };
      setNotifications((prev) => [newNotif, ...prev]);
      showInfo(
        '💬 Nova Mensagem Recebida',
        `${randomName}: "Poderia me enviar a chave Pix para pagamento?"`
      );
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setShowNotifications(false);
    setActiveTab(item.tabRedirect);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentCount = notifications.filter((n) => !n.read && n.urgent).length;

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'mensagens') return n.type === 'mensagem';
    if (notifFilter === 'pendencias') return n.type === 'pendencia' || n.urgent;
    return true;
  });

  // PUBLIC LANDING / LOGIN HEADER
  if (viewMode !== 'crm') {
    return (
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Logo */}
          <div
            onClick={() => setViewMode('landing')}
            className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer group shrink-0 min-w-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-800 to-indigo-600 flex items-center justify-center text-white font-black text-sm sm:text-base shadow-xs group-hover:scale-105 transition-transform shrink-0">
              M
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-lg leading-none block truncate">
                MediFlux
              </span>
              <span className="text-[9px] sm:text-[10px] text-purple-700 font-semibold leading-none block mt-0.5 truncate">
                CRM Saúde & LGPD
              </span>
            </div>
          </div>

          {/* Landing Nav Links */}
          {viewMode === 'landing' && (
            <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600 shrink-0">
              <a href="#recursos" className="hover:text-purple-700 transition-colors">
                Recursos
              </a>
              <a href="#lgpd" className="hover:text-purple-700 transition-colors flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>LGPD & Criptografia</span>
              </a>
              <a href="#roi" className="hover:text-purple-700 transition-colors">
                Calculadora ROI
              </a>
            </nav>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {viewMode === 'landing' ? (
              <>
                <button
                  onClick={() => setViewMode('login')}
                  className="text-xs font-bold text-purple-900 hover:text-purple-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-purple-50 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-purple-700" />
                  <span className="hidden xs:inline">Entrar</span>
                </button>
                <button
                  onClick={() => setViewMode(user ? 'crm' : 'login')}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-xs transition-all flex items-center gap-1 sm:gap-1.5 active:scale-95 shrink-0 cursor-pointer"
                >
                  <span>Área Restrita</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setViewMode('landing')}
                className="text-xs font-bold text-slate-700 hover:text-purple-900 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-purple-600" />
                <span>Voltar ao Site</span>
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // RESTRICTED CRM DASHBOARD HEADER (LOGGED IN USER)
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-2.5 sm:px-4 lg:px-6 py-2 sm:py-2.5 shadow-2xs">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
        {/* Left Section: Mobile Menu Toggle + Breadcrumb & Unit Badge */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 min-w-0 shrink">
          {/* Mobile Sidebar Toggle */}
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-1.5 text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200/80 transition-colors shrink-0 focus:outline-none cursor-pointer"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* CRM Breadcrumb / Title */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 min-w-0">
            <span className="text-[9px] sm:text-xs font-bold text-purple-800 bg-purple-50 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-purple-200/80 flex items-center gap-1 shrink-0 shadow-2xs">
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600 animate-pulse shrink-0" />
              <span className="hidden xs:inline">MEDIFLUX</span>
              <span className="xs:hidden">CRM</span>
            </span>
            <span className="text-slate-300 font-light hidden xs:inline shrink-0">/</span>
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 capitalize truncate max-w-[85px] xs:max-w-[130px] sm:max-w-[180px] md:max-w-none">
              {activeTab.replace('-', ' ')}
            </h1>
            <span className="text-xs text-slate-400 hidden xl:inline-block shrink-0">
              • Unidade Jardins
            </span>
          </div>
        </div>

        {/* Center Section: Global Search Input */}
        <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-md mx-3 lg:mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar paciente, CPF, convênio ou conversa... (⌘K)"
              className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all shadow-2xs"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section: Action Buttons & User Profile */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Mobile Search Icon Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors shrink-0 cursor-pointer"
            aria-label="Buscar"
            title="Abrir busca rápida"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* LGPD Security Shield Popover (Visible on md+ screens) */}
          <div className="relative hidden md:block" ref={lgpdRef}>
            <button
              onClick={() => {
                setShowLgpdPopover(!showLgpdPopover);
                setShowNotifications(false);
                setShowProfileMenu(false);
              }}
              title="Central de Conformidade LGPD & Criptografia E2EE"
              className={`p-1.5 sm:p-2 rounded-xl transition-colors relative flex items-center justify-center cursor-pointer ${
                showLgpdPopover
                  ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400'
                  : 'text-emerald-700 hover:bg-emerald-50 bg-emerald-50/50 border border-emerald-200/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </button>

            {/* LGPD Popover */}
            {showLgpdPopover && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-fadeIn space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Conformidade LGPD Ativa
                    </span>
                  </div>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    E2EE AES-256
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <p className="font-bold text-slate-800 text-[11px]">
                      Criptografia Ponta a Ponta:
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Prontuários e conversas cifrados. Nenhum dado de saúde vazado.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <p className="font-bold text-slate-800 text-[11px]">
                      Encarregado DPO:
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Dr. Roberto Andrade (<span className="text-purple-700 font-mono">dpo@mediflux.com.br</span>)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('auditoria');
                    setShowLgpdPopover(false);
                  }}
                  className="w-full bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs py-2 rounded-xl border border-purple-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Abrir Logs de Auditoria</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Global Critical Pendencies Badge Widget (Visible on md+ screens) */}
          <button
            id="header-critical-pendencies-btn"
            onClick={() => {
              setNotifFilter('pendencias');
              setShowNotifications(true);
              setShowLgpdPopover(false);
              setShowProfileMenu(false);
            }}
            className={`hidden md:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all items-center gap-1 sm:gap-1.5 font-bold text-xs cursor-pointer shadow-2xs shrink-0 ${
              urgentCount > 0
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-300 ring-2 ring-rose-200/80 animate-pulse'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Sistema de Notificação Global: Tarefas & Pendências Críticas com Alerta SLA"
            aria-label="Pendências Críticas"
          >
            <AlertTriangle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${urgentCount > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-400'}`} />
            <span className="hidden sm:inline font-extrabold text-[11px] tracking-tight">
              Pendências
            </span>
            <span
              className={`min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px] px-1 sm:px-1.5 font-black text-[9px] sm:text-[10px] rounded-full flex items-center justify-center transition-transform ${
                urgentCount > 0
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {urgentCount}
            </span>
          </button>

          {/* Guided Tour Header Button (Shown on lg+ screens) */}
          {onStartTour && (
            <button
              onClick={onStartTour}
              className="hidden lg:flex p-1.5 sm:px-3 sm:py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 rounded-xl transition-all items-center gap-1.5 font-bold text-xs cursor-pointer shadow-2xs shrink-0"
              title="Iniciar Tour Guiado pelo CRM"
            >
              <Compass className="w-4 h-4 text-purple-700 animate-spin-slow" />
              <span>Tour Guiado</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              id="header-notifications-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowLgpdPopover(false);
                setShowProfileMenu(false);
              }}
              className={`p-1.5 sm:p-2 rounded-xl transition-all relative flex items-center justify-center cursor-pointer shrink-0 ${
                showNotifications
                  ? 'bg-purple-100 text-purple-800 ring-2 ring-purple-400 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
              aria-label="Notificações"
              title="Notificações & Alertas em Tempo Real"
            >
              <Bell className="w-4 h-4 text-slate-700" />

              {/* Dynamic Badge Count */}
              {(unreadCount > 0 || (urgentCount > 0)) && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-rose-600 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                  {unreadCount > 0 ? unreadCount : urgentCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-sm sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50 animate-fadeIn space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-purple-100 text-purple-800 rounded-lg">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-none">
                        Notificações & Alertas
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {unreadCount > 0 ? `${unreadCount} não lidas` : 'Nenhuma pendência nova'}
                      </p>
                    </div>
                  </div>

                  {urgentCount > 0 && (
                    <span className="text-[9px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      {urgentCount} urgente{urgentCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center justify-between bg-slate-100/80 p-1 rounded-xl text-[11px] font-bold text-slate-600">
                  <button
                    onClick={() => setNotifFilter('todas')}
                    className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                      notifFilter === 'todas'
                        ? 'bg-white text-purple-900 shadow-2xs font-extrabold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    Todas ({notifications.length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('mensagens')}
                    className={`flex-1 py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      notifFilter === 'mensagens'
                        ? 'bg-white text-purple-900 shadow-2xs font-extrabold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3 text-purple-600" />
                    Mensagens
                  </button>
                  <button
                    onClick={() => setNotifFilter('pendencias')}
                    className={`flex-1 py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      notifFilter === 'pendencias'
                        ? 'bg-white text-purple-900 shadow-2xs font-extrabold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Urgentes
                  </button>
                </div>

                {/* Quick Action Toolbar */}
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-0.5">
                  <button
                    onClick={handleSimulateNewAlert}
                    className="text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200/80 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Testar alerta com Toast na tela"
                  >
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>+ Simular Novo Alerta</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-slate-600 hover:text-purple-800 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Marcar todas como lidas"
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Marcar lidas</span>
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearNotifications}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="Limpar todas as notificações"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                  {filteredNotifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                      <p className="font-semibold">Nenhuma notificação encontrada</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Clique em "+ Simular Novo Alerta" para testar os avisos.
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                          !item.read
                            ? item.urgent
                              ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/80'
                              : 'bg-purple-50/60 border-purple-200 hover:bg-purple-100/70'
                            : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80 opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {item.type === 'mensagem' && (
                              <MessageSquare className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            )}
                            {item.type === 'pendencia' && (
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            )}
                            {item.type === 'agendamento' && (
                              <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            )}

                            <span className="font-bold text-xs text-slate-900 truncate">
                              {item.sender}
                            </span>
                          </div>

                          <span className="text-[9px] font-semibold text-slate-400 shrink-0">
                            {item.time}
                          </span>
                        </div>

                        <p className="text-[11px] font-bold text-slate-800 mt-1 leading-snug">
                          {item.title}
                        </p>

                        <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] gap-2">
                          <span
                            className={`font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                              item.urgent
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {item.urgent ? 'SLA Urgente' : item.type.toUpperCase()}
                          </span>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {!item.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNotifications((prev) =>
                                    prev.map((n) =>
                                      n.id === item.id ? { ...n, read: true, urgent: false } : n
                                    )
                                  );
                                  showSuccess('Pendência Concluída', `Atendimento de ${item.sender} marcado como resolvido.`);
                                }}
                                className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-bold px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                title="Marcar esta pendência como resolvida"
                              >
                                <CheckCheck className="w-3 h-3 text-emerald-600" />
                                <span>Resolver</span>
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(item);
                              }}
                              className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-2.5 py-0.5 rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <span>Atender</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
                setShowLgpdPopover(false);
              }}
              className="flex items-center space-x-1.5 sm:space-x-2 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none shrink-0 cursor-pointer"
              title="Menu do Usuário"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-800 text-white font-extrabold text-xs flex items-center justify-center ring-2 ring-purple-200 shadow-2xs shrink-0">
                {userInitials}
              </div>
              <div className="hidden lg:block text-left text-xs leading-tight">
                <span className="font-bold text-slate-900 block truncate max-w-[120px]">
                  {userName}
                </span>
                <span className="text-[10px] text-purple-700 font-semibold block truncate max-w-[120px]">
                  {userRole}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block shrink-0" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-xs sm:w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-50 animate-fadeIn space-y-2">
                <div className="p-2.5 bg-purple-50/80 rounded-xl border border-purple-100 flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-purple-800 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs shrink-0">
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-purple-950 truncate">
                      {userName}
                    </p>
                    <p className="text-[10px] text-purple-700 font-semibold truncate">
                      {userRole} • {userUnit}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Sessão Next-Auth Ativa
                    </span>
                  </div>
                </div>

                {/* Mobile Quick Action Cards (Visible only on mobile < md) */}
                <div className="md:hidden space-y-1.5 border-y border-slate-100 py-2">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
                    Status & Ações Rápidas
                  </p>

                  <button
                    onClick={() => {
                      setNotifFilter('pendencias');
                      setShowNotifications(true);
                      setShowProfileMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      urgentCount > 0
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className={`w-4 h-4 shrink-0 ${urgentCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
                      <span className="truncate">Tarefas & SLA</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      urgentCount > 0 ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {urgentCount} pendente{urgentCount !== 1 ? 's' : ''}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('auditoria');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-xs font-bold text-emerald-900 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">Conformidade LGPD</span>
                    </div>
                    <span className="text-[9px] font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-md shrink-0">
                      AES-256
                    </span>
                  </button>

                  {onStartTour && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onStartTour();
                      }}
                      className="w-full text-left p-2 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-xs font-bold text-purple-900 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Compass className="w-4 h-4 text-purple-700 animate-spin-slow shrink-0" />
                      <span>Iniciar Tour Guiado</span>
                    </button>
                  )}
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setActiveTab('auditoria');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-900 font-medium flex items-center gap-2 transition-colors cursor-pointer hidden md:flex"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Conformidade & Auditoria LGPD</span>
                  </button>

                  <button
                    onClick={() => {
                      setViewMode('landing');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Ir para o Site / Landing Page</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-700 hover:bg-rose-50 font-bold flex items-center gap-2 transition-colors border-t border-slate-100 mt-1 pt-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Encerrar Sessão (Sair)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Input Drawer */}
      {showMobileSearch && (
        <div className="pt-2 pb-1 md:hidden animate-fadeIn">
          <div className="relative w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Buscar paciente, CPF, convênio..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>
            <button
              onClick={() => setShowMobileSearch(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg text-xs font-semibold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

