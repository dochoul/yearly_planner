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
import { useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
  onError: (msg: string) => void;
}

export function CategoryEditModal({
  isOpen, onClose, categoryId, categoryName, onError,
}: CategoryEditModalProps) {
  const [name, setName] = useState(categoryName);
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const isValid = name.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    updateCategory.mutate(
      { id: categoryId, name: trimmed },
      {
        onSuccess: onClose,
        onError: () => onError('카테고리 이름 변경에 실패했습니다.'),
      }
    );
  };

  const handleDelete = () => {
    if (!window.confirm(`"${categoryName}" 카테고리와 모든 업무 기록을 삭제할까요?`)) return;
    deleteCategory.mutate(categoryId, {
      onSuccess: onClose,
      onError: () => onError('카테고리 삭제에 실패했습니다.'),
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        카테고리 수정
        <IconButton
          onClick={onClose}
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
          <Button
            onClick={handleDelete}
            color="error"
            size="small"
            sx={{ mr: 'auto' }}
          >
            삭제
          </Button>
          <Button onClick={onClose} size="small">
            취소
          </Button>
          <Button type="submit" variant="contained" size="small" disabled={!isValid}>
            수정
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
