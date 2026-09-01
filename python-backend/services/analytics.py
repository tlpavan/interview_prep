"""
Analytics Service
Provides performance analytics and insights from interview sessions
"""

from typing import Dict, Any, List
import json
import os
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Path to data file (same as Node.js backend)
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'backend', 'data')
SESSIONS_FILE = os.path.join(DATA_DIR, 'interviews.json')

def load_sessions_data() -> Dict[str, Any]:
    """Load interview sessions from JSON file"""
    try:
        if os.path.exists(SESSIONS_FILE):
            with open(SESSIONS_FILE, 'r') as f:
                return json.load(f)
        return {'sessions': []}
    except Exception as e:
        logger.warning(f"Could not load sessions: {str(e)}")
        return {'sessions': []}

def get_user_sessions(user_id: str) -> List[Dict]:
    """Get all sessions for a specific user"""
    data = load_sessions_data()
    sessions = data.get('sessions', [])
    
    user_sessions = [s for s in sessions if s.get('user_id') == user_id or s.get('userId') == user_id]
    return user_sessions

def calculate_progress(sessions: List[Dict]) -> Dict[str, Any]:
    """Calculate user progress over time"""
    if not sessions:
        return {
            'total_interviews': 0,
            'total_hours': 0,
            'average_score': 0,
            'trend': 'No data'
        }
    
    # Sort by date
    sorted_sessions = sorted(sessions, key=lambda x: x.get('createdAt', ''), reverse=True)
    
    # Calculate total hours
    total_duration = sum(s.get('duration', 0) for s in sorted_sessions)
    total_hours = round(total_duration / 3600, 2)
    
    # Calculate average score
    scores = [s.get('score', 0) for s in sorted_sessions if s.get('score')]
    average_score = round(sum(scores) / len(scores), 2) if scores else 0
    
    # Determine trend
    if len(sorted_sessions) >= 2:
        recent_scores = scores[:5]  # Last 5
        older_scores = scores[5:10] if len(scores) > 5 else scores[-5:]
        
        if recent_scores and older_scores:
            recent_avg = sum(recent_scores) / len(recent_scores)
            older_avg = sum(older_scores) / len(older_scores)
            
            if recent_avg > older_avg + 5:
                trend = "Improving ↗"
            elif recent_avg < older_avg - 5:
                trend = "Declining ↘"
            else:
                trend = "Stable →"
        else:
            trend = "Insufficient data"
    else:
        trend = "Only one session"
    
    return {
        'total_interviews': len(sessions),
        'total_hours': total_hours,
        'average_score': average_score,
        'trend': trend,
        'recent_sessions': len(sorted_sessions[:5])
    }

def analyze_strengths(sessions: List[Dict]) -> List[Dict]:
    """Identify strong areas"""
    if not sessions:
        return []
    
    # Aggregate scores by area
    areas = {}
    
    for session in sessions:
        feedback = session.get('feedback', {})
        
        if isinstance(feedback, dict):
            for area, score in feedback.items():
                if area != 'suggestions' and isinstance(score, (int, float)):
                    if area not in areas:
                        areas[area] = []
                    areas[area].append(score)
    
    # Calculate averages and identify strengths (> 70)
    strengths = []
    for area, scores in areas.items():
        avg_score = sum(scores) / len(scores)
        if avg_score > 70:
            strengths.append({
                'area': area.replace('_', ' ').title(),
                'score': round(avg_score, 2),
                'sessions_analyzed': len(scores)
            })
    
    return sorted(strengths, key=lambda x: x['score'], reverse=True)

def analyze_weaknesses(sessions: List[Dict]) -> List[Dict]:
    """Identify areas needing improvement"""
    if not sessions:
        return []
    
    # Aggregate scores by area
    areas = {}
    
    for session in sessions:
        feedback = session.get('feedback', {})
        
        if isinstance(feedback, dict):
            for area, score in feedback.items():
                if area != 'suggestions' and isinstance(score, (int, float)):
                    if area not in areas:
                        areas[area] = []
                    areas[area].append(score)
    
    # Calculate averages and identify weaknesses (< 60)
    weaknesses = []
    for area, scores in areas.items():
        avg_score = sum(scores) / len(scores)
        if avg_score < 60:
            weaknesses.append({
                'area': area.replace('_', ' ').title(),
                'score': round(avg_score, 2),
                'sessions_analyzed': len(scores),
                'recommendation': f"Focus on improving your {area.lower()}"
            })
    
    return sorted(weaknesses, key=lambda x: x['score'])

def get_category_breakdown(sessions: List[Dict]) -> Dict[str, int]:
    """Breakdown of interview types"""
    categories = {}
    
    for session in sessions:
        category = session.get('type', 'Unknown')
        categories[category] = categories.get(category, 0) + 1
    
    return categories

def get_performance_analytics(user_id: str) -> Dict[str, Any]:
    """Main function to get comprehensive analytics"""
    logger.info(f"📊 Generating analytics for user {user_id}")
    
    try:
        sessions = get_user_sessions(user_id)
        
        progress = calculate_progress(sessions)
        strengths = analyze_strengths(sessions)
        weaknesses = analyze_weaknesses(sessions)
        categories = get_category_breakdown(sessions)
        
        # Generate recommendations
        recommendations = []
        
        if len(weaknesses) > 0:
            top_weakness = weaknesses[0]
            recommendations.append(f"Focus on: {top_weakness['recommendation']}")
        
        if progress['trend'] == "Declining ↘":
            recommendations.append("Your recent performance is declining. Consider reviewing fundamentals.")
        elif progress['trend'] == "Improving ↗":
            recommendations.append("Great! You're showing improvement. Keep practicing!")
        
        if len(sessions) < 5:
            recommendations.append(f"Complete {5 - len(sessions)} more interviews to build confidence.")
        else:
            recommendations.append("You have enough practice data. Focus on weak areas now.")
        
        return {
            'user_id': user_id,
            'progress': progress,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'categories': categories,
            'recommendations': recommendations,
            'sessions': sessions,
            'generated_at': str(datetime.now())
        }
        
    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        return {
            'error': str(e),
            'user_id': user_id,
            'progress': None,
            'strengths': [],
            'weaknesses': [],
            'recommendations': ['Unable to generate analytics. Please try again later.']
        }
