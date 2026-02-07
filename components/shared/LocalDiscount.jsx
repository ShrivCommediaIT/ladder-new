// app/components/LocalDiscounts.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LocalDiscount() {
  const [isOpen, setIsOpen] = useState(false);

  const discounts = [
    { text: "10% off at Dinos Pizzaria", phone: "07456 320344" },
    { text: "15% off at Jodhpur’s Indian Restaurant", phone: "07456 320344" },
    { text: "5% off at Sports Scene, Kirkstall", phone: "07456 320344" },
    { text: "10% with Danny’s Window Cleaner", phone: "07456 320344" },
  ];

  return (
    <div className="w-full mx-4 bg-gradient-to-br from-green-200 via-green-200 to-green-200">
      <div className="flex items-center justify-between px-4 border-b">
        <h2 className="text-md font-semibold text-blue-600">
            LOCAL DISCOUNTS

        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1"
        >
          <span className="text-lg w-36 text-black cursor-pointer ">
            {isOpen ? "see less" : "see more"}
          </span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CardContent className="space-y-3 py-4">
              {discounts.map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-gray-50 border hover:bg-gray-100 transition"
                >
                  <p className="text-md font-medium">{item.text}</p>
                  <p className="text-md text-gray-500">({item.phone})</p>
                </div>
              ))}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
