import { useState, useRef, useEffect } from 'react';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { useUpdateCategory } from '../hooks/useCategories';

interface CategoryNameEditorProps {
  categoryId: string;
  name: string;
  onError: (msg: string) => void;
}

export function CategoryNameEditor({ categoryId, name, onError }: CategoryNameEditorProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateCategory = useUpdateCategory();

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) { setValue(name); setEditing(false); return; }
    if (trimmed === name) { setEditing(false); return; }
    updateCategory.mutate(
      { id: categoryId, name: trimmed },
      {
        onError: () => { onError('카테고리 이름 변경에 실패했습니다.'); setValue(name); },
      }
    );
    setEditing(false);
  };

  if (editing) {
    return (
      <InputBase
        inputRef={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') { setValue(name); setEditing(false); }
        }}
        sx={{
          fontSize: '0.875rem',
          fontWeight: 500,
          width: '100%',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '4px',
          px: 0.75,
          py: 0.25,
        }}
      />
    );
  }

  return (
    <Typography
      variant="body2"
      fontWeight={500}
      onClick={() => setEditing(true)}
      sx={{ cursor: 'text' }}
    >
      {name}
    </Typography>
  );
}
