import { useState } from "react";
import { Check, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

const text = {
  en: { question: "Was this correct?", yes: "Yes", no: "No", thanks: "Thanks for your feedback!" },
  zh: { question: "结果正确吗？", yes: "正确", no: "不正确", thanks: "感谢您的反馈！" },
  ms: { question: "Adakah ini betul?", yes: "Ya", no: "Tidak", thanks: "Terima kasih atas maklum balas anda!" },
};

// Tiny, non-saving feedback line: shows a thank-you after any click.
const ScanFeedback = () => {
  const { lang } = useTranslation();
  const s = text[lang as keyof typeof text] ?? text.en;
  const [answered, setAnswered] = useState(false);

  return (
    <div
      className="flex min-h-7 items-center gap-2 text-xs text-muted-foreground"
      aria-live="polite"
    >
      {answered ? (
        <span className="flex items-center gap-1">
          <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
          {s.thanks}
        </span>
      ) : (
        <>
          <span>{s.question}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setAnswered(true)}
            aria-label={s.yes}
            title={s.yes}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setAnswered(true)}
            aria-label={s.no}
            title={s.no}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </div>
  );
};

export default ScanFeedback;
