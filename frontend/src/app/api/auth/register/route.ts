import { NextRequest, NextResponse } from 'next/server';
import { isValidEmail, isValidPassword, generateToken } from '@/lib/auth';
import { createUser } from '@/lib/auth-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    try {
      // Create user (will throw if user already exists)
      const user = await createUser(email, password, name);
      
      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email
      });

      return NextResponse.json(
        { user, token },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'User already exists') {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}