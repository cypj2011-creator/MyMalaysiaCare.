import { useState } from "react";
import { Check, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";

interface ScanFeedbackProps {
  category: string;
  recyclable: boolean;
  scanId: string | null;
}

const text = {
  en: {
    question: "Was this result correct?",
    yes: "Yes",
    no: "No",
    noted: "Thanks for letting us know.",
    whatIsIt: "What is it actually? (optional)",
    send: "Send",
    skip: "Skip",
    thanks: "Thanks! Your feedback helps improve the scanner.",
    errorTitle: "Feedback not saved",
    error: "Could not save your feedback. Please try again.",
  },
  zh: {
    question: "这个结果正确吗？",
    yes: "正确",
    no: "不正确",
    noted: "感谢您的反馈。",
    whatIsIt: "它实际是什么？（可选）",
    send: "提交",
    skip: "跳过",
    thanks: "谢谢！您的反馈将帮助我们改进扫描器。",
    errorTitle: "反馈未保存",
    error: "无法保存您的反馈，请重试。",
  },
  ms: {
    question: "Adakah keputusan ini betul?",
    yes: "Ya",
    no: "Tidak",
    noted: "Terima kasih kerana memaklumkan kami.",
    whatIsIt: "Apakah sebenarnya? (pilihan)",
    send: "Hantar",
    skip: "Langkau",
    thanks: "Terima kasih! Maklum balas anda membantu menambah baik pengimbas.",
    errorTitle: "Maklum balas tidak disimpan",
    error: "Maklum balas anda tidak dapat disimpan. Sila cuba lagi.",
  },
};

// scan_feedback is a new table, so it is not in the generated Supabase types yet.
const feedbackTable = () => (supabase as any).from("scan_feedback");

const ScanFeedback = ({ category, recyclable, scanId }: ScanFeedbackProps) => {
  const { lang } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const s = text[lang] ?? text.en;

  const [step, setStep] = useState<"ask" | "correction" | "done">("ask");
  const [rowId, setRowId] = useState<string | null>(null);
  const [correction, setCorrection] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const showError = () =>
    toast({ title: s.errorTitle, description: s.error, variant: "destructive" });

  // Saves the rating straight away, so a "No" is never lost if the person
  // walks away before filling in the optional correction.
  const rate = async (isCorrect: boolean) => {
    setSaving(true);
    const { data, error } = await feedbackTable()
      .insert({
        user_id: user.id,
        scan_id: scanId,
        category: category.slice(0, 120),
        ai_recyclable: recyclable,
        is_correct: isCorrect,
      })
      .select("id")
      .single();
    setSaving(false);

    // 23505 = this scan was already rated, so just show the thank-you.
    if (error && error.code !== "23505") {
      showError();
      return;
    }
    if (error || isCorrect) {
      setStep("done");
      return;
    }
    setRowId(data?.id ?? null);
    setStep("correction");
  };

  const sendCorrection = async () => {
    const note = correction.trim().slice(0, 200);
    if (!note || !rowId) {
      setStep("done");
      return;
    }
    setSaving(true);
    const { error } = await feedbackTable().update({ correction: note }).eq("id", rowId);
    setSaving(false);
    if (error) {
      showError();
      return;
    }
    setStep("done");
  };

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground" aria-live="polite">
      {step === "done" && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 flex-shrink-0 text-primary" />
          {s.thanks}
        </p>
      )}

      {step === "correction" && (
        <div className="space-y-3">
          <p className="text-sm font-medium">{s.noted}</p>
          <label htmlFor="scan-feedback-correction" className="block text-sm text-muted-foreground">
            {s.whatIsIt}
          </label>
          <Input
            id="scan-feedback-correction"
            value={correction}
            maxLength={200}
            onChange={(e) => setCorrection(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendCorrection();
            }}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={sendCorrection} disabled={saving}>
              {s.send}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setStep("done")} disabled={saving}>
              {s.skip}
            </Button>
          </div>
        </div>
      )}

      {step === "ask" && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">{s.question}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => rate(true)} disabled={saving}>
              <ThumbsUp className="mr-2 h-4 w-4" />
              {s.yes}
            </Button>
            <Button size="sm" variant="outline" onClick={() => rate(false)} disabled={saving}>
              <ThumbsDown className="mr-2 h-4 w-4" />
              {s.no}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanFeedback;
