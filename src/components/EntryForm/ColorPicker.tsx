import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { EntryColor } from '../../types';
import { ENTRY_COLORS } from '../../constants';

interface ColorPickerProps {
  value: EntryColor;
  onChange: (color: EntryColor) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {ENTRY_COLORS.map((c) => (
        <ButtonBase
          key={c.value}
          onClick={() => onChange(c.value)}
          title={c.label}
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: c.hex,
            border: value === c.value ? '2.5px solid #333' : '2.5px solid transparent',
            transform: value === c.value ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.15s, border-color 0.15s',
            outline: '1px solid rgba(0,0,0,0.12)',
          }}
        />
      ))}
    </Box>
  );
}
