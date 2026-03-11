const ErrorPost = require('../models/ErrorPost');
// AI Controller using Gemini REST API directly (no SDK dependency issues)

// Models to try in order — if one is quota-limited, fall through to the next
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

async function callGemini(apiKey, modelName, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const errorMsg = errorBody?.error?.message || `HTTP ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
}

// Try each model in order until one works
async function callWithFallback(apiKey, prompt) {
  let lastError;

  for (const model of MODELS) {
    try {
      console.log(`Trying model: ${model}`);
      const result = await callGemini(apiKey, model, prompt);
      console.log(`✅ Success with model: ${model}`);
      return result;
    } catch (err) {
      console.log(`❌ ${model} failed: ${err.message?.substring(0, 100)}`);
      lastError = err;

      // Only retry with next model if it's a rate limit / quota issue
      if (err.status !== 429 && err.status !== 503) {
        throw err; // Don't retry on auth errors, bad requests, etc.
      }
    }
  }

  throw lastError;
}

// @desc    AI debug assistant - explain/solve errors
// @route   POST /api/ai/debug
// @access  Public
const debugError = async (req, res) => {
  try {
    const { errorText, mode } = req.body;

    if (!errorText || !errorText.trim()) {
      return res.status(400).json({ message: "Error text is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing from .env");
      return res.status(500).json({ message: "AI service not configured. Add GEMINI_API_KEY to .env" });
    }

    const validModes = ["explanation", "solution"];
    const selectedMode = validModes.includes(mode) ? mode : "explanation";

    let prompt;

    if (selectedMode === "explanation") {
      prompt = `You are an expert software debugging assistant.

A developer encountered the following error:

${errorText}

Explain what this error means, when it typically occurs, and why it happens.

Format your response clearly with these sections:
## Error Explanation
A clear explanation of the error.

## Why It Occurs
The technical reason behind this error.

## Common Causes
A bullet-point list of common causes.

Keep the response developer-friendly, concise, and practical.`;
    } else {
      prompt = `You are an expert software debugging assistant.

A developer encountered the following error:

${errorText}

Explain the error and provide a clear solution with example code if possible.

Format your response clearly with these sections:
## Error Explanation
A clear explanation of the error.

## Why It Occurs
The technical reason behind this error.

## Solution
A step-by-step fix with example code.

## Best Practices
Tips to avoid this error in the future.

Keep the response developer-friendly, concise, and practical.`;
    }

    const answer = await callWithFallback(apiKey, prompt);
    res.json({ answer });
  } catch (error) {
    console.error("AI DEBUG ERROR:", error.message || error);

    const isQuota = error.status === 429 || error.message?.includes("quota") || error.message?.includes("RESOURCE_EXHAUSTED");
    const message = isQuota
      ? "AI rate limit reached. Please wait a minute and try again."
      : "Failed to generate AI response. Please try again.";

    res.status(isQuota ? 429 : 500).json({ message });
  }
};

// @desc    Check if a drafted question is a duplicate
// @route   POST /api/ai/check-duplicate
// @access  Public
const checkDuplicateQuestion = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "AI service not configured." });
    }

    // Fetch recent questions to check against (limit to 50 for prompt size)
    const recentQuestions = await ErrorPost.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .select('_id title description');

    if (recentQuestions.length === 0) {
      return res.json({ isDuplicate: false, similarQuestions: [] });
    }

    // Construct the prompt
    let prompt = `You are an AI assistant designed to prevent duplicate questions in a developer forum.
A user is about to post a new question. Here is their draft:

[DRAFT TITLE]: ${title}
[DRAFT DESCRIPTION]: ${description}

Here are the most recent 50 questions posted on the forum, formatted as ID | TITLE | DESCRIPTION:

`;

    recentQuestions.forEach(q => {
      prompt += `${q._id} | ${q.title} | ${q.description.substring(0, 200)}...\n`;
    });

    prompt += `
Analyze the drafted question and the existing questions. 
Are there any existing questions that are CLEARLY asking the exact same fundamental question or solving the exact same specific error? (Ignore minor differences in variable names or framing, but do not flag generic similarities).
Only return positive if it is highly likely to be a duplicate.

Respond ONLY with a raw JSON object in this exact format (do not wrap in markdown quotes):
{
  "isDuplicate": true/false,
  "similarQuestionIds": ["id1", "id2"] // array of matched IDs, empty if none
}`;

    const answer = await callWithFallback(apiKey, prompt);
    let parsedResult = { isDuplicate: false, similarQuestionIds: [] };
    
    try {
      // Clean up potential markdown formatting from AI
      const cleanJson = answer.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Failed to parse AI duplicate check response:", answer);
      // Fallback: If it failed to parse, assume not a duplicate to not block the user
    }

    // If duplicate found, fetch the full similar questions to send to frontend
    let similarQuestionsDetails = [];
    if (parsedResult.isDuplicate && parsedResult.similarQuestionIds.length > 0) {
      similarQuestionsDetails = await ErrorPost.find({
        _id: { $in: parsedResult.similarQuestionIds }
      }).select('_id title').limit(3);
      
      // If we couldn't actually find the IDs in the DB (AI hallucinated), reset duplicate flag
      if (similarQuestionsDetails.length === 0) {
        parsedResult.isDuplicate = false;
      }
    }

    res.json({
      isDuplicate: parsedResult.isDuplicate,
      similarQuestions: similarQuestionsDetails
    });

  } catch (error) {
    console.error("AI DUPLICATE CHECK ERROR:", error.message || error);
    // On error, let the user proceed so we don't block them from posting their question
    res.json({ isDuplicate: false, similarQuestions: [] });
  }
};

module.exports = { debugError, checkDuplicateQuestion };
