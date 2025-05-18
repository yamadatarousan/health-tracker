import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const userId = searchParams.get('userId');

  if (!date || !userId) {
    return NextResponse.json({ error: 'date and userId are required' }, { status: 400 });
  }

  try {
    const records = await prisma.record.findMany({
      where: {
        userId: Number(userId),
        date: {
          gte: new Date(date),
          lte: new Date(`${date}T23:59:59.999Z`),
        },
      },
    });
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId, date, hour, event, feeling } = await request.json();

  if (!userId || !date || hour == null || !event || !feeling) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  // ユーザーが存在するか確認
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const record = await prisma.record.create({
      data: {
        userId,
        date: new Date(date),
        hour,
        event,
        feeling,
      },
    });
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}