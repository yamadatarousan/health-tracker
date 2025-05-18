'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Record {
  id: number;
  hour: number;
  event: string;
  feeling: string;
}

export default function DayBar({ date, userId }: { date: string; userId: number }) {
  const [records, setRecords] = useState<Record[]>([]);
  const [event, setEvent] = useState('');
  const [feeling, setFeeling] = useState('');
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // データ取得
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/records?date=${date}&userId=${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch records');
        }
        const data = await response.json();
        setRecords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, [date, userId]);

  // データ保存
  const handleSubmit = async (hour: number) => {
    if (!event || !feeling) {
      setError('出来事と感情を入力してください');
      return;
    }

    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, date, hour, event, feeling }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'レコードの保存に失敗しました');
      }

      const newRecord = await response.json();
      setRecords((prev) => [...prev, newRecord]);
      setEvent('');
      setFeeling('');
      setSelectedHour(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  // 感情に応じたスタイル
  const getFeelingStyle = (feeling: string) => {
    switch (feeling.toLowerCase()) {
      case '元気':
      case '嬉しい':
        return 'bg-green-100 text-green-700';
      case '疲れた':
      case '悲しい':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) return <div className="p-4 text-gray-500">読み込み中...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <motion.div
      className="w-64 bg-white rounded-lg shadow-md p-4 flex-shrink-0"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-lg font-semibold text-center text-gray-800 mb-4">{date}</h2>
      <div className="space-y-2">
        {Array.from({ length: 24 }).map((_, hour) => {
          const record = records.find((r) => r.hour === hour);
          return (
            <motion.div
              key={hour}
              className="border-b border-gray-200 py-2"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <span className="text-sm font-medium text-gray-600">{hour}:00</span>
              {record ? (
                <div className={`p-2 rounded-md ${getFeelingStyle(record.feeling)}`}>
                  <p className="text-sm">出来事: {record.event}</p>
                  <p className="text-sm">感情: {record.feeling}</p>
                </div>
              ) : (
                <div className="mt-1">
                  <input
                    className="w-full text-sm p-1 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                    placeholder="出来事"
                    value={selectedHour === hour ? event : ''}
                    onChange={(e) => {
                      setSelectedHour(hour);
                      setEvent(e.target.value);
                    }}
                  />
                  <input
                    className="w-full text-sm p-1 mt-1 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                    placeholder="感情"
                    value={selectedHour === hour ? feeling : ''}
                    onChange={(e) => {
                      setSelectedHour(hour);
                      setFeeling(e.target.value);
                    }}
                  />
                  <button
                    className="w-full text-xs bg-blue-500 text-white p-1 mt-1 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    onClick={() => handleSubmit(hour)}
                    disabled={!event || !feeling || selectedHour !== hour}
                  >
                    保存
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}