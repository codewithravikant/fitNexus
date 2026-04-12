'use client';

import { PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { InspireItem } from '@/lib/content/wellness-content';
import { toYouTubeEmbedUrl } from '@/lib/youtube-embed';

interface InspireVideoCardProps {
  item: InspireItem;
}

function formatCategory(category: string | undefined): string {
  if (!category) return 'Wellness';
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function InspireVideoCard({ item }: InspireVideoCardProps) {
  const embedUrl = toYouTubeEmbedUrl(item.link);

  return (
    <Dialog>
      <Card className="border-border bg-card text-left hover:border-primary/40 transition-colors h-full flex flex-col">
        <CardContent className="p-4 space-y-3 flex flex-col flex-1">
          <p className="text-xs uppercase tracking-wide text-primary font-semibold">
            {formatCategory(item.category)}
          </p>
          <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
          <p className="text-xs text-muted-foreground flex-1">{item.description}</p>
          <p className="text-[11px] text-primary font-medium">{item.duration || 'Video'}</p>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 mt-auto border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
            >
              <PlayCircle className="h-4 w-4" />
              {item.duration ? `Do It Now (${item.duration})` : 'Do It Now'}
            </Button>
          </DialogTrigger>
        </CardContent>
      </Card>

      <DialogContent className="w-[min(95vw,960px)] max-w-4xl bg-background/85 backdrop-blur-xl border-primary/30">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>
        {embedUrl ? (
          <div className="mx-auto aspect-video w-full max-w-[900px] overflow-hidden rounded-lg border border-primary/20 bg-black/70">
            <iframe
              src={embedUrl}
              title={item.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This inspiration source is external. Open it in a new tab.
            </p>
            <Button asChild>
              <a href={item.link} target="_blank" rel="noreferrer" className="w-fit gap-2">
                <PlayCircle className="h-4 w-4" />
                Open Resource
              </a>
            </Button>
          </div>
        )}
        <div className="flex justify-end">
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <a href={item.link} target="_blank" rel="noreferrer">
              Open on YouTube
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
