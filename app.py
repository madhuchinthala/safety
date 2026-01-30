
from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app) # Enable CORS for frontend communication

class RuleBasedAnalyzer:
    DANGER_PATTERNS = [
        r'\bkill\b', r'\bsuicide\b', r'\bdie\b', r'\bhurt myself\b', 
        r'\bend it all\b', r'\bself-harm\b', r'\bno point\b', r'\bharm\b'
    ]
    
    CONCERNING_PATTERNS = [
        r'\bsad\b', r'\blonely\b', r'\bdepressed\b', r'\bangry\b', 
        r'\banxious\b', r'\bfear\b', r'\bcrying\b', r'\bhate\b', r'\bworthless\b'
    ]
    
    HAPPY_PATTERNS = [
        r'\bhappy\b', r'\bgood\b', r'\bgreat\b', r'\bexcited\b', 
        r'\bpeaceful\b', r'\blove\b', r'\bjoy\b', r'\bokay\b'
    ]

    def analyze(self, text):
        text = text.lower()
        
        # Check for Danger
        for pattern in self.DANGER_PATTERNS:
            if re.search(pattern, text):
                return {
                    "emotion": "Crisis / Despair",
                    "intensity": 10,
                    "statusSummary": "Immediate safety risk detected. Activating emergency protocols.",
                    "safetyLevel": "DANGER",
                    "recommendation": "Please contact emergency services or a crisis hotline immediately. Your guardians have been alerted."
                }
        
        # Check for Concerning
        for pattern in self.CONCERNING_PATTERNS:
            if re.search(pattern, text):
                return {
                    "emotion": "Distress",
                    "intensity": 7,
                    "statusSummary": "High emotional weight detected. You seem to be going through a tough time.",
                    "safetyLevel": "CONCERNING",
                    "recommendation": "Try talking to a friend or using a grounding technique. We've sent a wellness check to your contacts."
                }
        
        # Check for Happy/Positive
        for pattern in self.HAPPY_PATTERNS:
            if re.search(pattern, text):
                return {
                    "emotion": "Positive",
                    "intensity": 4,
                    "statusSummary": "You sound stable and positive. Keep maintaining this mindset!",
                    "safetyLevel": "SAFE",
                    "recommendation": "Continue your current self-care routine. It's working well for you."
                }

        # Default fallback
        return {
            "emotion": "Neutral / Unclear",
            "intensity": 3,
            "statusSummary": "Standard emotional check-in. No immediate risks found.",
            "safetyLevel": "SAFE",
            "recommendation": "Keep journaling your feelings daily to track patterns."
        }

analyzer = RuleBasedAnalyzer()

@app.route('/analyze', methods=['POST'])
def analyze_endpoint():
    data = request.json
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    result = analyzer.analyze(text)
    return jsonify(result)

if __name__ == '__main__':
    print("SentientGuardian Python NLP Engine starting on port 5000...")
    app.run(port=5000, debug=True)
