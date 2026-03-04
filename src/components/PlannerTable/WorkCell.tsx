import { useState } from 'react';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { WorkEntry } from '../../types';
import { HIGHLIGHT_BG } from '../../constants';
import { EntryFormModal } from '../EntryForm/EntryFormModal';
import { useDeleteWorkEntry } from '../../hooks/useWorkEntries';

const COLOR_DOT: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  orange: '#f97316',
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

  const handleDelete = (id: string) => {
    if (!window.confirm('이 업무 항목을 삭제할까요?')) return;
    deleteEntry.mutate(id, {
      onError: () => onError('업무 항목 삭제에 실패했습니다.'),
    });
  };

  const formatDate = (entry: WorkEntry) => {
    if (entry.date_type === 'single') return entry.date_value ? `(${entry.date_value})` : '';
    return entry.date_from && entry.date_to ? `(${entry.date_from}~${entry.date_to})` : '';
  };

  return (
    <>
      <TableCell sx={{ verticalAlign: 'top', px: 1, py: 0.75 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {entries.map((entry) => (
            <Box
              key={entry.id}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 0.5,
                '&:hover .entry-actions': { visibility: 'visible' },
              }}
            >
              <span
                style={{
                  marginTop: 3,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  flexShrink: 0,
                  backgroundColor: COLOR_DOT[entry.color],
                  display: 'inline-block',
                }}
              />
              <Box sx={{ flex: 1, lineHeight: 1.3 }}>
                <Typography variant="caption">{entry.text}</Typography>
                {' '}
                <span
                  className={entry.highlight ? HIGHLIGHT_BG[entry.color] : ''}
                  style={!entry.highlight ? { color: '#9ca3af', fontSize: '0.75rem' } : { fontSize: '0.75rem', borderRadius: 2, padding: '0 2px' }}
                >
                  {formatDate(entry)}
                </span>
              </Box>
              <Box
                className="entry-actions"
                sx={{ visibility: 'hidden', display: 'flex', gap: 0.25, flexShrink: 0 }}
              >
                <IconButton
                  size="small"
                  onClick={() => setEditingEntry(entry)}
                  sx={{ p: 0.25, color: 'text.disabled', '&:hover': { color: 'primary.main' } }}
                >
                  <EditIcon sx={{ fontSize: 11 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(entry.id)}
                  sx={{ p: 0.25, color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                >
                  <DeleteIcon sx={{ fontSize: 11 }} />
                </IconButton>
              </Box>
            </Box>
          ))}

          {/* 항상 고정된 추가 버튼 */}
          <Typography
            variant="caption"
            onClick={() => setIsAddOpen(true)}
            sx={{
              color: 'text.disabled',
              cursor: 'pointer',
              userSelect: 'none',
              mt: entries.length > 0 ? 0.25 : 0,
              '&:hover': { color: 'primary.main' },
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
