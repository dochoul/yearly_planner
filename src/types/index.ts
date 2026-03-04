export type EntryColor = 'red' | 'orange' | 'green' | 'blue';
export type DateType = 'single' | 'range';

export interface Category {
  id: string;
  name: string;
  order: number;
  created_at: string;
}

export interface WorkEntry {
  id: string;
  category_id: string;
  year: number;
  month: number;
  color: EntryColor;
  text: string;
  date_type: DateType;
  date_value: string | null;
  date_from: string | null;
  date_to: string | null;
  highlight: boolean;
  created_at: string;
}

export type NewCategory = Pick<Category, 'name' | 'order'>;
export type NewWorkEntry = Omit<WorkEntry, 'id' | 'created_at'>;
export type UpdateWorkEntry = Partial<NewWorkEntry> & { id: string };
