import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

interface YearSelectorProps {
  year: number;
  onChange: (year: number) => void;
}

export function YearSelector({ year, onChange }: YearSelectorProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  return (
    <Select
      size="small"
      value={year}
      onChange={(e: SelectChangeEvent<number>) => onChange(Number(e.target.value))}
      sx={{ fontSize: '0.875rem', fontWeight: 500 }}
    >
      {years.map((y) => (
        <MenuItem key={y} value={y}>{y}년</MenuItem>
      ))}
    </Select>
  );
}
