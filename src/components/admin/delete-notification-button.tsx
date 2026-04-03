"use client";

import { DeleteButton } from "./delete-button";
import { deleteNotification } from "@/app/admin/actions";

export function DeleteNotificationButton({ id }: { id: string }) {
  return <DeleteButton onDelete={() => deleteNotification(id)} label="notificacion" />;
}
