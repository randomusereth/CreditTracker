/**
 * NEXT.JS API ROUTE: /api/data
 * Handles all CRUD operations for user-specific app data
 * 
 * GET    - Fetch user data (requires userId query param)
 * POST   - Save user data (requires userId in body)
 * DELETE - Clear user data (requires userId query param)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserData, saveUserData, clearUserData } from '@/lib/database';

// GET /api/data?userId=xxx - Fetch user-specific data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const data = await getUserData(userId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// POST /api/data - Save user-specific data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, data } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'data is required' },
        { status: 400 }
      );
    }

    await saveUserData(userId, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}

// DELETE /api/data?userId=xxx - Clear user-specific data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await clearUserData(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear data' },
      { status: 500 }
    );
  }
}
