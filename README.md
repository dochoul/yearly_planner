# 연간 업무 플래너

업무 카테고리별로 연간 일정을 관리하는 웹 애플리케이션입니다.

## 기능

### 업무 관리
- 월별 업무 항목 추가 / 수정 / 삭제
- 단일 날짜 또는 기간(범위) 설정
- 하이라이트 표시
- 6가지 색상 태그로 업무 유형 구분

| 색상 | 용도 |
|------|------|
| 빨강 | 오류/장애 |
| 주황 | 이슈 |
| 초록 | 공지/EMS |
| 파랑 | 오픈/개편/기능추가 |
| 회색 | 종료 |
| 진회색 | 팀 내부 이슈 |

### 카테고리 관리
- 카테고리 추가 / 이름 수정 / 삭제
- 카테고리 셀에 마우스를 올리면 편집 버튼 표시
- 카테고리 순서 유지

### UI/UX
- 라이트 모드 / 다크 모드 토글 (선택값 localStorage 저장)
- 월별 컬럼 너비 조절 (드래그 리사이즈, localStorage 저장)
- 연도 선택

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript |
| 빌드 | Vite 6 |
| UI | MUI (Material UI) v7 |
| 날짜 | dayjs + MUI X Date Pickers |
| 서버 상태 | TanStack React Query v5 |
| 백엔드 | Supabase (PostgreSQL + RLS) |
| 폰트 | Pretendard |

## 프로젝트 구조

```
src/
├── components/
│   ├── PlannerTable/
│   │   ├── PlannerTable.tsx   # 메인 테이블 + 헤더 영역
│   │   ├── TableHeader.tsx    # 월 헤더 + 컬럼 리사이즈
│   │   ├── CategoryRow.tsx    # 카테고리 행
│   │   └── WorkCell.tsx       # 월별 업무 셀
│   ├── EntryForm/
│   │   ├── EntryFormModal.tsx # 업무 추가/수정 모달
│   │   ├── ColorPicker.tsx    # 색상 선택
│   │   └── DateInput.tsx      # 날짜 입력
│   ├── CategoryAddModal.tsx   # 카테고리 추가 모달
│   ├── CategoryEditModal.tsx  # 카테고리 수정 모달
│   ├── YearSelector.tsx       # 연도 선택
│   └── Toast.tsx              # 알림 토스트
├── hooks/
│   ├── useCategories.ts       # 카테고리 CRUD
│   └── useWorkEntries.ts      # 업무 항목 CRUD
├── lib/
│   └── supabase.ts            # Supabase 클라이언트
├── types/index.ts             # 타입 정의
├── constants/index.ts         # 색상, 월 상수
└── App.tsx                    # 테마 (라이트/다크) + 루트
```

## 시작하기

### 환경 변수 설정

`.env` 파일을 생성하고 Supabase 프로젝트 정보를 입력합니다.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### DB 스키마 적용

Supabase SQL Editor에서 `supabase/schema.sql`을 실행합니다.

### 개발 서버 실행

```bash
npm install
npm run dev
```

### 빌드

```bash
npm run build
```
