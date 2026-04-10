import { useState, useRef, useEffect } from "react";
import Anthropic from "@anthropic-ai/sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Key, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  computeDFCTotals,
  formatBRL,
  getMonthKeyFromRow,
  getSortedMonths,
} from "@/lib/finance-utils";
import type { MovimentacaoFinanceira, DateField } from "@/hooks/useFinanceData";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAgentProps {
  data: MovimentacaoFinanceira[];
  dateField: DateField;
  startDate: string;
  endDate: string;
}

// --- Helpers para construir o contexto financeiro ---

function buildMonthlyBreakdown(data: MovimentacaoFinanceira[], dateField: DateField) {
  const months = getSortedMonths(data, dateField);
  return months.map((month) => {
    const subset = data.filter((d) => getMonthKeyFromRow(d, dateField) === month);
    const t = computeDFCTotals(subset);
    return {
      mes: month,
      faturamento: t.fat,
      custos: t.custos,
      despesas: t.desp,
      lucroLiquido: t.lucroLiquido,
      margemContribuicao: t.margemContribuicao,
    };
  });
}

function buildTopCategories(data: MovimentacaoFinanceira[]) {
  const map = new Map<string, number>();
  data.forEach((d) => {
    const cat = d.categoria_lancamento || "Outros";
    map.set(cat, (map.get(cat) ?? 0) + (d.valor_liquido ?? 0));
  });
  return Array.from(map.entries())
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 10)
    .map(([categoria, total]) => ({ categoria, total }));
}

