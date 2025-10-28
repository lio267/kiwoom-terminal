# 📘 Kiwoom REST API 기반 금융 데이터 시각화 MVP

**제품 요구 사항 문서 (PRD) 및 아키텍처 청사진**

---

## I. 🎯 전략적 개요 및 프로젝트 정의

### A. 프로젝트 배경 및 상위 목표

본 프로젝트의 목적은 **키움증권 REST API**를 이용해 안전하게 금융 데이터를 조회하고, **Next.js + TypeScript + Tailwind CSS + Zustand** 스택을 사용하여 대시보드에서 고성능 시각화를 구현하는 것입니다.

- **핵심 목표 (Phase I / MVP)**

  - Kiwoom REST API를 통해 실시간 및 과거 OHLCV 데이터를 안전하게 조회.
  - Next.js 클라이언트에서 TradingView Lightweight Charts로 부드럽게 렌더링.
  - 사용자 입력(종목 선택, 시간 프레임 변경)에 따른 즉각적인 반응성 확보.

- **성공 지표 (KPI)**

  - 데이터 로딩 지연 시간 ≤ 200ms.
  - 차트 프레임 전환 시 오류 없는 렌더링.
  - 클라이언트에서 API Key나 인증 정보 노출 0건.

---

### B. 법률 및 규제 준수 고려

현재 MVP는 데이터 시각화 단계에 국한되지만, 장기적으로 **자동매매 시스템**을 염두에 두고 있으므로 금융 규제 환경을 사전에 검토해야 합니다.

- **규제 준수 방향:**

  - 개인의 자율 투자 목적에 한정된 자동화만 허용.
  - 불법 대리 매매, 시장 교란, 타인 계좌 거래 등의 행위 금지.
  - 키움증권 API 이용 약관 및 금융위원회 가이드라인 준수.

---

### C. 비기능적 요구사항 (NFR)

| 구분       | 요구사항                                                                              |
| ---------- | ------------------------------------------------------------------------------------- |
| **보안**   | API Key, Client Secret은 절대 클라이언트에 노출되지 않아야 하며, 서버(.env)에만 저장. |
| **성능**   | OHLCV 데이터 대량 처리 및 부드러운 차트 렌더링 (60fps 수준).                          |
| **확장성** | TypeScript 기반 타입 일관성 유지로 런타임 오류 최소화.                                |

---

## II. 🧱 아키텍처 및 보안 청사진

### A. Next.js 기반 BFF (Backend for Frontend) 구조

Next.js는 `App Router`와 `API Routes`를 활용해 클라이언트와 서버 간을 안전하게 구분합니다.

- SSR 기반 초기 렌더링으로 속도 향상.
- API Routes를 통해 내부 프록시 서버 구현.
- TypeScript로 데이터 모델을 엄격히 정의하여 상태 일관성 유지.

---

### B. API 프록시 (BFF) 보안 아키텍처

**왜 필요한가?**
API Key가 프론트엔드 코드에 포함될 경우, 브라우저 Network 탭이나 소스 검사를 통해 노출될 수 있습니다. 이를 방지하기 위해 모든 API 요청은 **Next.js API Route**를 통해 처리되어야 합니다.

**BFF 구성 요소**

| 계층               | 역할                    | 보안 근거                     |
| ------------------ | ----------------------- | ----------------------------- |
| 클라이언트         | 데이터 요청/렌더링      | 인증정보 접근 불가            |
| Next.js API Routes | 키움 API 호출 대리 수행 | 서버 환경 변수에서만 Key 관리 |
| 키움 REST API      | 금융 데이터 제공        | Proxy 토큰 기반 접근          |

**OAuth 2.0 인증 흐름**

1. 클라이언트 → `/api/kiwoom/historical` 요청.
2. Proxy 서버에서 Access Token 유효성 검사.
3. 만료 시 Refresh Token으로 재발급.
4. Authorization 헤더에 Token 삽입 후 키움 서버에 요청.
5. 응답 가공 후 클라이언트에 전달.

---

## III. 🧭 핵심 기능 및 UI/UX

### A. 사용자 스토리 (MVP 중심)

| 역할   | 목표                          | 설명                  |
| ------ | ----------------------------- | --------------------- |
| 사용자 | 특정 종목의 실시간 차트 확인  | 시장 추세 시각적 분석 |
| 사용자 | 시간 프레임 전환 (일/시/분봉) | 멀티타임프레임 분석   |
| 사용자 | 주요 시세 정보 확인           | 빠른 투자 판단        |

---

### B. 대시보드 레이아웃

```
[Header]   - 종목 검색 입력, API 연결 상태 표시
[Main]     - Lightweight Charts 기반 차트
[Sidebar]  - 현재 시세, 거래량, 고가/저가 표시
[Footer]   - 시스템 로그 및 오류 상태 표시
```

---

### C. 데이터 매핑 사양

| 데이터 유형 | 출처            | 필드                                 | 표시 위치 |
| ----------- | --------------- | ------------------------------------ | --------- |
| 실시간 시세 | Kiwoom REST API | 현재가, 거래량, 등락률               | 사이드바  |
| 과거 캔들   | Kiwoom REST API | time, open, high, low, close, volume | 차트 영역 |
| API 상태    | Zustand         | 연결 상태, 오류 메시지               | 푸터      |

---

## IV. 📊 금융 데이터 시각화 계층

### A. 라이브러리 선정 근거

