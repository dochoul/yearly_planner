import Box from '@mui/material/Box';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import type { DateType } from '../../types';

interface DateInputProps {
  year: number;
  dateType: DateType;
  onDateTypeChange: (type: DateType) => void;
  dateValue: string;
  onDateValueChange: (v: string) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
}

// "M/D" 문자열 → Dayjs (해당 연도 기준)
function parseMD(value: string, year: number): Dayjs | null {
  if (!value) return null;
  const [m, d] = value.split('/').map(Number);
  if (!m || !d) return null;
  return dayjs(`${year}-${m}-${d}`);
}

// Dayjs → "M/D" 문자열
function formatMD(date: Dayjs | null): string {
  if (!date || !date.isValid()) return '';
  return `${date.month() + 1}/${date.date()}`;
}

const pickerSlotProps = {
  textField: { size: 'small' as const },
};

export function DateInput({
  year,
  dateType, onDateTypeChange,
  dateValue, onDateValueChange,
  dateFrom, onDateFromChange,
  dateTo, onDateToChange,
}: DateInputProps) {
  const minDate = dayjs(`${year}-01-01`);
  const maxDate = dayjs(`${year}-12-31`);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <RadioGroup
        row
        value={dateType}
        onChange={(e) => onDateTypeChange(e.target.value as DateType)}
      >
        <FormControlLabel value="single" control={<Radio size="small" />} label="단일 날짜" />
        <FormControlLabel value="range" control={<Radio size="small" />} label="기간" />
      </RadioGroup>

      {dateType === 'single' ? (
        <Box sx={{ width: '50%' }}>
          <DatePicker
            value={parseMD(dateValue, year)}
            onChange={(date) => onDateValueChange(formatMD(date))}
            minDate={minDate}
            maxDate={maxDate}
            format="M월 D일"
            slotProps={pickerSlotProps}
          />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DatePicker
            value={parseMD(dateFrom, year)}
            onChange={(date) => onDateFromChange(formatMD(date))}
            minDate={minDate}
            maxDate={maxDate}
            format="M월 D일"
            slotProps={pickerSlotProps}
          />
          <span style={{ flexShrink: 0, color: '#9ca3af' }}>~</span>
          <DatePicker
            value={parseMD(dateTo, year)}
            onChange={(date) => onDateToChange(formatMD(date))}
            minDate={minDate}
            maxDate={maxDate}
            format="M월 D일"
            slotProps={pickerSlotProps}
          />
        </Box>
      )}
    </Box>
  );
}
