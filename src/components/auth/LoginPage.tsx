import React, { useState } from 'react';
import { ViewMode } from '../../types';
import { ShieldCheck, Lock, ArrowRight, User, AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface LoginPageProps {
  setViewMode: (mode: ViewMode) => void;
}

const DEMO_PROFILES = [
  { role: 'Administrador', email: 'admin@clinicasantahelena.com.br', pass: 'admin123', tag: 'Acesso Total' },
  { role: 'Recepção', email: 'recepcao@clinicasantahelena.com.br', pass: 'recepcao123', tag: 'Atendimento' },
  { role: 'Contador (financeiro)', email: 'financeiro@clinicasantahelena.com.br', pass: 'financeiro123', tag: 'Financeiro' },
  { role: 'Terceirizado', email: 'terceirizado@clinicasantahelena.com.br', pass: 'terceirizado123', tag: 'Restrito' },
  { role: 'Profissional de Saúde', email: 'saude@clinicasantahelena.com.br', pass: 'saude123', tag: 'Clínico' },
];

export const LoginPage: React.FC<LoginPageProps> = ({ setViewMode }) => {
  const [email, setEmail] = useState('recepcao@clinicasantahelena.com.br');
  const [password, setPassword] = useState('recepcao123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const { showError, showSuccess } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      showSuccess('Autenticação bem-sucedida!', 'Bem-vindo ao MediFlux CRM.');
      setViewMode('crm');
    } else {
      const errText = result.error || 'Credenciais inválidas. Verifique seu e-mail e senha.';
      setErrorMessage(errText);
      showError('Falha na Autenticação', errText);
    }
  };

  const handleDemoSelect = async (demoEmail: string, rolePass = 'mediflux123') => {
    setEmail(demoEmail);
    setPassword(rolePass);
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await login(demoEmail, rolePass);
    setIsSubmitting(false);

    if (result.success) {
      showSuccess('Perfil Demonstrativo Ativado!', `Sessão iniciada como ${demoEmail}`);
      setViewMode('crm');
    } else {
      const errText = result.error || 'Não foi possível autenticar com o perfil demonstrativo.';
      setErrorMessage(errText);
      showError('Erro ao Autenticar Perfil', errText);
    }
  };

  return (
    <div className="min-h-screen bg-[#2e1065] text-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-200/50 space-y-6">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md">
            M
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            MediFlux CRM
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Autenticação & Controle de Acesso por Perfil Administrador (Next-Auth)
          </p>
        </div>

        {/* Demo Profiles Bar */}
        <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-100 space-y-2">
          <span className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wider block">
            ⚡ ENTRAR COM PERFIL DE DEMOSTRAÇÃO:
          </span>
          <div className="grid grid-cols-1 gap-1.5 text-xs font-semibold">
            {DEMO_PROFILES.map((profile) => (
              <button
                key={profile.role}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDemoSelect(profile.email, profile.pass)}
                className="w-full text-left bg-white hover:bg-purple-100 text-purple-950 p-2 rounded-xl border border-purple-200 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-bold">{profile.role}</span>
                  <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-semibold">
                    {profile.tag}
                  </span>
                </div>
                <span className="text-[10px] bg-purple-200 group-hover:bg-purple-700 group-hover:text-white px-2 py-0.5 rounded text-purple-900 font-bold transition-colors">
                  Autenticar →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Error Banner */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-extrabold block">Erro ao entrar:</span>
              <p className="text-[11px] text-rose-700 leading-tight mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-700 p-0.5 rounded cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              E-mail Profissional
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Autenticando sessão...</span>
              </>
            ) : (
              <>
                <span>Autenticar no MediFlux</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sessão Next-Auth Ativa por Token JWT & Auditoria LGPD</span>
        </div>
      </div>
    </div>
  );
};
