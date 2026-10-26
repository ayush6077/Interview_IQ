import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { User, Mail, Briefcase, Clock, Save, LogOut, Award, BarChart2 } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({ name: "", bio: "", targetRole: "", experience: "" });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ totalInterviews: 0, avgScore: 0, memberSince: "" });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.profile?.bio || "",
        targetRole: user.profile?.targetRole || "",
        experience: user.profile?.experience || "",
      });
    }
    // Load full profile
    api.get("/auth/profile").then((res) => {
      const u = res.data.data || res.data;
      setForm({
        name: u.name || "",
        bio: u.profile?.bio || "",
        targetRole: u.profile?.targetRole || "",
        experience: u.profile?.experience || "",
      });
      setStats({
        memberSince: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—",
      });
    }).catch(() => {});

    // Load session stats
    api.get("/session").then((res) => {
      const sessions = res.data.data || [];
      const completed = sessions.filter((s) => s.completedAt);
      const avg = completed.length > 0
        ? Math.round(completed.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completed.length)
        : 0;
      setStats((prev) => ({ ...prev, totalInterviews: sessions.length, avgScore: avg }));
    }).catch(() => {});
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      name: form.name,
      profile: { bio: form.bio, targetRole: form.targetRole, experience: form.experience },
    });
    setSaving(false);
  };

  const initials = (form.name || user?.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const avatarColors = ["from-brand-600 to-purple-600", "from-cyan-600 to-blue-600", "from-emerald-600 to-teal-600"];
  const avatarColor = avatarColors[(initials.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Avatar & Name */}
          <div className="card flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center flex-shrink-0`}>
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{form.name || "Your Name"}</h1>
              <p className="text-white/50">{user?.email}</p>
              {form.targetRole && <p className="text-brand-400 text-sm mt-1">{form.targetRole}</p>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Award, label: "Avg Score", value: stats.avgScore ? `${stats.avgScore}%` : "—", color: "text-yellow-400" },
              { icon: BarChart2, label: "Sessions", value: stats.totalInterviews, color: "text-brand-400" },
              { icon: Clock, label: "Member Since", value: stats.memberSince || "—", color: "text-purple-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="card text-center">
                <Icon size={20} className={`${color} mx-auto mb-2`} />
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/50">{label}</p>
              </div>
            ))}
          </div>

          {/* Edit Form */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-5">Edit Profile</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3.5 text-white/30" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field pl-9"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3.5 text-white/30" />
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="input-field pl-9 opacity-40 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Target Role</label>
                  <div className="relative">
                    <Briefcase size={16} className="absolute left-3 top-3.5 text-white/30" />
                    <input
                      type="text"
                      value={form.targetRole}
                      onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                      className="input-field pl-9"
                      placeholder="e.g. Full Stack Developer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Years of Experience</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-3.5 text-white/30" />
                    <input
                      type="text"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                      className="input-field pl-9"
                      placeholder="e.g. 3"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="card border-red-500/20 bg-red-500/5">
            <h3 className="font-semibold text-red-400 mb-3">Account Actions</h3>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
