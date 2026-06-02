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
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className} style={style}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] overflow-y-auto bg-slate-800 border-white/20 text-white">
        {COUNTRIES.map((country) => (
          <SelectItem key={country.code} value={country.name} className="focus:bg-violet-600 focus:text-white cursor-pointer">
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
