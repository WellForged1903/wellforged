/**
 * Analytics Utility
 * Abstraction for tracking user interactions.
 * Currently logs to console, but can be integrated with GTM/GA4.
 */

interface AnalyticsEvent {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: unknown;
}

export const trackEvent = (eventName: string, properties: AnalyticsEvent = {}) => {
    // In production, this would send to dataLayer (GTM) or gtag (GA4)
    if (import.meta.env.PROD) {
        // window.dataLayer?.push({ event: eventName, ...properties });
    }

    // Always log to console in dev mode
    console.log(`[Analytics Event]: ${eventName}`, properties);
};

export const trackPageView = (url: string) => {
    if (import.meta.env.PROD) {
        // window.gtag?.('config', 'GA_MEASUREMENT_ID', { page_path: url });
    }
    console.log(`[Analytics PageView]: ${url}`);
};
