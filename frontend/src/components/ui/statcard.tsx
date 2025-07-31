import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  progress: number;
  textColor?: string;     // e.g. "text-blue-700"
  gradientFrom?: string;  // e.g. "from-blue-100"
  gradientTo?: string;    // e.g. "to-blue-200"
}

export function StatCard({
  icon,
  label,
  value,
  progress,
  textColor = "text-blue-700",
  gradientFrom = "from-blue-100",
  gradientTo = "to-blue-200"
}: StatCardProps) {
  return (
    <Card
      className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} transition-transform hover:scale-105 shadow-lg`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {icon}
          <span className={`font-semibold ${textColor}`}>{label}</span>
        </div>
        <motion.p
          className={`text-3xl mt-4 font-bold ${textColor}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {value}
        </motion.p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1 }}
        >
          <Progress value={progress} className="mt-2" />
        </motion.div>
      </CardContent>
    </Card>
  );
}
