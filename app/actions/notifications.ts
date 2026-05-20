"use server";

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ApiNotification,
} from "@/lib/adminApi";

export async function getNotificationsAction(): Promise<
  { success: true; data: ApiNotification[] } | { error: string; data: ApiNotification[] }
> {
  try {
    const data = await getNotifications();
    return { success: true, data };
  } catch (err) {
    return { error: String(err), data: [] };
  }
}

export async function markNotificationReadAction(
  id: string,
): Promise<{ success: true } | { error: string }> {
  try {
    await markNotificationRead(id);
    return { success: true };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function markAllNotificationsReadAction(): Promise<
  { success: true } | { error: string }
> {
  try {
    await markAllNotificationsRead();
    return { success: true };
  } catch (err) {
    return { error: String(err) };
  }
}
