import React, { useState } from 'react';
import { CRMTab } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  Kanban,
  AlertCircle,
  Sparkles,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronDown,
  MoreHorizontal,
  Bot,
  Users,
  Calendar,
  Wallet,
  Menu,
  X,
  Lock,
  ShieldAlert,
  Compass
} from 'lucide-react';

interface SidebarProps {
  activeTab: CRMTab;
  setActiveTab: (tab: CRMTab) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  onStartTour?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openMobile,
  setOpenMobile,
  onStartTour,
}) => {
  const [clinicUnit, setClinicUnit] = useState('Clínica Santa Helena');
  const [unitBranch, setUnitBranch] = useState('Unidade Jardins');

  const { user, hasPermission } = useAuth();

  const userName = user?.name || 'Camila Santos';
  const userRole = user?.role || 'Recepção';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const navItems = [
    {
      group: 'OPERAÇÃO',
      items: [
        { id: 'visao-geral' as CRMTab, label: 'Visão geral', icon: LayoutDashboard },
        { id: 'atendimentos' as CRMTab, label: 'Atendimentos', icon: MessageSquare, badge: '4' },
        { id: 'jornadas' as CRMTab, label: 'Jornadas', icon: Kanban },
        { id: 'pendencias' as CRMTab, label: 'Pendências', icon: AlertCircle, badge: '17', badgeColor: 'bg-purple-500' },
      ],
    },
    {
      group: 'GESTÃO',
      items: [
        { id: 'automacoes' as CRMTab, label: 'Automações', icon: Sparkles },
        { id: 'indicadores' as CRMTab, label: 'Indicadores', icon: BarChart3 },
        { id: 'configuracoes' as CRMTab, label: 'Configurações', icon: Settings },
        { id: 'auditoria' as CRMTab, label: 'Auditoria & LGPD', icon: ShieldCheck, badge: 'A3', badgeColor: 'bg-emerald-500' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {openMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setOpenMobile(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#2e1065] text-purple-100 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          openMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Brand Header */}
        <div className="p-4 border-b border-purple-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-400 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              M
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-wide leading-tight">
                MediFlux
              </h2>
              <span className="text-[11px] text-purple-300 font-medium">
                CRM para saúde
              </span>
            </div>
          </div>
          <button
            onClick={() => setOpenMobile(false)}
            className="lg:hidden text-purple-300 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clinic Unit Switcher */}
        <div className="p-3">
          <div className="bg-purple-950/60 border border-purple-800/60 rounded-xl p-2.5 flex items-center justify-between hover:bg-purple-900/40 cursor-pointer transition-colors">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-purple-800 flex items-center justify-center text-white font-bold text-xs shrink-0">
                SH
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">
                  {clinicUnit}
                </p>
                <p className="text-[10px] text-purple-300 truncate">
                  {unitBranch}
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-purple-400 shrink-0" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {navItems.map((group) => {
            const visibleItems = group.items.filter((item) => hasPermission(item.id));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group}>
                <p className="px-3 text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">
                  {group.group}
                </p>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`sidebar-nav-${item.id}`}
                        onClick={() => {
                          setActiveTab(item.id);
                          setOpenMobile(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isActive
                            ? 'bg-purple-800/80 text-white font-semibold shadow-inner ring-1 ring-purple-600'
                            : 'text-purple-200 hover:bg-purple-900/40 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-purple-300' : 'text-purple-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold text-white ${
                              item.badgeColor || 'bg-purple-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Guided Tour Start Button */}
        {onStartTour && (
          <div className="px-3 pb-1">
            <button
              onClick={onStartTour}
              className="w-full bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-xl border border-purple-600/60 transition-all flex items-center justify-between shadow-xs cursor-pointer group"
            >
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-purple-300 group-hover:rotate-45 transition-transform" />
                <span>Tour pelo Sistema</span>
              </div>
              <span className="text-[10px] bg-purple-950/80 text-purple-200 px-1.5 py-0.5 rounded font-extrabold border border-purple-700">
                Guia
              </span>
            </button>
          </div>
        )}

        {/* AI Agent Status Box */}
        <div className="p-3">
          <div className="bg-purple-950/80 border border-purple-800/80 rounded-xl p-3 flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-purple-950 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white leading-tight">
                Agente IA ativo
              </p>
              <p className="text-[10px] text-purple-300 truncate">
                Monitorando SLAs & Respostas
              </p>
            </div>
          </div>
        </div>

        {/* LGPD Security Badge */}
        <div className="px-3 pb-2">
          <div className="bg-purple-900/30 border border-purple-700/30 rounded-lg p-2 flex items-center justify-between text-[10px] text-purple-300">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              E2EE AES-256 + LGPD
            </span>
            <span className="text-[9px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
              HIPAA/TISS
            </span>
          </div>
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-purple-900/50 bg-purple-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-purple-700 border border-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {userInitials}
              </div>
              <div className="truncate min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {userName}
                </p>
                <p className="text-[10px] text-purple-300 truncate">
                  {userRole}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
