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

module.exports = { debugError };
