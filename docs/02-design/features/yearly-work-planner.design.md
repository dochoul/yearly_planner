# Design: 연간 업무 플래너 (Yearly Work Planner)

**작성일**: 2026-03-04
**Feature ID**: yearly-work-planner
**참조 Plan**: `docs/01-plan/features/yearly-work-planner.plan.md`
**Status**: Design

---

## 1. 프로젝트 디렉토리 구조

```
yearly-planner/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx                    # 앱 진입점, QueryClientProvider 설정
│   ├── App.tsx                     # 루트 컴포넌트, 연도 상태 관리
│   │
│   ├── lib/
│   │   └── supabase.ts             # Supabase 클라이언트 초기화
│   │
│   ├── types/
│   │   └── index.ts                # Category, WorkEntry 타입 정의
│   │
│   ├── hooks/                      # TanStack Query 커스텀 훅
│   │   ├── useCategories.ts        # 카테고리 CRUD 훅
│   │   └── useWorkEntries.ts       # 업무 항목 CRUD 훅
│   │
│   ├── components/
│   │   ├── PlannerTable/           # 메인 테이블 영역
│   │   │   ├── PlannerTable.tsx    # 테이블 전체 컨테이너
│   │   │   ├── TableHeader.tsx     # 월 헤더 행 (1월~12월)
│   │   │   ├── CategoryRow.tsx     # 카테고리 행 (행 단위)
│   │   │   └── WorkCell.tsx        # 업무 기록 셀 (월 × 카테고리)
│   │   │
│   │   ├── EntryForm/              # 업무 항목 입력 폼
│   │   │   ├── EntryFormModal.tsx  # 모달 래퍼
│   │   │   ├── ColorPicker.tsx     # 도트 색상 선택
│   │   │   └── DateInput.tsx       # 날짜/기간 입력
│   │   │
│   │   ├── CategoryNameEditor.tsx  # 카테고리 이름 인라인 편집
│   │   ├── YearSelector.tsx        # 연도 선택 드롭다운
│   │   └── Toast.tsx               # 에러/성공 토스트 메시지
│   │
│   └── constants/
│       └── index.ts                # MONTHS, COLORS 상수
│
├── .env.local                      # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 2. Supabase DB 스키마 (SQL)

```sql
-- categories 테이블
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  "order"    integer not null default 0,
  created_at timestamptz not null default now()
);

-- work_entries 테이블
create table public.work_entries (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  year        integer not null,
  month       integer not null check (month between 1 and 12),
  color       text not null default 'blue'
                check (color in ('red', 'blue', 'green', 'orange')),
  text        text not null,
  date_type   text not null default 'single'
                check (date_type in ('single', 'range')),
  date_value  text,         -- 단일 날짜 (예: "1/6")
  date_from   text,         -- 기간 시작 (예: "1/8")
  date_to     text,         -- 기간 종료 (예: "1/12")
  highlight   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- 인덱스: 연도+월 조회 최적화
create index idx_work_entries_year_month on public.work_entries(year, month);
create index idx_work_entries_category_id on public.work_entries(category_id);

-- RLS 비활성화 (개인 도구, 인증 없음)
alter table public.categories enable row level security;
alter table public.work_entries enable row level security;

create policy "allow all" on public.categories for all using (true) with check (true);
create policy "allow all" on public.work_entries for all using (true) with check (true);
```

---

## 3. TypeScript 타입 정의 (`src/types/index.ts`)

```typescript
export type EntryColor = 'red' | 'blue' | 'green' | 'orange';
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
  date_value: string | null;  // date_type === 'single'
  date_from: string | null;   // date_type === 'range'
  date_to: string | null;     // date_type === 'range'
  highlight: boolean;
  created_at: string;
}

export type NewCategory = Pick<Category, 'name' | 'order'>;
export type NewWorkEntry = Omit<WorkEntry, 'id' | 'created_at'>;
export type UpdateWorkEntry = Partial<NewWorkEntry> & { id: string };
```

---

## 4. 상수 정의 (`src/constants/index.ts`)

```typescript
export const MONTHS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
] as const;

export const ENTRY_COLORS: { value: EntryColor; label: string; hex: string }[] = [
  { value: 'red',    label: '빨강', hex: '#ef4444' },
  { value: 'blue',   label: '파랑', hex: '#3b82f6' },
  { value: 'green',  label: '초록', hex: '#22c55e' },
  { value: 'orange', label: '주황', hex: '#f97316' },
];

export const HIGHLIGHT_BG: Record<EntryColor, string> = {
  red:    'bg-red-100',
  blue:   'bg-blue-100',
  green:  'bg-green-100',
  orange: 'bg-orange-100',
};
```

---

## 5. Supabase 클라이언트 (`src/lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 6. TanStack Query 훅 설계

### 6.1 카테고리 훅 (`src/hooks/useCategories.ts`)

