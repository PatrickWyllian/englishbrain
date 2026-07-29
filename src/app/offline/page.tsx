"use client";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold text-foreground">
        Você está offline
      </h1>
      <p className="text-muted-foreground">
        Verifique sua conexão com a internet e tente novamente.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-lg bg-accent px-6 py-2 font-semibold text-background transition-colors hover:opacity-90"
      >
        Tentar novamente
      </button>
    </main>
  );
}
