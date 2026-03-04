# Plan: 연간 업무 플래너 (Yearly Work Planner)

**작성일**: 2026-03-04
**수정일**: 2026-03-04 v2 (기술 스택 확정: React + TypeScript + Supabase + TanStack Query)
**Feature ID**: yearly-work-planner
**Status**: Plan

---

## 1. 개요 (Overview)

### 1.1 배경 및 목적
업무 담당자가 1년 치 업무 이력을 한 눈에 파악할 수 있는 테이블 기반의 업무 기록 화면을 제공한다.
월별(1~12월)로 컬럼을 구성하고, 업무 카테고리를 행으로 배치하여 어느 달에 어떤 업무를 수행했는지를 직관적으로 확인할 수 있게 한다.

### 1.2 대상 사용자
- 다양한 업무 영역을 관리하는 IT/총무/경영 지원 담당자
- 연간 업무 이력을 회고하거나 보고해야 하는 팀 단위 사용자

### 1.3 핵심 가치
- **가시성**: 12개월 × N개 업무 카테고리를 단일 화면에서 파악
- **유연성**: 사용자가 직접 업무 카테고리(행)를 추가/삭제/순서 변경 가능
- **경량 기록**: 각 셀에 간단한 텍스트 + 날짜로 업무 내용을 빠르게 메모

---

## 2. 레퍼런스 분석

### 2.1 화면 구조 (참고 이미지 기준)

| 구성 요소 | 설명 |
|-----------|------|
| 고정 헤더 행 | 1월 ~ 12월 컬럼 레이블 |
| 고정 첫 번째 컬럼 | 업무 카테고리 이름 (메일, 근무/인사, 경리회계 등) |
| 데이터 셀 | 컬러 도트 + 업무 설명 + 날짜 |
| 스크롤 | 가로 스크롤(월 컬럼 많을 경우) + 세로 스크롤(카테고리 많을 경우) |

### 2.2 셀(Cell) 기록 형식

```
● [업무 설명] (날짜 또는 기간)
```

- **도트 색상**: 업무 유형 또는 상태를 구분하는 색상 마커
  - 빨강(●): 장애/긴급 이슈
  - 파랑(●): 일반 완료 업무
  - 초록(●): 정상 처리/업데이트
  - 주황/노랑(●): 진행 중 또는 주의 필요
- **날짜 형식**: `(M/D)` 단일 날짜 또는 `(M/D~M/D)` 기간
- **강조 표시**: 기간이 긴 업무는 날짜에 하이라이트 처리 (예: `(1/14~2/3)` 주황 배경)

### 2.3 관찰된 업무 카테고리 (레퍼런스 기준)
- 메일
- 근무/인사
- 경리회계
- 전자결제
- 세금계산서
- 메신저
- 메시징
- 업무관리
- 드라이브
- AI 체킹

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 테이블 구조

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-01 | 가로 축: 1월~12월 고정 컬럼 표시 | Must |
| FR-02 | 세로 축: 사용자 정의 업무 카테고리 행 표시 | Must |
| FR-03 | 카테고리 행 추가 버튼 제공 (행 하단 또는 상단) | Must |
| FR-04 | 카테고리 이름 인라인 편집 (더블클릭 또는 클릭) | Must |
| FR-05 | 카테고리 행 삭제 (삭제 확인 다이얼로그 포함) | Should |
| FR-06 | 카테고리 행 순서 변경 (드래그 앤 드롭) | Could |

### 3.2 업무 기록 (셀 입력)

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-07 | 셀 클릭 시 업무 항목 추가 입력 모드 전환 | Must |
| FR-08 | 업무 항목: 도트 색상 선택 + 설명 텍스트 + 날짜/기간 입력 | Must |
| FR-09 | 하나의 셀에 여러 업무 항목 등록 가능 | Must |
| FR-10 | 업무 항목 수정 (클릭 후 편집) | Must |
| FR-11 | 업무 항목 삭제 | Must |
| FR-12 | 날짜 형식: 단일 날짜(M/D) 또는 기간(M/D~M/D) 선택 입력 | Must |
| FR-13 | 기간 업무의 경우 날짜 부분 강조 색상 처리 | Should |

### 3.3 데이터 저장 전략

> **확정**: Supabase (PostgreSQL)를 백엔드로 사용하여 서버에 영구 저장.
> 브라우저 초기화/캐시 삭제와 완전히 무관하며, 어느 기기에서나 동일 데이터 접근 가능.

#### 저장 방식: Supabase (PostgreSQL)

- 모든 데이터는 Supabase 클라우드 DB에 저장
- 네트워크 요청을 통해 CRUD 수행
- TanStack Query로 서버 상태 캐싱 및 동기화 관리
- 추후 인증(Auth) 연동 시 사용자별 데이터 분리 가능

