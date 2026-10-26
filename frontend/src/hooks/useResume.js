import { useState, useCallback, useEffect } from "react";
import { resumeAPI } from "../services/api.js";
import toast from "react-hot-toast";

export function useResume() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await resumeAPI.list();
      const list =
        res.data?.data?.resumes ||
        res.data?.resumes ||
        (Array.isArray(res.data) ? res.data : []);
      setResumes(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
      toast.error("Failed to load resumes");
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadResume = useCallback(async (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    const toastId = toast.loading("Uploading resume...");
    try {
      const res = await resumeAPI.upload(formData);
      const newResume =
        res.data?.data?.resume ||
        res.data?.resume ||
        res.data;
      setResumes((prev) => [newResume, ...(Array.isArray(prev) ? prev : [])]);
      toast.success("Resume uploaded successfully!", { id: toastId });
      return { success: true, resume: newResume };
    } catch (err) {
      const message = err.response?.data?.message || "Upload failed";
      toast.error(message, { id: toastId });
      return { success: false, message };
    }
  }, []);

  const deleteResume = useCallback(async (id) => {
    try {
      await resumeAPI.delete(id);
      setResumes((prev) =>
        (Array.isArray(prev) ? prev : []).filter((r) => r._id !== id && r.id !== id)
      );
      toast.success("Resume deleted");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Delete failed";
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  return {
    resumes: Array.isArray(resumes) ? resumes : [],
    loading,
    uploadResume,
    deleteResume,
    fetchResumes,
  };
}
