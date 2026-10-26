const { ChatPromptTemplate } = require('@langchain/core/prompts');

/**
 * Prompt template for generating interview questions.
 * Inputs: {context}, {targetRole}, {experienceLevel}
 * Expected output: JSON array of question objects.
 */
const questionGenerationPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an expert technical interviewer. Your task is to generate relevant interview questions based on the candidate's resume and the target role.

Guidelines:
- Generate exactly 10 interview questions.
- Mix question types: technical (60%), behavioral (25%), and situational (15%).
- Tailor difficulty to the experience level provided.
- Base questions on the candidate's actual skills, projects, and experience from the resume context.
- Return ONLY a valid JSON array with no extra text, markdown, or explanation.

Output format:
[
  {{
    "question": "Question text here",
    "type": "technical | behavioral | situational | general",
    "difficulty": "easy | medium | hard"
  }}
]`,
  ],
  [
    'human',
    `Resume Context:
{context}

Target Role: {targetRole}
Experience Level: {experienceLevel}

Generate 10 interview questions as a JSON array:`,
  ],
]);

/**
 * Prompt template for evaluating a candidate's answer.
 * Inputs: {question}, {userAnswer}, {context}, {targetRole}
 * Expected output: JSON evaluation object.
 */
const answerEvaluationPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an expert technical interviewer evaluating a candidate's interview answer. Provide a detailed, fair, and constructive evaluation.

Return ONLY a valid JSON object with no extra text, markdown, or explanation.

Output format:
{{
  "score": <number between 0 and 10>,
  "feedback": "<overall feedback paragraph>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<area for improvement 1>", "<area for improvement 2>"],
  "modelAnswer": "<a comprehensive model answer for this question>"
}}`,
  ],
  [
    'human',
    `Target Role: {targetRole}

Resume Context:
{context}

Question: {question}

Candidate's Answer: {userAnswer}

Evaluate this answer and return a JSON object:`,
  ],
]);

/**
 * Prompt template for generating a session summary.
 * Inputs: {qaHistory}, {targetRole}
 * Expected output: JSON summary object.
 */
const sessionSummaryPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an expert career coach summarizing an interview practice session. Based on all the questions, answers, and individual evaluations, provide a comprehensive overall summary.

Return ONLY a valid JSON object with no extra text, markdown, or explanation.

Output format:
{{
  "strengths": ["<overall strength 1>", "<overall strength 2>", "<overall strength 3>"],
  "areasToImprove": ["<improvement area 1>", "<improvement area 2>", "<improvement area 3>"],
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", "<actionable recommendation 3>"]
}}`,
  ],
  [
    'human',
    `Target Role: {targetRole}

Interview Q&A History:
{qaHistory}

Generate a comprehensive session summary as a JSON object:`,
  ],
]);

module.exports = {
  questionGenerationPrompt,
  answerEvaluationPrompt,
  sessionSummaryPrompt,
};
