"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-8 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <WifiOff className="w-16 h-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">You&#39;re Offline</CardTitle>
          <CardDescription>
            It looks like you&#39;ve lost your internet connection. Don&#39;t worry, your data is safe in IndexedDB!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">What you can still do:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>View your saved notes</li>
              <li>Create new notes</li>
              <li>Delete notes</li>
              <li>All data is stored locally</li>
            </ul>
          </div>
          <Button onClick={handleRefresh} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
