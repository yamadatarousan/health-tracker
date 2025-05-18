'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type Record = {
  id: number;
  date: string;
  hour: number;
  event: string;
  feeling: string;
  user: {
    name: string | null;
    email: string;
  };
};

export default function PdfExport({ 
  userId, 
  year, 
  month 
}: { 
  userId: number; 
  year: number; 
  month: number; 
}) {
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const handleExportPDF = async () => {
    setIsLoading(true);
    try {
      // データを取得
      const response = await fetch(
        `/api/records/export?userId=${userId}&year=${year}&month=${month + 1}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.data?.records) {
        throw new Error('Failed to fetch data');
      }
      
      await generatePDFWithHTMLConversion(result.data.records);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('PDFのエクスポートに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // テーブルのHTML文字列を生成
  const generateTableHTML = (records: Record[]) => {
    let html = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h1 style="text-align: center; font-size: 24px; margin-bottom: 10px;">健康記録</h1>
        <p style="text-align: center; font-size: 18px; margin-bottom: 20px;">${year}年${month + 1}月</p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #4285f4;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; color: white;">日付</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; color: white;">時間</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; color: white;">イベント</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; color: white;">感情</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    records.forEach((record, index) => {
      const bgColor = index % 2 === 0 ? '#f2f2f2' : '#ffffff';
      html += `
        <tr style="background-color: ${bgColor};">
          <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(record.date)}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${record.hour}:00</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${record.event}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${record.feeling}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
        
        <p style="text-align: right; margin-top: 20px; font-size: 12px;">
          生成日: ${new Date().toLocaleDateString('ja-JP')}
        </p>
      </div>
    `;
    
    return html;
  };

  // HTMLからPDFを生成（印刷ダイアログを使用）
  const generatePDFWithHTMLConversion = async (records: Record[]) => {
    try {
      // テーブルのHTMLを生成
      const tableHTML = generateTableHTML(records);
      
      // 新しいウィンドウを開く
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window. Please allow popups for this site.');
      }
      
      // HTMLコンテンツを設定
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>健康記録 ${year}年${month + 1}月</title>
          <meta charset="utf-8">
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #4285f4; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
            }
          </style>
        </head>
        <body>
          ${tableHTML}
          <script>
            // ページが読み込まれたら印刷ダイアログを表示
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 300);
            }
          </script>
        </body>
        </html>
      `);
      
      printWindow.document.close();
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  return (
    <motion.button
      className={`px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 ${
        isLoading ? 'opacity-70 cursor-not-allowed' : ''
      }`}
      onClick={handleExportPDF}
      whileHover={{ scale: isLoading ? 1 : 1.05 }}
      whileTap={{ scale: isLoading ? 1 : 0.95 }}
      disabled={isLoading}
    >
      {isLoading ? '処理中...' : 'PDFでエクスポート'}
    </motion.button>
  );
}