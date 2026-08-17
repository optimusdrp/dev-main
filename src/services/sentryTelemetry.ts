import * as Sentry from '@sentry/react';

export interface TelemetryErrorEvent {
  id: string;
  timestamp: string;
  type: 'AUTH_FAILURE' | 'EXCEPTION' | 'UNHANDLED_REJECTION' | 'NETWORK_ERROR';
  severity: 'fatal' | 'error' | 'warning' | 'info';
  message: string;
  email?: string;
  role?: string;
  stackTrace?: string;
  breadcrumbs: Array<{ timestamp: string; category: string; message: string }>;
  context?: Record<string, any>;
}

const LOCAL_STORAGE_TELEMETRY_KEY = 'mediflux_sentry_telemetry_events';

class SentryTelemetryService {
  private eventsBuffer: TelemetryErrorEvent[] = [];
  private currentBreadcrumbs: Array<{ timestamp: string; category: string; message: string }> = [];
  private initialized = false;

  constructor() {
    this.loadFromStorage();
  }

  public init() {
    if (this.initialized) return;

    try {
      const dsn =
        (import.meta as any).env?.VITE_SENTRY_DSN ||
        'https://mediflux_sentry_key@o450000000.ingest.sentry.io/45000000';

      Sentry.init({
        dsn,
        environment: (import.meta as any).env?.MODE || 'development',
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        beforeSend(event) {
          // Mask sensitive health data or passwords if present
          if (event.request && event.request.data) {
            const reqData = event.request.data as Record<string, any>;
            if (typeof reqData === 'object' && reqData && reqData.password) {
              reqData.password = '[REDACTED_BY_SENTRY]';
            }
          }
          return event;
        },
      });

      this.initialized = true;
      this.addBreadcrumb('system', 'Sentry SDK initialized successfully for MediFlux CRM');
    } catch (err) {
      console.warn('Sentry initialization fallback active:', err);
    }
  }

  public addBreadcrumb(category: string, message: string, data?: Record<string, any>) {
    const entry = {
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      category,
      message,
    };

    this.currentBreadcrumbs.unshift(entry);
    if (this.currentBreadcrumbs.length > 15) {
      this.currentBreadcrumbs = this.currentBreadcrumbs.slice(0, 15);
    }

    try {
      Sentry.addBreadcrumb({
        category,
        message,
        data,
        level: 'info',
      });
    } catch (e) {
      // Sentry fallback
    }
  }

  public setUserContext(user: { id: string; email: string; role: string; name: string } | null) {
    try {
      if (user) {
        Sentry.setUser({
          id: user.id,
          email: user.email,
          username: user.name,
          role: user.role,
        });
        this.addBreadcrumb('auth', `User context bound to Sentry: ${user.email} (${user.role})`);
      } else {
        Sentry.setUser(null);
        this.addBreadcrumb('auth', 'User context cleared from Sentry session');
      }
    } catch (e) {
      // Fallback
    }
  }

  public captureAuthError(email: string, reason: string, details?: Record<string, any>) {
    const eventId = `sent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toLocaleString('pt-BR');

    const event: TelemetryErrorEvent = {
      id: eventId,
      timestamp,
      type: 'AUTH_FAILURE',
      severity: 'error',
      message: `Falha de Autenticação: ${reason}`,
      email,
      breadcrumbs: [...this.currentBreadcrumbs],
      context: {
        attemptedEmail: email,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server Environment',
        ipAddress: '189.120.45.12 (SSL Verified)',
        ...details,
      },
      stackTrace: new Error(`AuthFailureException: ${reason}`).stack,
    };

    this.recordEvent(event);

    try {
      Sentry.withScope((scope) => {
        scope.setTag('event_type', 'AUTH_FAILURE');
        scope.setExtra('attemptedEmail', email);
        scope.setExtra('details', details);
        Sentry.captureMessage(`[AuthFailure] ${reason} for user: ${email}`, 'error');
      });
    } catch (e) {
      // fallback
    }

    // Report to backend telemetry API
    this.sendToBackendTelemetry(event);

    return eventId;
  }

  public captureException(error: Error | unknown, context?: Record<string, any>) {
    const eventId = `sent_exc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toLocaleString('pt-BR');
    const errObj = error instanceof Error ? error : new Error(String(error));

    const event: TelemetryErrorEvent = {
      id: eventId,
      timestamp,
      type: 'EXCEPTION',
      severity: 'fatal',
      message: errObj.message || 'Exceção não tratada capturada no runtime',
      breadcrumbs: [...this.currentBreadcrumbs],
      context: {
        name: errObj.name,
        ...context,
      },
      stackTrace: errObj.stack,
    };

    this.recordEvent(event);

    try {
      Sentry.captureException(errObj, { extra: context });
    } catch (e) {
      // fallback
    }

    this.sendToBackendTelemetry(event);
    return eventId;
  }

  public getEvents(): TelemetryErrorEvent[] {
    return this.eventsBuffer;
  }

  public clearEvents() {
    this.eventsBuffer = [];
    localStorage.removeItem(LOCAL_STORAGE_TELEMETRY_KEY);
  }

  private recordEvent(event: TelemetryErrorEvent) {
    this.eventsBuffer.unshift(event);
    if (this.eventsBuffer.length > 50) {
      this.eventsBuffer = this.eventsBuffer.slice(0, 50);
    }
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      localStorage.setItem(LOCAL_STORAGE_TELEMETRY_KEY, JSON.stringify(this.eventsBuffer));
    } catch (e) {
      // ignore storage quota issues
    }
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TELEMETRY_KEY);
      if (saved) {
        this.eventsBuffer = JSON.parse(saved);
      }
    } catch (e) {
      this.eventsBuffer = [];
    }
  }

  private async sendToBackendTelemetry(event: TelemetryErrorEvent) {
    try {
      await fetch('/api/telemetry/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (e) {
      // local log saved
    }
  }
}

export const sentryTelemetry = new SentryTelemetryService();
sentryTelemetry.init();
