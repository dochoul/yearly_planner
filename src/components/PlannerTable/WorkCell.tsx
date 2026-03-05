import { useState } from 'react';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import type { WorkEntry } from '../../types';
import { EntryFormModal } from '../EntryForm/EntryFormModal';
import { useDeleteWorkEntry } from '../../hooks/useWorkEntries';

const COLOR_BG: Record<string, string> = {
  red:    '#ef4444',
  orange: '#f59e0b',
  green:  '#22c55e',
  blue:   '#3b82f6',
  gray:   '#9ca3af',
  dark:   '#374151',
};

interface WorkCellProps {
  categoryId: string;
  month: number;
  year: number;
  entries: WorkEntry[];
  onError: (msg: string) => void;
}

export function WorkCell({ categoryId, month, year, entries, onError }: WorkCellProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);
  const deleteEntry = useDeleteWorkEntry(year);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('이 업무 항목을 삭제할까요?')) return;
    deleteEntry.mutate(id, {
      onError: () => onError('업무 항목 삭제에 실패했습니다.'),
    });
  };

  return (
    <>
      <TableCell sx={{ verticalAlign: 'middle', px: 1.5, py: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {entries.map((entry) => (
            <Box
              key={entry.id}
              onClick={() => setEditingEntry(entry)}
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                bgcolor: COLOR_BG[entry.color],
                borderRadius: '6px',
                px: 1,
                py: 0.5,
                cursor: 'pointer',
                overflow: 'hidden',
                '&:hover .delete-btn': { opacity: 1 },
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.65)',
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.4,
                }}
              >
                {entry.text}
              </Typography>
              <IconButton
                className="delete-btn"
                size="small"
                onClick={(e) => handleDelete(e, entry.id)}
                sx={{
                  opacity: 0,
                  transition: 'opacity 0.1s',
                  p: 0.25,
                  color: 'rgba(255,255,255,0.85)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.2)', color: 'white' },
                }}
              >
                <CloseIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Box>
          ))}

          <Typography
            variant="caption"
            onClick={() => setIsAddOpen(true)}
            sx={{
              color: 'text.disabled',
              cursor: 'pointer',
              userSelect: 'none',
              textAlign: 'center',
              py: 0.25,
              '&:hover': { color: 'text.secondary' },
            }}
          >
            + 추가
          </Typography>
        </Box>
      </TableCell>

      {isAddOpen && (
        <EntryFormModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          categoryId={categoryId}
          month={month}
          year={year}
          onError={onError}
        />
      )}
      {editingEntry && (
        <EntryFormModal
          isOpen={!!editingEntry}
          onClose={() => setEditingEntry(null)}
          categoryId={categoryId}
          month={month}
          year={year}
          editingEntry={editingEntry}
          onError={onError}
        />
      )}
    </>
  );
}
