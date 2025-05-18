import { NextResponse } from 'next/server';
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

    return NextResponse.json({
      success: true,
      data: {
        records,
        periodInfo: year && month ? { year, month } : null,
      }
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch records' 
    }, { status: 500 });
  }
}