# 🚀 Kiwoom REST API 기반 금융 데이터 시각화 MVP — 통합 정리본

## Ⅰ. 개요

- **목표:**
  키움증권 REST API를 통해 안전하게 금융 데이터를 가져와
  Next.js + TypeScript + Tailwind + Zustand로 시각화 대시보드 구현.
- **환경:**
  macOS에서는 OpenAPI+ (ActiveX) 미지원 → **REST API 기반으로 진행.**
- **진행 모드:**
  실거래 아님 → **모의투자 API(Sandbox)** 사용.

---

## Ⅱ. 기술 스택 및 구조

| 계층                   | 기술                                                                                         | 역할                     |
| ---------------------- | -------------------------------------------------------------------------------------------- | ------------------------ |
| **Frontend (Next.js)** | Next.js (App Router), Tailwind CSS                                                           | 대시보드 UI, 차트 렌더링 |
| **State Management**   | Zustand                                                                                      | 실시간 데이터 상태 관리  |
| **Visualization**      | Lightweight Charts                                                                           | 캔들스틱 / OHLCV 시각화  |
| **Server (BFF)**       | Next.js API Routes                                                                           | 키움 REST API 프록시     |
| **Database (향후)**    | PostgreSQL + Prisma                                                                          | 백엔드 데이터 저장       |
| **모의 API 환경**      | [https://openapi-sandbox.kiwoom.com:9443](https://openapi-sandbox.kiwoom.com:9443) | 테스트용 REST API        |

---

## Ⅲ. 폴더 구조 (Next.js 기준)

```
app/
 ├── layout.tsx
 ├── page.tsx
 ├── dashboard/
 │   ├── page.tsx
 │   └── ChartClient.tsx
 ├── api/
 │   └── kiwoom/
 │       ├── quote/route.ts
 │       └── historical/route.ts
lib/
 ├── kiwoom.ts
 └── types.ts
store/
 ├── useAuthStore.ts
 ├── useUIStore.ts
 └── useChartDataStore.ts
components/
 ├── Header.tsx
 ├── Sidebar.tsx
 └── Footer.tsx
.env.local
```

---

## Ⅳ. REST API 프록시 (BFF) 핵심 구조

### 🔹 `lib/kiwoom.ts`

- 서버에서 **OAuth2 토큰 발급 및 자동 갱신**.
- 클라이언트는 API Key를 알 수 없음.

```ts
const KIWOOM_BASE_URL = process.env.KIWOOM_BASE_URL!;
const APP_KEY = process.env.KIWOOM_APP_KEY!;
const APP_SECRET = process.env.KIWOOM_APP_SECRET!;
```

### 🔹 `/api/kiwoom/historical`

- **과거 OHLCV 데이터 조회**
- `/uapi/domestic-stock/v1/quotations/inquire-daily-chartprice` 호출

### 🔹 `/api/kiwoom/quote`

- **현재가 데이터 조회**
- `/uapi/domestic-stock/v1/quotations/inquire-price` 호출

---

## Ⅴ. 모의투자 환경 설정

```bash
# .env.local
KIWOOM_BASE_URL=https://openapi-sandbox.kiwoom.com:9443
KIWOOM_APP_KEY=모의투자_APP_KEY
KIWOOM_APP_SECRET=모의투자_APP_SECRET
```

- 실거래 계좌 불필요
- 데이터 지연(Delay) 가능성 있음
- 하루 API 호출 횟수 제한 (약 1~2천회)
- 주문 API 일부 비활성화

---

## Ⅵ. Mock Mode (개발 편의)

API 서버 접속이 불가능할 때 개발 지속용:

```bash
MOCK_MODE=true
```

→ 차트 데이터 임시 JSON으로 대체.

---

## Ⅶ. Zustand 구조

| Store               | 주요 상태              |
| ------------------- | ---------------------- |
| `useAuthStore`      | 토큰 상태, 연결 여부   |
| `useUIStore`        | 종목 코드, 시간 프레임 |
| `useChartDataStore` | 시세 / OHLCV 데이터    |

- 고빈도 데이터 처리 시 **스로틀링(100~200ms)** 적용
- **선택적 구독**으로 불필요한 리렌더 최소화

---

## Ⅷ. Lightweight Charts 통합

1. `npm install lightweight-charts`
2. 클라이언트 컴포넌트에서만 차트 생성 (`'use client'`)
3. Kiwoom API → OHLCV 변환 후 렌더링
4. Attribution 명시: [TradingView](https://www.tradingview.com)

---

## Ⅸ. 단계별 개발 로드맵

| 단계              | 내용                                   | 결과물          |
| ----------------- | -------------------------------------- | --------------- |
| **Step 1**        | Next.js + Tailwind + TS 환경 구성      | 기본 앱 환경    |
| **Step 2**        | API Proxy 구현 (`/api/kiwoom/*`)       | 보안 BFF 완료   |
| **Step 3**        | Zustand 스토어 구축                    | 상태 관리 완성  |
| **Step 4**        | Lightweight Charts 통합                | 차트 MVP 완성   |
| **Step 5**        | 모의투자 REST API 연동                 | 실데이터 시각화 |
| **Step 6 (차후)** | PostgreSQL + Prisma + TimescaleDB 확장 | 백엔드 구축     |

---

## Ⅹ. 주요 보안 및 운영 원칙

- ✅ **API Key는 서버 전용 환경 변수에만 저장**
- ✅ **BFF(Backend for Frontend) 아키텍처 필수 적용**
- ✅ **모의투자 REST API 사용 중 실계좌 연동 금지**
- ✅ **오류 발생 시 Proxy에서 예외 처리 후 클라이언트에 전달**

---

## Ⅺ. 차후 확장 방향

1. **PostgreSQL + TimescaleDB 도입**
   → 시계열 데이터 저장 및 백테스팅 지원
2. **자동매매 로직 (개인용)**
   → 키움 API의 거래 주문 기능 연동
3. **전략 엔진 + 리스크 관리 기능 추가**

---

## 📎 전달용 요약 (코덱스용)

> “Next.js + Kiwoom REST API 기반 금융 데이터 시각화 MVP를 macOS 환경에서 진행하며,
> 키움 모의투자 REST API를 Proxy 서버(BFF) 구조로 연동합니다.
> 프론트엔드는 Zustand + Lightweight Charts로 구성되고,
> 모든 API 인증은 서버에서만 관리됩니다.
> 단계별 로드맵을 따라 MVP → 백엔드 확장 → 자동매매 시스템으로 발전시킬 예정입니다.”
