const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { Document } = require("langchain/document");

// In-memory store: resumeId (string) -> VectorStore instance
const vectorStoreMap = new Map();

/**
 * Split text into overlapping chunks.
 */
const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  if (!text || text.trim().length === 0) return [];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start += chunkSize - overlap;
  }

  return chunks;
};

/**
 * Local Semantic Vector Store based on tokenization, TF-IDF weights, and cosine similarity.
 * Runs completely locally with 0 API cost and works when OpenAI API quota is exhausted.
 */
class LocalSemanticVectorStore {
  constructor(docs) {
    this.docs = docs;
    this.vocab = new Map();
    this.docVectors = [];
    this.buildIndex();
  }

  tokenize(text) {
    return (text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s+#.]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1);
  }

  buildIndex() {
    let vocabIndex = 0;
    const docTokensList = this.docs.map((doc) => {
      const tokens = this.tokenize(doc.pageContent);
      for (const t of tokens) {
        if (!this.vocab.has(t)) {
          this.vocab.set(t, vocabIndex++);
        }
      }
      return tokens;
    });

    const numDocs = this.docs.length || 1;
    // Calculate IDF
    this.idf = new Float32Array(this.vocab.size);
    for (const [term, idx] of this.vocab.entries()) {
      let count = 0;
      for (const tokens of docTokensList) {
        if (tokens.includes(term)) count++;
      }
      this.idf[idx] = Math.log((numDocs + 1) / (count + 1)) + 1;
    }

    // Vectorize each document
    this.docVectors = docTokensList.map((tokens) => this.vectorize(tokens));
  }

  vectorize(tokens) {
    const vec = new Float32Array(this.vocab.size);
    for (const t of tokens) {
      const idx = this.vocab.get(t);
      if (idx !== undefined) vec[idx] += 1;
    }
    // Multiply by IDF and normalize
    let norm = 0;
    for (let i = 0; i < vec.length; i++) {
      vec[i] *= this.idf[i];
      norm += vec[i] * vec[i];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < vec.length; i++) vec[i] /= norm;
    }
    return vec;
  }

  similaritySearch(query, k = 5) {
    const queryTokens = this.tokenize(query);
    const queryVec = this.vectorize(queryTokens);

    const scored = this.docs.map((doc, idx) => {
      const docVec = this.docVectors[idx];
      let dot = 0;
      for (let i = 0; i < queryVec.length; i++) {
        dot += queryVec[i] * docVec[i];
      }
      return { doc, score: dot };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k).map((s) => s.doc);
  }
}

/**
 * Create vector store with LangChain OpenAI Embeddings, with fallback to LocalSemanticVectorStore if quota 429 occurs.
 */
const createVectorStore = async (texts, metadata = []) => {
  const docs = texts.map(
    (text, i) =>
      new Document({
        pageContent: text,
        metadata: metadata[i] || { chunkIndex: i },
      })
  );

  // If OpenAI key is present, attempt remote embeddings with strict timeout
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith("sk-")) {
    try {
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "text-embedding-3-small",
        maxRetries: 0,
        timeout: 6000,
      });
      const vs = await MemoryVectorStore.fromDocuments(docs, embeddings);
      console.log("[RAG] OpenAI text-embedding-3-small vector store initialized.");
      return vs;
    } catch (err) {
      console.warn(
        `[RAG] OpenAI Embeddings API unavailable (${err.message}). Using high-performance Local Semantic Vector Store.`
      );
    }
  }

  // Fallback to local semantic vector store
  return new LocalSemanticVectorStore(docs);
};

const similaritySearch = async (vectorStore, query, k = 5) => {
  return vectorStore.similaritySearch(query, k);
};

const storeVectorStore = (resumeId, vectorStore) => {
  vectorStoreMap.set(String(resumeId), vectorStore);
};

const getVectorStore = (resumeId) => {
  return vectorStoreMap.get(String(resumeId)) || null;
};

module.exports = {
  chunkText,
  createVectorStore,
  similaritySearch,
  storeVectorStore,
  getVectorStore,
  LocalSemanticVectorStore,
  vectorStoreMap,
};
