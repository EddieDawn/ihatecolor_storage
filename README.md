# Justyes Gallery

**사진작가가 직접 작품을 관리하고, 방문자는 사진에 집중해 감상하는 웨딩 스냅 포트폴리오 서비스입니다.**

`ihatecolor-storage`는 Justyes Gallery의 공개 웹사이트와 Sanity Studio 기반 콘텐츠 관리 화면을 함께 관리하는 저장소입니다. 대표 사진으로 시작해 사진 목록과 개별 작품 상세로 이어지는 탐색 흐름을 제공하며, 사진작가는 코드 수정 없이 사진과 메타데이터를 등록하고 랜딩의 대표 사진을 선택할 수 있습니다.

콘텐츠 중심 서비스에 맞춘 정적 생성, CMS와 화면 사이의 데이터 계약, 문서에 기반한 AI 협업을 중심으로 설계했습니다.

## 목차

- [주요 기능](#주요-기능)
- [기술 스택과 선택 이유](#기술-스택과-선택-이유)
- [아키텍처와 데이터 흐름](#아키텍처와-데이터-흐름)
- [프로젝트 구조](#프로젝트-구조)
- [Markdown 문서 안내](#markdown-문서-안내)
- [AI 협업과 품질 개선](#ai-협업과-품질-개선)
- [로컬 실행](#로컬-실행)
- [검증과 CI](#검증과-ci)
- [현재 범위와 후속 과제](#현재-범위와-후속-과제)
- [기여 및 콘텐츠 권리](#기여-및-콘텐츠-권리)

## 주요 기능

| 영역                             | 구현 내용                                                                               |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| 랜딩 `/`                         | CMS에서 선택한 대표 사진, Journal·Instagram 링크, Contact 문구                          |
| 사진 목록 `/photos/`             | 데스크톱 3열, 페이지당 9장, 숫자 및 이전·다음 페이지네이션                              |
| 추가 목록 `/photos/page/{page}/` | 사진 수에 맞춰 빌드 시 생성하는 목록 페이지                                             |
| 사진 상세 `/photos/{slug}/`      | 원본 비율을 유지한 사진 감상, 작품명과 선택 메타데이터, 랜딩 또는 목록 복귀             |
| 콘텐츠 관리                      | 사진 업로드, 제목·대체 텍스트·slug·정렬 순서 및 선택 메타데이터 편집                    |
| 대표 사진 관리                   | 하나의 `Landing page` 문서에서 Hero 사진 선택                                           |
| 이미지 처리                      | 랜딩·목록에서 Astro Image와 Sharp로 반응형 WebP 생성; 상세에서는 Sanity 이미지 URL 사용 |
| 접근성 고려                      | 이미지 대체 텍스트, 키보드 포커스, 모션 감소 설정 대응                                  |

공개 웹사이트는 정적 생성 방식입니다. CMS에서 게시한 변경 사항을 운영 사이트에 반영하려면 사이트를 다시 빌드하고 배포해야 합니다. 현재 Contact는 문구만 표시하며 링크와 문의 전송 기능은 구현되어 있지 않습니다.

## 기술 스택과 선택 이유

아래 버전은 저장소의 `package.json`에 고정된 버전입니다. 웹사이트와 Studio는 각각의 의존성과 lockfile을 사용합니다.

| 영역          | 기술                                       | 선택 이유 및 역할                                                           |
| ------------- | ------------------------------------------ | --------------------------------------------------------------------------- |
| 공개 웹사이트 | Astro 7.2.2                                | 콘텐츠를 빌드 시 HTML로 생성하고 필요한 상호작용에만 브라우저 스크립트 사용 |
| 언어          | TypeScript 6.0.3, strict mode              | 페이지·콘텐츠 계층이 공유하는 모델과 타입 경계 정의                         |
| 스타일        | CSS, Astro scoped/global style             | 디자인 문서의 토큰과 화면별 규칙을 직접 구현                                |
| CMS           | Sanity Studio 6.10.1, React 19.2.8         | 사진작가가 사용할 콘텐츠 편집·게시 화면 제공; React는 Studio에서 사용       |
| 데이터 조회   | `@sanity/client` 8.2.0, GROQ               | 게시된 사진과 랜딩 대표 사진 조회                                           |
| 응답 검증     | Zod 4.4.3                                  | 외부 CMS 응답을 실행 시점에 검증                                            |
| 이미지 최적화 | Astro Image, Sharp 0.35.3                  | 랜딩·목록 이미지의 크기별 정적 변환                                         |
| 실행 환경     | Node.js 24.19.0, pnpm 11.22.0              | 버전과 lockfile을 고정해 개발환경 차이 축소                                 |
| 개발환경      | Docker Compose, VS Code Dev Containers     | 웹사이트와 Studio를 독립 서비스로 실행                                      |
| 코드 품질     | ESLint 10.8.1, Prettier 3.9.6, Astro Check | 정적 분석·포맷·타입 검사                                                    |
| CI            | GitHub Actions                             | PR과 `main` push에서 웹사이트 검증 및 정적 빌드                             |

## 아키텍처와 데이터 흐름

별도의 범용 API 서버 대신 Sanity가 콘텐츠 저장과 관리를 담당합니다. Astro는 빌드 시 게시된 콘텐츠를 조회하고 검증한 뒤 정적 페이지를 생성합니다.

```text
사진작가 → Sanity Studio → Sanity Content Lake
                                  │ 게시된 콘텐츠 조회
                                  ▼
                        Sanity client + GROQ
                                  ▼
                        Zod로 외부 응답 검증
                                  ▼
                        어댑터 → Photo 모델
                                  ▼
                     콘텐츠 계층: 중복 검사·정렬
                                  ▼
                     Astro 페이지·컴포넌트 → dist/
                                  ▼
                          정적 호스팅 → 방문자
```

### 설계에서 중점을 둔 부분

- **CMS와 화면의 분리**: 페이지는 콘텐츠 조회 함수를 호출합니다. Sanity의 `_id`, 참조 문서 등 외부 구조는 어댑터에서 공통 `Photo` 모델로 변환합니다.
- **입력과 조회의 이중 검증**: Studio에서 필수값과 slug 규칙을 검사하고, 사이트에서도 Zod로 응답을 다시 검증합니다. 콘텐츠 계층은 ID·slug 중복을 검사해 잘못된 정적 경로 생성을 방지합니다.
- **일관된 정렬과 URL**: `sortOrder` 내림차순, 동일 순위에서는 ID 순으로 정렬합니다. 작품 URL은 독립된 slug를 사용하며, 앨범 확장용 선택 필드 `albumId`를 모델에 남겨 두었습니다.
- **빌드 시점의 오류 발견**: 필수 환경변수 누락, 유효하지 않은 응답, 중복 slug, 대표 사진 미설정은 오류로 드러나도록 처리합니다.
- **최소 권한의 콘텐츠 조회**: 비공개 dataset 조회에는 읽기 전용 Viewer 토큰을 사용하고, 게시된 문서만 읽습니다. 토큰은 로컬 환경 파일 또는 CI secret으로 관리합니다.

## 프로젝트 구조

```text
.
├── README.md                       # 서비스·설계·실행 방법의 진입점
├── AGENTS.md                       # AI 작업 규칙과 승인·검증 경계
├── docs/                           # 디자인·기술 결정·개발환경 문서
├── archive/                        # Day1~Day8 개발 과정과 의사결정 기록
├── src/
│   ├── pages/
│   │   ├── index.astro             # 대표 사진 중심 랜딩
│   │   ├── health.ts               # 개발 서버 상태 확인
│   │   └── photos/
│   │       ├── index.astro         # 사진 목록 첫 페이지
│   │       ├── page/[page].astro   # 두 번째 이후 목록의 정적 경로 생성
│   │       └── [slug].astro        # 작품별 상세 경로·화면·복귀 동작
│   ├── components/photos/
│   │   └── PhotoJournalView.astro  # 목록 공통 화면·페이지네이션·스타일
│   ├── lib/
│   │   ├── content/                # 화면에서 사용할 데이터 계약과 조회 함수
│   │   └── sanity/                 # CMS 접속·쿼리·응답 검증·변환
│   ├── styles/landing.css          # 랜딩 스타일과 모션
│   └── env.d.ts                    # Astro 환경변수 타입 선언
├── studio/
│   ├── schemaTypes/               # 사진·랜딩 문서의 필드와 입력 검증
│   ├── structure.ts               # 관리 화면 메뉴와 랜딩 singleton 구성
│   ├── sanity.config.ts           # Studio 플러그인·스키마·문서 동작 설정
│   ├── sanity.cli.ts              # Studio CLI 설정
│   ├── environment.ts             # Studio 환경변수 검증
│   └── README.md                  # Studio 실행 및 관리 범위 안내
├── scripts/                       # 랜딩·목록 검토용 HTML 내보내기 도구
├── astro.config.mjs                # 정적 출력·이미지 도메인·파일 감시 설정
├── Dockerfile                     # 웹사이트 개발 이미지
├── studio/Dockerfile              # Studio 개발 이미지
├── compose.yaml                   # 두 서비스·포트·볼륨·healthcheck
├── .devcontainer/                 # VS Code 컨테이너 개발환경
└── .github/workflows/ci.yml        # 웹사이트 검증 및 빌드 자동화
```

### 핵심 데이터 파일

| 파일                                                             | 책임                                                  |
| ---------------------------------------------------------------- | ----------------------------------------------------- |
| [`photo-model.ts`](src/lib/content/photo-model.ts)               | 공통 `Photo`, `PhotoImage` 타입 정의                  |
| [`photos.ts`](src/lib/content/photos.ts)                         | 사진 조회 흐름 연결, ID·slug 중복 검사, 정렬          |
| [`photo-pagination.ts`](src/lib/content/photo-pagination.ts)     | 페이지당 9장 기준, 페이지 수·항목·URL 계산            |
| [`landing-page-model.ts`](src/lib/content/landing-page-model.ts) | 랜딩 대표 사진 데이터 계약                            |
| [`landing-page.ts`](src/lib/content/landing-page.ts)             | 대표 사진 조회·검증·변환, 미설정 오류 처리            |
| [`environment.ts`](src/lib/sanity/environment.ts)                | 웹사이트의 Sanity 필수 환경변수 검사                  |
| [`client.ts`](src/lib/sanity/client.ts)                          | 읽기 토큰과 게시 콘텐츠 조회 설정으로 클라이언트 생성 |
| [`queries.ts`](src/lib/sanity/queries.ts)                        | 사진 및 랜딩 조회용 GROQ와 반환 필드 정의             |
| [`fetch.ts`](src/lib/sanity/fetch.ts)                            | 쿼리 실행, 아직 검증하지 않은 `unknown` 응답 반환     |
| [`response-schemas.ts`](src/lib/sanity/response-schemas.ts)      | 필수 문자열·slug·이미지 크기 등 외부 응답 검증        |
| [`photo-adapter.ts`](src/lib/sanity/photo-adapter.ts)            | 검증된 CMS 응답을 화면용 모델로 변환                  |

## Markdown 문서 안내

문서는 **프로젝트 소개 → 작업 기준 → 분야별 상세 설명 → 과거 기록**으로 역할을 나눕니다. Markdown은 개발 지식과 결정 사항을 관리하며, 현재 운영 사진의 콘텐츠 소스는 Sanity입니다.

| 문서                                                                               | 담당 내용과 읽는 시점                                                             |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [`README.md`](README.md)                                                           | 처음 방문한 사람이 서비스·구조·실행 방법을 이해하는 안내서                        |
| [`AGENTS.md`](AGENTS.md)                                                           | AI 작업 전 확인할 규칙, 디자인 변경 승인 절차, 리뷰 응답 방식                     |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)                                   | 시각 디자인의 단일 기준. 색상·타이포그래피·여백·이미지·모션·검수 기준과 승인 이력 |
| [`docs/TECH_STACK.md`](docs/TECH_STACK.md)                                         | 기술 선택 배경, 콘텐츠 모델, 데이터 경계, CMS·보안·개발환경 원칙                  |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)                                       | Docker 실행·종료·로그·검증, 환경변수와 CI 설정                                    |
| [`docs/NESTJS_ARCHITECTURE_COMPARISON.md`](docs/NESTJS_ARCHITECTURE_COMPARISON.md) | NestJS 경험자를 위한 계층별 대응 설명. CMS 전환 중 작성된 시점의 구현 상태도 포함 |
| [`studio/README.md`](studio/README.md)                                             | 관리자 앱의 환경변수, 실행·빌드 방법, Hero 관리 범위                              |
| [`archive/Day1.md`](archive/Day1.md)–[`Day8.md`](archive/Day8.md)                  | 요구사항·구현·리뷰·문제 해결과 클라이언트 피드백의 일자별 기록                    |

과거 기록에는 현재 제거된 로컬 Content Collection, HTML 프로토타입 및 이전 UI가 등장합니다. 기술 문서 일부에도 전환 당시 설명이 남아 있으므로, 현재 구현과 버전은 소스 코드 및 각 `package.json`을 함께 확인합니다. 시각 디자인의 기준은 `docs/DESIGN_SYSTEM.md`입니다.

## AI 협업과 품질 개선

이 프로젝트는 AI를 개발 협업 도구로 활용하며, **사람이 승인한 기준을 문서에 고정하고 AI가 그 범위 안에서 구현·검증하도록 작업 경계를 설정**합니다. 서비스 자체에 AI 추론 기능이나 모델 자동 학습 기능이 포함된 것은 아닙니다.

### 가드레일: 변경 가능한 범위를 명시

| 경계      | 적용 방식                                                                                                  | 근거                                           |
| --------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 디자인    | UI 작업 전에 디자인 시스템 전체를 읽고 기존 토큰과 규칙 적용                                               | `AGENTS.md`, `docs/DESIGN_SYSTEM.md`           |
| 승인      | 디자인 기준과 다른 처리가 필요하면 화면 예외인지 전체 변경인지 확인하고 답변 대기                          | `AGENTS.md`                                    |
| 변경 순서 | 승인된 디자인 변경은 문서에 먼저 기록한 뒤 코드에 적용                                                     | `AGENTS.md`                                    |
| 리뷰      | `Codex Review:` 요청은 실제 코드로 타당성을 검증하고 해결 계획까지만 제시; 코드 수정은 명시적 허가 후 진행 | `AGENTS.md`                                    |
| 데이터    | 외부 응답을 바로 신뢰하지 않고 스키마 검증·모델 변환·중복 검사 수행                                        | `src/lib/sanity/`, `src/lib/content/photos.ts` |
| 품질      | 정적 분석·포맷·타입·빌드를 검사하고, 디자인은 1440×900 기준으로 시각 검수                                  | CI, `AGENTS.md`                                |

문서 규칙은 AI의 작업 절차를 통제하고, 스키마와 CI는 코드 수준에서 오류를 드러냅니다. 디자인 승인과 시각적 적합성 판단은 사람의 검토가 필요한 영역입니다.

### 개선 루프: 피드백을 다음 작업의 기준으로 축적

```text
요구사항과 기존 문서 확인
    → 승인된 범위에서 구현
    → 코드 검사·빌드·화면 검수
    → 리뷰와 사용자 피드백으로 문제 확인
    → 필요한 변경 승인
    → 기준 문서 갱신 후 코드 수정
    → 재검증 및 작업 기록 → 다음 작업에서 재사용
```

여기서 개선되는 대상은 AI 모델 자체가 아니라 **AI가 참조하는 프로젝트 지식과 작업 결과물**입니다. 문서와 변경 이력을 저장소에 남겨 다음 작업에서도 같은 제약과 판단 근거를 다시 사용할 수 있도록 합니다.

실제 기록에서 확인할 수 있는 사례는 다음과 같습니다.

- **호버 효과 범위 고정**: 확대 효과를 제거하고 흑백에서 컬러로의 전환만 유지하도록 코드와 승인된 디자인 기준을 맞췄습니다. → [`Day5`](archive/Day5.md)
- **환경 문제의 원인 검증**: 개발 서버가 준비되지 않는 문제를 조사해 프로젝트 내부 `.pnpm-store`의 파일 감시를 원인으로 확인하고 감시 제외 설정을 적용했습니다. → [`Day6`](archive/Day6.md)
- **기준의 일원화**: 제품 구현 후 프로토타입의 필요한 규칙을 디자인 시스템에 이관하고 이전 HTML에 대한 의존을 제거했습니다. → [`Day7`](archive/Day7.md)
- **비교 후 되돌리는 판단도 기록**: Hero 사진 확장과 링크 중앙 정렬을 비교한 뒤 기존 비대칭 구성을 유지한 이유를 기록했습니다. → [`Day8`](archive/Day8.md)

## 로컬 실행

### 준비 사항

- Docker Desktop 또는 Docker Engine + Compose
- 접근 가능한 Sanity 프로젝트와 dataset
- 해당 dataset을 읽을 수 있는 Viewer 토큰 및 Studio 로그인 권한

Docker 사용 시 호스트에 Node.js와 pnpm을 별도로 설치할 필요가 없습니다. 저장소를 내려받은 뒤 프로젝트 루트에서 진행합니다.

### 1. 환경변수 설정

```sh
cp .env.example .env.local
cp studio/.env.example studio/.env.local
```

예시 값을 실제 프로젝트 설정으로 교체합니다.

| 파일                | 변수                       | 용도                                   |
| ------------------- | -------------------------- | -------------------------------------- |
| `.env.local`        | `SANITY_PROJECT_ID`        | 웹사이트에서 조회할 Sanity 프로젝트    |
| `.env.local`        | `SANITY_DATASET`           | 조회할 dataset                         |
| `.env.local`        | `SANITY_API_READ_TOKEN`    | 비공개 dataset의 읽기 전용 Viewer 토큰 |
| `studio/.env.local` | `SANITY_STUDIO_PROJECT_ID` | Studio에서 편집할 프로젝트             |
| `studio/.env.local` | `SANITY_STUDIO_DATASET`    | Studio에서 편집할 dataset              |

두 앱에는 같은 프로젝트와 dataset을 지정합니다. 루트 예시의 `SANITY_AUTH_TOKEN`은 배포 인증용 항목이며 현재 웹 콘텐츠 조회에는 사용하지 않습니다. 실제 토큰이 담긴 `.env.local` 파일은 Git에 포함하지 않습니다.

포트를 바꾸려면 Compose가 읽는 루트 `.env`에 `ASTRO_PORT` 또는 `SANITY_STUDIO_PORT`를 별도로 지정합니다. 기본 포트로 실행할 때는 필요하지 않습니다.

### 2. 서비스 시작

```sh
docker compose up --build --detach
docker compose ps
```

- 웹사이트: [localhost:4321](http://localhost:4321/)
- 관리자 화면: [localhost:3333](http://localhost:3333/)
- 개발 서버 상태 확인: [localhost:4321/health](http://localhost:4321/health)

컨테이너 시작 시 각 서비스의 lockfile에 맞춰 의존성을 설치하고 개발 서버를 실행합니다.

### 3. 최초 콘텐츠 게시

Studio에 로그인해 `Photo` 문서를 생성하고 이미지·제목·slug·대체 텍스트·정렬 순서를 입력한 뒤 게시합니다. 이어서 `Landing page`에서 게시된 사진을 Hero로 선택하고 해당 문서도 게시합니다.

현재는 로컬 샘플 사진이나 CMS 미연결 대체 화면을 제공하지 않습니다. 대표 사진이 설정되지 않으면 랜딩 조회와 전체 빌드가 실패합니다.

### 4. 종료

```sh
docker compose down
```

자세한 로그 확인과 Dev Container 사용법은 [개발환경 문서](docs/DEVELOPMENT.md)를 참고합니다.

## 검증과 CI

실행 중인 컨테이너에서 검사합니다.

```sh
# 웹사이트: 정적 분석 → 포맷 → Astro/TypeScript 검사 → 정적 빌드
docker compose exec web pnpm validate

# Studio: 별도 타입 검사와 빌드
docker compose exec studio pnpm typecheck
docker compose exec studio pnpm build
```

| 명령                | 역할                                    |
| ------------------- | --------------------------------------- |
| `pnpm lint`         | ESLint 정적 분석                        |
| `pnpm format:check` | Prettier 포맷 검사                      |
| `pnpm check`        | Astro·TypeScript 진단                   |
| `pnpm build`        | 게시된 Sanity 콘텐츠로 정적 사이트 생성 |
| `pnpm validate`     | 위 네 검사를 순서대로 실행              |

GitHub Actions는 `main` 대상 PR, `main` push, 수동 실행에서 웹사이트의 `pnpm validate`를 수행합니다. 저장소 variables에 `SANITY_PROJECT_ID`, `SANITY_DATASET`을, secret에 `SANITY_API_READ_TOKEN`을 설정해야 합니다.

현재 CI에는 Studio 검사, 단위·E2E 테스트, 자동 시각 회귀 검사가 포함되어 있지 않습니다. UI 변경 시에는 디자인 시스템의 체크리스트로 색상·폰트·여백·열 수·이미지 비율·캡션·호버·모션을 별도로 확인합니다. CI 실패 시 병합을 차단하려면 GitHub Ruleset 설정이 추가로 필요합니다.

## 현재 범위와 후속 과제

랜딩·사진 목록·상세 탐색, Sanity 콘텐츠 연동, 관리 화면, 개발환경과 웹사이트 CI가 구현되어 있습니다. 운영 배포와 확장 기능은 다음 항목을 구분해 진행합니다.

- 정적 호스팅·도메인 결정 및 CMS 게시 이후 재빌드·배포 방식 확정
- 문의 전송 기능과 최종 연락 경로 확정
- 운영 URL 기반 SEO·공유 메타데이터 보완
- 출시 사진의 사용 권한과 공개 이미지 EXIF 제거 여부 검증
- 페이지네이션·응답 검증·복귀 흐름의 자동 테스트 및 Studio CI 확장
- 필요 시 앨범과 분류 기능 추가; 현재 `albumId` 등 모델 필드만 준비

## 기여 및 콘텐츠 권리

변경 전 [`AGENTS.md`](AGENTS.md)를 확인하고, UI 작업은 [`디자인 시스템`](docs/DESIGN_SYSTEM.md)을 따릅니다. PR에는 변경 목적과 검증 결과를 기록하며, 디자인 기준을 바꾸는 경우 사전 승인과 문서 갱신을 먼저 진행합니다.

현재 저장소에는 별도의 `LICENSE` 파일이 없습니다. 코드의 재사용 조건은 저장소 소유자에게 확인해야 하며, 사진의 저작권과 초상권·사용 허가는 코드와 별도로 확인해야 합니다.
