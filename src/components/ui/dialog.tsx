"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export function DialogContent({
  className,
  children,
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#020D13]/70 backdrop-blur-sm data-[state=open]:animate-in" />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-2xl bg-[#FFFBFC] p-5 shadow-2xl outline-none md:left-1/2 md:top-1/2 md:bottom-auto md:max-h-[86vh] md:w-[min(720px,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl md:p-7",
          className,
        )}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/90 text-[#020D13] shadow-sm transition hover:bg-white"
          aria-label="Закрыть"
        >
          <X className="size-5" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
