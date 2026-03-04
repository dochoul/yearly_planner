import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 },
    mutations: { retry: 1 },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </LocalizationProvider>
  </StrictMode>,
);
