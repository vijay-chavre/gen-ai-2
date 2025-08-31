import { AlertCircle, X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  error: string;
  onDismiss?: () => void;
  className?: string;
  variant?: "default" | "destructive" | "warning";
}

export function ErrorMessage({
  error,
  onDismiss,
  className,
  variant = "destructive",
}: ErrorMessageProps) {
  const variantStyles = {
    default:
      "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
    destructive:
      "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    warning:
      "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border",
        variantStyles[variant],
        className
      )}
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{error}</p>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="h-6 w-6 text-current hover:bg-current/10"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
