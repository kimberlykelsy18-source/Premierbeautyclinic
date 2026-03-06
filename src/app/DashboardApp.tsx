import { RouterProvider } from 'react-router';
import { dashboardRouter } from './dashboard-routes';
import { StoreProvider } from './context/StoreContext';
import { FeedbackProvider } from './components/Feedback';

export default function DashboardApp() {
  return (
    <StoreProvider>
      <FeedbackProvider>
        <RouterProvider router={dashboardRouter} />
      </FeedbackProvider>
    </StoreProvider>
  );
}
