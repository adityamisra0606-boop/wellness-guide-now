import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Stethoscope, Pill, AlertTriangle, Loader2, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const Index = () => {
  const [symptoms, setSymptoms] = useState("");
  const [advice, setAdvice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!symptoms.trim()) {
      toast({ title: "Please describe your symptoms", variant: "destructive" });
      return;
    }
    if (symptoms.length > 1000) {
      toast({ title: "Please keep your input under 1000 characters", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setAdvice("");

    try {
      const { data, error } = await supabase.functions.invoke("health-advisor", {
        body: { symptoms: symptoms.trim() },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAdvice(data.advice);
    } catch (e: any) {
      toast({
        title: "Something went wrong",
        description: e.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">MediGuide</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Health Assistant</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <section className="text-center space-y-3 py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Stethoscope className="h-4 w-4" />
            Describe your symptoms
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Get Medicine Recommendations
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Enter your health problem below and our AI will suggest possible conditions and commonly used medicines.
          </p>
        </section>

        {/* Input */}
        <Card className="border-border/60 shadow-lg shadow-primary/5">
          <CardContent className="p-6 space-y-4">
            <Textarea
              placeholder="e.g. I have a headache, mild fever, and a sore throat for the past 2 days..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="min-h-[120px] resize-none text-base"
              maxLength={1000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{symptoms.length}/1000</span>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !symptoms.trim()}
                size="lg"
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Pill className="h-4 w-4" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Disclaimer:</strong> This tool provides general health information only and is not a substitute for professional medical advice. Always consult a qualified healthcare provider before taking any medication.
          </p>
        </div>

        {/* Results */}
        {advice && (
          <Card className="border-border/60 shadow-lg shadow-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-headings:font-bold prose-strong:text-foreground prose-li:text-foreground/90 prose-p:text-foreground/90">
                <ReactMarkdown>{advice}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Index;
