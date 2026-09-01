"""
Python Microservices Backend for InterviewPrep AI
Provides specialized services: DSA evaluation, audio analysis, analytics
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging

from services.dsa_evaluator import evaluate_code
from services.audio_analyzer import analyze_audio
from services.analytics import get_performance_analytics

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PORT = os.getenv('PYTHON_BACKEND_PORT', 5001)
NODE_BACKEND_URL = os.getenv('NODE_BACKEND_URL', 'http://localhost:5000')

# ============================================================================
# Health Check
# ============================================================================
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'python-microservices',
        'timestamp': str(__import__('datetime').datetime.now()),
        'services': ['dsa_evaluator', 'audio_analyzer', 'analytics']
    }), 200

# ============================================================================
# DSA Code Evaluation
# ============================================================================
@app.route('/api/dsa/evaluate', methods=['POST'])
def dsa_evaluate():
    """
    Evaluate DSA solution code
    Expected payload:
    {
        "code": "python code string",
        "problem": "problem description",
        "test_cases": [{"input": "...", "expected": "..."}]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'code' not in data:
            return jsonify({'error': 'Missing code in request'}), 400
        
        code = data.get('code', '')
        problem = data.get('problem', '')
        test_cases = data.get('test_cases', [])
        
        result = evaluate_code(code, problem, test_cases)
        
        logger.info(f"✅ DSA Evaluation: {result['is_valid']} - {result['verdict']}")
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"❌ DSA Evaluation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============================================================================
# Audio Analysis
# ============================================================================
@app.route('/api/audio/analyze', methods=['POST'])
def audio_analyze():
    """
    Analyze audio metrics (tone, pace, confidence, filler words)
    Expected payload:
    {
        "audio_base64": "base64 encoded audio",
        "mime_type": "audio/wav or audio/webm"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'audio_base64' not in data:
            return jsonify({'error': 'Missing audio_base64 in request'}), 400
        
        audio_base64 = data.get('audio_base64', '')
        mime_type = data.get('mime_type', 'audio/wav')
        
        result = analyze_audio(audio_base64, mime_type)
        
        logger.info(f"🎤 Audio Analysis: Confidence={result['confidence_score']}")
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"❌ Audio Analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============================================================================
# Analytics
# ============================================================================
@app.route('/api/analytics/performance/<user_id>', methods=['GET'])
def performance_analytics(user_id):
    """
    Get performance analytics for a user
    Returns: progress trends, strong areas, areas to improve
    """
    try:
        result = get_performance_analytics(user_id)
        
        logger.info(f"📊 Analytics: User {user_id} - {len(result['sessions'])} sessions")
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"❌ Analytics error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============================================================================
# Test Endpoints
# ============================================================================
@app.route('/api/test/dsa', methods=['POST'])
def test_dsa():
    """Test DSA evaluator with sample code"""
    sample_code = """
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
"""
    sample_problem = "Find two indices where nums[i] + nums[j] = target"
    
    result = evaluate_code(sample_code, sample_problem, [])
    return jsonify({
        'message': 'DSA test executed',
        'result': result
    }), 200

@app.route('/api/test/ping', methods=['GET'])
def test_ping():
    """Simple ping test"""
    return jsonify({'ping': 'pong', 'service': 'python-backend'}), 200

# ============================================================================
# Error Handler
# ============================================================================
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

# ============================================================================
# Main
# ============================================================================
if __name__ == '__main__':
    logger.info(f"🚀 Starting Python Microservices Backend on port {PORT}")
    logger.info(f"📡 Node.js Backend: {NODE_BACKEND_URL}")
    app.run(host='0.0.0.0', port=int(PORT), debug=True)
