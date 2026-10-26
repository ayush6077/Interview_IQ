import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ChevronRight, Clock, LogOut, CheckCircle2, AlertCircle,
  Brain, Lightbulb, ChevronDown, ChevronUp, Send, Loader2
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import api from "../services/api.js";

const difficultyColor = {
  easy: "text-green-400 bg-green-400/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  hard: "text-red-400 bg-red-400/10",
};
const typeColor = {
  technical: "text-blue-400 bg-blue-400/10",
  behavioral: "text-purple-400 bg-purple-400/10",
  situational: "text-cyan-400 bg-cyan-400/10",
  general: "text-gray-400 bg-gray-400/10",
};

function ScoreBadge({ score }) {
  const color =
    score >= 8
      ? "from-green-500 to-emerald-500"
      : score >= 5
      ? "from-yellow-500 to-amber-500"
      : "from-red-500 to-rose-500";
  return (
    <div
      className={`flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${color} shadow-lg`}
    >
      <span className="text-2xl font-bold text-white">{score}</span>
      <span className="text-xs text-white/70">/10</span>
    </div>
  );
}

export default function InterviewPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timerActive) setTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const loadInterview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/interview/${interviewId}`);
      const interviewData =
        res.data?.data?.interview ||
        res.data?.interview ||
        res.data?.data ||
        res.data;
      setInterview(interviewData);

      const sessionRes = await api.post("/session/create", { interviewId });
      const sessionData =
        sessionRes.data?.data?.session ||
        sessionRes.data?.session ||
        sessionRes.data?.data ||
        sessionRes.data;
      setSession(sessionData);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load interview.");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [interviewId, navigate]);

  useEffect(() => {
    loadInterview();
  }, [loadInterview]);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast.error("Please write an answer before submitting.");
      return;
    }
    const sessionId = session?._id || session?.id;
    if (!sessionId) {
      toast.error("Session not initialized. Please try reloading.");
      return;
    }

    setSubmitting(true);
    setTimerActive(false);
    try {
      const q = interview.questions[currentIdx];
      const res = await api.post(`/session/${sessionId}/answer`, {
        questionIndex: currentIdx,
        question: q.question,
        userAnswer: answer,
        interviewId,
      });
      const evalData =
        res.data?.data?.evaluation ||
        res.data?.evaluation ||
        res.data?.data ||
        res.data;
      setEvaluation(evalData);
      toast.success("Answer evaluated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Evaluation failed.");
      setTimerActive(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setAnswer("");
    setEvaluation(null);
    setShowModelAnswer(false);
    setTimerActive(true);
    setTimer(0);
    setCurrentIdx((i) => i + 1);
  };

  const handleComplete = async () => {
    const sessionId = session?._id || session?.id;
    if (!sessionId) {
      navigate("/dashboard");
      return;
    }

    setCompleting(true);
    try {
      await api.put(`/session/${sessionId}/complete`);
      toast.success("Interview completed! Viewing your results...");
      navigate(`/results/${sessionId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete session.");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/60">Generating your personalized questions...</p>
        </div>
      </div>
    );
  }

  if (!interview) return null;
  const questions = Array.isArray(interview.questions) ? interview.questions : [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIdx] || {};
  const progress = totalQuestions > 0 ? (currentIdx / totalQuestions) * 100 : 0;
  const isLastQuestion = currentIdx === totalQuestions - 1;

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      {/* Header */}
      <div className="sticky top-16 z-40 glass-dark border-b border-white/5 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-white/60">
                Question {currentIdx + 1} of {totalQuestions}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-sm font-medium text-brand-400">
                {interview.targetRole || "Technical Role"}
              </span>
              <span className="text-white/40">•</span>
              <span className="capitalize text-sm text-white/60">
                {interview.experienceLevel || "Mid"}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                className="h-2 bg-gradient-to-r from-brand-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-lg">
              <Clock size={14} className="text-white/50" />
              <span className="text-sm font-mono text-white/70">{formatTime(timer)}</span>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Exit interview? Progress will be lost."))
                  navigate("/dashboard");
              }}
              className="p-2 glass rounded-lg hover:bg-red-500/20 hover:border-red-500/30 transition-colors"
            >
              <LogOut size={16} className="text-white/60" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {/* Question Card */}
            <div className="card mb-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Brain size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        typeColor[currentQuestion?.type] || typeColor.technical
                      }`}
                    >
                      {currentQuestion?.type || "technical"}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        difficultyColor[currentQuestion?.difficulty] || difficultyColor.medium
                      }`}
                    >
                      {currentQuestion?.difficulty || "medium"}
                    </span>
                  </div>
                  <p className="text-lg font-medium text-white leading-relaxed">
                    {currentQuestion?.question || "Loading question..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Answer Area */}
            {!evaluation && (
              <div className="card space-y-4">
                <label className="block text-sm font-medium text-white/70">Your Answer</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={submitting}
                  rows={8}
                  placeholder="Type your answer here. Be specific and use examples from your experience..."
                  className="input-field resize-none font-sans leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/30">{answer.length} characters</span>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !answer.trim()}
                    className="btn-primary flex items-center gap-2"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {submitting ? "Evaluating..." : "Submit Answer"}
                  </button>
                </div>
              </div>
            )}

            {/* Evaluation Panel */}
            <AnimatePresence>
              {evaluation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Score */}
                  <div className="card">
                    <div className="flex items-center gap-6">
                      <ScoreBadge score={evaluation.score ?? 5} />
                      <div>
                        <p className="text-sm text-white/50 mb-1">AI Evaluation Score</p>
                        <p className="text-white font-medium leading-relaxed">
                          {evaluation.feedback || "Answer evaluated."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card bg-green-500/5 border-green-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 size={18} className="text-green-400" />
                        <span className="font-semibold text-green-400">Strengths</span>
                      </div>
                      <ul className="space-y-2">
                        {(evaluation.strengths || []).map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                            <span className="text-green-400 mt-0.5">✓</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="card bg-yellow-500/5 border-yellow-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle size={18} className="text-yellow-400" />
                        <span className="font-semibold text-yellow-400">Areas to Improve</span>
                      </div>
                      <ul className="space-y-2">
                        {(evaluation.improvements || []).map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                            <span className="text-yellow-400 mt-0.5">→</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Model Answer */}
                  <div className="card">
                    <button
                      onClick={() => setShowModelAnswer(!showModelAnswer)}
                      className="flex items-center gap-2 w-full text-left"
                    >
                      <Lightbulb size={18} className="text-brand-400" />
                      <span className="font-semibold text-brand-400 flex-1">Model Answer</span>
                      {showModelAnswer ? (
                        <ChevronUp size={16} className="text-white/40" />
                      ) : (
                        <ChevronDown size={16} className="text-white/40" />
                      )}
                    </button>
                    <AnimatePresence>
                      {showModelAnswer && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 pt-3 border-t border-white/10 overflow-hidden"
                        >
                          <p className="text-sm text-white/70 leading-relaxed">
                            {evaluation.modelAnswer || "No model answer available."}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-end gap-3">
                    {!isLastQuestion ? (
                      <button onClick={handleNext} className="btn-primary flex items-center gap-2">
                        Next Question <ChevronRight size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={handleComplete}
                        disabled={completing}
                        className="btn-primary flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500"
                      >
                        {completing ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        {completing ? "Generating Report..." : "Complete Interview"}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
