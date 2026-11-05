import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  useEffect(() => {
    const dismissSonnerToastsOnClick = () => {
      document.querySelectorAll<HTMLElement>("[data-sonner-toast]").forEach((notification) => {
        notification.dataset.dismissDirection = "up";
      });
      toast.dismiss();
    };

    document.addEventListener("click", dismissSonnerToastsOnClick, true);
    return () => document.removeEventListener("click", dismissSonnerToastsOnClick, true);
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg data-[dismiss-direction=up]:animate-out data-[dismiss-direction=up]:fade-out-80 data-[dismiss-direction=up]:slide-out-to-top-full",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
