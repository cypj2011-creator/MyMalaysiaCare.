import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const touchStart = useRef(new Map<string, { x: number; y: number }>());

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            onPointerDown={(event) => {
              if (event.pointerType === "touch") {
                touchStart.current.set(id, { x: event.clientX, y: event.clientY });
              }
            }}
            onPointerUp={(event) => {
              if (event.pointerType !== "touch") return;

              const start = touchStart.current.get(id);
              touchStart.current.delete(id);
              if (!start) return;

              const deltaX = event.clientX - start.x;
              const deltaY = event.clientY - start.y;
              const swipeDistance = 50;

              if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= swipeDistance) {
                dismiss(id);
              }
            }}
            onPointerCancel={() => touchStart.current.delete(id)}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
