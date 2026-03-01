import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Gamepad2, Laptop, Loader2, Zap, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const Index = () => {
  const [gameName, setGameName] = useState("");
  const [laptopModel, setLaptopModel] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!gameName.trim()) {
      toast({ title: "Please enter a game name", variant: "destructive" });
      return;
    }
    if (!laptopModel.trim()) {
      toast({ title: "Please enter your laptop model", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const { data, error } = await supabase.functions.invoke("game-checker", {
        body: { gameName: gameName.trim(), laptopModel: laptopModel.trim() },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data.result);
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
    <div className="min-h-screen bg-background relative">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style={{ backgroundImage: "url('/images/hero-bg.png')" }}
      />
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10 relative">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Gamepad2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">CanIRunIt</h1>
            <p className="text-xs text-muted-foreground">AI Game Compatibility Checker</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 relative z-[1]">
        {/* Hero */}
        <section className="text-center space-y-3 py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-sm font-semibold">
            <Zap className="h-4 w-4" />
            AI-Powered Check
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Can Your Laptop Run It?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Enter a game name and your laptop model — our AI instantly checks compatibility and suggests optimal settings.
          </p>
        </section>

        {/* Input */}
        <Card className="border-border/60 shadow-lg shadow-primary/5">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-primary" />
                Game Name
              </label>
              <Input
                placeholder="e.g. GTA V, Cyberpunk 2077, Valorant, Elden Ring..."
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Laptop className="h-4 w-4 text-accent" />
                Laptop Model
              </label>
              <Input
                placeholder="e.g. HP Pavilion 15, Dell Inspiron 5515, Lenovo IdeaPad 3..."
                value={laptopModel}
                onChange={(e) => setLaptopModel(e.target.value)}
                className="text-base"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !gameName.trim() || !laptopModel.trim()}
              size="lg"
              className="w-full gap-2 text-base font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking Compatibility...
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Check Compatibility
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="border-border/60 shadow-lg shadow-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-headings:font-bold prose-strong:text-foreground prose-li:text-foreground/90 prose-p:text-foreground/90">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Index;
