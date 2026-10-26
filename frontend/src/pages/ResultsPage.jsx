import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Trophy, TrendingUp, TrendingDown, Lightbulb, BarChart2,
  ChevronLeft, RefreshCw, Printer, CheckCircle, AlertTriangle
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import api from "../services/api.js";

function ScoreBar({ score, index }) {
  const color =
    score >= 8
      ? "from-green-500 to-emerald-500"
      : score >= 5
      ? "from-yellow-500 to-amber-500"
      : "from-red-500 to-rose-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-white/60">
        <span>Q{index + 1}</span>
        <span>{score}/10</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-2 bg-gradient-to-r ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${(score / 10) * 100}%` }}
          transition={{ duration: 0.8, delay: index * 0.08 }}
        />
      </div>
    </div>
  );
}

function BigScore({ score }) {
  const numScore = Math.round(Number(score) || 0);
  const color = numScore >= 80 ? "#10b981" : numScore >= 50 ? "#f59e0b" : "#ef4444";
  const label =
    numScore >= 80 ? "Excellent" : numScore >= 60 ? "Good" : numScore >= 40 ? "Fair" : "Needs Work";
  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <motion.circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 70}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - numScore / 100) }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          transform="rotate(-90 80 80)"
        />
        <text x="80" y="74" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold">
          {numScore}
        </text>
        <text x="80" y="96" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="13">
          out of 100
        </text>
      </svg>
      <span className="text-lg font-semibold mt-2" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function ResultsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      const res = await api.get(`/session/${sessionId}`);
      const sessionData =
        res.data?.data?.session ||
        res.data?.session ||
        res.data?.data ||
        res.data;
      setSession(sessionData);
    } catch {
      toast.error("Failed to load results.");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/60">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const answers = Array.isArray(session.answers) ? session.answers : [];
  const overallScore = session.overallScore || 0;
  const summary = session.summary || {};

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} className="text-white/60" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Interview Results</h1>
            <p className="text-white/50 text-sm">
              Session completed • {answers.length} questions answered
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => window.print()}
              className="btn-secondary flex items-center gap-2 text-sm py-2"
            >
              <Printer size={15} /> Print
            </button>
            <Link to="/dashboard" className="btn-primary flex items-center gap-2 text-sm py-2">
              <RefreshCw size={15} /> New Interview
            </Link>
          </div>
        </div>

        <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
          {/* Score + Summary row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={item} className="card flex flex-col items-center justify-center py-8">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={20} className="text-yellow-400" />
                <span className="font-semibold text-white">Overall Score</span>
              </div>
              <BigScore score={overallScore} />
            </motion.div>

            <motion.div variants={item} className="card md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart2 size={18} className="text-brand-400" />
                <h3 className="font-semibold text-white">Performance Per Question</h3>
              </div>
              <div className="space-y-3">
                {answers.map((a, i) => (
                  <ScoreBar key={i} score={a.evaluation?.score ?? 0} index={i} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={item} className="card bg-green-500/5 border-green-500/20">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-green-400" />
                <h3 className="font-semibold text-green-400">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {(summary.strengths || ["Good participation"]).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={item} className="card bg-yellow-500/5 border-yellow-500/20">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown size={18} className="text-yellow-400" />
                <h3 className="font-semibold text-yellow-400">Areas to Improve</h3>
              </div>
              <ul className="space-y-2">
                {(summary.areasToImprove || ["Keep practicing"]).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <AlertTriangle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={item} className="card bg-brand-500/5 border-brand-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={18} className="text-brand-400" />
                <h3 className="font-semibold text-brand-400">Recommendations</h3>
              </div>
              <ul className="space-y-2">
                {(summary.recommendations || ["Practice more"]).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <span className="text-brand-400 mt-0.5 flex-shrink-0">→</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Q&A Review */}
          <motion.div variants={item} className="card">
            <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
              Detailed Review
            </h3>
            <div className="space-y-5">
              {answers.map((a, i) => {
                const score = a.evaluation?.score ?? 0;
                const scoreColor =
                  score >= 8 ? "text-green-400" : score >= 5 ? "text-yellow-400" : "text-red-400";
                return (
                  <div key={i} className="p-4 rounded-xl bg-white/3 border border-white/8 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-white font-medium text-sm flex-1">
                        <span className="text-white/40 text-xs mr-2">Q{i + 1}</span>
                        {a.question}
                      </p>
                      <span className={`text-lg font-bold flex-shrink-0 ${scoreColor}`}>
                        {score}/10
                      </span>
                    </div>
                    <p className="text-white/50 text-xs italic">{a.evaluation?.feedback}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
