"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useEffect } from "react";
import { LessonShell } from "@/components/lesson/LessonShell";
import { getLessonBySlug } from "@/lib/lesson/data";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const lesson = useMemo(() => {
    return getLessonBySlug(slug);
  }, [slug]);

  useEffect(() => {
    if (!lesson) {
      router.replace("/learn");
    }
  }, [lesson, router]);

  if (!lesson) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      </main>
    );
  }

  return <LessonShell lesson={lesson} />;
}
