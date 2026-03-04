import { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import type { Category, WorkEntry } from '../../types';
import { CategoryEditModal } from '../CategoryEditModal';
import { WorkCell } from './WorkCell';

interface CategoryRowProps {
  category: Category;
  entries: Map<number, WorkEntry[]>;
  year: number;
  onError: (msg: string) => void;
}

export function CategoryRow({ category, entries, year, onError }: CategoryRowProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '&:hover .edit-btn': { visibility: 'visible' } }}>
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
            <Typography variant="body2" fontWeight={500} sx={{ flex: 1, minWidth: 0 }}>
              {category.name}
            </Typography>
            <IconButton
              className="edit-btn"
              onClick={() => setModalOpen(true)}
              size="small"
              sx={{
                visibility: 'hidden',
                ml: 'auto',
                flexShrink: 0,
                p: 0.25,
                color: 'text.disabled',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <EditIcon sx={{ fontSize: 14 }} />
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
      <CategoryEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categoryId={category.id}
        categoryName={category.name}
        onError={onError}
      />
    </>
  );
}