#### 데이터 흐름

```
[사용자 액션]
    ↓
React 컴포넌트
    ↓
TanStack Query (useMutation / useQuery)
    ↓
Supabase JS Client
    ↓
Supabase PostgreSQL DB
```

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-14 | Supabase DB에 카테고리/업무 항목 CRUD | Must |
| FR-15 | TanStack Query로 서버 데이터 캐싱 및 자동 재조회 | Must |
| FR-16 | Optimistic Update: 저장 응답 전에 UI 즉시 반영 | Should |
| FR-17 | 연도 선택 기능 (기본값: 현재 연도) | Should |
| FR-18 | 네트워크 오류 시 에러 토스트 메시지 표시 및 롤백 | Must |

### 3.4 UI/UX

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-19 | 첫 번째 컬럼(카테고리) 고정, 가로 스크롤 시 유지 | Must |
| FR-20 | 헤더 행(월) 고정, 세로 스크롤 시 유지 | Must |
| FR-21 | 반응형 레이아웃 (최소 데스크톱 기준 1280px 이상) | Should |
| FR-22 | 컬럼 너비 조절 가능 | Could |

---

## 4. 비기능 요구사항 (Non-Functional Requirements)

| ID | 요구사항 |
|----|----------|
| NFR-01 | React + TypeScript + Vite 기반 SPA로 구현 |
| NFR-02 | 백엔드: Supabase (PostgreSQL, 별도 서버 구축 불필요) |
| NFR-03 | 데이터 관리: TanStack Query v5 (서버 상태 캐싱/동기화) |
| NFR-04 | 최신 Chrome/Safari/Firefox/Edge 모두 지원 |
| NFR-05 | 초기 페이지 로딩 3초 이내 (Vite 번들 최적화) |
| NFR-06 | 브라우저 로컬스토리지 미사용 (데이터 소실 방지) |

---

## 5. 화면 설계 (UI Sketch)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [연간 업무 플래너]  2026년 ▼                      [+ 카테고리 추가]  │
├──────────────┬──────┬──────┬──────┬──────┬───  ···  ───┬──────────┤
│  업무 카테고리 │  1월  │  2월  │  3월  │  4월  │           │  12월    │
├──────────────┼──────┼──────┼──────┼──────┼─── ···  ───┼──────────┤
│ 메일       ✏️ │ ●업무 │ ●업무 │      │      │           │          │
│              │ ●업무 │      │      │      │           │          │
├──────────────┼──────┼──────┼──────┼──────┼─── ···  ───┼──────────┤
│ 근무/인사   ✏️│      │      │      │      │           │          │
├──────────────┼──────┼──────┼──────┼──────┼─── ···  ───┼──────────┤
│ 경리회계    ✏️│      │      │      │      │           │          │
├──────────────┼──────┼──────┼──────┼──────┼─── ···  ───┼──────────┤
│ [+ 행 추가]  │      │      │      │      │           │          │
└──────────────┴──────┴──────┴──────┴──────┴─── ···  ───┴──────────┘

[셀 클릭 시 팝업/인라인 편집]
┌──────────────────────────────────┐
│  업무 추가                     ✕ │
│  색상: ●빨강 ●파랑 ●초록 ●주황    │
│  내용: [________________________] │
│  날짜: ○단일 (M/D)  ○기간 M/D~M/D│
│                 [취소]  [저장]    │
└──────────────────────────────────┘
```

---

## 6. 데이터 모델 (Supabase DB Schema)

### 테이블: `categories` (업무 카테고리)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 자동 생성 |
| name | text | 카테고리 이름 (예: "메일") |
| order | integer | 행 표시 순서 |
| created_at | timestamptz | 생성 시각 |

### 테이블: `work_entries` (업무 항목)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 자동 생성 |
| category_id | uuid (FK → categories.id) | 소속 카테고리 |
| year | integer | 연도 (예: 2026) |
| month | integer | 월 (1~12) |
| color | text | 도트 색상 ('red', 'blue', 'green', 'orange') |
| text | text | 업무 설명 |
| date_type | text | 날짜 유형 ('single' \| 'range') |
| date_value | text | 단일 날짜 (예: "1/6") |
| date_from | text | 기간 시작 (예: "1/8") |
| date_to | text | 기간 종료 (예: "1/12") |
| highlight | boolean | 날짜 하이라이트 여부 |
| created_at | timestamptz | 생성 시각 |

### TypeScript 타입

```typescript
type Category = {
  id: string;
  name: string;
  order: number;
  created_at: string;
};

