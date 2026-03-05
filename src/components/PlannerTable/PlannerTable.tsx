import { useMemo, useState, useCallback } from 'react';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useCategories } from '../../hooks/useCategories';
import { useWorkEntries } from '../../hooks/useWorkEntries';
import type { WorkEntry } from '../../types';
import { TableHeader } from './TableHeader';
import { CategoryRow } from './CategoryRow';
import { CategoryAddModal } from '../CategoryAddModal';

const CATEGORY_COL_WIDTH = 140;
const DEFAULT_MONTH_WIDTH = 150;

interface PlannerTableProps {
  year: number;
  onError: (msg: string) => void;
  mode: 'light' | 'dark';
  onToggleMode: () => void;
}

export function PlannerTable({ year, onError, mode, onToggleMode }: PlannerTableProps) {
  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: entries = [], isLoading: entryLoading } = useWorkEntries(year);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [colWidths, setColWidths] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('planner-col-widths');
      if (saved) {
        const parsed = JSON.parse(saved) as number[];
        if (Array.isArray(parsed) && parsed.length === 12) return parsed;
      }
    } catch {}
    return Array(12).fill(DEFAULT_MONTH_WIDTH);
  });

  const handleResize = useCallback((index: number, width: number) => {
    setColWidths((prev) => {
      const next = [...prev];
      next[index] = Math.max(80, width);
      localStorage.setItem('planner-col-widths', JSON.stringify(next));
      return next;
    });
  }, []);

  const entriesMap = useMemo(() => {
    const map = new Map<string, Map<number, WorkEntry[]>>();
    for (const entry of entries) {
      if (!map.has(entry.category_id)) map.set(entry.category_id, new Map());
      const monthMap = map.get(entry.category_id)!;
      if (!monthMap.has(entry.month)) monthMap.set(entry.month, []);
      monthMap.get(entry.month)!.push(entry);
    }
    return map;
  }, [entries]);


  if (catLoading || entryLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256, gap: 1.5 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">데이터를 불러오는 중...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          📆 연간 업무 플래너
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={mode === 'light' ? '다크 모드' : '라이트 모드'}>
            <IconButton onClick={onToggleMode} size="small" sx={{ color: 'text.secondary' }}>
              {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Button
            onClick={() => setAddModalOpen(true)}
            startIcon={<AddIcon />}
            variant="outlined"
            size="medium"
            sx={{
              fontWeight: 600,
              borderRadius: 5,
              px: 2,
              py: 0.75,
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.hover', borderColor: 'text.disabled' },
            }}
          >
            카테고리 추가
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
        <Table size="small" sx={{ tableLayout: 'fixed', borderCollapse: 'collapse', '& td, & th': { border: '1px solid', borderColor: 'divider' } }}>
          <colgroup>
            <col style={{ width: CATEGORY_COL_WIDTH }} />
            {colWidths.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <TableHeader colWidths={colWidths} onResize={handleResize} />
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                entries={entriesMap.get(cat.id) ?? new Map()}
                year={year}
                onError={onError}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 1.5, display: 'flex', gap: 3, px: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          총 카테고리: {categories.length}개
        </Typography>
        <Typography variant="body2" color="text.secondary">
          총 업무: {entries.length}개
        </Typography>
      </Box>
      <CategoryAddModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        order={categories.length}
        onError={onError}
      />
    </Box>
  );
}
