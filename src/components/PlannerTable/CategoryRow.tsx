import { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Category, WorkEntry } from '../../types';
import { CategoryEditModal } from '../CategoryEditModal';
import { WorkCell } from './WorkCell';

interface CategoryRowProps {
  category: Category;
  entries: Map<number, WorkEntry[]>;
  year: number;
  onError: (msg: string) => void;
  visibleMonths: number[];
}

export function CategoryRow({ category, entries, year, onError, visibleMonths }: CategoryRowProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });

  const rowStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <TableRow ref={setNodeRef} style={rowStyle} {...attributes} sx={{ '&:hover .drag-handle': { opacity: 1 } }}>
        <TableCell
          sx={{
            position: 'sticky',
            left: 0,
            zIndex: 10,
            bgcolor: 'background.paper',
            verticalAlign: 'top',
            py: 1,
            px: 1,
            '&:hover .edit-btn': { visibility: 'visible' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DragIndicatorIcon
              className="drag-handle"
              {...listeners}
              sx={{
                fontSize: 16,
                color: 'text.disabled',
                cursor: isDragging ? 'grabbing' : 'grab',
                opacity: 0,
                transition: 'opacity 0.15s',
                flexShrink: 0,
                touchAction: 'none',
              }}
            />
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
                p: 0.5,
                color: 'text.disabled',
                borderRadius: '50%',
                '&:hover': { color: 'primary.main', bgcolor: 'action.hover' },
              }}
            >
              <EditIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </TableCell>
        {visibleMonths.map((month) => (
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
