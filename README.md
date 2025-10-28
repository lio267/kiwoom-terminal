# Kiwoom Market Dashboard

Next.js + TypeScript + Tailwind CSS + Zustand 기반으로 구축된 금융 데이터 시각화 대시보드입니다. 키움증권 REST API를 BFF(Backend for Frontend) 구조로 연동하여 실시간 시세와 OHLCV 차트를 제공합니다.

## 주요 기능

- **차트 렌더링**: TradingView Lightweight Charts로 부드러운 캔들 차트를 표시합니다.
- **상태 관리**: Zustand로 UI, 인증, 시세 데이터를 분리 관리합니다.
- **데이터 패칭**: Next.js Route Handlers를 통한 안전한 REST 프록시와 React Query 기반 데이터 요청.
- **모의 개발 모드**: 환경 변수 `MOCK_MODE=true` 설정 시 목데이터로 화면을 빠르게 확인할 수 있습니다.

## 프로젝트 구조

```
src/
 ├─ app/
 │   ├─ dashboard/
 │   │   ├─ ChartClient.tsx
 │   │   └─ page.tsx
 │   ├─ api/kiwoom/
 │   │   ├─ historical/route.ts
 │   │   └─ quote/route.ts
 │   ├─ globals.css
 │   ├─ layout.tsx
 │   ├─ page.tsx
 │   └─ providers.tsx
 ├─ components/
 │   ├─ Header.tsx
 │   ├─ Sidebar.tsx
 │   ├─ Footer.tsx
 │   └─ chart/CandleChart.tsx
 ├─ hooks/useKiwoomData.ts
 ├─ lib/
 │   ├─ kiwoom.ts
 │   ├─ mockData.ts
 │   └─ types.ts
 └─ store/
     ├─ useAuthStore.ts
     ├─ useChartDataStore.ts
     └─ useUIStore.ts
```

## 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 다음 값을 설정하세요.

```env
KIWOOM_BASE_URL=https://openapi-sandbox.kiwoom.com:9443
KIWOOM_APP_KEY=your_app_key
KIWOOM_APP_SECRET=your_app_secret
# 선택 사항: 기본 TR ID나 고객타입(P/B)을 변경하려면 주석을 해제하세요.
# KIWOOM_TR_ID_HISTORICAL=FHKST03010100
# KIWOOM_TR_ID_QUOTE=FHKST01010100
# KIWOOM_CUSTOMER_TYPE=P
MOCK_MODE=false
```

> 키움 OpenAPI+ REST에서 `client_id` / `client_secret`을 별도로 받았다면
> `KIWOOM_APP_KEY` / `KIWOOM_APP_SECRET`에 동일한 값을 넣으면 됩니다.

테스트용으로 목데이터를 사용하려면 `MOCK_MODE=true`로 설정하면 됩니다.

## 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000/dashboard](http://localhost:3000/dashboard)를 열어 대시보드를 확인하세요.

## Kiwoom REST API 연동

- `/api/kiwoom/historical`: 과거 OHLCV 데이터를 조회하여 차트용 데이터로 가공합니다.
- `/api/kiwoom/quote`: 현재가 및 주요 지표를 반환합니다.
- 서버에서 토큰을 캐싱하며 클라이언트는 민감 정보에 접근하지 않습니다.

## 차후 확장 계획

- PostgreSQL + Prisma로 시계열 데이터 영구 저장
- Kiwoom 주문 API 연동 및 자동매매 전략 엔진
- 실시간 스트리밍(WebSocket) 기반 데이터 업데이트

---

> 본 프로젝트는 PRD 문서 요구사항을 반영하여 단계별로 확장 가능한 구조로 설계되었습니다.
