'use client';

import { motion } from 'framer-motion';
import DayBar from '@/app/components/DayBar';

export default function Home() {
  const dates = ['2025-05-19', '2025-05-20', '2025-05-21']; // 仮の日付
  const userId = 1; // 仮のユーザーID（認証後に動的に設定）

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-blue-600 text-center mb-8"
      >
        Health Record App
      </motion.h1>
      <motion.div
        className="flex space-x-4 overflow-x-auto pb-4 snap-x snap-mandatory"
        drag="x"
        dragConstraints={{ left: -1000, right: 0 }}
        dragElastic={0.2}
      >
        {dates.map((date) => (
          <div key={date} className="snap-center">
            <DayBar date={date} userId={userId} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}