"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@/constants/countries";

export default function CountrySelect({ value, onValueChange, className = "", placeholder = "Select Country", style }) {
  const selectedValue = (() => {
    const normalizedValue = String(value || "").trim().toLowerCase();
    if (!normalizedValue) return "";

    const matchedCountry = COUNTRIES.find(
      (country) =>
        country.name.toLowerCase() === normalizedValue ||
        country.code.toLowerCase() === normalizedValue,
    );

    return matchedCountry?.name || value;
  })();

  return (
    <Select key={selectedValue} value={selectedValue} onValueChange={onValueChange}>
      <SelectTrigger className={className} style={style}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] overflow-y-auto bg-popover border-border text-foreground">
        {COUNTRIES.map((country) => (
          <SelectItem key={country.code} value={country.name} className="cursor-pointer text-foreground">
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
