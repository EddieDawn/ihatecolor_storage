# Day 5 — 랜딩 페이지 구현과 CMS 전환 전 구조 정리

> 작업일: 2026-08-24  
> 프로젝트: 웨딩 스냅 사진작가 포트폴리오 사이트

## 1. 작업 목표

승인된 `prototype-c/`를 기준으로 실제 랜딩 페이지를 구현하고, 외부 검토용 단일 HTML 산출물을 추가했다. 개발환경에서는 Docker 컨테이너와 Astro 서버의 실행 방식을 다시 통합하고 healthcheck를 보완했다. 이후 `feat/CMS` 브랜치에서 CMS 구현을 시작하기 전에 현재 사진 콘텐츠의 로딩·가공·표시 흐름을 검토하고 불필요한 파일과 혼동되는 이름을 정리했다.

## 2. 사진 목록 hover 동작 수정

사진 목록 카드에 적용되던 확대 효과를 제거했다. 데스크톱에서는 사진이 기본 흑백으로 표시되고 hover 시 컬러로 전환되는 동작만 유지한다.

구현과 디자인 문서가 어긋나지 않도록 `docs/DESIGN_SYSTEM.md`도 승인된 동작에 맞춰 함께 갱신했다.

관련 커밋:

- `e3f86a1` — `fix: eleminated enlargement on hover`

## 3. Docker 컨테이너와 Astro 서버 실행 재통합

Docker의 `web` 서비스가 컨테이너 시작 시 의존성을 lockfile과 동기화한 뒤 Astro 개발 서버를 대표 프로세스로 실행하도록 구성했다. `/health` 엔드포인트를 이용하는 healthcheck도 다시 연결했다.

함께 반영한 내용:

- `compose.yaml`의 서버 실행 및 healthcheck 구성
- `Dockerfile`의 개발 서버 실행 명령 보완
- `docs/DEVELOPMENT.md` 실행 안내 수정
- `docs/TECH_STACK.md`의 Docker 개발환경 설명 동기화
- `AGENTS.md` 정리

관련 커밋:

- `e67d794` — `infra: integrated server and container lifetime, additional healthcheck`
- `180e6b5` — `fix: agents.md and codex review : p2`
- PR #12 병합

## 4. 랜딩 페이지 구현

`src/pages/index.astro`의 자리표시자를 실제 랜딩 페이지로 교체했다. 랜딩의 시각적 기준은 `prototype-c/`이며, 현재 로컬 Photo Content Collection에서 공개 사진을 조회해 지정된 작품을 각 영역에 배치한다.

주요 구현:

- Hero와 사진 에세이 레이아웃
- Astro `Image`를 이용한 반응형 이미지 생성
- IntersectionObserver 기반 reveal 동작
- `<dialog>` 기반 사진 뷰어
- 이전·다음 버튼 및 키보드 방향키 탐색
- 접근성용 skip link와 이미지 대체 텍스트
- 랜딩 전용 `src/styles/landing.css`
- Hero 제목을 두 줄로 유지하도록 보완

현재 랜딩은 `getPhotos()`로 공개 사진을 가져온 뒤 코드에 지정된 `slug` 7개를 선택한다. 따라서 해당 사진이 삭제되거나 draft로 바뀌면 빌드가 실패한다. CMS 전환 시 랜딩의 사진 선택까지 CMS에서 관리할지 별도 결정이 필요하다.

관련 커밋:

- `334df8e` — `feat: landing page generated`
- `4766bab` — `chore: made hero landing title to 2 line`
- PR #13 병합

## 5. 독립 실행 가능한 검토용 HTML 추가

Astro 빌드 결과의 CSS와 이미지를 한 HTML 파일 안에 삽입하는 export 스크립트를 추가했다.

- `scripts/export-landing-example.mjs`
- `scripts/export-photos-example.mjs`
- `landingpage_example.html`
- `photospage_example.html`

두 HTML은 외부 Astro asset 경로 없이 단독으로 열 수 있는 검토본이다. 실제 애플리케이션의 입력 파일은 아니며 `dist/`의 빌드 결과에서 생성한다.

관련 커밋:

- `0fb32bc` — `chore: example pages for namu`

## 6. CMS 전환 전 현재 콘텐츠 흐름 확인

현재 사진이 화면에 표시되는 흐름을 다음과 같이 확인했다.

