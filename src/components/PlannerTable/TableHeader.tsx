import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { MONTHS } from '../../constants';

interface TableHeaderProps {
  colWidths: number[];
  onResize: (index: number, width: number) => void;
}

export function TableHeader({ colWidths, onResize }: TableHeaderProps) {
  const startResize = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = colWidths[index];

    const onMouseMove = (e: MouseEvent) => {
      onResize(index, startWidth + (e.clientX - startX));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const headerCellSx = {
    bgcolor: '#dce8fb',
    color: '#1e3a5f',
    fontWeight: 700,
    fontSize: '0.85rem',
    letterSpacing: '0.02em',
    borderColor: '#c2d4ee',
    py: 1.25,
    position: 'sticky' as const,
    top: 0,
    zIndex: 20,
  };

  return (
    <TableRow>
      <TableCell
        sx={{
          ...headerCellSx,
          left: 0,
          zIndex: 30,
          textAlign: 'left',
        }}
      >
        업무 카테고리
      </TableCell>
      {MONTHS.map((month, i) => (
        <TableCell
          key={month}
          align="center"
          sx={{ ...headerCellSx, position: 'relative' as const }}
        >
          {month}
          <div
            onMouseDown={(e) => startResize(e, i)}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              height: '100%',
              width: 6,
              cursor: 'col-resize',
            }}
          />
        </TableCell>
      ))}
    </TableRow>
  );
}
