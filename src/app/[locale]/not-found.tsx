import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-6xl font-bold text-accent">404</h1>
      <h2 className="text-2xl font-bold text-foreground">
        Página não encontrada
      </h2>
      <p className="text-muted-foreground">
        A página que você procura não existe ou foi movida.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-accent px-6 py-2 font-semibold text-background transition-colors hover:opacity-90"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
