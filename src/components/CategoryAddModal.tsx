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
import { useAddCategory } from '../hooks/useCategories';

interface CategoryAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: number;
  onError: (msg: string) => void;
}

export function CategoryAddModal({ isOpen, onClose, order, onError }: CategoryAddModalProps) {
  const [name, setName] = useState('');
  const addCategory = useAddCategory();

  const isValid = name.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    addCategory.mutate(
      { name: trimmed, order },
      {
        onSuccess: () => {
          setName('');
          onClose();
        },
        onError: () => onError('카테고리 추가에 실패했습니다.'),
      }
    );
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        카테고리 추가
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              카테고리 이름 *
            </Typography>
            <TextField
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="카테고리 이름을 입력하세요"
              fullWidth
              size="small"
              autoFocus
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={handleClose} size="small">
            취소
          </Button>
          <Button type="submit" variant="contained" size="small" disabled={!isValid}>
            추가
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
