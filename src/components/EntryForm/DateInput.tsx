import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import type { DateType } from '../../types';

interface DateInputProps {
  dateType: DateType;
  onDateTypeChange: (type: DateType) => void;
  dateValue: string;
  onDateValueChange: (v: string) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
}

export function DateInput({
  dateType, onDateTypeChange,
  dateValue, onDateValueChange,
  dateFrom, onDateFromChange,
  dateTo, onDateToChange,
}: DateInputProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <RadioGroup
        row
        value={dateType}
        onChange={(e) => onDateTypeChange(e.target.value as DateType)}
      >
        <FormControlLabel value="single" control={<Radio size="small" />} label="단일 날짜" />
        <FormControlLabel value="range" control={<Radio size="small" />} label="기간" />
      </RadioGroup>
      {dateType === 'single' ? (
        <TextField
          size="small"
          fullWidth
          value={dateValue}
          onChange={(e) => onDateValueChange(e.target.value)}
          placeholder="예: 1/6"
        />
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            placeholder="예: 1/8"
            sx={{ width: 110 }}
          />
          <span>~</span>
          <TextField
            size="small"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            placeholder="예: 1/12"
            sx={{ width: 110 }}
          />
        </Box>
      )}
    </Box>
  );
}
