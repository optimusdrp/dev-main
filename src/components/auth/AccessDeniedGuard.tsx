import React, { useState } from 'react';
import { ShieldAlert, Lock, Key, ArrowRight, Check, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CRMTab } from '../../types';

interface AccessDeniedGuardProps {
  tab: CRMTab;
  onNavigateToAllowed?: () => void;
}

export const AccessDeniedGuard: React.FC<AccessDeniedGuardProps> = ({
  tab,
  onNavigateToAllowed,
}) => {
  const { user } = useAuth();
  const [requested, setRequested] = useState(false);

  const tabLabels: Record<CRMTab, string> = {
    'visao-geral': 'Visão Geral Executiva',
    atendimentos: 'Central de Atendimentos',
    jornadas: 'Jornadas & Funis',
    pendencias: 'Central de Pendências',
    automacoes: 'Automações & Robôs IA',
    indicadores: 'Indicadores & Faturamento TISS',
    configuracoes: 'Configurações de Operação e Permissões',
    auditoria: 'Auditoria LGPD & Criptografia',
  };

  const pageTitle = tabLabels[tab] || tab;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#f8f9fc]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-inner ring-8 ring-rose-50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 px-3 py-1 rounded-full">
            Acesso Restrito pelo Administrador
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Permissão Insuficiente
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Seu perfil atual de <strong className="text-purple-900 font-bold">{user?.role || 'Usuário'}</strong> não tem autorização para acessar o módulo <strong className="text-slate-800">{pageTitle}</strong>.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-semibold">Usuário Autenticado:</span>
            <span className="font-bold text-slate-900">{user?.name}</span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-semibold">Perfil / Nível:</span>
            <span className="font-mono text-[11px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded">
              {user?.role}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-semibold">Token de Sessão:</span>
            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[150px]">
              {user?.token}
            </span>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          {!requested ? (
            <button
              onClick={() => setRequested(true)}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Solicitar Acesso ao Administrador</span>
            </button>
          ) : (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3.0 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Solicitação enviada à Gestão da Clínica!</span>
            </div>
          )}

          {onNavigateToAllowed && (
            <button
              onClick={onNavigateToAllowed}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Ir para Módulos Liberados</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>Políticas de Controle de Acesso Baseado em Funções (RBAC)</span>
        </div>
      </div>
    </div>
  );
};
