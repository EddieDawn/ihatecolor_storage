# Day 7 — 사진 상세 흐름, 디자인 기준 이관과 Hero-only 랜딩 정리

> 작업일: 2026-08-27  
> 프로젝트: 웨딩 스냅 사진작가 포트폴리오 사이트

## 1. 작업 목표

사진 목록에서 개별 사진 상세 페이지로 이어지는 탐색 흐름을 완성하고, 더 이상 필요하지 않은 HTML 프로토타입을 제거했다. 이후 클라이언트 피드백에 따라 브랜드와 내비게이션을 정리하고 랜딩 페이지를 Hero-only 구조로 축소했다.

Sanity Studio에는 잘못된 slug를 게시 전에 막는 입력 가드레일을 추가하고, 랜딩 CMS 계약도 Hero 사진 한 장만 관리하도록 단순화했다.

## 2. 사진 상세 페이지와 복귀 흐름

`/photos/[slug]/` 정적 라우트와 사진 상세 레이아웃을 구현했다.

주요 동작:

- 사진 목록 카드와 랜딩 Hero 사진에서 상세 페이지로 이동
- 사진은 화면 안에서 `object-fit: contain`으로 전체 구도를 유지
- 목록에서 진입하면 사진이 속한 목록 페이지로 복귀
- 랜딩에서 진입하면 랜딩 페이지로 복귀
- 같은 사이트의 정상적인 이전 화면이 있으면 브라우저 기록을 이용해 기존 스크롤 위치 보존
- 잘못된 URL fragment를 제거한 뒤에도 페이지 단위 복귀 경로 유지

관련 커밋:

- `2ee5143` — slug 기반 사진 상세 페이지 라우트 추가
- `1304aee` — 사진 상세 페이지 레이아웃
- `d308cd1` — 사진 카드 링크 연결
- `ee7835b` — 사진이 속한 목록 복귀 경로 계산
- `21fdf39` — 랜딩·목록 진입 경로 구분
- `b566dfd` — 브라우저 기록을 이용한 이전 위치 복귀
- PR #20 병합

## 3. HTML 프로토타입 제거와 디자인 시스템 이관

실제 제품 화면 구현이 완료되어 비교용 `prototype-b/`, `prototype-c/`를 삭제했다. 삭제 전에 현재 구현에 남아 있던 중요 규칙을 `docs/DESIGN_SYSTEM.md`로 옮겼다.

이관한 주요 기준:

- 랜딩과 사진 목록의 색상 토큰 및 폰트 스택
- 데스크톱 헤더, 여백과 그리드
- 사진 목록의 3열 카드와 페이지당 9장
- 카드 비율, 캡션, 흑백·컬러 전환
- 사진 상세 페이지의 3열 구조와 `contain` 이미지 처리
- 사진 목록 모바일 레이아웃
- 텍스트 링크, 다이얼로그와 모션 규칙

함께 정리한 파일:

- `AGENTS.md`
- `.dockerignore`
- `.prettierignore`
- `eslint.config.js`
- `docs/DEVELOPMENT.md`
- `docs/TECH_STACK.md`

과거 작업 기록인 `archive/`의 프로토타입 언급은 당시 사실을 보존하기 위해 수정하지 않았다.

관련 커밋:

- `dfaf1a2` — 프로토타입 제거와 디자인 문서 독립화

## 4. URL fragment와 skip link 제거

사이트의 화면 내부 해시 이동을 모두 제거했다.

제거 범위:

- `#top`, `#story`, `#journal-grid`, `#journal-title`, `#photo`
- `Story`, `Index`, `Back to top` 해시 링크
- 페이지네이션 URL의 `#journal-title`
- `window.location.hash`, `scrollIntoView()`와 포커스 이동 코드
- 모든 skip link와 관련 CSS

일반 페이지 이동, 사진 상세 이동, 페이지네이션과 상세 복귀 링크는 유지했다.

관련 커밋:

- `706e172` — 해시 앵커 및 관련 코드 제거

## 5. 브랜드와 사진 목록 헤더 정리

임시 브랜드 `FIELD`를 실제 작가명 `Justyes`로 교체했다.

교체 범위:

- 사진 목록 중앙 워드마크
- 브라우저 문서 제목
- 사진 상세 문서 제목
- 홈 링크 설명
- 푸터 저작권 표기

사진 목록 헤더는 다음 구조로 단순화했다.

```text
Contact        Justyes        Instagram
```

- 중복된 현재 페이지 링크 `Journal` 제거
- 미구현 `Photographer` 제거
- `Seoul, KR` 제거
- 중앙 `Justyes`를 랜딩 페이지(`/`)에 연결
- `Instagram`을 Justyes Gallery 공식 계정에 연결

사진 목록의 별도 소개 섹션도 제거했다. 헤더 다음에는 `Journal` 도구 모음과 사진 카드가 바로 나타나며, 도구 모음의 `Journal`은 페이지 `h1` 역할을 한다.

## 6. 랜딩 페이지를 Hero-only 구조로 전환

랜딩 하단의 Story 사진 에세이를 처음에는 `hidden`으로 숨겼다가 최종적으로 완전히 삭제했다.

삭제 범위:

- Story 마크업과 여섯 장의 사진 렌더링
- Story 사진 변수와 메타데이터 처리
- IntersectionObserver 기반 스크롤 공개 스크립트
- 에세이 그리드, 인용문, 인터루드와 캡션 CSS
- 디자인 시스템의 Story 전용 타이포그래피·간격·모션 규칙

랜딩은 이제 화면 높이를 채우는 Hero 한 섹션만 렌더링한다.

