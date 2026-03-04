import { useMemo, useState, useCallback } from 'react';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { useCategories, useAddCategory } from '../../hooks/useCategories';
import { useWorkEntries } from '../../hooks/useWorkEntries';
import type { WorkEntry } from '../../types';
import { TableHeader } from './TableHeader';
import { CategoryRow } from './CategoryRow';

const CATEGORY_COL_WIDTH = 140;
const DEFAULT_MONTH_WIDTH = 150;

interface PlannerTableProps {
  year: number;
  onError: (msg: string) => void;
}

export function PlannerTable({ year, onError }: PlannerTableProps) {
  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: entries = [], isLoading: entryLoading } = useWorkEntries(year);
  const addCategory = useAddCategory();
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

  const handleAddCategory = () => {
    const order = categories.length;
    addCategory.mutate(
      { name: '새 카테고리', order },
      { onError: () => onError('카테고리 추가에 실패했습니다.') }
    );
  };

  if (catLoading || entryLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256, gap: 1.5 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">데이터를 불러오는 중...</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
      <Table size="small" sx={{ tableLayout: 'fixed', borderCollapse: 'collapse', '& td, & th': { border: '1px solid #ccd4e3' } }}>
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
          <TableRow>
            <TableCell
              sx={{
                position: 'sticky',
                left: 0,
                zIndex: 10,
                bgcolor: 'background.paper',
                py: 1,
                px: 1.5,
              }}
            >
              <Button
                onClick={handleAddCategory}
                startIcon={<AddIcon />}
                size="small"
                variant="text"
                sx={{ fontSize: '0.75rem' }}
              >
                카테고리 추가
              </Button>
            </TableCell>
            {Array.from({ length: 12 }, (_, i) => (
              <TableCell key={i} />
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
