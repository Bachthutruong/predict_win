'use client';
import type { Prediction } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import Image from 'next/image';

type PredictionCardProps = {
  prediction: Prediction;
};

export function PredictionCard({ prediction }: PredictionCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0">
        <Link href={`/predictions/${prediction.id}`}>
          <Image
            src={prediction.imageUrl}
            alt={prediction.title}
            width={600}
            height={400}
            className="rounded-t-lg aspect-[3/2] object-cover"
            data-ai-hint={prediction['data-ai-hint']}
          />
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg font-bold hover:text-primary">
          <Link href={`/predictions/${prediction.id}`}>{prediction.title}</Link>
        </CardTitle>
        <CardDescription className="mt-2 text-sm">{prediction.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Tag className="h-4 w-4" />
          <span>{prediction.pointsCost} Points</span>
        </div>
        <Button asChild>
          <Link href={`/predictions/${prediction.id}`}>Make Prediction</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
