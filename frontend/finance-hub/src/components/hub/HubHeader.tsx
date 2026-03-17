import logoScore from "@/assets/logo_score.png";

export function HubHeader() {
  return (
    <header className="w-full bg-card border-b border-border px-8 py-4 flex items-center gap-3">
      <img src={logoScore} alt="Score" className="w-9 h-9 object-contain" />
      <div>
        <h1 className="text-lg font-extrabold text-primary tracking-tight leading-none">Score Data Hub</h1>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Plataforma de Inteligência</p>
      </div>
    </header>
  );
}
