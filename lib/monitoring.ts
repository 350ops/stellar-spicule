/**
 * Monitoring and Error Reporting Utilities
 *
 * This module provides:
 * - Error tracking and reporting
 * - Performance monitoring
 * - User analytics
 * - Custom metrics
 *
 * Integrates with Sentry, Vercel Analytics, or custom solutions
 */

// ============================================
// Types
// ============================================

export interface ErrorContext {
  userId?: string;
  tripId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  tags?: Record<string, string>;
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

// ============================================
// Error Tracking
// ============================================

/**
 * Report an error to monitoring service
 */
export function captureError(
  error: Error | string,
  context?: ErrorContext
): void {
  const errorObj = typeof error === 'string' ? new Error(error) : error;

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', errorObj, context);
  }

  // Send to Sentry (if configured)
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(errorObj, {
      extra: context,
      tags: {
        component: context?.component,
        tripId: context?.tripId,
      },
    });
  }

  // Send to custom error endpoint
  if (process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          message: errorObj.message,
          stack: errorObj.stack,
          name: errorObj.name,
        },
        context,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      }),
    }).catch(console.error);
  }
}

/**
 * Report a warning (non-critical error)
 */
export function captureWarning(
  message: string,
  context?: ErrorContext
): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Warning]', message, context);
  }

  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureMessage(message, {
      level: 'warning',
      extra: context,
    });
  }
}

// ============================================
// Performance Monitoring
// ============================================

/**
 * Track a performance metric
 */
export function trackPerformance(metric: PerformanceMetric): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Performance]', metric);
  }

  // Send to analytics
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible('Performance', {
      props: {
        metric: metric.name,
        value: metric.value,
        unit: metric.unit,
        ...metric.tags,
      },
    });
  }

  // Send to custom endpoint
  if (process.env.NEXT_PUBLIC_METRICS_ENDPOINT) {
    navigator.sendBeacon(
      process.env.NEXT_PUBLIC_METRICS_ENDPOINT,
      JSON.stringify({
        type: 'performance',
        metric,
        timestamp: Date.now(),
      })
    );
  }
}

/**
 * Measure and track page load time
 */
export function trackPageLoad(pageName: string): void {
  if (typeof window === 'undefined') return;

  // Use Navigation Timing API
  const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  if (perfData) {
    trackPerformance({
      name: 'page_load_time',
      value: perfData.loadEventEnd - perfData.fetchStart,
      unit: 'ms',
      tags: { page: pageName },
    });

    trackPerformance({
      name: 'dom_content_loaded',
      value: perfData.domContentLoadedEventEnd - perfData.fetchStart,
      unit: 'ms',
      tags: { page: pageName },
    });

    trackPerformance({
      name: 'first_byte',
      value: perfData.responseStart - perfData.requestStart,
      unit: 'ms',
      tags: { page: pageName },
    });
  }
}

/**
 * Track API call performance
 */
export function trackAPICall(
  endpoint: string,
  duration: number,
  status: number
): void {
  trackPerformance({
    name: 'api_call_duration',
    value: duration,
    unit: 'ms',
    tags: {
      endpoint,
      status: status.toString(),
      success: status >= 200 && status < 300 ? 'true' : 'false',
    },
  });
}

/**
 * Measure database query time
 */
export async function measureQueryTime<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await queryFn();
    const duration = performance.now() - start;

    trackPerformance({
      name: 'db_query_time',
      value: duration,
      unit: 'ms',
      tags: {
        query: queryName,
        success: 'true',
      },
    });

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    trackPerformance({
      name: 'db_query_time',
      value: duration,
      unit: 'ms',
      tags: {
        query: queryName,
        success: 'false',
      },
    });

    throw error;
  }
}

// ============================================
// Analytics
// ============================================

/**
 * Track a user event
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event);
  }

  // Plausible Analytics
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(event.name, { props: event.properties });
  }

  // Google Analytics (if configured)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event.name, event.properties);
  }

  // Custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        timestamp: event.timestamp || Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      }),
    }).catch(console.error);
  }
}

/**
 * Track page view
 */
export function trackPageView(pageName: string, properties?: Record<string, any>): void {
  trackEvent({
    name: 'pageview',
    properties: {
      page: pageName,
      ...properties,
    },
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUse(feature: string, action: string, metadata?: Record<string, any>): void {
  trackEvent({
    name: 'feature_use',
    properties: {
      feature,
      action,
      ...metadata,
    },
  });
}

// ============================================
// Health Checks
// ============================================

/**
 * Check application health
 */
export async function checkHealth(): Promise<{
  healthy: boolean;
  checks: Record<string, boolean>;
}> {
  const checks: Record<string, boolean> = {};

  // Check database
  try {
    const response = await fetch('/api/health/database');
    checks.database = response.ok;
  } catch {
    checks.database = false;
  }

  // Check external APIs
  try {
    const response = await fetch('/api/health/external');
    checks.external_apis = response.ok;
  } catch {
    checks.external_apis = false;
  }

  // Check storage
  try {
    const response = await fetch('/api/health/storage');
    checks.storage = response.ok;
  } catch {
    checks.storage = false;
  }

  const healthy = Object.values(checks).every(check => check);

  return { healthy, checks };
}

// ============================================
// Custom Metrics
// ============================================

/**
 * Track custom business metric
 */
export function trackMetric(
  name: string,
  value: number,
  tags?: Record<string, string>
): void {
  trackPerformance({
    name,
    value,
    unit: 'count',
    tags,
  });
}

/**
 * Track collaboration event
 */
export function trackCollaboration(
  action: 'created' | 'updated' | 'deleted',
  resourceType: 'note' | 'expense' | 'file' | 'itinerary_item',
  userId: string
): void {
  trackEvent({
    name: 'collaboration_event',
    properties: {
      action,
      resource_type: resourceType,
      user_id: userId,
    },
  });
}

/**
 * Track real-time update latency
 */
export function trackRealtimeLatency(
  latencyMs: number,
  updateType: string
): void {
  trackPerformance({
    name: 'realtime_latency',
    value: latencyMs,
    unit: 'ms',
    tags: {
      update_type: updateType,
    },
  });
}

// ============================================
// Error Boundary Helpers
// ============================================

/**
 * Log component error (for use in Error Boundaries)
 */
export function logComponentError(
  error: Error,
  errorInfo: { componentStack: string }
): void {
  captureError(error, {
    component: 'ErrorBoundary',
    metadata: {
      componentStack: errorInfo.componentStack,
    },
  });
}

// ============================================
// Initialization
// ============================================

/**
 * Initialize monitoring (call in _app.tsx)
 */
export function initMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Set up global error handler
  window.addEventListener('error', (event) => {
    captureError(event.error || new Error(event.message), {
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Set up unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    captureError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      {
        metadata: {
          type: 'unhandledrejection',
        },
      }
    );
  });

  // Track page load performance
  if (document.readyState === 'complete') {
    trackPageLoad('initial');
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => trackPageLoad('initial'), 0);
    });
  }

  console.log('[Monitoring] Initialized');
}

// ============================================
// Exports
// ============================================

export default {
  captureError,
  captureWarning,
  trackPerformance,
  trackPageLoad,
  trackAPICall,
  measureQueryTime,
  trackEvent,
  trackPageView,
  trackFeatureUse,
  trackMetric,
  trackCollaboration,
  trackRealtimeLatency,
  checkHealth,
  logComponentError,
  initMonitoring,
};
