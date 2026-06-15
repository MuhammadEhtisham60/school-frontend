// utils/dateUtils.js
export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format date to DD/MM/YYYY format (e.g., 18/09/2016)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateDDMMYYYY = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Calculate time ago roughly (e.g., "5 minutes ago", "2 hours ago")
 * @param {string|Date} date - Date to calculate from
 * @returns {string} Time ago string
 */
export const calculateTimeAgo = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const seconds = Math.floor((now - d) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);

  return date.toLocaleString("en-US", {
    month: "short", // Mar
    day: "2-digit", // 16
    year: "numeric", // 2026
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24-hour format
  });
};
