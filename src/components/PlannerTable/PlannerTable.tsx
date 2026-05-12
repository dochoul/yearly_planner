import { useMemo, useState, useCallback } from 'react';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
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

type ViewMode = 'full' | 'h1' | 'h2' | 'q1' | 'q2' | 'q3' | 'q4';

const VIEW_MONTHS: Record<ViewMode, number[]> = {
  full: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  h1:   [1, 2, 3, 4, 5, 6],
  h2:   [7, 8, 9, 10, 11, 12],
  q1:   [1, 2, 3],
  q2:   [4, 5, 6],
  q3:   [7, 8, 9],
  q4:   [10, 11, 12],
};

const QUARTER_LABELS: Record<'q1' | 'q2' | 'q3' | 'q4', string> = {
  q1: 'Q1 (1~3월)',
  q2: 'Q2 (4~6월)',
  q3: 'Q3 (7~9월)',
  q4: 'Q4 (10~12월)',
};

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
  const [viewMode, setViewMode] = useState<ViewMode>('full');
  const [quarterMenuAnchor, setQuarterMenuAnchor] = useState<null | HTMLElement>(null);
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

  const visibleMonths = VIEW_MONTHS[viewMode];
  const isQuarterMode = ['q1', 'q2', 'q3', 'q4'].includes(viewMode);

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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          📆 연간 업무 플래너
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {/* 뷰 모드 버튼 그룹 */}
          <ButtonGroup size="small" variant="outlined" sx={{ '& .MuiButton-root': { borderColor: 'divider', fontWeight: 600, fontSize: '0.78rem', px: 1.5 } }}>
            {(['full', 'h1', 'h2'] as const).map((mode) => (
              <Button
                key={mode}
                onClick={() => setViewMode(mode)}
                sx={{
                  color: viewMode === mode ? 'primary.contrastText' : 'text.secondary',
                  bgcolor: viewMode === mode ? 'primary.main' : 'transparent',
                  '&:hover': { bgcolor: viewMode === mode ? 'primary.dark' : 'action.hover' },
                }}
              >
                {mode === 'full' ? '전체' : mode === 'h1' ? '상반기' : '하반기'}
              </Button>
            ))}
            <Button
              onClick={(e) => setQuarterMenuAnchor(e.currentTarget)}
              endIcon={<ArrowDropDownIcon />}
              sx={{
                color: isQuarterMode ? 'primary.contrastText' : 'text.secondary',
                bgcolor: isQuarterMode ? 'primary.main' : 'transparent',
                '&:hover': { bgcolor: isQuarterMode ? 'primary.dark' : 'action.hover' },
              }}
            >
              {isQuarterMode ? viewMode.toUpperCase() : '분기'}
            </Button>
          </ButtonGroup>
          <Menu
            anchorEl={quarterMenuAnchor}
            open={Boolean(quarterMenuAnchor)}
            onClose={() => setQuarterMenuAnchor(null)}
            slotProps={{ paper: { elevation: 2, sx: { mt: 0.5 } } }}
          >
            {(['q1', 'q2', 'q3', 'q4'] as const).map((q) => (
              <MenuItem
                key={q}
                selected={viewMode === q}
                onClick={() => { setViewMode(q); setQuarterMenuAnchor(null); }}
                sx={{ fontSize: '0.85rem' }}
              >
                {QUARTER_LABELS[q]}
              </MenuItem>
            ))}
          </Menu>

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
            {visibleMonths.map((month) => (
              <col key={month} style={{ width: colWidths[month - 1] }} />
            ))}
          </colgroup>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <TableHeader colWidths={colWidths} onResize={handleResize} visibleMonths={visibleMonths} />
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                entries={entriesMap.get(cat.id) ?? new Map()}
                year={year}
                onError={onError}
                visibleMonths={visibleMonths}
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
