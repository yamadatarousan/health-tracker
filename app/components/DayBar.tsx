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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // データ取得
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setIsLoading(true);
        setRecords([]); // 状態リセット
        const response = await fetch(`/api/records?date=${date}&userId=${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch records');
        }
        const data = await response.json();
        console.log(`Records for ${date}:`, data); // デバッグ
        setRecords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, [date, userId]);

  // データ保存（新規）
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

  // データ編集
  const handleEdit = async (id: number) => {
    if (!event || !feeling) {
      setError('出来事と感情を入力してください');
      return;
    }

    try {
      const response = await fetch('/api/records', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, event, feeling }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'レコードの更新に失敗しました');
      }

      const updatedRecord = await response.json();
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? updatedRecord : r))
      );
      setEvent('');
      setFeeling('');
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  // データ削除
  const handleDelete = async (id: number) => {
    if (!confirm('このレコードを削除しますか？')) return;

    try {
      const response = await fetch('/api/records', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'レコードの削除に失敗しました');
      }

      setRecords((prev) => prev.filter((r) => r.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  // フォームをキャンセル
  const handleCancel = () => {
    setEvent('');
    setFeeling('');
    setSelectedHour(null);
    setEditingId(null);
    setError(null);
  };

  // 編集開始
  const startEditing = (record: Record) => {
    setEditingId(record.id);
    setEvent(record.event);
    setFeeling(record.feeling);
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
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">{hour}:00</span>
                {!record && selectedHour !== hour && (
                  <button
                    className="text-xs bg-gray-200 text-gray-700 p-1 rounded-full hover:bg-gray-300"
                    onClick={() => setSelectedHour(hour)}
                  >
                    ＋
                  </button>
                )}
              </div>
              {record && editingId !== record.id ? (
                <div className={`p-2 rounded-md ${getFeelingStyle(record.feeling)} mt-1`}>
                  <p className="text-sm">出来事: {record.event}</p>
                  <p className="text-sm">感情: {record.feeling}</p>
                  <div className="flex space-x-2 mt-1">
                    <button
                      className="text-xs bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600"
                      onClick={() => startEditing(record)}
                    >
                      編集
                    </button>
                    <button
                      className="text-xs bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      onClick={() => handleDelete(record.id)}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ) : (selectedHour === hour || editingId) ? (
                <motion.div
                  className="mt-1 overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <input
                    className="w-full text-sm p-1 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                    placeholder="出来事"
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                  />
                  <input
                    className="w-full text-sm p-1 mt-1 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                    placeholder="感情"
                    value={feeling}
                    onChange={(e) => setFeeling(e.target.value)}
                  />
                  {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                  <div className="flex space-x-2 mt-1">
                    <button
                      className="flex-1 text-xs bg-blue-500 text-white p-1 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      onClick={() => (editingId ? handleEdit(editingId) : handleSubmit(hour))}
                      disabled={!event || !feeling}
                    >
                      保存
                    </button>
                    <button
                      className="flex-1 text-xs bg-gray-200 text-gray-700 p-1 rounded hover:bg-gray-300"
                      onClick={handleCancel}
                    >
                      キャンセル
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}