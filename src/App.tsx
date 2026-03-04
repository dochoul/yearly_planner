import { useState, useCallback } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 2 }}>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            📆 연간 업무 플래너
          </Typography>
          <PlannerTable year={year} onError={showError} />
        </Box>
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
