import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export function parseDobToDate(dob) {
  if (!dob) return null;

  if (dob instanceof Date) {
    return isNaN(dob.getTime()) ? null : dob;
  }

  if (typeof dob !== "string") {
    return null;
  }

  let parsedDate = null;

  if (dob.includes("-")) {
    const parts = dob.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      parsedDate = new Date(year, month - 1, day);
    }
  } else if (dob.includes("/")) {
    const parts = dob.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      parsedDate = new Date(year, month - 1, day);
    }
  }

  if (!parsedDate) {
    parsedDate = new Date(dob);
  }

  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function formatDateInputValue(date) {
  const parsedDate = parseDobToDate(date);
  if (!parsedDate) return "";

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateInputValue(value) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  const parsedDate = new Date(year, month - 1, day);

  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function calculateAge(dob) {
  const birthDate = parseDobToDate(dob);
  if (!birthDate) return "";
  if (isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : "";
}

export function isValidEmail(email) {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const regex = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
  return regex.test(normalized);
}

export function checkPasswordStrength(password) {
  if (!password) return { score: 0, label: "Empty", color: "text-gray-400", bgColor: "bg-gray-300" };

  let matchedConditions = 0;

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasMinLength = password.length >= 8;

  if (hasUpper) matchedConditions++;
  if (hasLower) matchedConditions++;
  if (hasDigit) matchedConditions++;
  if (hasSymbol) matchedConditions++;
  if (hasMinLength) matchedConditions++;

  if (matchedConditions <= 2) {
    return { score: 1, label: "Weak", color: "text-red-500", bgColor: "bg-red-500" };
  } else if (matchedConditions <= 4) {
    return { score: 2, label: "Medium", color: "text-yellow-500", bgColor: "bg-yellow-500" };
  } else {
    return { score: 3, label: "Strong", color: "text-green-500", bgColor: "bg-green-500" };
  }
}

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────

export function getUserImage(user, imageBasePath) {
  if (!user || !user.image) return null;
  if (user.image.startsWith("http") || user.image.startsWith("blob:")) {
    return user.image;
  }
  let img = user.image;
  if (img.includes("/")) {
    img = img.substring(img.lastIndexOf("/") + 1);
  }
  if (user.image_path) {
    return `${user.image_path}/${img}`;
  }
  const path = imageBasePath || "https://ne-games.com/leaderBoard/public/admin/clip-one/assets/user/original";
  return `${path}/${img}`;
}

// Basic XSS sanitizer — strips dangerous tags and event handlers
// For production, consider using DOMPurify after installing it:
//   npm install dompurify
export function sanitizeHtml(html) {
  if (!html || typeof html !== "string") return html;
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<script[^>]*\/>/gi, "")
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<iframe[^>]*\/>/gi, "")
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[^>]*>/gi, "")
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\s*on\w+\s*=\s*[^>\s]*/gi, "");
}
