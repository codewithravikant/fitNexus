import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { privacySettingsSchema } from '@/lib/validations/profile';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const settings = await prisma.privacySettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) throw new ApiError(404, 'Privacy settings not found');
    return NextResponse.json(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const body = await request.json();
    const data = privacySettingsSchema.partial().parse(body);

    const settings = await prisma.privacySettings.update({
      where: { userId: session.user.id },
      data,
    });

    return NextResponse.json(settings);
  } catch (error) {
    return handleApiError(error);
  }
}
