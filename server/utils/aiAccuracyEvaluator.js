const { GoogleGenerativeAI } = require("@google/generative-ai");

const evaluateAnswerAccuracy = async (questionText, answerText) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing from .env");
      return { accuracy: null, reason: "AI service not configured." };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an expert software engineer.

Question:
${questionText}

Answer:
${answerText}

Evaluate how accurate and helpful the answer is for solving the question.

Return ONLY JSON:

{
  "accuracy": number between 0 and 100,
  "reason": "short explanation"
}
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Clean up potential markdown blocks
    if (text.startsWith('```json')) {
      text = text.substring(7);
      if (text.endsWith('```')) {
        text = text.substring(0, text.length - 3);
      }
    } else if (text.startsWith('```')) {
        text = text.substring(3);
        if (text.endsWith('```')) {
          text = text.substring(0, text.length - 3);
        }
    }

    const parsed = JSON.parse(text.trim());
    return {
      accuracy: typeof parsed.accuracy === 'number' ? parsed.accuracy : parseInt(parsed.accuracy),
      reason: parsed.reason || "Evaluated by AI."
    };
  } catch (error) {
    console.error("AI Evaluation Error (aiAccuracyEvaluator):", error);
    // Explicitly return null accuracy if it fails so backend can skip it or save normally
    return null;
  }
};

module.exports = evaluateAnswerAccuracy;
