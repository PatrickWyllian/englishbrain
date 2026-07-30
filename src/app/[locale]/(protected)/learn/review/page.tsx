"use client";

import { ReviewQueue } from "@/components/srs/ReviewQueue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function ReviewPage() {
  return (
    <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Revisão
        </h1>
        <p className="text-sm text-n-400 mt-1">
          Revise suas cartas de vocabulário com o sistema de repetição espaçada (SRS)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fila de Revisão</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewQueue />
        </CardContent>
      </Card>
    </main>
  );
}