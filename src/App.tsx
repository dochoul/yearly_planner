import { useState, useCallback, useMemo } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Box from '@mui/material/Box';
import { PlannerTable } from './components/PlannerTable/PlannerTable';
import { Toast } from './components/Toast';

type ToastState = { message: string; type: 'error' | 'success' } | null;

export default function App() {
  const year = new Date().getFullYear();
  const [toast, setToast] = useState<ToastState>(null);
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('color-mode') as 'light' | 'dark') ?? 'light';
  });

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
        typography: {
          fontFamily: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
        },
      }),
    [mode]
  );

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('color-mode', next);
      return next;
    });
  }, []);

  const showError = useCallback((message: string) => {
    setToast({ message, type: 'error' });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
        <PlannerTable year={year} onError={showError} mode={mode} onToggleMode={toggleMode} />
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
