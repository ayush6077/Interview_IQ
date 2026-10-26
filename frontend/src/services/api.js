import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API — /api/auth
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// Resume API — /api/resume
export const resumeAPI = {
  list: () => api.get("/resume"),
  upload: (formData) =>
    api.post("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/resume/${id}`),
  get: (id) => api.get(`/resume/${id}`),
};

// Interview API — /api/interview
export const interviewAPI = {
  create: (data) => api.post("/interview/create", data),
  list: () => api.get("/interview"),
  get: (id) => api.get(`/interview/${id}`),
};

// Session API — /api/session
export const sessionAPI = {
  create: (interviewId) => api.post("/session/create", { interviewId }),
  get: (id) => api.get(`/session/${id}`),
  list: () => api.get("/session"),
  submitAnswer: (id, data) => api.post(`/session/${id}/answer`, data),
  complete: (id) => api.put(`/session/${id}/complete`),
};
