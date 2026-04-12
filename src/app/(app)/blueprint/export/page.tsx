'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ExportPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (format: 'json' | 'csv') => {
    setLoading(format);
    try {
      const res = await fetch(`/api/export?format=${format}`);
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitnexus-export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: 'Export complete', variant: 'success' });
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Export Data</h1>
        <p className="text-muted-foreground">Download your wellness data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Data, Your Choice</CardTitle>
          <CardDescription>Export all your health data in your preferred format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => handleExport('json')}
            loading={loading === 'json'}
          >
            <FileJson className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-medium">JSON Format</p>
              <p className="text-xs text-muted-foreground">Complete structured data</p>
            </div>
            <Download className="ml-auto h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => handleExport('csv')}
            loading={loading === 'csv'}
          >
            <FileText className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-medium">CSV Format</p>
              <p className="text-xs text-muted-foreground">Spreadsheet compatible</p>
            </div>
            <Download className="ml-auto h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
