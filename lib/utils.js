import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export function calculateAge(dob) {
  if (!dob) return "";
  let birthDate;
  if (dob instanceof Date) {
    birthDate = dob;
  } else if (typeof dob === "string") {
    if (dob.includes("-")) {
      // Handle YYYY-MM-DD
      const parts = dob.split("-");
      if (parts.length === 3) {
        birthDate = new Date(parts[0], parts[1] - 1, parts[2]);
      }
    } else if (dob.includes("/")) {
      // Handle DD/MM/YYYY
      const parts = dob.split("/");
      if (parts.length === 3) {
        birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
      }
    }
    
    if (!birthDate) {
      birthDate = new Date(dob); // Fallback to standard parsing
    }
  } else {
    return "";
  }

  if (isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : "";
}
