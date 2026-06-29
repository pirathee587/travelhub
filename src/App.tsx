import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/common/ui/tooltip';
import { Toaster } from '@/components/common/ui/toaster';
import { Toaster as Sonner } from '@/components/common/ui/sonner';
import { Suspense } from 'react';

import { AuthProvider } from '@/context/AuthContext';
import AppRoutes from '@/routes/AppRoutes';

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <AppRoutes />
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
