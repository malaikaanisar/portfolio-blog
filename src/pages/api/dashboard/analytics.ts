import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/auth';

const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID;
const GA_CLIENT_EMAIL = process.env.GA_CLIENT_EMAIL;
const GA_PRIVATE_KEY = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n');

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GA_PROPERTY_ID || !GA_CLIENT_EMAIL || !GA_PRIVATE_KEY) {
    return res.status(200).json({
      configured: false,
      message: 'Google Analytics not configured. Add GA_PROPERTY_ID, GA_CLIENT_EMAIL, and GA_PRIVATE_KEY to environment variables.',
    });
  }

  try {
    const { BetaAnalyticsDataClient } = await import('@google-analytics/data');

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: GA_CLIENT_EMAIL,
        private_key: GA_PRIVATE_KEY,
      },
    });

    const propertyId = `properties/${GA_PROPERTY_ID}`;

    // Run all requests in parallel
    const [overviewRes, dailyRes, pagesRes, sourcesRes, devicesRes, countriesRes] =
      await Promise.all([
        // Overview metrics (last 30 days)
        analyticsDataClient.runReport({
          property: propertyId,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
            { name: 'sessions' },
            { name: 'averageSessionDuration' },
            { name: 'bounceRate' },
            { name: 'newUsers' },
          ],
        }),

        // Daily visitors & pageviews (last 30 days)
        analyticsDataClient.runReport({
          property: propertyId,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'date' }],
          metrics: [
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
            { name: 'sessions' },
          ],
          orderBys: [{ dimension: { dimensionName: 'date', orderType: 'ALPHANUMERIC' } }],
        }),

        // Top pages (last 30 days)
        analyticsDataClient.runReport({
          property: propertyId,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'activeUsers' },
          ],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 10,
        }),

        // Traffic sources (last 30 days)
        analyticsDataClient.runReport({
          property: propertyId,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 8,
        }),

        // Device categories (last 30 days)
        analyticsDataClient.runReport({
          property: propertyId,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        }),

        // Top countries (last 30 days)
        analyticsDataClient.runReport({
          property: propertyId,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'country' }],
          metrics: [{ name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
          limit: 10,
        }),
      ]);

    // Parse overview
    const overviewRow = overviewRes[0]?.rows?.[0]?.metricValues;
    const overview = {
      activeUsers: parseInt(overviewRow?.[0]?.value || '0'),
      pageViews: parseInt(overviewRow?.[1]?.value || '0'),
      sessions: parseInt(overviewRow?.[2]?.value || '0'),
      avgSessionDuration: parseFloat(overviewRow?.[3]?.value || '0'),
      bounceRate: parseFloat(overviewRow?.[4]?.value || '0'),
      newUsers: parseInt(overviewRow?.[5]?.value || '0'),
    };

    // Parse daily data
    const daily = (dailyRes[0]?.rows || []).map((row) => ({
      date: row.dimensionValues?.[0]?.value || '',
      visitors: parseInt(row.metricValues?.[0]?.value || '0'),
      pageViews: parseInt(row.metricValues?.[1]?.value || '0'),
      sessions: parseInt(row.metricValues?.[2]?.value || '0'),
    }));

    // Parse top pages (exclude /dashboard paths)
    const topPages = (pagesRes[0]?.rows || [])
      .map((row) => ({
        path: row.dimensionValues?.[0]?.value || '',
        views: parseInt(row.metricValues?.[0]?.value || '0'),
        users: parseInt(row.metricValues?.[1]?.value || '0'),
      }))
      .filter((p) => !p.path.startsWith('/dashboard'));

    // Parse traffic sources
    const trafficSources = (sourcesRes[0]?.rows || []).map((row) => ({
      channel: row.dimensionValues?.[0]?.value || '',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    }));

    // Parse devices
    const devices = (devicesRes[0]?.rows || []).map((row) => ({
      device: row.dimensionValues?.[0]?.value || '',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    }));

    // Parse countries
    const countries = (countriesRes[0]?.rows || []).map((row) => ({
      country: row.dimensionValues?.[0]?.value || '',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
    }));

    return res.status(200).json({
      configured: true,
      overview,
      daily,
      topPages,
      trafficSources,
      devices,
      countries,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return res.status(500).json({
      configured: true,
      error: 'Failed to fetch analytics data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default withAuth(handler);
