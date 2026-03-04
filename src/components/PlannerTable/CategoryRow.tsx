import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Category, WorkEntry } from '../../types';
import { useDeleteCategory } from '../../hooks/useCategories';
import { CategoryNameEditor } from '../CategoryNameEditor';
import { WorkCell } from './WorkCell';

interface CategoryRowProps {
  category: Category;
  entries: Map<number, WorkEntry[]>;
  year: number;
  onError: (msg: string) => void;
}

export function CategoryRow({ category, entries, year, onError }: CategoryRowProps) {
  const deleteCategory = useDeleteCategory();

  const handleDelete = () => {
    if (!window.confirm(`"${category.name}" 카테고리와 모든 업무 기록을 삭제할까요?`)) return;
    deleteCategory.mutate(category.id, {
      onError: () => onError('카테고리 삭제에 실패했습니다.'),
    });
  };

  return (
    <TableRow sx={{ '&:hover .delete-btn': { visibility: 'visible' } }}>
      <TableCell
        sx={{
          position: 'sticky',
          left: 0,
          zIndex: 10,
          bgcolor: 'background.paper',
          verticalAlign: 'top',
          py: 1,
          px: 1.5,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <CategoryNameEditor
            categoryId={category.id}
            name={category.name}
            onError={onError}
          />
          <IconButton
            className="delete-btn"
            onClick={handleDelete}
            size="small"
            color="error"
            sx={{ visibility: 'hidden', p: 0.25, ml: 'auto', flexShrink: 0 }}
          >
            <DeleteIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </div>
      </TableCell>
      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
        <WorkCell
          key={month}
          categoryId={category.id}
          month={month}
          year={year}
          entries={entries.get(month) ?? []}
          onError={onError}
        />
      ))}
    </TableRow>
  );
}
