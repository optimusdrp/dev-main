import React, { useState, useEffect } from 'react';
import { ViewMode, CRMTab } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { FilterPreferencesProvider } from './context/FilterPreferencesContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { VisaoGeralView } from './components/views/VisaoGeralView';
import { AtendimentosView } from './components/views/AtendimentosView';
import { JornadasView } from './components/views/JornadasView';
import { PendenciasView } from './components/views/PendenciasView';
import { AutomacoesView } from './components/views/AutomacoesView';
import { IndicadoresView } from './components/views/IndicadoresView';
import { ConfiguracoesView } from './components/views/ConfiguracoesView';
import { AuditoriaLgpdView } from './components/views/AuditoriaLgpdView';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { AccessDeniedGuard } from './components/auth/AccessDeniedGuard';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { GuidedTour } from './components/common/GuidedTour';
import { RefreshCw } from 'lucide-react';

function AppContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [activeTab, setActiveTab] = useState<CRMTab>('visao-geral');
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  const { isAuthenticated, isLoading, hasPermission } = useAuth();

  // If user tries to enter CRM without logging in, redirect to login page
  useEffect(() => {
    if (viewMode === 'crm' && !isAuthenticated && !isLoading) {
      setViewMode('login');
    }
  }, [viewMode, isAuthenticated, isLoading]);

  // Helper to find first tab allowed for the current role
  const allowedTabs: CRMTab[] = [
    'visao-geral',
    'atendimentos',
    'jornadas',
    'pendencias',
    'automacoes',
    'indicadores',
    'configuracoes',
    'auditoria',
  ];
  const firstAllowedTab = allowedTabs.find((t) => hasPermission(t)) || 'atendimentos';

  const handleOpenPatientChat = (_patientId: string) => {
    if (hasPermission('atendimentos')) {
      setActiveTab('atendimentos');
    }
  };

  // If current active tab is forbidden for logged in user, automatically route to first allowed tab
  useEffect(() => {
    if (isAuthenticated && !hasPermission(activeTab)) {
      setActiveTab(firstAllowedTab);
    }
  }, [isAuthenticated, activeTab, firstAllowedTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-purple-900">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-700" />
          <span className="text-xs font-bold">Verificando sessão de autenticação...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col font-sans">
      {/* Top Global Navigation Bar */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={3}
        onNewAttendanceClick={() => setActiveTab('atendimentos')}
        onToggleMobileSidebar={() => setOpenMobileSidebar((prev) => !prev)}
        onStartTour={() => setIsTourOpen(true)}
      />

      {/* Guided Tour Component */}
      <GuidedTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={setActiveTab}
      />

      {/* Landing Page View */}
      {viewMode === 'landing' && <LandingPage setViewMode={setViewMode} />}

      {/* Login Page View */}
      {viewMode === 'login' && <LoginPage setViewMode={setViewMode} />}

      {/* CRM Main Application View (Protected) */}
      {viewMode === 'crm' && isAuthenticated && (
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Dark Purple Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openMobile={openMobileSidebar}
            setOpenMobile={setOpenMobileSidebar}
            onStartTour={() => setIsTourOpen(true)}
          />

          {/* Main Dashboard Workspace with RBAC Guard */}
          <main className="flex-1 overflow-y-auto">
            {!hasPermission(activeTab) ? (
              <AccessDeniedGuard
                tab={activeTab}
                onNavigateToAllowed={() => setActiveTab(firstAllowedTab)}
              />
            ) : (
              <>
                {activeTab === 'visao-geral' && (
                  <VisaoGeralView
                    onOpenPatientChat={handleOpenPatientChat}
                    onNavigateTab={setActiveTab}
                  />
                )}
                {activeTab === 'atendimentos' && <AtendimentosView />}
                {activeTab === 'jornadas' && (
                  <JornadasView onOpenPatientChat={handleOpenPatientChat} />
                )}
                {activeTab === 'pendencias' && (
                  <PendenciasView onOpenPatientChat={handleOpenPatientChat} />
                )}
                {activeTab === 'automacoes' && <AutomacoesView />}
                {activeTab === 'indicadores' && <IndicadoresView />}
                {activeTab === 'configuracoes' && <ConfiguracoesView />}
                {activeTab === 'auditoria' && <AuditoriaLgpdView />}
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <FilterPreferencesProvider>
            <AppContent />
          </FilterPreferencesProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
