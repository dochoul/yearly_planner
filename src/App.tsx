import { useState, useCallback } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Box from '@mui/material/Box';
import { PlannerTable } from './components/PlannerTable/PlannerTable';
import { Toast } from './components/Toast';

const theme = createTheme({
  typography: {
    fontFamily: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
  },
});

type ToastState = { message: string; type: 'error' | 'success' } | null;

export default function App() {
  const year = new Date().getFullYear();
  const [toast, setToast] = useState<ToastState>(null);

  const showError = useCallback((message: string) => {
    setToast({ message, type: 'error' });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', p: 2 }}>
        <PlannerTable year={year} onError={showError} />
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}
