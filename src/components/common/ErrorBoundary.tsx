import React from 'react';
import * as Sentry from '@sentry/react';
import { sentryTelemetry } from '../../services/sentryTelemetry';
import { RefreshCw, ShieldAlert } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error | null;
  resetError?: () => void;
  eventId?: string | null;
}

const FallbackComponent: React.FC<ErrorFallbackProps> = ({ error, resetError, eventId }) => {
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner ring-8 ring-rose-50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 px-3 py-1 rounded-full">
            Sentry Exception Shield
          </span>
          <h2 className="text-xl font-extrabold text-slate-900">
            Ocorreu uma falha inesperada na aplicação
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Esta exceção foi capturada automaticamente pelo monitor de erros Sentry e enviada à equipe de engenharia para análise.
          </p>
        </div>

        {error && (
          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-left font-mono text-[11px] space-y-2 overflow-x-auto max-h-48 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-rose-400">
              <span className="font-bold">Error Trace ID: {eventId || 'EVT_CAPTURED_BY_SENTRY'}</span>
              <span className="text-[10px] bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded">Sentry Severity: FATAL</span>
            </div>
            <p className="text-rose-300 font-bold">{error.name}: {error.message}</p>
            {error.stack && (
              <pre className="text-[10px] text-slate-400 whitespace-pre-wrap leading-tight pt-1">
                {error.stack.split('\n').slice(0, 5).join('\n')}
              </pre>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (resetError) resetError();
              window.location.reload();
            }}
            className="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recarregar e Recuperar Sessão</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-400">
          Sentry Telemetry Monitor • Versão 2.4.0 • Conformidade LGPD & Criptografia
        </div>
      </div>
    </div>
  );
};

export const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError, eventId }) => (
        <FallbackComponent error={error} resetError={resetError} eventId={eventId} />
      )}
      onError={(error, componentStack, eventId) => {
        sentryTelemetry.captureException(error, { componentStack, eventId });
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};
