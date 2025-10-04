import { NextResponse } from 'next/server'
import prisma from '@/db/prisma'

export async function GET() {
  try {
    const interviews = await prisma.quiz.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        difficulty: true,
        createdAt: true,
        updatedAt: true,
        company: true,
        technology: true,
        duration: true,
        totalPoints: true,
      }
    })
    return NextResponse.json(interviews)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}