function buildDFCGroups(data: MovimentacaoFinanceira[]) {
  const map = new Map<string, number>();
  data.forEach((d) => {
    const grupo = d.dfc_grupo || "Outros";
    map.set(grupo, (map.get(grupo) ?? 0) + (d.valor_liquido ?? 0));
  });
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

function buildFinancialContext(
  data: MovimentacaoFinanceira[],
  dateField: DateField,
  startDate: string,
  endDate: string
): string {
  const totals = computeDFCTotals(data);
  const monthly = buildMonthlyBreakdown(data, dateField);
  const topCats = buildTopCategories(data);
  const dfcGroups = buildDFCGroups(data);

  const pct = (v: number) =>
    totals.fat !== 0 ? `(${((v / totals.fat) * 100).toFixed(1)}% do faturamento)` : "";

  const monthlyText = monthly
    .map(
      (m) =>
        `  • ${m.mes}: Faturamento ${formatBRL(m.faturamento)} | LL ${formatBRL(m.lucroLiquido)} | MC ${formatBRL(m.margemContribuicao)}`
    )
    .join("\n");

  const topCatsText = topCats
    .map((c) => `  • ${c.categoria}: ${formatBRL(c.total)}`)
    .join("\n");

  const dfcText = dfcGroups
    .map((g) => `  • ${g[0]}: ${formatBRL(g[1])}`)
    .join("\n");

  return `
=== CONTEXTO FINANCEIRO DA EMPRESA ===
Período analisado: ${startDate || "início"} a ${endDate || "hoje"}
Regime: ${dateField === "data_pagamento" ? "Caixa (data pagamento)" : "Competência (data emissão)"}
Total de lançamentos: ${data.length}

--- KPIs PRINCIPAIS ---
• Faturamento:            ${formatBRL(totals.fat)}
• Custos Variáveis:       ${formatBRL(totals.custos)} ${pct(totals.custos)}
• Margem de Contribuição: ${formatBRL(totals.margemContribuicao)} ${pct(totals.margemContribuicao)}
• Despesas Fixas:         ${formatBRL(totals.desp)} ${pct(totals.desp)}
• Lucro Operacional:      ${formatBRL(totals.lucroOpAntesInvest)} ${pct(totals.lucroOpAntesInvest)}
• Investimentos:          ${formatBRL(totals.invest)} ${pct(totals.invest)}
• Resultado Não Oper.:    ${formatBRL(totals.resNaoOp)} ${pct(totals.resNaoOp)}
• Lucro Líquido:          ${formatBRL(totals.lucroLiquido)} ${pct(totals.lucroLiquido)}

--- EVOLUÇÃO MENSAL ---
${monthlyText || "  Nenhum dado mensal disponível"}

--- TOP 10 CATEGORIAS (por volume) ---
${topCatsText || "  Nenhuma categoria disponível"}

--- GRUPOS DFC ---
${dfcText || "  Nenhum grupo disponível"}
`.trim();
}

// --- Componente principal ---

const STORAGE_KEY = "ai_agent_api_key";
const MODEL = "claude-sonnet-4-6";

function ApiKeySetup({ onSave }: { onSave: (key: string) => void }) {
  const [key, setKey] = useState("");
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">Agente Financeiro IA</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Configure sua chave da API Anthropic para ativar o assistente inteligente que analisa todos os dados financeiros.
        </p>
      </div>
      <div className="w-full max-w-sm space-y-3">
        <div className="relative">
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="password"
            placeholder="sk-ant-..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => e.key === "Enter" && key.startsWith("sk-ant-") && onSave(key)}
          />
        </div>
        <Button
          className="w-full"
          disabled={!key.startsWith("sk-ant-")}
          onClick={() => onSave(key)}
        >
          Ativar Agente
        </Button>
        <p className="text-[11px] text-center text-muted-foreground">
          A chave é armazenada localmente neste navegador.
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3 mb-4", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

const SUGGESTED_QUESTIONS = [
  "Qual é a situação financeira geral da empresa?",
  "Quais são os principais pontos de atenção nas despesas?",
  "Como está a evolução do lucro líquido ao longo dos meses?",
  "Qual categoria representa o maior custo?",
  "A margem de contribuição está saudável?",
];

export function AIAgent({ data, dateField, startDate, endDate }: AIAgentProps) {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(STORAGE_KEY) || "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const financialContext = buildFinancialContext(data, dateField, startDate, endDate);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSaveKey = (key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKey(key);
  };

  const handleSend = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || isStreaming) return;

    setInput("");
    setError(null);

    const userMsg: Message = { role: "user", content: userText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const client = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true,
      });

      const stream = client.messages.stream({
        model: MODEL,
        max_tokens: 2048,
        system: `Você é um analista financeiro especialista da empresa. Você tem acesso completo aos dados financeiros da empresa e deve responder perguntas com base nesses dados.

Seja direto, objetivo e use os números reais para fundamentar suas análises. Formate valores em reais (R$) de forma clara. Quando identificar algo preocupante, destaque. Quando houver algo positivo, reconheça.

Responda sempre em português brasileiro.

${financialContext}`,
        messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
      });

      let fullContent = "";
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          fullContent += event.delta.text;
          setStreamingContent(fullContent);
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: fullContent }]);
      setStreamingContent("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setError(msg.includes("api_key") || msg.includes("401")
        ? "Chave de API inválida. Clique em 'Trocar chave' para corrigir."
        : `Erro: ${msg}`);
    } finally {
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  if (!apiKey) {
    return <ApiKeySetup onSave={handleSaveKey} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-none">Agente Financeiro IA</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Análise inteligente dos dados do período
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] gap-1 ml-2">
            <TrendingUp className="h-3 w-3" />
            {data.length} lançamentos
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground gap-1.5"
          onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            setApiKey("");
            setMessages([]);
          }}
        >
          <Key className="h-3.5 w-3.5" />
          Trocar chave
        </Button>
      </div>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col border-0 shadow-sm overflow-hidden">
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 && !isStreaming ? (
              <div className="flex flex-col items-center justify-center h-full py-8 gap-5">
                <Bot className="h-12 w-12 text-primary/30" />
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Olá! Estou pronto para analisar os dados financeiros da empresa. Faça uma pergunta ou escolha uma sugestão abaixo.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-md">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-left text-xs px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {messages.map((msg, i) => (
                  <MessageBubble key={i} message={msg} />
                ))}
                {isStreaming && streamingContent && (
                  <MessageBubble message={{ role: "assistant", content: streamingContent }} />
                )}
                {isStreaming && !streamingContent && (
                  <div className="flex gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </ScrollArea>

          {/* Error */}
          {error && (
            <div className="mx-4 mb-2 flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border">
            <form
              className="flex gap-2"
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Faça uma pergunta sobre os dados financeiros..."
                disabled={isStreaming}
                className="flex-1 text-sm"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isStreaming}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
