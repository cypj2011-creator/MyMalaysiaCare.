import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

const SWIPE_THRESHOLD = 50;

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const touchStart = useRef(new Map<string, { x: number; y: number }>());
  const suppressClickUntil = useRef(0);

  useEffect(() => {
    const dismissToastsOnClick = () => {
      if (Date.now() < suppressClickUntil.current) return;

      document.querySelectorAll<HTMLElement>("[data-toast-notification='true']").forEach((toast) => {
        toast.dataset.dismissDirection = "up";
      });
      dismiss();
    };

    document.addEventListener("click", dismissToastsOnClick, true);
    return () => document.removeEventListener("click", dismissToastsOnClick, true);
  }, [dismiss]);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            data-toast-notification="true"
            data-dismiss-direction="up"
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
              if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < SWIPE_THRESHOLD) return;

              const direction = Math.abs(deltaX) > Math.abs(deltaY)
                ? deltaX < 0 ? "left" : "right"
                : deltaY < 0 ? "up" : "down";
              event.currentTarget.dataset.dismissDirection = direction;
              suppressClickUntil.current = Date.now() + 500;
              dismiss(id);
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
