# Monitoring & Error Reporting Setup

## Overview

This document describes the monitoring and error reporting infrastructure for the Stellar Spicule travel planning application.

## Monitoring Stack

### Error Tracking
- **Primary:** Sentry (recommended)
- **Alternative:** Custom error reporting endpoint
- **Fallback:** Console logging (development only)

### Performance Monitoring
- **Metrics:** Custom performance tracking
- **APM:** Vercel Analytics (built-in)
- **Database:** Supabase monitoring dashboard

### Analytics
- **Primary:** Plausible Analytics (privacy-friendly)
- **Alternative:** Google Analytics
- **Custom:** Event tracking endpoint

## Setup Instructions

### 1. Sentry Integration

#### Install Sentry SDK
```bash
npm install @sentry/nextjs
```

#### Configure Sentry (`sentry.client.config.ts`)
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || "development",
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies;
    }
    return event;
  },

  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

#### Environment Variables
```env
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-auth-token
```

### 2. Vercel Analytics

#### Enable in `next.config.js`
```javascript
module.exports = {
  // ... other config
  experimental: {
    instrumentationHook: true,
  },
};
```

#### Add to layout
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 3. Plausible Analytics

#### Add script to `app/layout.tsx`
```typescript
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          defer
          data-domain="your-domain.com"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 4. Custom Monitoring Endpoints

#### Health Check API (`app/api/health/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  const checks = {
    api: true,
    database: false,
    storage: false,
    timestamp: new Date().toISOString(),
  };

  // Check database
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('trips').select('count').limit(1);
    checks.database = !error;
  } catch {
    checks.database = false;
  }

  // Check storage
  try {
    const supabase = getSupabase();
    const { error } = await supabase.storage.getBucket('trip-files');
    checks.storage = !error;
  } catch {
    checks.storage = false;
  }

  const healthy = Object.values(checks).every(v => v === true);

  return NextResponse.json(
    { healthy, checks },
    { status: healthy ? 200 : 503 }
  );
}
```

#### Error Reporting API (`app/api/errors/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Log error (send to your logging service)
  console.error('[Client Error]', {
    ...body,
    ip: request.ip,
    geo: request.geo,
  });

  // Send to Slack webhook (optional)
  if (body.error.severity === 'critical') {
    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Critical Error: ${body.error.message}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Error:* ${body.error.message}\n*URL:* ${body.url}\n*User:* ${body.context?.userId || 'Anonymous'}`,
            },
          },
        ],
      }),
    });
  }

  return NextResponse.json({ received: true });
}
```

## Monitoring Dashboard

### Supabase Dashboard
- **URL:** https://app.supabase.com/project/your-project-id
- **Metrics:**
  - Database performance
  - API requests
  - Real-time connections
  - Storage usage

### Vercel Dashboard
- **URL:** https://vercel.com/your-team/stellar-spicule
- **Metrics:**
  - Deployment status
  - Function execution time
  - Bandwidth usage
  - Error rates

### Sentry Dashboard
- **URL:** https://sentry.io/organizations/your-org/projects/stellar-spicule/
- **Metrics:**
  - Error frequency
  - Affected users
  - Stack traces
  - Performance trends

## Key Metrics to Monitor

### Application Health
- [ ] API response time < 500ms (p95)
- [ ] Database query time < 200ms (p95)
- [ ] Page load time < 3s
- [ ] Error rate < 1%
- [ ] Uptime > 99.9%

### User Experience
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Largest Contentful Paint < 2.5s

### Business Metrics
- [ ] Daily active users
- [ ] Feature adoption rate
- [ ] Collaboration events per user
- [ ] Average session duration

### Infrastructure
- [ ] Database connections < 80% max
- [ ] Storage usage < 90% quota
- [ ] Function execution time < timeout
- [ ] Memory usage stable

## Alerting Rules

### Critical Alerts (Page Immediately)
- **Error rate > 5%** for 5 minutes
- **API uptime < 99%** for 10 minutes
- **Database connection failure**
- **Authentication system down**

### Warning Alerts (Slack/Email)
- **Error rate > 2%** for 15 minutes
- **API response time > 1s** (p95) for 10 minutes
- **Storage usage > 80%**
- **Database query time > 500ms** (p95)

### Informational Alerts
- **New deployment completed**
- **Daily summary report**
- **Weekly usage statistics**

## Alert Channels

### Slack Integration
```bash
# Set up Slack webhook
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Test alert
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test alert from Stellar Spicule"}'
```

### Email Alerts
Configure in Sentry:
1. Go to Settings > Alerts
2. Create new alert rule
3. Set conditions (error rate, performance)
4. Add email recipients

### PagerDuty (Optional)
For 24/7 on-call rotation:
1. Create PagerDuty service
2. Integrate with Sentry
3. Set escalation policies

## Logging Best Practices

### What to Log
```typescript
// ✅ Good - Structured logging
logger.info('User created expense', {
  userId: user.id,
  tripId: trip.id,
  amount: expense.amount,
  category: expense.category,
});

// ❌ Bad - Unstructured
console.log('User did something');
```

### What NOT to Log
- Passwords or secrets
- Credit card numbers
- Personal identification numbers
- Full request/response bodies
- Tokens or API keys

### Log Levels
- **DEBUG:** Detailed diagnostic info (dev only)
- **INFO:** General informational messages
- **WARN:** Warning messages, degraded functionality
- **ERROR:** Error events, failures
- **FATAL:** Critical failures requiring immediate attention

## Performance Monitoring

### Web Vitals
Track Core Web Vitals automatically:

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Custom Performance Marks
```typescript
// Mark start of operation
performance.mark('notes-load-start');

// ... perform operation

// Mark end and measure
performance.mark('notes-load-end');
performance.measure('notes-load', 'notes-load-start', 'notes-load-end');

// Send to monitoring
const measure = performance.getEntriesByName('notes-load')[0];
trackPerformance({
  name: 'notes_load_time',
  value: measure.duration,
  unit: 'ms',
});
```

## Real-time Monitoring

### Supabase Realtime Status
Monitor real-time connection health:

```typescript
const channel = supabase.channel('system');

channel
  .on('system', {}, (payload) => {
    if (payload.event === 'error') {
      captureError(new Error('Realtime error'), {
        metadata: payload,
      });
    }
  })
  .subscribe((status) => {
    if (status === 'CHANNEL_ERROR') {
      captureWarning('Realtime channel error');
    }
  });
```

## Database Monitoring

### Query Performance
```typescript
// Wrap slow queries with monitoring
const result = await measureQueryTime(
  'get_trip_with_items',
  () => getFullTripData(tripId)
);

// Alert if > 1s
if (result.duration > 1000) {
  captureWarning('Slow database query', {
    metadata: {
      query: 'get_trip_with_items',
      duration: result.duration,
      tripId,
    },
  });
}
```

### Connection Pool
Monitor Supabase connection pool:
- Dashboard > Settings > Database > Connection Pooling
- Alert if pool usage > 80%

## Incident Response

### Runbook: High Error Rate

1. **Identify affected areas**
   - Check Sentry for error patterns
   - Review affected endpoints/components

2. **Assess impact**
   - Number of affected users
   - Degraded features
   - Data integrity concerns

3. **Mitigate**
   - Deploy hotfix if available
   - Rollback if necessary
   - Enable feature flags to disable affected features

4. **Communicate**
   - Update status page
   - Notify users (if major)
   - Internal team updates

5. **Resolve**
   - Deploy fix
   - Verify resolution
   - Monitor for recurrence

6. **Post-mortem**
   - Document incident
   - Identify root cause
   - Implement preventive measures

## Maintenance

### Weekly Tasks
- [ ] Review error trends
- [ ] Check alert noise (too many/few)
- [ ] Verify monitoring coverage
- [ ] Review performance metrics

### Monthly Tasks
- [ ] Audit alert rules
- [ ] Update monitoring thresholds
- [ ] Review and optimize slow queries
- [ ] Capacity planning review

### Quarterly Tasks
- [ ] Disaster recovery drill
- [ ] Security audit
- [ ] Performance benchmarking
- [ ] Monitoring tool evaluation

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Supabase Monitoring](https://supabase.com/docs/guides/platform/metrics)
- [Web Vitals](https://web.dev/vitals/)
- [Plausible Analytics](https://plausible.io/docs)

## Support

For issues with monitoring setup:
- Internal: #engineering-platform Slack channel
- Sentry: support@sentry.io
- Vercel: support@vercel.com
- Supabase: support@supabase.com