### 6.1 Hero 왼쪽 레일

사진 목록 이동은 헤더의 `Photos` 대신 왼쪽 검정 레일 상단의 `Journal`로 옮겼다. 화살표는 `->` 문자가 아니라 가는 선으로 만든 SVG 아이콘을 사용한다.

왼쪽 레일의 최종 구조:

```text
Journal  [SVG →]



Contact    [SVG →]  — 목적지 미정, 링크 없음
Instagram  [SVG →]  — 공식 계정 연결

Wedding
Archive 2024—26
```

함께 제거한 정보:

- 헤더 우측의 `SEOUL, KR`
- 헤더 우측의 `STORIES / 2026`
- 왼쪽 하단 위도·경도 좌표

`Wedding Archive 2024—26`은 좌측 하단으로 이동했다.

## 7. Sanity 랜딩 계약 단순화

Story 제거에 맞춰 화면만 숨기는 데서 끝내지 않고 CMS와 데이터 계층에서도 Story 의존성을 제거했다.

변경 범위:

- Studio `landingPage` 스키마에서 `Story photos` 필드 제거
- `LandingPagePhotoSelection`에서 `storyPhotos` 제거
- GROQ 랜딩 쿼리에서 Story reference 조회 제거
- Zod 랜딩 응답 스키마에서 Story 6장 검증 제거
- Sanity 어댑터에서 Story 변환 제거
- 누락 오류 문구를 Hero 한 장 기준으로 수정
- Studio README와 기술 문서 갱신

이제 랜딩 페이지는 Sanity의 singleton `landingPage` 문서에서 `Hero photo` 한 장만 요구한다. 기존 dataset에 저장된 `storyPhotos` 값이 남아 있어도 새 Studio 화면과 사이트 조회에는 사용되지 않는다.

## 8. slug 입력 가드레일

Sanity에서 `sham_cat` 같은 slug를 저장하면 애플리케이션의 Zod 검증이 빌드 단계에서 실패하는 문제가 있었다.

원인은 애플리케이션과 Studio의 검증 규칙이 달랐기 때문이다. 애플리케이션은 다음 정규식을 사용했지만 Studio에는 동일한 입력 검증이 없었다.

```regex
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Studio의 `photo.slug`에도 같은 규칙을 추가했다.

허용 예시:

- `sham-cat`
- `cat2`
- `wedding-2026`

거부 예시:

- `sham_cat`
- `Sham-Cat`
- `sham--cat`
- 앞뒤 하이픈, 공백 또는 한글이 포함된 값

Studio는 게시 전에 한글 오류를 표시하고, 애플리케이션의 Zod 검증은 API 우회나 기존 잘못된 데이터에 대한 이중 방어로 유지한다. 이미 저장된 `sham_cat`은 자동 변경되지 않으므로 Sanity에서 직접 수정해야 한다.

## 9. Sanity Studio 배포 과정에서 확인한 사항

`sanity.io`에 호스팅된 Studio는 로컬 코드나 Docker 컨테이너 재실행만으로 갱신되지 않는다. 현재 GitHub Actions도 검사와 Astro 빌드만 수행하며 Studio 자동 배포는 포함하지 않는다.

Studio 배포 명령:

```sh
pnpm --dir studio deploy
```

컨테이너 안에서 `sanity login`을 실행했을 때 인증 callback이 `localhost:4321`을 가리켰다. 브라우저의 `localhost`는 호스트를 의미하고 해당 포트에는 Astro가 실행 중이어서 404가 발생했다.

현재 권장 절차:

```sh
docker compose stop web
corepack pnpm --dir studio exec sanity login
corepack pnpm --dir studio deploy
docker compose start web
```

즉 로그인과 배포는 브라우저와 같은 호스트 환경에서 수행하고, 인증 callback 포트 충돌을 피하기 위해 Astro `web` 서비스를 잠시 중단한다.

## 10. 문서와 검증

`docs/DESIGN_SYSTEM.md`를 v1.5에서 v1.14까지 갱신해 오늘 승인된 변경을 순서대로 기록했다. `docs/TECH_STACK.md`, `studio/README.md`도 실제 구현과 일치하도록 수정했다.

실행한 검증:

- ESLint 통과
- Prettier 통과
- Astro check: 0 errors, 0 warnings, 0 hints
- Sanity Studio TypeScript 검사 통과
- 주요 단계에서 Sanity 데이터를 포함한 Astro 정적 빌드 성공
- Hero 내비게이션 변경 후 1440×900 시각 확인

## 11. 현재 상태와 다음 작업

완료:

- 사진 상세 페이지와 진입 경로별 복귀 흐름
- 프로토타입 제거 및 디자인 규칙 문서 이관
- 모든 URL fragment 기반 화면 이동 제거
- `Justyes` 브랜드 표기 반영
- 사진 목록 헤더와 소개 영역 단순화
- Hero-only 랜딩 전환
- Hero 왼쪽 레일 내비게이션 정리
- Sanity 랜딩 계약을 Hero 한 장으로 축소
- Studio slug 입력 가드레일 추가

남은 작업:

1. Sanity의 기존 잘못된 slug가 있다면 하이픈 형식으로 수정한다.
2. 호스트에서 Sanity 로그인을 완료하고 Studio를 다시 배포한다.
3. 배포된 Studio에서 `Story photos`가 사라지고 `Hero photo`만 남는지 확인한다.
4. `Contact`의 실제 목적지 또는 동작을 결정한다.
5. 현재 작업 트리의 미커밋 변경을 검토한 뒤 커밋·푸시한다.