```typescript
// Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
};

// 카테고리 전체 조회
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order');
      if (error) throw error;
      return data as Category[];
    },
  });
}

// 카테고리 추가
export function useAddCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCategory: NewCategory) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(newCategory)
        .select()
        .single();
      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

// 카테고리 이름 수정
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey: categoryKeys.all });
      const previous = queryClient.getQueryData<Category[]>(categoryKeys.all);
      queryClient.setQueryData<Category[]>(categoryKeys.all, (old = []) =>
        old.map((c) => (c.id === id ? { ...c, name } : c))
      );
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(categoryKeys.all, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

// 카테고리 삭제 (연관 work_entries cascade 삭제)
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: entryKeys.all });
    },
  });
}
```

### 6.2 업무 항목 훅 (`src/hooks/useWorkEntries.ts`)

```typescript
// Query Keys
export const entryKeys = {
  all: ['entries'] as const,
  byYear: (year: number) => ['entries', year] as const,
};

// 연도별 업무 항목 전체 조회
export function useWorkEntries(year: number) {
  return useQuery({
    queryKey: entryKeys.byYear(year),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_entries')
        .select('*')
        .eq('year', year)
        .order('created_at');
      if (error) throw error;
      return data as WorkEntry[];
    },
  });
}

// 업무 항목 추가 (Optimistic Update)
export function useAddWorkEntry(year: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newEntry: NewWorkEntry) => {
      const { data, error } = await supabase
        .from('work_entries')
        .insert(newEntry)
        .select()
        .single();
      if (error) throw error;
      return data as WorkEntry;
    },
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: entryKeys.byYear(year) });
      const previous = queryClient.getQueryData<WorkEntry[]>(entryKeys.byYear(year));
      const optimistic: WorkEntry = {
        ...newEntry,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<WorkEntry[]>(entryKeys.byYear(year), (old = []) =>
        [...old, optimistic]
      );
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(entryKeys.byYear(year), context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: entryKeys.byYear(year) }),
  });
}

// 업무 항목 수정
export function useUpdateWorkEntry(year: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateWorkEntry) => {
      const { error } = await supabase
        .from('work_entries')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: entryKeys.byYear(year) });
      const previous = queryClient.getQueryData<WorkEntry[]>(entryKeys.byYear(year));
      queryClient.setQueryData<WorkEntry[]>(entryKeys.byYear(year), (old = []) =>
        old.map((e) => (e.id === id ? { ...e, ...updates } : e))
      );
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(entryKeys.byYear(year), context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: entryKeys.byYear(year) }),
  });
}

// 업무 항목 삭제
export function useDeleteWorkEntry(year: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('work_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: entryKeys.byYear(year) });
      const previous = queryClient.getQueryData<WorkEntry[]>(entryKeys.byYear(year));
      queryClient.setQueryData<WorkEntry[]>(entryKeys.byYear(year), (old = []) =>
        old.filter((e) => e.id !== id)
      );
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(entryKeys.byYear(year), context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: entryKeys.byYear(year) }),
  });
}
```

---

## 7. 컴포넌트 설계

