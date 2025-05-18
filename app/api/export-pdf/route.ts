import { NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    // 日付による絞り込み（指定された場合）
    let dateFilter = {};
    if (year && month) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    // レコードを取得
    const records = await prisma.record.findMany({
      where: {
        userId: parseInt(userId),
        ...dateFilter,
      },
      orderBy: [
        { date: 'asc' },
        { hour: 'asc' },
      ],
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // PDFドキュメントを作成 (A4サイズ)
    const doc = new jsPDF();
    
    // ユーザー名と期間情報
    const userName = records[0]?.user?.name || 'User';
    const title = `Health Record - ${userName}`;
    let subtitle = '';
    if (year && month) {
      subtitle = `Period: ${year}年${month}月`;
    }
    
    // タイトルとサブタイトルの描画
    doc.setFontSize(16);
    doc.text(title, doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
    if (subtitle) {
      doc.setFontSize(12);
      doc.text(subtitle, doc.internal.pageSize.width / 2, 30, { align: 'center' });
    }
    
    // テーブルヘッダーを手動で描画
    let startY = subtitle ? 40 : 30;
    doc.setFillColor(66, 139, 202);
    doc.rect(10, startY, doc.internal.pageSize.width - 20, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Date', 15, startY + 6);
    doc.text('Time', 45, startY + 6);
    doc.text('Event', 75, startY + 6);
    doc.text('Feeling', 145, startY + 6);
    
    // ヘッダー後のY位置
    let currentY = startY + 15;
    
    // データ行を手動で描画
    doc.setTextColor(0, 0, 0);
    records.forEach((record, index) => {
      const formattedDate = new Date(record.date).toLocaleDateString('ja-JP');
      const formattedTime = `${record.hour}:00`;
      
      // 新しいページが必要かチェック
      if (currentY > doc.internal.pageSize.height - 20) {
        doc.addPage();
        currentY = 20;
      }
      
      // 交互に背景色を変える
      if (index % 2 === 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(10, currentY - 5, doc.internal.pageSize.width - 20, 10, 'F');
      }
      
      doc.text(formattedDate, 15, currentY);
      doc.text(formattedTime, 45, currentY);
      
      // 長い文字列を省略
      const truncateText = (text: string, maxLength: number) => {
        if (text.length > maxLength) {
          return text.substring(0, maxLength - 3) + '...';
        }
        return text;
      };
      
      doc.text(truncateText(record.event, 30), 75, currentY);
      doc.text(truncateText(record.feeling, 20), 145, currentY);
      
      currentY += 10;
    });
    
    // フッター
    doc.setFontSize(8);
    doc.text(
      `Generated on ${new Date().toLocaleDateString('ja-JP')}`,
      doc.internal.pageSize.width - 15,
      doc.internal.pageSize.height - 10
    );
    
    // PDFをバッファとして取得
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="health-record${year && month ? `_${year}_${month}` : ''}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}