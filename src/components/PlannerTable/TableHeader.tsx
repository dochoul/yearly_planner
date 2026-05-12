import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { MONTHS } from '../../constants';

interface TableHeaderProps {
  colWidths: number[];
  onResize: (index: number, width: number) => void;
  visibleMonths: number[];
}

export function TableHeader({ colWidths, onResize, visibleMonths }: TableHeaderProps) {
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
    bgcolor: (theme: import('@mui/material').Theme) =>
      theme.palette.mode === 'light' ? '#dce8fb' : '#1a2a3a',
    color: (theme: import('@mui/material').Theme) =>
      theme.palette.mode === 'light' ? '#1e3a5f' : '#90caf9',
    fontWeight: 700,
    fontSize: '0.85rem',
    letterSpacing: '0.02em',
    borderColor: 'divider',
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
      {visibleMonths.map((month) => {
        const i = month - 1;
        return (
          <TableCell
            key={month}
            align="center"
            sx={{ ...headerCellSx, position: 'relative' as const }}
          >
            {MONTHS[i]}
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
        );
      })}
    </TableRow>
  );
}
