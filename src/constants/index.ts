import type { EntryColor } from '../types';

export const MONTHS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
] as const;

export const MONTH_EMOJIS = [
  '❄️', '💝', '🌸', '🌼', '🌿', '☔',
  '☀️', '🏖️', '🌾', '🍂', '🍁', '🎄',
] as const;

export const ENTRY_COLORS: { value: EntryColor; label: string; hex: string }[] = [
  { value: 'red',    label: '오류/장애',         hex: '#ef4444' },
  { value: 'yellow', label: '이슈',               hex: '#eab308' },
  { value: 'green',  label: '공지/EMS',           hex: '#22c55e' },
  { value: 'blue',   label: '오픈/개편/기능추가', hex: '#3b82f6' },
  { value: 'white',  label: '종료',               hex: '#ffffff' },
  { value: 'black',  label: '팀 내부 이슈',       hex: '#1c2b4b' },
];

export const HIGHLIGHT_BG: Record<EntryColor, string> = {
  red:    'bg-red-100',
  yellow: 'bg-yellow-100',
  green:  'bg-green-100',
  blue:   'bg-blue-100',
  white:  'bg-gray-100',
  black:  'bg-gray-200',
};
