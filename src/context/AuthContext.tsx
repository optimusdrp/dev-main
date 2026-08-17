import React, { createContext, useContext, useState, useEffect } from 'react';
import { CRMTab, UserRole, UserSession, RolePermissions } from '../types';
import { sentryTelemetry } from '../services/sentryTelemetry';

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, CRMTab[]> = {
  Administrador: [
    'visao-geral',
    'atendimentos',
    'jornadas',
    'pendencias',
    'automacoes',
    'indicadores',
    'configuracoes',
    'auditoria',
  ],
  Recepção: ['atendimentos', 'jornadas', 'pendencias'],
  'Contador (financeiro)': ['visao-geral', 'pendencias', 'indicadores'],
  Terceirizado: ['pendencias'],
  'Profissional de Saúde': [
    'visao-geral',
    'atendimentos',
    'jornadas',
    'pendencias',
    'auditoria',
  ],
};

export const DEMO_USERS: Record<string, { name: string; role: UserRole; unit: string; password: string }> = {
  'admin@clinicasantahelena.com.br': {
    name: 'Dra. Helena Martins',
    role: 'Administrador',
    unit: 'Unidade Jardins & Matriz',
    password: 'admin123',
  },
  'recepcao@clinicasantahelena.com.br': {
    name: 'Camila Santos',
    role: 'Recepção',
    unit: 'Recepção Unidade Jardins',
    password: 'recepcao123',
  },
  'financeiro@clinicasantahelena.com.br': {
    name: 'Marcos Vinícius',
    role: 'Contador (financeiro)',
    unit: 'Setor Financeiro & TISS',
    password: 'financeiro123',
  },
  'terceirizado@clinicasantahelena.com.br': {
    name: 'Lucas Ferreira',
    role: 'Terceirizado',
    unit: 'Equipe Externa de Exames',
    password: 'terceirizado123',
  },
  'saude@clinicasantahelena.com.br': {
    name: 'Dr. Roberto Andrade',
    role: 'Profissional de Saúde',
    unit: 'Corpo Médico / DPO',
    password: 'saude123',
  },
};

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  rolePermissions: Record<UserRole, CRMTab[]>;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (tab: CRMTab) => boolean;
  updateRolePermissions: (role: UserRole, newTabs: CRMTab[]) => Promise<void>;
  resetPermissionsToDefault: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('mediflux_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, CRMTab[]>>(() => {
    const savedPerms = localStorage.getItem('mediflux_role_permissions');
    if (savedPerms) {
      try {
        return JSON.parse(savedPerms);
      } catch (e) {
        return DEFAULT_ROLE_PERMISSIONS;
      }
    }
    return DEFAULT_ROLE_PERMISSIONS;
  });

  const [loading, setLoading] = useState(false);

  // Sync to localstorage and backend
  useEffect(() => {
    localStorage.setItem('mediflux_role_permissions', JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('mediflux_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('mediflux_user_session');
    }
  }, [user]);

  // Sync session with current role permissions if permissions changed
  useEffect(() => {
    if (user) {
      const currentAllowed = rolePermissions[user.role] || [];
      if (JSON.stringify(currentAllowed) !== JSON.stringify(user.allowedTabs)) {
        setUser((prev) => (prev ? { ...prev, allowedTabs: currentAllowed } : null));
      }
    }
  }, [rolePermissions]);

  const login = async (email: string, password?: string) => {
    setLoading(true);

    const cleanEmail = (email ? email.trim().toLowerCase() : '') || 'recepcao@clinicasantahelena.com.br';
    sentryTelemetry.addBreadcrumb('auth', `Login direto para: ${cleanEmail}`);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await response.json();

      if (data.success && data.user) {
        const activeRole = data.user.role as UserRole;
        const activeAllowed = rolePermissions[activeRole] || data.user.allowedTabs;

        const session: UserSession = {
          ...data.user,
          allowedTabs: activeAllowed,
        };

        setUser(session);
        sentryTelemetry.setUserContext(session);
        sentryTelemetry.addBreadcrumb('auth', `Autenticação bem-sucedida para ${session.email} (${session.role})`);
        setLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      sentryTelemetry.addBreadcrumb('auth', `Fallback de sessão local para ${cleanEmail}`);
    }

    // Local fallback when server is unavailable or offline
    const userMeta = DEMO_USERS[cleanEmail] || {
      name: cleanEmail.includes('@') ? cleanEmail.split('@')[0].toUpperCase() : 'Usuário MediFlux',
      role: 'Recepção' as UserRole,
      unit: 'Unidade Jardins',
      password: '',
    };

    const allowed = rolePermissions[userMeta.role] || DEFAULT_ROLE_PERMISSIONS[userMeta.role];

    const fallbackSession: UserSession = {
      id: `usr_${Date.now()}`,
      name: userMeta.name,
      email: cleanEmail,
      role: userMeta.role,
      unit: userMeta.unit,
      token: `jwt_sec_${Math.random().toString(36).substring(2)}`,
      allowedTabs: allowed,
    };

    setUser(fallbackSession);
    sentryTelemetry.setUserContext(fallbackSession);
    setLoading(false);
    return { success: true };
  };

  const logout = () => {
    if (user) {
      sentryTelemetry.addBreadcrumb('auth', `Sessão encerrada voluntariamente por ${user.email}`);
    }
    sentryTelemetry.setUserContext(null);
    setUser(null);
    localStorage.removeItem('mediflux_user_session');
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  const hasPermission = (tab: CRMTab): boolean => {
    if (!user) return false;
    if (user.role === 'Administrador') return true;
    return user.allowedTabs.includes(tab);
  };

  const updateRolePermissions = async (role: UserRole, newTabs: CRMTab[]) => {
    setRolePermissions((prev) => {
      const updated = { ...prev, [role]: newTabs };
      localStorage.setItem('mediflux_role_permissions', JSON.stringify(updated));
      return updated;
    });

    // Notify backend
    try {
      await fetch('/api/auth/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, allowedTabs: newTabs }),
      });
    } catch (e) {
      // local update persisted
    }
  };

  const resetPermissionsToDefault = () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    localStorage.setItem('mediflux_role_permissions', JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: loading,
        loading,
        rolePermissions,
        login,
        logout,
        hasPermission,
        updateRolePermissions,
        resetPermissionsToDefault,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
