import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { StoreProvider } from './context/StoreContext';
import { FeedbackProvider } from './components/Feedback';

function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F2F1F8]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#6D4C91] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <FeedbackProvider>
        <Suspense fallback={<PageLoader />}>
          <RouterProvider router={router} />
        </Suspense>
      </FeedbackProvider>
    </StoreProvider>
  );
}
