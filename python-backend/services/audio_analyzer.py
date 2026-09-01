"""
Audio Analyzer Service
Analyzes audio metrics: tone, pace, confidence, filler words
"""

import base64
import io
import numpy as np
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

try:
    import librosa
    HAS_LIBROSA = True
except ImportError:
    HAS_LIBROSA = False
    logger.warning("librosa not installed - audio analysis will be limited")

def decode_audio(audio_base64: str, mime_type: str = "audio/wav"):
    """
    Decode base64 audio to numpy array
    """
    try:
        audio_bytes = base64.b64decode(audio_base64)
        
        # Try to load with librosa if available
        if HAS_LIBROSA:
            y, sr = librosa.load(io.BytesIO(audio_bytes), sr=None)
            return y, sr
        else:
            # Fallback: simple byte analysis
            audio_array = np.frombuffer(audio_bytes, dtype=np.float32)
            return audio_array, 16000  # Assume 16kHz
            
    except Exception as e:
        logger.error(f"Audio decode error: {str(e)}")
        raise

def analyze_confidence(audio_signal: np.ndarray) -> float:
    """
    Analyze confidence from audio amplitude
    Higher RMS = higher confidence
    Returns 0-100
    """
    if len(audio_signal) == 0:
        return 0
    
    # Calculate RMS (Root Mean Square) energy
    rms_energy = np.sqrt(np.mean(audio_signal ** 2))
    
    # Normalize to 0-100
    confidence = min(100, max(0, rms_energy * 1000))
    
    return round(confidence, 2)

def analyze_pace(audio_signal: np.ndarray, sr: int) -> Dict[str, Any]:
    """
    Analyze speaking pace from zero-crossing rate
    """
    try:
        if HAS_LIBROSA:
            zcr = librosa.feature.zero_crossing_rate(audio_signal)[0]
            mean_zcr = np.mean(zcr)
            
            # Estimate words per minute
            # Higher ZCR ~ more rapid speech
            if mean_zcr < 0.05:
                pace = "Slow"
                wpm = 100
            elif mean_zcr < 0.1:
                pace = "Normal"
                wpm = 150
            else:
                pace = "Fast"
                wpm = 200
        else:
            pace = "Unknown"
            wpm = 150
        
        return {
            'pace': pace,
            'estimated_wpm': wpm,
            'quality': 'Good' if pace == 'Normal' else 'Could be improved'
        }
    except Exception as e:
        logger.warning(f"Pace analysis error: {str(e)}")
        return {
            'pace': 'Unknown',
            'estimated_wpm': 150,
            'quality': 'Unable to analyze'
        }

def analyze_filler_words(transcript: str = "") -> Dict[str, Any]:
    """
    Detect filler words in transcript
    """
    filler_words = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'literally']
    
    if not transcript:
        return {
            'filler_count': 0,
            'filler_score': 100,
            'suggestion': 'No transcript available'
        }
    
    text = transcript.lower()
    filler_count = sum(1 for word in filler_words if word in text)
    
    # Score: fewer fillers = higher score
    words_total = len(text.split())
    filler_ratio = (filler_count / words_total * 100) if words_total > 0 else 0
    
    filler_score = max(0, 100 - (filler_ratio * 10))
    
    return {
        'filler_count': filler_count,
        'filler_score': round(filler_score, 2),
        'suggestion': 'Try to minimize filler words for more impact' if filler_count > 3 else 'Good job minimizing fillers!'
    }

def analyze_clarity(audio_signal: np.ndarray) -> Dict[str, Any]:
    """
    Analyze audio clarity (signal-to-noise ratio)
    """
    if len(audio_signal) == 0:
        return {
            'clarity_score': 0,
            'noise_level': 'Unknown',
            'suggestion': 'No audio data'
        }
    
    # Simple noise estimation: look at quietest 25% of samples
    sorted_signal = np.sort(np.abs(audio_signal))
    noise_estimate = np.mean(sorted_signal[:len(sorted_signal)//4])
    
    # Calculate signal-to-noise ratio
    signal_power = np.mean(audio_signal ** 2)
    snr = 10 * np.log10(signal_power / (noise_estimate ** 2 + 1e-10))
    
    # Convert to 0-100 score
    clarity_score = min(100, max(0, snr * 5))
    
    if clarity_score > 80:
        noise_level = "Very Low"
    elif clarity_score > 60:
        noise_level = "Low"
    elif clarity_score > 40:
        noise_level = "Moderate"
    else:
        noise_level = "High"
    
    return {
        'clarity_score': round(clarity_score, 2),
        'noise_level': noise_level,
        'suggestion': 'Audio quality is good' if clarity_score > 60 else 'Try reducing background noise'
    }

def analyze_audio(audio_base64: str, mime_type: str = "audio/wav", transcript: str = "") -> Dict[str, Any]:
    """
    Main function to analyze audio
    Returns comprehensive audio metrics
    """
    logger.info(f"🎤 Analyzing audio ({mime_type})")
    
    try:
        # Decode audio
        audio_signal, sr = decode_audio(audio_base64, mime_type)
        
        # Analyze metrics
        confidence = analyze_confidence(audio_signal)
        pace = analyze_pace(audio_signal, sr)
        filler = analyze_filler_words(transcript)
        clarity = analyze_clarity(audio_signal)
        
        # Overall score
        overall_score = round((confidence + pace.get('wpm', 150) / 2 + clarity['clarity_score']) / 3, 2)
        
        return {
            'confidence_score': confidence,
            'pace': pace,
            'filler_words': filler,
            'clarity': clarity,
            'overall_score': overall_score,
            'duration_seconds': round(len(audio_signal) / sr, 2),
            'audio_info': {
                'sample_rate': sr,
                'channels': 1,
                'format': mime_type
            }
        }
        
    except Exception as e:
        logger.error(f"Audio analysis error: {str(e)}")
        return {
            'error': str(e),
            'confidence_score': 0,
            'pace': {'pace': 'Unknown', 'estimated_wpm': 0},
            'filler_words': {'filler_count': 0, 'filler_score': 0},
            'clarity': {'clarity_score': 0, 'noise_level': 'Unknown'},
            'overall_score': 0
        }