```text
src/data/photos/**/index.md + image
              ↓
src/content.config.ts
로컬 파일 위치 지정 및 Photo 스키마 검사
              ↓
src/lib/content/photos.ts
조회, 중복 검사, 정렬, published 필터링
              ↓
     ┌────────┴────────┐
     ↓                 ↓
랜딩 페이지       사진 목록 라우트
                       ↓
              PhotoJournalView.astro
```

Astro는 내장된 파일 기반 라우팅 규칙에 따라 `src/pages/`를 페이지 진입점으로 사용한다. 페이지가 `getPhotos()`를 호출하고, `getPhotos()`가 `getCollection("photos")`를 호출하면서 `src/content.config.ts`에 등록된 로컬 사진 컬렉션이 로드된다.

CMS 도입 후에도 페이지와 화면의 전체 구조는 유지할 수 있다. 다만 `src/data/photos`를 직접 읽는 부분은 CMS 조회 어댑터로 교체하고, CMS 응답을 화면이 사용하는 공통 `Photo` 모델로 정규화해야 한다.

## 7. 사진 콘텐츠 구조 정리

애플리케이션에서 사용하지 않던 루트 `content/`의 카카오톡 이미지 5개를 제거했다. 실제 사이트의 로컬 사진은 계속 `src/data/photos/`에서 관리한다.

테스트나 실제 페이지 어디에서도 호출하지 않던 `src/lib/content/photo-scenarios.ts`도 삭제했다. 이 파일은 빈 목록, 사진 한 장, 페이지네이션 경계 상태를 인위적으로 만드는 보조 코드였지만 현재 연결된 소비자가 없었다. 실제 테스트를 도입할 때 테스트 목적에 맞는 fixture를 다시 작성하는 편이 구조상 더 명확하다.

`src/content.config.ts`에는 현재 역할이 로컬 데이터를 CMS처럼 사용하기 위한 설정이라는 설명을 추가했다.

## 8. 사진 목록 화면 컴포넌트 이름 변경

`PhotoListingPage.astro`는 독립 URL을 만드는 페이지가 아니라 `/photos/`와 `/photos/page/{page}/`가 공유하는 화면 컴포넌트다. `Page`라는 이름이 `src/pages`의 라우트 파일과 혼동될 수 있어 다음과 같이 변경했다.

```text
PhotoListingPage.astro
→ PhotoJournalView.astro
```

다음 두 라우트의 import와 사용 이름도 함께 변경했다.

- `src/pages/photos/index.astro`
- `src/pages/photos/page/[page].astro`

관련 커밋:

- `1112135` — `refactor: 사진 콘텐츠 구조 및 저널 뷰 이름 정리`

## 9. 확인한 주요 파일의 역할

- `astro.config.mjs`: 정적 출력 방식과 개발 서버 외부 접속 설정
- `src/env.d.ts`: TypeScript가 Astro 전용 타입을 인식하게 하는 선언 파일
- `src/content.config.ts`: 로컬 Photo Content Collection의 위치와 데이터 규칙 정의
- `src/lib/content/photos.ts`: 사진 조회와 공통 가공 경계
- `src/lib/content/photo-pagination.ts`: 페이지당 9장 분할과 URL 계산
- `src/pages/`: Astro의 파일 기반 라우팅 진입점
- `src/components/photos/PhotoJournalView.astro`: 여러 사진 목록 라우트가 공유하는 실제 저널 화면

## 10. 현재 상태와 다음 작업

완료:

- Prototype C 기반 랜딩 페이지 구현
- 랜딩 및 사진 목록 검토용 단일 HTML 생성 도구
- 사진 목록 hover 확대 제거
- Docker 개발 서버 실행과 healthcheck 재통합
- 미사용 루트 이미지와 `photo-scenarios.ts` 제거
- 사진 목록 화면 컴포넌트 이름 명확화
- CMS 전환 전 로컬 콘텐츠 흐름 확인

다음 작업:

1. CMS 제품과 운영 방식을 최종 확정한다.
2. CMS 데이터와 로컬 데이터가 공유할 `Photo` 애플리케이션 모델을 정의한다.
3. 로컬 Content Collection과 CMS 조회를 교체할 수 있는 콘텐츠 어댑터 경계를 설계한다.
4. Astro 로컬 이미지 타입과 CMS 원격 이미지 타입의 차이를 해결한다.
5. 랜딩 사진 선택과 문구를 CMS 관리 범위에 포함할지 결정한다.
6. 정적 빌드를 유지한다면 CMS 게시 후 재빌드·배포를 호출할 webhook 흐름을 정한다.

