import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Upload, BarChart2, ClipboardList, CheckSquare,
  FileText, Trophy, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import StatCard from "../components/StatCard.jsx";
import InterviewCard from "../components/InterviewCard.jsx";
import ResumeCard from "../components/ResumeCard.jsx";
import Modal from "../components/Modal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useResume } from "../hooks/useResume.js";
import api from "../services/api.js";

const LEVELS = ["Junior", "Mid", "Senior", "Lead"];

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { resumes, loading: resumeLoading, uploadResume, deleteResume } = useResume();
  const fileInputRef = useRef(null);

  const [interviews, setInterviews] = useState([]);
  const [interviewsLoading, setInterviewsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgScore: "—", completed: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newInterview, setNewInterview] = useState({
    resumeId: "",
    targetRole: "",
    experienceLevel: "Mid",
  });

  const resumeList = Array.isArray(resumes) ? resumes : [];
  const interviewList = Array.isArray(interviews) ? interviews : [];

  const fetchInterviews = useCallback(async () => {
    setInterviewsLoading(true);
    try {
      const res = await api.get("/interview");
      const data =
        res.data?.data?.interviews ||
        res.data?.interviews ||
        (Array.isArray(res.data?.data) ? res.data.data : []) ||
        (Array.isArray(res.data) ? res.data : []);
      const validInterviews = Array.isArray(data) ? data : [];
      setInterviews(validInterviews);
      const completed = validInterviews.filter((i) => i.status === "completed");
      const avgScore =
        completed.length > 0
          ? (
              completed.reduce((s, i) => s + (i.averageScore || 0), 0) /
              completed.length
            ).toFixed(1)
          : "—";
      setStats({ total: validInterviews.length, avgScore, completed: completed.length });
    } catch {
      setInterviews([]);
    } finally {
      setInterviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleCreateInterview = async () => {
    if (!newInterview.resumeId) return toast.error("Please select a resume");
    if (!newInterview.targetRole.trim()) return toast.error("Please enter a target role");
    setCreating(true);
    try {
      const res = await api.post("/interview/create", {
        resumeId: newInterview.resumeId,
        targetRole: newInterview.targetRole.trim(),
        experienceLevel: newInterview.experienceLevel,
      });
      const interview =
        res.data?.data?.interview ||
        res.data?.interview ||
        res.data?.data ||
        res.data;
      toast.success("Interview created — generating questions...");
      setModalOpen(false);
      setNewInterview({ resumeId: "", targetRole: "", experienceLevel: "Mid" });
      const interviewId = interview?._id || interview?.id;
      if (interviewId) {
        navigate(`/interview/${interviewId}`);
      } else {
        fetchInterviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create interview");
    } finally {
      setCreating(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return toast.error("Only PDF and Word files are supported");
    }
    await uploadResume(file);
    e.target.value = "";
  };

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white"
            >
              Welcome back, <span className="gradient-text">{firstName}!</span>
            </motion.h1>
            <p className="text-white/50 mt-1">Ready to practice for your next interview?</p>
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setModalOpen(true)}
            className="btn-primary flex items-center gap-2 self-start"
          >
            <Plus size={18} /> Start New Interview
          </motion.button>
        </div>

        {/* Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: ClipboardList, label: "Total Interviews", value: stats.total, color: "brand" },
            { icon: BarChart2, label: "Average Score", value: stats.avgScore !== "—" ? `${stats.avgScore}/10` : "—", color: "purple" },
            { icon: CheckSquare, label: "Completed", value: stats.completed, color: "green" },
            { icon: FileText, label: "Resumes", value: resumeList.length, color: "cyan" },
          ].map((s, i) => (
            <motion.div key={s.label} variants={fadeUp}>
              <StatCard {...s} delay={i * 0.05} />
            </motion.div>
          ))}
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interviews List — 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Interviews</h2>
              {interviewList.length > 0 && (
                <span className="text-xs text-white/40">{interviewList.length} total</span>
              )}
            </div>

            {interviewsLoading ? (
              <div className="card flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-brand-400" size={28} />
              </div>
            ) : interviewList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card text-center py-12"
              >
                <Trophy size={40} className="text-white/20 mx-auto mb-3" />
                <p className="text-white/50 font-medium">No interviews yet</p>
                <p className="text-white/30 text-sm mt-1">
                  Upload a resume and start your first interview
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="btn-primary mt-4 text-sm"
                >
                  Start First Interview
                </button>
              </motion.div>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                {interviewList.map((interview, i) => (
                  <motion.div key={interview._id || i} variants={fadeUp}>
                    <InterviewCard interview={interview} delay={i * 0.05} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Resume Manager — 1/3 width */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">My Resumes</h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                <Upload size={13} /> Upload
              </button>
            </div>

            {resumeLoading ? (
              <div className="card flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-brand-400" size={24} />
              </div>
            ) : resumeList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card text-center py-8"
              >
                <FileText size={32} className="text-white/20 mx-auto mb-2" />
                <p className="text-white/50 text-sm font-medium">No resumes yet</p>
                <p className="text-white/30 text-xs mt-1">Upload a PDF to get started</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 mx-auto px-4 py-2 mt-3 text-sm btn-secondary"
                >
                  <Upload size={14} /> Upload Resume
                </button>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {resumeList.map((resume, i) => (
                  <ResumeCard
                    key={resume._id || i}
                    resume={resume}
                    onDelete={deleteResume}
                    delay={i * 0.06}
                  />
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 text-sm text-white/40 hover:text-white/70 border border-dashed border-white/10 hover:border-white/20 rounded-xl transition-all"
                >
                  <Upload size={14} /> Add another resume
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Interview Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Start New Interview"
        maxWidth="max-w-md"
      >
        <div className="space-y-5">
          {resumeList.length === 0 ? (
            <div className="text-center py-6">
              <FileText size={40} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/50 font-medium">No resumes uploaded</p>
              <p className="text-white/30 text-sm mt-1">Upload a resume first to start an interview</p>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setTimeout(() => fileInputRef.current?.click(), 200);
                }}
                className="btn-primary mt-4 text-sm"
              >
                Upload Resume
              </button>
            </div>
          ) : (
            <>
              {/* Resume select */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Select Resume
                </label>
                <select
                  value={newInterview.resumeId}
                  onChange={(e) =>
                    setNewInterview((p) => ({ ...p, resumeId: e.target.value }))
                  }
                  className="input-field"
                >
                  <option value="" className="bg-dark-800">
                    — Choose a resume —
                  </option>
                  {resumeList.map((r) => (
                    <option
                      key={r._id || r.id}
                      value={r._id || r.id}
                      className="bg-dark-800"
                    >
                      {r.originalName || r.filename || "Resume"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Role */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Target Role
                </label>
                <input
                  type="text"
                  value={newInterview.targetRole}
                  onChange={(e) =>
                    setNewInterview((p) => ({ ...p, targetRole: e.target.value }))
                  }
                  placeholder="e.g. Frontend Developer, ML Engineer..."
                  className="input-field"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateInterview()}
                />
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-3">
                  Experience Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        setNewInterview((p) => ({ ...p, experienceLevel: level }))
                      }
                      className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                        newInterview.experienceLevel === level
                          ? "bg-brand-500/20 border-brand-500 text-brand-400"
                          : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateInterview}
                  disabled={creating}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Start Interview"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