| 라이브러리         | 장점                          | 단점                        | 비고    |
| ------------------ | ----------------------------- | --------------------------- | ------- |
| Lightweight Charts | 금융 차트 특화, TS 지원, 빠름 | Attribution 필요            | ✅ 채택 |
| ECharts            | 다양한 차트 지원              | 금융 차트 커스터마이징 필요 | 보조    |

### B. 통합 전략

1. `npm install lightweight-charts`
2. API Proxy에서 OHLCV 데이터 변환.
3. `createChart`로 차트 생성 후 DOM에 연결.
4. TradingView Attribution 명시 ([https://www.tradingview.com](https://www.tradingview.com)).

---

## V. ⚙️ Zustand 상태 관리 및 데이터 흐름

### A. 스토어 설계

| 스토어              | 역할                                   |
| ------------------- | -------------------------------------- |
| `useAuthStore`      | 인증 상태 및 세션 관리                 |
| `useUIStore`        | 종목 선택, 시간 프레임, 모달 상태 관리 |
| `useChartDataStore` | OHLCV/시세 데이터 저장                 |

### B. 성능 최적화 전략

- 선택적 구독 (Selective Subscription)으로 불필요한 리렌더 방지.
- WebSocket 수신 데이터 스로틀링(100~200ms)으로 성능 유지.
- React batching과 Zustand shallow 비교로 최소 렌더링 유지.

### C. 서버/클라이언트 동기화 (Hydration)

- SSR 단계에서 초기 데이터 주입.
- Zustand per-request 스토어 인스턴스로 캐시 오염 방지.

---

## VI. 🗄️ 백엔드 데이터 아키텍처 (PostgreSQL + Prisma)

### A. TimescaleDB 기반 시계열 최적화

- PostgreSQL + TimescaleDB 하이퍼테이블을 사용.
- Continuous Aggregates로 빠른 쿼리 성능 확보.
- 데이터 압축률 95% 이상 유지.

### B. Prisma 스키마 예시

```prisma
model Stock {
  symbol       String  @id
  companyName  String
  CandleData   CandleData[]
}

model CandleData {
  id           Int       @id @default(autoincrement())
  stockSymbol  String
  timestamp    DateTime  @index
  timeframe    String
  open         Float
  high         Float
  low          Float
  close        Float
  volume       Float
}

model Strategy {
  id          Int      @id @default(autoincrement())
  name        String
  parameters  Json
  isActive    Boolean  @default(false)
}
```

---

## VII. 🚀 개발 로드맵 (단계별 Task Breakdown)

### Phase 1: MVP (Frontend + Proxy)

| 단계 | 작업                                      | 기술                |
| ---- | ----------------------------------------- | ------------------- |
| 1    | Next.js + Tailwind + TS 초기화, .env 구성 | Next.js, TypeScript |
| 2    | `/api/kiwoom/*` 프록시 엔드포인트 생성    | Next.js API Routes  |
| 3    | Zustand 3 스토어 구축                     | Zustand             |
| 4    | Lightweight Charts 통합 및 차트 렌더링    | lightweight-charts  |
| 5    | UI/UX 구성 (Header, Sidebar, Footer)      | Tailwind CSS        |

### Phase 2: 백엔드 확장 (PostgreSQL + Prisma)

| 단계 | 작업                                        | 기술           |
| ---- | ------------------------------------------- | -------------- |
| 1    | PostgreSQL 및 TimescaleDB 환경 구성         | PostgreSQL     |
| 2    | Prisma 스키마 및 마이그레이션 적용          | Prisma ORM     |
| 3    | 과거 데이터 수집 및 저장 배치 프로세스 구축 | Node.js + CRON |
| 4    | 백테스팅 및 자동매매 전략 기초 엔진 설계    | TS + Prisma    |

### Phase 3: 자동매매 및 전략 엔진

| 단계 | 작업                                 | 기술         |
| ---- | ------------------------------------ | ------------ |
| 1    | 백테스팅 엔진 개발                   | TS + DB      |
| 2    | 주문 실행 인터페이스 (거래 API 연동) | Kiwoom API   |
| 3    | 손절/익절 로직 및 리스크 관리        | Zustand + TS |

---

## VIII. ✅ 결론 및 권고 사항

1. **BFF 프록시 의무화:** 모든 키움 API 요청은 서버 사이드 API Route를 통해 처리.
2. **성능 최적화:** Zustand 구독 최적화 및 Lightweight Charts로 프론트엔드 부하 최소화.
3. **백엔드 대비:** 초기 단계부터 TimescaleDB 고려한 Prisma 스키마 설계.
4. **규제 대응:** 자동매매 이전 반드시 법규 및 약관 준수 검토.

---

## IX. 📋 실행 워크플로우 (Step-by-Step)

| 단계   | 목표                     | 산출물               |
| ------ | ------------------------ | -------------------- |
| Step 1 | Next.js + BFF 환경 구축  | Proxy 서버 완성      |
| Step 2 | Zustand + Chart 통합     | 실시간 시각화 MVP    |
| Step 3 | UI 최적화 및 보안 점검   | MVP 완성             |
| Step 4 | Prisma + DB 확장         | 백엔드 아키텍처 구축 |
| Step 5 | 자동매매 엔진 프로토타입 | Phase 2 시작         |

---

> ⚙️ 본 PRD는 Kiwoom REST API를 안전하게 프록시 처리하고, Next.js 환경에서 금융 데이터를 고성능으로 시각화하는 것을 목표로 설계되었습니다.
> 향후 확장을 고려해 초기부터 백엔드 구조와 보안 패턴을 일관되게 유지해야 합니다.