### 7.1 앱 진입점 (`src/main.tsx`)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 },   // 1분 캐시
    mutations: { retry: 1 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

### 7.2 App 컴포넌트 (`src/App.tsx`)

| 상태 | 타입 | 설명 |
|------|------|------|
| `year` | `number` | 현재 선택된 연도 (기본: 현재 연도) |
| `toast` | `{ message: string; type: 'error' \| 'success' } \| null` | 토스트 상태 |

```
App
├── YearSelector          (year 상태 변경)
├── PlannerTable          (year 전달)
└── Toast                 (toast 상태 표시)
```

### 7.3 PlannerTable 컴포넌트

**Props**
```typescript
interface PlannerTableProps {
  year: number;
}
```

**내부 로직**
- `useCategories()` → 카테고리 목록
- `useWorkEntries(year)` → 해당 연도 업무 항목
- 업무 항목을 `Map<categoryId, Map<month, WorkEntry[]>>` 구조로 인덱싱하여 렌더링 최적화

**레이아웃**
```
<div class="overflow-auto">               ← 가로+세로 스크롤 컨테이너
  <table>
    <thead class="sticky top-0">          ← 헤더 행 고정
      <TableHeader />
    </thead>
    <tbody>
      {categories.map(cat =>
        <CategoryRow
          key={cat.id}
          category={cat}
          entries={entriesMap.get(cat.id)}
          year={year}
        />
      )}
      <AddCategoryRow />                  ← 마지막 행: 카테고리 추가
    </tbody>
  </table>
</div>
```

**CSS 핵심 (sticky 컬럼)**
```css
/* 첫 번째 컬럼 고정 */
th:first-child, td:first-child {
  position: sticky;
  left: 0;
  z-index: 10;
  background: white;
}
/* 헤더 행의 첫 셀은 z-index 높게 */
thead th:first-child {
  z-index: 20;
}
```

### 7.4 CategoryRow 컴포넌트

**Props**
```typescript
interface CategoryRowProps {
  category: Category;
  entries: Map<number, WorkEntry[]>;  // month → entries
  year: number;
}
```

**포함 요소**
- 첫 번째 `<td>`: `CategoryNameEditor` + 삭제 버튼
- 나머지 12개 `<td>`: `WorkCell` (각 월)

### 7.5 WorkCell 컴포넌트

**Props**
```typescript
interface WorkCellProps {
  categoryId: string;
  month: number;
  year: number;
  entries: WorkEntry[];
}
```

**내부 상태**
- `isModalOpen: boolean` — 업무 추가 모달 열림 여부
- `editingEntry: WorkEntry | null` — 편집 중인 항목

**렌더링**
```
<td onClick={() => openAddModal()}>
  {entries.map(entry =>
    <EntryChip
      key={entry.id}
      entry={entry}
      onEdit={() => openEditModal(entry)}
      onDelete={() => deleteEntry(entry.id)}
    />
  )}
  <span class="add-hint">+ 추가</span>   ← hover 시 표시
</td>
```

**EntryChip 표시 형식**
```
● 공공메일 발송 불가 (1/6)
  ↑color dot  ↑text      ↑date (highlight 시 배경색)
```

### 7.6 EntryFormModal 컴포넌트

**Props**
```typescript
interface EntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  month: number;
  year: number;
  editingEntry?: WorkEntry;   // 편집 시 기본값
}
```

**폼 필드**
| 필드 | 컴포넌트 | 유효성 |
|------|----------|--------|
| 색상 | `ColorPicker` | 필수 (기본: blue) |
| 업무 내용 | `<textarea>` | 필수, 최대 200자 |
| 날짜 유형 | `<radio>` single/range | 필수 |
| 날짜 값 | `DateInput` | 필수, M/D 형식 |

**DateInput 규칙**
- `single`: 텍스트 입력, placeholder `예: 1/6`
- `range`: 두 개 입력 `시작` `~` `종료`, placeholder `예: 1/8 ~ 1/12`
- `highlight`: range 선택 시 자동 true (toggle 가능)

### 7.7 CategoryNameEditor 컴포넌트

**동작**
1. 기본: `<span>카테고리명</span>` 표시
2. 클릭 시: `<input>` 인라인 전환
3. Enter 또는 blur 시: `useUpdateCategory()` 호출 (Optimistic Update)
4. Escape: 원래 이름으로 복원

### 7.8 YearSelector 컴포넌트

**Props**
```typescript
interface YearSelectorProps {
  year: number;
  onChange: (year: number) => void;
}
```

- 현재 연도 ± 3년 선택 가능 (예: 2023~2029)
- `<select>` 드롭다운

---

## 8. 에러 처리 전략

| 시나리오 | 처리 방식 |
|----------|-----------|
| 네트워크 오류 (CRUD 실패) | Optimistic Update 롤백 + 에러 토스트 3초 표시 |
| Supabase 연결 실패 (초기 로드) | 로딩 스피너 → 에러 메시지 + 재시도 버튼 |
| 카테고리 삭제 확인 | `window.confirm` 또는 인라인 확인 버튼 (2단계) |
| 빈 텍스트 저장 시도 | 폼 유효성 검사로 저장 버튼 비활성화 |

---

## 9. 구현 순서 (Do Phase 체크리스트)

```
[ ] M1: 프로젝트 초기화
    [ ] npm create vite@latest -- --template react-ts
    [ ] tailwindcss, @tanstack/react-query, @supabase/supabase-js 설치
    [ ] .env.local 설정

[ ] M2: Supabase 연동
    [ ] Supabase 프로젝트 생성 + SQL 스키마 실행
    [ ] src/lib/supabase.ts 작성
    [ ] src/types/index.ts 작성

[ ] M3: TanStack Query 훅
    [ ] useCategories.ts (CRUD 전체)
    [ ] useWorkEntries.ts (CRUD 전체)

[ ] M4: 테이블 레이아웃
    [ ] PlannerTable.tsx (sticky 헤더/컬럼)
    [ ] TableHeader.tsx (1월~12월)
    [ ] CategoryRow.tsx (행 구조)
    [ ] WorkCell.tsx (셀 기본)

[ ] M5: 카테고리 관리
    [ ] CategoryNameEditor.tsx (인라인 편집)
    [ ] 카테고리 추가/삭제

[ ] M6: 업무 항목 관리
    [ ] EntryChip 표시 (도트 + 텍스트 + 날짜)
    [ ] EntryFormModal.tsx
    [ ] ColorPicker.tsx
    [ ] DateInput.tsx
    [ ] 날짜 하이라이트 처리

[ ] M7: 에러 처리
    [ ] Toast.tsx
    [ ] useMutation onError 핸들러 연결
    [ ] 초기 로딩 상태 UI

[ ] M8: (옵션) 드래그 앤 드롭
    [ ] @dnd-kit/core 설치
    [ ] CategoryRow 순서 변경
    [ ] categories.order 업데이트
```

---

## 10. 환경 변수

```bash
# .env.local
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

*설계서 작성: Claude Code (PDCA Design Phase)*
*참조: yearly-work-planner.plan.md*
