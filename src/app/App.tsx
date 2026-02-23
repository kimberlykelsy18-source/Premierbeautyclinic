import { RouterProvider } from 'react-router';
import { router } from './routes';
import { StoreProvider } from './context/StoreContext';
import { FeedbackProvider } from './components/Feedback';

export default function App() {
  return (
    <StoreProvider>
      <FeedbackProvider>
        <RouterProvider router={router} />
      </FeedbackProvider>
    </StoreProvider>
  );
}