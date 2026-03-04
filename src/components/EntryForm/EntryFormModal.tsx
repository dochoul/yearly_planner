import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import type { EntryColor, DateType, WorkEntry } from '../../types';
import { ColorPicker } from './ColorPicker';
import { DateInput } from './DateInput';
import { useAddWorkEntry, useUpdateWorkEntry } from '../../hooks/useWorkEntries';

interface EntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  month: number;
  year: number;
  editingEntry?: WorkEntry;
  onError: (msg: string) => void;
}

export function EntryFormModal({
  isOpen, onClose, categoryId, month, year, editingEntry, onError,
}: EntryFormModalProps) {
  const [color, setColor] = useState<EntryColor>(editingEntry?.color ?? 'blue');
  const [text, setText] = useState(editingEntry?.text ?? '');
  const [dateType, setDateType] = useState<DateType>(editingEntry?.date_type ?? 'single');
  const [dateValue, setDateValue] = useState(editingEntry?.date_value ?? '');
  const [dateFrom, setDateFrom] = useState(editingEntry?.date_from ?? '');
  const [dateTo, setDateTo] = useState(editingEntry?.date_to ?? '');

  const addEntry = useAddWorkEntry(year);
  const updateEntry = useUpdateWorkEntry(year);

  const isValid = text.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const payload = {
      category_id: categoryId,
      year,
      month,
      color,
      text: text.trim(),
      date_type: dateType,
      date_value: dateType === 'single' ? (dateValue.trim() || null) : null,
      date_from: dateType === 'range' ? (dateFrom.trim() || null) : null,
      date_to: dateType === 'range' ? (dateTo.trim() || null) : null,
      highlight: dateType === 'range',
    };

    if (editingEntry) {
      updateEntry.mutate(
        { id: editingEntry.id, ...payload },
        {
          onSuccess: onClose,
          onError: () => onError('업무 항목 수정에 실패했습니다.'),
        }
      );
    } else {
      addEntry.mutate(payload, {
        onSuccess: onClose,
        onError: () => onError('업무 항목 추가에 실패했습니다.'),
      });
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        {editingEntry ? '업무 수정' : '업무 추가'}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              색상
            </Typography>
            <ColorPicker value={color} onChange={setColor} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              업무 내용
            </Typography>
            <TextField
              value={text}
              onChange={(e) => setText(e.target.value)}
              inputProps={{ maxLength: 200 }}
              multiline
              rows={2}
              placeholder="업무 내용을 입력하세요"
              fullWidth
              size="small"
              required
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              날짜
            </Typography>
            <DateInput
              year={year}
              dateType={dateType}
              onDateTypeChange={setDateType}
              dateValue={dateValue}
              onDateValueChange={setDateValue}
              dateFrom={dateFrom}
              onDateFromChange={setDateFrom}
              dateTo={dateTo}
              onDateToChange={setDateTo}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={onClose} variant="outlined" size="small">
            취소
          </Button>
          <Button type="submit" variant="contained" size="small" disabled={!isValid}>
            저장
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
