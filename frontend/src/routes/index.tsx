import Quotes from '@/pages/quotes';

const routes = [
  {
    path: '/quotes',
    element: (
      <PrivateRoute>
        <Quotes />
      </PrivateRoute>
    ),
  },
]; 