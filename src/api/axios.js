import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 40000,
  withCredentials: true,
});

let isRefreshingAuthor = false;
let authorQueue = [];

let isRefreshingAdmin = false;
let adminQueue = [];

const processQueue = (queue, error = null) => {
  queue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  queue.length = 0;
};

// Helper to check if request is an initial session verification
const isAuthCheckEndpoint = (url = "") => {
  return url.includes("/me");
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const code = error.response?.data?.code;

    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // --- AUTHOR TOKEN AUTO-REFRESH ---
    if (code === "AUTHOR_TOKEN_EXPIRED") {
      originalRequest._retry = true;

      if (isRefreshingAuthor) {
        return new Promise((resolve, reject) => {
          authorQueue.push({
            resolve: () => resolve(API(originalRequest)),
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshingAuthor = true;

      try {
        await API.post("/author/refresh");
        processQueue(authorQueue, null);
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(authorQueue, refreshError);
        // Only dispatch unauthorized redirect event for active feature requests, NOT initial /me checks
        if (!isAuthCheckEndpoint(originalRequest?.url)) {
          window.dispatchEvent(new CustomEvent("author:unauthorized"));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshingAuthor = false;
      }
    }

    // --- ADMIN TOKEN AUTO-REFRESH ---
    if (code === "ADMIN_TOKEN_EXPIRED") {
      originalRequest._retry = true;

      if (isRefreshingAdmin) {
        return new Promise((resolve, reject) => {
          adminQueue.push({
            resolve: () => resolve(API(originalRequest)),
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshingAdmin = true;

      try {
        await API.post("/admin/refresh");
        processQueue(adminQueue, null);
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(adminQueue, refreshError);
        // Only dispatch unauthorized redirect event for active feature requests, NOT initial /me checks
        if (!isAuthCheckEndpoint(originalRequest?.url)) {
          window.dispatchEvent(new CustomEvent("admin:unauthorized"));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshingAdmin = false;
      }
    }

    return Promise.reject(error);
  },
);

export default API;
