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
    // UTCで日付を構築
    const [year, month, day] = date.split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const records = await prisma.record.findMany({
      where: {
        userId: Number(userId),
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // デバッグ: 取得したレコードの日付をログ
    console.log(`Fetched records for ${date}:`, records.map(r => r.date));
    return NextResponse.json(records);
  } catch (error) {
    console.error(`Error fetching records for ${date}:`, error);
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId, date, hour, event, feeling } = await request.json();

  if (!userId || !date || hour == null || !event || !feeling) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const [year, month, day] = date.split('-').map(Number);
    const recordDate = new Date(Date.UTC(year, month - 1, day));
    const record = await prisma.record.create({
      data: {
        userId,
        date: recordDate,
        hour,
        event,
        feeling,
      },
    });
    return NextResponse.json(record);
  } catch (error) {
    console.error('Error creating record:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { id, event, feeling } = await request.json();

  if (!id || !event || !feeling) {
    return NextResponse.json({ error: 'id, event, and feeling are required' }, { status: 400 });
  }

  try {
    const record = await prisma.record.update({
      where: { id },
      data: { event, feeling, updatedAt: new Date() },
    });
    return NextResponse.json(record);
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  try {
    await prisma.record.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}