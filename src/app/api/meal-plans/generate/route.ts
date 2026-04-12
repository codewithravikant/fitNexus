import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateMealPlanForUser } from '@/lib/ai/meal-plan-pipeline';
import { handleApiError, ApiError } from '@/lib/api-error';
import { rateLimitStrict } from '@/lib/rate-limit';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const { success } = rateLimitStrict(session.user.id, 'meal-plan-gen');
    if (!success) throw new ApiError(429, 'Too many meal plan generations — try again later');

    const result = await generateMealPlanForUser(session.user.id);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
