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
