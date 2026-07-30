import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const session = await auth();

  if (!session) {
    redirect(`/${locale}/auth/login`);
  }

  return <>{children}</>;
}
