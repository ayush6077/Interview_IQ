const Resume = require('../models/Resume');
const { getResumeVectorStore } = require('./embeddingService');
const { similaritySearch } = require('../utils/vectorStore');

/**
 * Search the vector store for relevant resume chunks.
 */
const getRelevantContext = async (resumeId, query, k = 5) => {
  try {
    const vectorStore = await getResumeVectorStore(resumeId);
    if (!vectorStore) {
      const resume = await Resume.findById(resumeId);
      return resume?.parsedText ? resume.parsedText.slice(0, 3000) : '';
    }

    const docs = await similaritySearch(vectorStore, query, k);
    return docs.map((doc) => doc.pageContent).join('\n\n');
  } catch (err) {
    console.warn(`[RAG] getRelevantContext fallback (${err.message})`);
    const resume = await Resume.findById(resumeId).catch(() => null);
    return resume?.parsedText ? resume.parsedText.slice(0, 3000) : '';
  }
};

/**
 * Build context for an interview by querying multiple relevant topics from the resume.
 */
const buildInterviewContext = async (resumeId, targetRole, experienceLevel) => {
  try {
    const vectorStore = await getResumeVectorStore(resumeId);
    if (!vectorStore) {
      const resume = await Resume.findById(resumeId);
      return resume?.parsedText ? resume.parsedText.slice(0, 4000) : '';
    }

    const queries = [
      `${targetRole} skills and experience`,
      `technical skills programming languages frameworks`,
      `projects achievements accomplishments`,
      `education qualifications certifications`,
      `work experience responsibilities`,
    ];

    const contextParts = await Promise.all(
      queries.map(async (query) => {
        try {
          const docs = await similaritySearch(vectorStore, query, 3);
          return docs.map((doc) => doc.pageContent).join('\n');
        } catch {
          return '';
        }
      })
    );

    const uniqueParts = [...new Set(contextParts.flat().filter(Boolean))];
    const joined = uniqueParts.join('\n\n').slice(0, 6000);
    if (joined && joined.trim().length > 100) return joined;

    // Fallback to parsed text
    const resume = await Resume.findById(resumeId);
    return resume?.parsedText ? resume.parsedText.slice(0, 4000) : '';
  } catch (err) {
    console.warn(`[RAG] buildInterviewContext fallback (${err.message})`);
    const resume = await Resume.findById(resumeId).catch(() => null);
    return resume?.parsedText ? resume.parsedText.slice(0, 4000) : '';
  }
};

module.exports = { getRelevantContext, buildInterviewContext };
