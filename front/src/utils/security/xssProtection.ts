// XSS Protection Utilities

// Sanitize HTML content to prevent XSS attacks
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
};

// Escape HTML special characters
export const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'\/]/g, (char) => map[char]);
};

// Sanitize user input for display
export const sanitizeInput = (input: string): string => {
  if (typeof input !== "string") return "";

  // Remove potentially dangerous characters and scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/javascript:/gi, "") // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .replace(/<iframe\b[^>]*>/gi, "") // Remove iframe tags
    .replace(/<object\b[^>]*>/gi, "") // Remove object tags
    .replace(/<embed\b[^>]*>/gi, "") // Remove embed tags
    .replace(/<link\b[^>]*>/gi, "") // Remove link tags
    .replace(/<meta\b[^>]*>/gi, ""); // Remove meta tags
};

// Validate and sanitize URLs
export const sanitizeUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);

    // Only allow http and https protocols
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return "";
    }

    return parsedUrl.toString();
  } catch {
    return "";
  }
};

// Content Security Policy helper
export const getCSPDirectives = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Adjust based on your needs
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
};

// Validate file uploads
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];

  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "File type not allowed" };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "File size too large" };
  }

  return { valid: true };
};

// Secure localStorage wrapper with XSS protection
export const secureLocalStorage = {
  setItem: (key: string, value: string): void => {
    // Sanitize key and value
    const sanitizedKey = sanitizeInput(key);
    const sanitizedValue = sanitizeInput(value);

    if (sanitizedKey && sanitizedValue) {
      localStorage.setItem(sanitizedKey, sanitizedValue);
    }
  },

  getItem: (key: string): string | null => {
    const sanitizedKey = sanitizeInput(key);
    if (!sanitizedKey) return null;

    const value = localStorage.getItem(sanitizedKey);
    return value ? sanitizeInput(value) : null;
  },

  removeItem: (key: string): void => {
    const sanitizedKey = sanitizeInput(key);
    if (sanitizedKey) {
      localStorage.removeItem(sanitizedKey);
    }
  },
};
