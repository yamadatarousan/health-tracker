'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DayBar from '@/app/components/DayBar';
import PdfExport from '@/app/components/PdfExport';

const getMonthDays = (year: number, month: number): string[] => {
  const days: string[] = [];
  const endDay = new Date(year, month + 1, 0).getDate(); // 月の最終日

  for (let day = 1; day <= endDay; day++) {
    const date = new Date(Date.UTC(year, month, day));
    days.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
  }
  return days;
};

const formatMonth = (year: number, month: number): string => {
  return `${year}年${month + 1}月`;
};

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4)); // 2025年5月（0-based）
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const dates = getMonthDays(year, month);
  const userId = 1; // 仮のユーザーID（認証後に動的に設定）

  // デバッグ: 生成された日付をログ出力
  useEffect(() => {
    console.log(`Displaying month: ${formatMonth(year, month)}`);
    console.log('Dates:', dates);
  }, [year, month, dates]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex items-center justify-between mb-8">
        <motion.button
          className="text-lg font-semibold text-blue-600 hover:text-blue-800"
          onClick={handlePrevMonth}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ◄ 前月
        </motion.button>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-blue-600 text-center"
        >
          {formatMonth(year, month)}
        </motion.h1>
        <motion.button
          className="text-lg font-semibold text-blue-600 hover:text-blue-800"
          onClick={handleNextMonth}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          次月 ►
        </motion.button>
      </div>

      {/* PDFエクスポートボタン */}
      <div className="flex justify-end mb-4">
        <PdfExport userId={userId} year={year} month={month} />
      </div>

      <motion.div
        className="flex space-x-4 overflow-x-auto pb-4 snap-x snap-mandatory"
        drag="x"
        dragConstraints={{ left: -dates.length * 272, right: 0 }} // w-64 + space-x-4
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