'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function PWAUpdateHandler() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Check for service worker updates
    const checkForUpdates = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          setRegistration(reg);
          
          // Check for updates every 60 seconds
          setInterval(() => {
            reg.update();
          }, 60000);

          // Listen for new service worker waiting
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is ready
                  setShowUpdatePrompt(true);
                }
              });
            }
          });

          // Check if there's already a waiting service worker
          if (reg.waiting) {
            setShowUpdatePrompt(true);
          }
        }
      } catch (error) {
        console.error('Error checking for service worker updates:', error);
      }
    };

    // Listen for controller change (when new SW takes over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('App is online, checking for updates...');
      checkForUpdates();
    };

    window.addEventListener('online', handleOnline);
    
    // Initial check
    checkForUpdates();

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting and become active
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <Card className="p-4 shadow-lg border-2 border-blue-500">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg">Update Available</h3>
            <p className="text-sm text-muted-foreground mt-1">
              A new version of this app is available. Update now to get the latest features and improvements.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUpdate} className="flex-1">
              Update Now
            </Button>
            <Button onClick={handleDismiss} variant="outline">
              Later
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
