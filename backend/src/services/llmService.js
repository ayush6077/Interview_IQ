const env = require("../config/env");

/**
 * Safely parse JSON from LLM response text (strips markdown code fences if present).
 */
const safeParseJSON = (text, fallback) => {
  if (!text) return fallback;
  try {
    const cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/i, "$1").trim();
    const jsonMatch = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
};

/**
 * Call Google Gemini API directly using native fetch.
 */
async function callGemini(promptText) {
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No GEMINI_API_KEY configured");

  const modelsToTry = [
    env.GEMINI_MODEL || "gemini-flash-lite-latest",
    "gemini-flash-lite-latest",
    "gemini-2.5-flash-lite",
    "gemini-pro-latest",
  ];

  let lastError = null;
  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Gemini HTTP ${res.status}: ${errorBody.slice(0, 200)}`);
      }

      const data = await res.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText) {
        return candidateText;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini] model ${model} failed (${err.message}). Trying next...`);
    }
  }
  throw lastError || new Error("All Gemini models failed");
}

/**
 * Extract key technologies from resume context for fallback questions.
 */
function extractResumeHighlights(context) {
  const commonTech = [
    "react", "node.js", "express", "mongodb", "typescript", "javascript", "python",
    "docker", "kubernetes", "aws", "redux", "graphql", "sql", "postgresql",
    "git", "rest api", "microservices", "ci/cd", "tailwind", "next.js"
  ];
  const found = [];
  const lower = (context || "").toLowerCase();
  for (const t of commonTech) {
    if (lower.includes(t)) found.push(t);
  }
  return found.length > 0 ? found : ["full-stack development", "API architecture", "databases"];
}

function getFallbackQuestions(context, targetRole, experienceLevel) {
  const techs = extractResumeHighlights(context);
  const primaryTech = techs[0] || "JavaScript";
  const secondaryTech = techs[1] || "React";
  const tertiaryTech = techs[2] || "Node.js";

  return [
    {
      question: `Walk me through your background as a ${targetRole}. How have you leveraged ${primaryTech} and ${secondaryTech} in your recent projects?`,
      type: "behavioral",
      difficulty: "easy",
    },
    {
      question: `In your experience with ${secondaryTech}, how do you structure components, manage state, and prevent unnecessary re-renders?`,
      type: "technical",
      difficulty: experienceLevel === "Junior" ? "easy" : "medium",
    },
    {
      question: `Describe how you design and implement scalable RESTful APIs using ${tertiaryTech}. How do you handle authentication, error handling, and rate limiting?`,
      type: "technical",
      difficulty: "medium",
    },
    {
      question: `Can you walk through a challenging bug or performance bottleneck you identified in a past project? What debugging tools and strategies did you use?`,
      type: "technical",
      difficulty: "medium",
    },
    {
      question: `How do you approach database schema design and query optimization when working with data-intensive applications?`,
      type: "technical",
      difficulty: experienceLevel === "Senior" || experienceLevel === "Lead" ? "hard" : "medium",
    },
    {
      question: `Describe a situation where you had to quickly learn or adopt a new tool or framework to meet a tight deadline. What was the outcome?`,
      type: "situational",
      difficulty: "medium",
    },
    {
      question: `How do you implement automated testing (unit, integration, or E2E) and CI/CD pipelines to ensure code reliability before deploying to production?`,
      type: "technical",
      difficulty: "medium",
    },
    {
      question: `Tell me about a time you had a technical disagreement regarding system architecture or code review feedback with a teammate. How did you resolve it?`,
      type: "behavioral",
      difficulty: "medium",
    },
    {
      question: `How do you ensure web application security, mitigating vulnerabilities like XSS, CSRF, and SQL/NoSQL injection?`,
      type: "technical",
      difficulty: "hard",
    },
    {
      question: `Where do you see yourself growing as a ${targetRole} over the next 2-3 years, and what emerging technologies are you most excited to master?`,
      type: "general",
      difficulty: "easy",
    },
  ];
}

/**
 * Generate 10 interview questions using Gemini LLM and RAG context.
 */
const generateQuestions = async (context, targetRole, experienceLevel) => {
  const fallback = getFallbackQuestions(context, targetRole, experienceLevel);

  const prompt = `You are an expert technical interviewer. Generate exactly 10 high-quality interview questions tailored to the candidate's resume and target role.

Target Role: ${targetRole || "Software Engineer"}
Experience Level: ${experienceLevel || "Mid"}

Candidate Resume Context:
${context || "No resume context available."}

Guidelines:
- Create 10 personalized questions based directly on the candidate's skills, projects, and technologies found in the resume context.
- Mix question types: technical (60%), behavioral (25%), situational (15%).
- Return ONLY a valid JSON array. Do not wrap with extra explanation.

Format:
[
  {
    "question": "Question text here",
    "type": "technical | behavioral | situational | general",
    "difficulty": "easy | medium | hard"
  }
]`;

  try {
    console.log(`[LLM] Calling Gemini to generate questions for ${targetRole}...`);
    const responseText = await callGemini(prompt);
    const parsed = safeParseJSON(responseText, fallback);

    if (Array.isArray(parsed) && parsed.length > 0) {
      console.log(`[LLM] Gemini generated ${parsed.length} questions successfully!`);
      return parsed.slice(0, 10).map((q) => ({
        question: q.question || "Tell me about yourself.",
        type: ["technical", "behavioral", "situational", "general"].includes(q.type) ? q.type : "technical",
        difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium",
      }));
    }
  } catch (err) {
    console.warn(`[LLM] Gemini question generation error: ${err.message}. Using RAG fallback.`);
  }

  return fallback;
};

