import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getCurrentUserId(): Promise<number | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userId = Number(session.user.id);
  if (!Number.isFinite(userId)) return null;

  return userId;
}
