import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center text-center px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Mascot placeholder */}
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-n-800 border border-n-700 mx-auto">
          <span className="text-5xl">&#x1F989;</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground">
          English
          <span className="text-accent">Quest</span>
        </h1>

        <p className="text-lg text-n-300 max-w-xl mx-auto leading-relaxed">
          Domine o inglês aprendendo com{" "}
          <span className="text-accent font-semibold">The Office</span>
          ,{" "}
          <span className="text-accent-secondary font-semibold">Friends</span>
          , tech, negócios e muito mais — com progressão estilo RPG, XP, skill
          tree e loot.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 rounded-xl bg-accent text-n-950 px-8 py-4 font-display font-semibold text-lg hover:bg-accent-600 transition-colors"
          >
            Começar Quest
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-xl bg-n-800 text-n-200 px-8 py-4 font-medium border border-n-700 hover:border-n-500 transition-colors"
          >
            Já tenho conta
          </Link>
        </div>

        {/* Feature preview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 max-w-2xl mx-auto">
          {(
            [
              { label: "Skill Tree", desc: "6 branches, 30+ skills", icon: "\uD83E\uDDEC" },
              { label: "XP & Loot", desc: "Ganhe XP, drops e equipamentos", icon: "⚡" },
              { label: "Contexto Real", desc: "Aprenda com o que você ama", icon: "🎬" },
            ] as const
          ).map((f) => (
            <div
              key={f.label}
              className="rounded-xl bg-n-900 border border-n-800 p-4 text-center"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-display font-semibold text-sm text-n-100">
                {f.label}
              </div>
              <div className="text-xs text-n-400 mt-1">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}