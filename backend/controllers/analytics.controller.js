/**
 * Analytics Controller
 * Integrates with Python backend for performance analytics
 */

import { getPerformanceAnalytics } from '../services/python-client.js';
import { resolveAuthenticatedUser } from '../services/auth.service.js';

/**
 * Get user performance analytics
 * GET /api/analytics/user-performance
 */
export async function getUserPerformanceAnalytics(req, res) {
  try {
    const user = await resolveAuthenticatedUser(req);
    
    if (!user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`📊 Fetching analytics for user ${user.id}`);
    
    const analytics = await getPerformanceAnalytics(user.id);

    if (analytics.error) {
      return res.status(400).json({
        error: 'Analytics generation failed',
        details: analytics.error
      });
    }

    console.log(`✅ Analytics generated: ${analytics.progress?.total_interviews || 0} sessions`);
    return res.json(analytics);

  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({
      error: 'Failed to fetch analytics',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
}

/**
 * Get quick performance summary
 * GET /api/analytics/summary
 */
export async function getPerformanceSummary(req, res) {
  try {
    const user = await resolveAuthenticatedUser(req);
    
    if (!user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const analytics = await getPerformanceAnalytics(user.id);

    if (analytics.error) {
      return res.status(400).json({ error: 'Could not fetch summary' });
    }

    // Return simplified summary
    const summary = {
      user_id: user.id,
      total_interviews: analytics.progress?.total_interviews || 0,
      average_score: analytics.progress?.average_score || 0,
      trend: analytics.progress?.trend || 'Unknown',
      top_strength: analytics.strengths?.[0]?.area || 'N/A',
      area_to_improve: analytics.weaknesses?.[0]?.area || 'N/A',
      next_recommendation: analytics.recommendations?.[0] || 'Keep practicing!'
    };

    return res.json(summary);

  } catch (error) {
    console.error('Summary error:', error);
    return res.status(500).json({ error: 'Failed to fetch summary' });
  }
}

/**
 * Get analytics comparison (time period comparison)
 * GET /api/analytics/comparison
 */
export async function getComparisonAnalytics(req, res) {
  try {
    const user = await resolveAuthenticatedUser(req);
    
    if (!user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const analytics = await getPerformanceAnalytics(user.id);

    if (analytics.error) {
      return res.status(400).json({ error: 'Could not fetch comparison' });
    }

    // Build comparison data
    const comparison = {
      user_id: user.id,
      progress: {
        total_interviews: analytics.progress?.total_interviews || 0,
        average_score: analytics.progress?.average_score || 0,
        trend: analytics.progress?.trend || 'Unknown'
      },
      categories: analytics.categories || {},
      top_areas: analytics.strengths?.slice(0, 3) || [],
      improvement_areas: analytics.weaknesses?.slice(0, 3) || []
    };

    return res.json(comparison);

  } catch (error) {
    console.error('Comparison error:', error);
    return res.status(500).json({ error: 'Failed to fetch comparison' });
  }
}

export default {
  getUserPerformanceAnalytics,
  getPerformanceSummary,
  getComparisonAnalytics
};
