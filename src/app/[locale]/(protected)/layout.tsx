import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { cookies } from "next/headers";

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
  const cookieStore = await cookies();
  const sessionCookie =
    cookieStore.get("authjs.session-token")?.value ||
    cookieStore.get("__Secure-authjs.session-token")?.value;

  if (!session?.user?.id || !sessionCookie) {
    redirect(`/${locale}/auth/login`);
  }

  return <>{children}</>;
}