type WorkEntry = {
  id: string;
  category_id: string;
  year: number;
  month: number;
  color: 'red' | 'blue' | 'green' | 'orange';
  text: string;
  date_type: 'single' | 'range';
  date_value: string | null;
  date_from: string | null;
  date_to: string | null;
  highlight: boolean;
  created_at: string;
};
```

---

## 7. 구현 기술 스택

| 영역 | 기술 | 버전 | 이유 |
|------|------|------|------|
| **프레임워크** | React | 19.x | 컴포넌트 기반 UI, 생태계 |
| **언어** | TypeScript | 5.x | 타입 안전성, IDE 자동완성 |
| **빌드** | Vite | 6.x | 빠른 HMR, 경량 번들 |
| **서버 상태** | TanStack Query | v5 | useQuery/useMutation, 캐싱, Optimistic Update |
| **백엔드/DB** | Supabase | latest | PostgreSQL, Auth 내장, JS SDK |
| **스타일** | Tailwind CSS | v4 | 유틸리티 클래스, 빠른 스타일링 |
| **아이콘** | Lucide React | latest | 편집/삭제 버튼 아이콘 |
| **드래그 앤 드롭** | @dnd-kit/core | latest | 행 순서 변경 (Could) |

### TanStack Query 활용 패턴

```typescript
// 카테고리 조회
const { data: categories } = useQuery({
  queryKey: ['categories'],
  queryFn: () => supabase.from('categories').select('*').order('order'),
});

// 업무 항목 추가 (Optimistic Update)
const addEntry = useMutation({
  mutationFn: (entry: NewWorkEntry) =>
    supabase.from('work_entries').insert(entry),
  onMutate: async (newEntry) => {
    // 즉시 UI 반영
    await queryClient.cancelQueries({ queryKey: ['entries'] });
    const previous = queryClient.getQueryData(['entries']);
    queryClient.setQueryData(['entries'], (old) => [...old, newEntry]);
    return { previous };
  },
  onError: (err, _, context) => {
    // 실패 시 롤백
    queryClient.setQueryData(['entries'], context.previous);
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['entries'] }),
});
```

---

## 8. 개발 단계 (Milestone)

| 단계 | 내용 | 산출물 |
|------|------|--------|
| M1 | 프로젝트 초기화 (Vite + React + TS + Tailwind) | 개발 환경 |
| M2 | Supabase 프로젝트 생성 + 테이블 스키마 정의 + JS SDK 연동 | DB 연결 |
| M3 | TanStack Query 설정 + 카테고리/업무 항목 기본 CRUD | 데이터 레이어 |
| M4 | 테이블 레이아웃 컴포넌트 + 고정 헤더/컬럼 | UI 기초 |
| M5 | 카테고리 행 추가/삭제/이름 편집 (Optimistic Update) | 카테고리 관리 |
| M6 | 셀 업무 항목 추가/수정/삭제 + 색상 + 날짜 입력 | 업무 기록 |
| M7 | 에러 처리 + 로딩 상태 UI + 롤백 | 안정성 |
| M8 | (옵션) 드래그 앤 드롭 행 정렬 (@dnd-kit) | UX 향상 |

---

## 9. 위험 요소 및 대응

| 위험 | 가능성 | 대응 방안 |
|------|--------|-----------|
| 셀 내용이 많아 행 높이 불일치 | 높음 | `vertical-align: top` + 최소 높이 설정 |
| 가로 스크롤 시 첫 컬럼 미고정 | 중간 | `position: sticky; left: 0` 적용 |
| Supabase 네트워크 오류 시 데이터 손실 | 중간 | Optimistic Update + 실패 시 롤백, 에러 토스트 |
| Supabase 무료 플랜 한도 초과 | 낮음 | 개인 업무 기록 수준은 무료 플랜으로 충분 |
| 모바일 테이블 가독성 저하 | 중간 | 1차 데스크톱 전용, 2차에 모바일 대응 |

---

## 10. 완료 조건 (Definition of Done)

- [ ] 1~12월 컬럼이 가로로 나열된 테이블이 렌더링된다
- [ ] 업무 카테고리 행을 추가/삭제/이름 변경할 수 있다
- [ ] 각 셀에 컬러 도트 + 설명 + 날짜 형식으로 업무 항목을 추가/수정/삭제할 수 있다
- [ ] 하나의 셀에 여러 업무 항목이 쌓여서 표시된다
- [ ] 데이터가 Supabase DB에 저장되며 브라우저 초기화와 무관하게 유지된다
- [ ] 업무 항목 추가/수정 시 화면이 즉시 반영된다 (Optimistic Update)
- [ ] 네트워크 오류 시 에러 메시지가 표시되고 데이터가 롤백된다
- [ ] 첫 번째 컬럼(카테고리)과 헤더 행이 스크롤 시 고정된다

---

*기획서 작성: Claude Code (PDCA Plan Phase)*
*참고: reference.png (레퍼런스 이미지)*