/**
 * Evaluate candidate answer using Gemini LLM.
 */
const evaluateAnswer = async (question, userAnswer, context, targetRole) => {
  const prompt = `You are an expert technical interviewer evaluating a candidate's answer for the role of ${targetRole || "Software Engineer"}.

Resume Context:
${context || "Not provided."}

Interview Question:
${question}

Candidate's Answer:
${userAnswer || "(No answer provided)"}

Provide a fair, rigorous, and constructive evaluation.
Return ONLY a valid JSON object in the following format:
{
  "score": <number between 0 and 10, e.g. 7.5>,
  "feedback": "<detailed feedback paragraph explaining how well the answer addressed the question, technical accuracy, and depth>",
  "strengths": [
    "<specific strength 1>",
    "<specific strength 2>"
  ],
  "improvements": [
    "<actionable suggestion 1 to make this answer top-tier>",
    "<actionable suggestion 2>"
  ],
  "modelAnswer": "<an outstanding, production-level model answer for this exact question>"
}`;

  try {
    console.log(`[LLM] Calling Gemini to evaluate answer for: "${question.slice(0, 40)}..."`);
    const responseText = await callGemini(prompt);
    const parsed = safeParseJSON(responseText, null);

    if (parsed && typeof parsed.score === "number") {
      console.log(`[LLM] Gemini evaluated answer. Score: ${parsed.score}/10`);
      return {
        score: Math.min(10, Math.max(0, parsed.score)),
        feedback: parsed.feedback || "Good response.",
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ["Clear communication"],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ["Add more technical depth"],
        modelAnswer: parsed.modelAnswer || "A complete answer covers system architecture, scalability, and concrete examples.",
      };
    }
  } catch (err) {
    console.warn(`[LLM] Gemini answer evaluation error: ${err.message}`);
  }

  // Fallback if API fails
  const words = (userAnswer || "").trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const score = wordCount >= 50 ? 8 : wordCount >= 25 ? 6.5 : wordCount >= 10 ? 5 : 3.5;

  return {
    score,
    feedback: `Your response provides a foundation for ${targetRole}, but could be improved with more concrete architectural examples and quantifiable results.`,
    strengths: ["Directly answered the question", "Communicated key ideas clearly"],
    improvements: ["Incorporate specific framework nuances", "Use the STAR method (Situation, Task, Action, Result)"],
    modelAnswer: `A comprehensive answer for this ${targetRole} question covers the core mechanism, error recovery, scalability, and a concrete example from past experience.`,
  };
};

/**
 * Generate session summary using Gemini LLM.
 */
const generateSessionSummary = async (qaHistory, targetRole) => {
  const answers = Array.isArray(qaHistory) ? qaHistory : [];
  const qaFormatted = answers
    .map(
      (item, i) =>
        `Q${i + 1}: ${item.question}\nAnswer: ${item.userAnswer}\nScore: ${item.evaluation?.score ?? "N/A"}/10\nFeedback: ${item.evaluation?.feedback ?? "N/A"}`
    )
    .join("\n\n---\n\n");

  const prompt = `You are an executive engineering hiring coach. Review this candidate's full mock interview practice session for the role of ${targetRole || "Software Engineer"}.

Interview History:
${qaFormatted}

Provide an insightful, holistic summary.
Return ONLY a valid JSON object in this format:
{
  "strengths": [
    "<overall candidate strength 1>",
    "<overall candidate strength 2>",
    "<overall candidate strength 3>"
  ],
  "areasToImprove": [
    "<critical improvement area 1>",
    "<critical improvement area 2>",
    "<critical improvement area 3>"
  ],
  "recommendations": [
    "<actionable career recommendation 1>",
    "<actionable career recommendation 2>",
    "<actionable career recommendation 3>"
  ]
}`;

  try {
    console.log(`[LLM] Calling Gemini to generate session summary for ${targetRole}...`);
    const responseText = await callGemini(prompt);
    const parsed = safeParseJSON(responseText, null);

    if (parsed && Array.isArray(parsed.strengths)) {
      console.log(`[LLM] Gemini generated session summary successfully!`);
      return {
        strengths: parsed.strengths,
        areasToImprove: Array.isArray(parsed.areasToImprove) ? parsed.areasToImprove : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      };
    }
  } catch (err) {
    console.warn(`[LLM] Gemini summary error: ${err.message}`);
  }

  return {
    strengths: [
      `Demonstrated consistent technical commitment across ${answers.length} interview questions`,
      `Articulated foundational engineering concepts for the ${targetRole} position`,
      "Maintained professional communication and willingness to tackle complex scenarios",
    ],
    areasToImprove: [
      "Incorporate more quantifiable metrics (e.g. latency reduced by X%, throughput scaled to Y)",
      "Elaborate on edge cases, error-recovery mechanisms, and fault tolerance in system design answers",
      "Structure behavioral responses using the STAR method (Situation, Task, Action, Result)",
    ],
    recommendations: [
      `Review core data structures, API security, and state management fundamentals for ${targetRole}`,
      "Prepare 3-4 specific stories highlighting personal impact in past team projects",
      "Practice whiteboard and timed mock interviews to build conciseness under pressure",
    ],
  };
};

module.exports = { generateQuestions, evaluateAnswer, generateSessionSummary };
