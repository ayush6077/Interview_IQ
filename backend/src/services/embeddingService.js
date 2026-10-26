const Resume = require('../models/Resume');
const { chunkText, createVectorStore, storeVectorStore, getVectorStore } = require('../utils/vectorStore');

/**
 * Process a resume: chunk text, create embeddings/index, store vector store.
 */
const processResume = async (resumeId, text) => {
  const chunks = chunkText(text, 1000, 200);

  if (chunks.length === 0) {
    throw new Error('No text content found in the resume');
  }

  const metadata = chunks.map((_, i) => ({
    resumeId: String(resumeId),
    chunkIndex: i,
    source: 'resume',
  }));

  // Create vector store (OpenAI or Local Semantic Index)
  const vectorStore = await createVectorStore(chunks, metadata);

  // Store in memory map
  storeVectorStore(String(resumeId), vectorStore);

  // Update resume in DB with chunks and marked as processed
  await Resume.findByIdAndUpdate(resumeId, {
    chunks,
    isProcessed: true,
    vectorStoreId: String(resumeId),
  });

  console.log(`[RAG] Resume ${resumeId} processed: ${chunks.length} chunks indexed in vector store.`);
  return { chunks, vectorStoreId: String(resumeId) };
};

/**
 * Retrieve the vector store for a resume. If not in memory, rebuild from DB chunks.
 */
const getResumeVectorStore = async (resumeId) => {
  let vectorStore = getVectorStore(String(resumeId));
  if (vectorStore) return vectorStore;

  const resume = await Resume.findById(resumeId);
  if (!resume || !resume.parsedText) return null;

  const textChunks =
    Array.isArray(resume.chunks) && resume.chunks.length > 0
      ? resume.chunks
      : chunkText(resume.parsedText, 1000, 200);

  const metadata = textChunks.map((_, i) => ({
    resumeId: String(resumeId),
    chunkIndex: i,
    source: 'resume',
  }));

  vectorStore = await createVectorStore(textChunks, metadata);
  storeVectorStore(String(resumeId), vectorStore);

  if (!resume.chunks || resume.chunks.length === 0) {
    await Resume.findByIdAndUpdate(resumeId, { chunks: textChunks, isProcessed: true });
  }

  return vectorStore;
};

module.exports = { processResume, getResumeVectorStore };
