# Day 3 — Photo 모델과 로컬 Content Collection 구현

> 작업일: 2026-08-19
> 프로젝트: 웨딩 스냅 사진작가 포트폴리오 사이트

## 1. 작업 목표

실제 웨딩 사진과 Sanity CMS를 연결하기 전에 화면 구현이 의존할 공통 `Photo` 데이터 계약을 코드로 확정했다. 초기 데이터 소스는 로컬 Astro Content Collection이며, 사진 한 장을 하나의 독립 작품으로 취급한다.

관련 Notion 작업:

- [Photo 모델과 로컬 Content Collection 구성](https://app.notion.com/p/3c0154b95f67811b8e95e01525a19f6f)

## 2. Photo 스키마

`src/content.config.ts`에 `photos` 컬렉션을 등록했다. `src/data/photos/**/index.md`를 로드하며 frontmatter가 스키마에 맞지 않으면 Astro 동기화와 빌드가 실패한다.

필수 필드:

- `id`: 데이터 소스가 바뀌어도 유지할 작품 ID
- `slug`: 공개 사진 URL에 사용할 식별자
- `image`: 작품 이미지
- `title`: 작품명
- `altText`: 이미지 대체 텍스트
- `status`: `draft` 또는 `published`
- `sortOrder`: 0 이상의 정수 표시 순서

선택 필드:

- `caption`
- `location`
- `shotAt`
- `category`
- `albumId`

## 3. 필드 검증 결정

- `slug`는 소문자 영문, 숫자와 단일 하이픈만 허용한다.
- `shotAt`은 `YYYY`, `YYYY-MM`, `YYYY-MM-DD` 형식만 허용한다.
- `category`는 실제 분류 체계를 정하기 전까지 비어 있지 않은 자유 문자열로 둔다.
- 선택 필드는 값이 없으면 빈 문자열을 넣지 않고 필드 자체를 생략한다.
- 향후 앨범 기능을 추가할 수 있도록 `albumId`를 선택 필드로 유지한다.

## 4. 콘텐츠 조회 경계

`src/lib/content/photos.ts`에 화면과 로컬 컬렉션 사이의 조회 계층을 추가했다.

- 기본 `getPhotos()`는 `published` 사진만 반환한다.
- 관리와 검증이 필요하면 `getPhotos({ status: "all" })`로 초안을 포함할 수 있다.
- `id`, `slug`, `sortOrder`는 전체 사진에서 각각 고유해야 한다.
- 결과는 `sortOrder` 오름차순으로 정렬한다.
- 화면 컴포넌트가 파일 경로나 Astro 컬렉션 엔트리 구조를 직접 처리하지 않게 한다.

이 경계를 유지하면 Sanity를 연결할 때 화면 컴포넌트를 CMS SDK에 직접 결합하지 않고 어댑터만 교체할 수 있다.

## 5. 콘텐츠 작성 문서

`src/data/photos/README.md`에 다음 내용을 기록했다.

- 사진 한 장당 디렉터리 하나를 사용하는 구조
- `index.md` frontmatter 예시
- 이미지 파일을 데이터 파일과 함께 두는 규칙
- 각 필드의 허용 형식
- `draft`와 `published` 조회 방법

실제 모크 작품과 경계 사례 데이터는 다음 작업인 `경계 사례를 포함한 로컬 모크 콘텐츠 작성`에서 추가한다.

## 6. 기술 문서와 Notion 동기화

`docs/TECH_STACK.md`의 초기 구현 순서에서 `Photo` 스키마와 로컬 Content Collection 작업을 완료로 변경했다. 콘텐츠 조회 원칙과 작성 문서 경로도 함께 추가했다.

Notion 작업 페이지에는 구현 파일, 검증 결과와 기술 결정을 기록하고 상태를 `완료`로 변경했다.

## 7. 검증 결과

임시 콘텐츠를 사용해 정상 입력과 오류 입력을 각각 확인했다.

- 유효한 Photo 콘텐츠: `astro check` 통과
- 공백과 대문자가 포함된 잘못된 slug: `InvalidContentEntryDataError` 발생 확인
- 최종 `pnpm validate`: 성공
- ESLint: 성공
- Prettier 검사: 성공
- Astro 진단: 오류 0, 경고 0, 힌트 0
- 정적 빌드: 성공
- `git diff --check`: 성공

현재 실제 Photo 엔트리가 없으므로 glob loader가 빈 컬렉션 경고를 출력한다. 이는 후속 모크 콘텐츠 작업 전까지 예상된 상태이며 빌드 실패는 아니다.

## 8. 다음 작업

1. 경계 사례를 포함한 로컬 모크 콘텐츠 작성
2. 모크 콘텐츠를 사용하는 사진 목록 페이지 구현
3. 명시적 숫자 페이지네이션 연결
4. 이미지 최적화와 접근성 검증

## 9. 로컬 모크 콘텐츠 구현

두 번째 구현 브랜치 `codex/photo-mock-content`에서 실제 화면 개발에 사용할 모크 콘텐츠를 추가했다. 이 브랜치는 아직 `main`에 병합되지 않은 Photo 스키마가 필요하므로 `codex/photo-content-collection` 위에 쌓았다.

총 13개 Photo 엔트리를 구성했다.

- `published` 10개, `draft` 3개
- 세로형, 정사각형, 약 `3:1` 가로형, 약 `1:3` 세로형 이미지
- 긴 작품명과 긴 캡션
- 선택 메타데이터를 모두 생략한 작품
- 연도, 연월, 전체 날짜 형식의 `shotAt`
- `people`, `places`, `quiet` 범주 예시

기존 사진 10개는 `prototype-b/` 원본을 변경하지 않고 각 모크 콘텐츠 디렉터리로 복사했다. 가로·세로 극단 비율을 검증하기 위한 비식별 풍경 및 건축 이미지 2개는 개발 fixture 용도로 별도 생성했다.

페이지당 카드 수는 아직 승인되지 않았으므로 코드에 고정하지 않았다. `src/lib/content/photo-scenarios.ts`에 다음 시나리오를 추가하고 페이지네이션 경계만 호출 시점의 `pageSize + 1`로 계산한다.

- 전체 목록
- 빈 목록
- 사진 한 장 목록
- 페이지네이션 경계 초과 목록

임시 정적 엔드포인트를 사용해 실제 Astro Content Collection 조회 결과를 확인한 뒤 검증 파일은 제거했다.

- 전체 13개
- 공개 10개
- 초안 3개
- 빈 목록 0개
- 단일 목록 1개
- 페이지 크기 9 기준 경계 목록 10개

최종 `pnpm validate`에서도 ESLint, Prettier, Astro 진단과 정적 빌드가 모두 성공했다.

## 10. 브랜치 의존성과 병합 순서

두 번째 브랜치는 첫 번째 Photo 스키마 구현에 의존한다.

```text
main
└─ codex/photo-content-collection
   └─ codex/photo-mock-content
```

따라서 다음 순서를 지킨다.

1. `codex/photo-content-collection`을 `main` 대상으로 PR을 만들고 먼저 병합한다.
2. 원격 `main`이 갱신된 뒤 로컬에서 두 번째 브랜치로 이동한다.
3. 첫 번째 작업 커밋 `a872bc6` 이후의 두 번째 작업 커밋만 최신 `main` 위로 재배치한다.
4. rebase로 원격 브랜치 이력이 바뀌므로 `--force-with-lease`로 안전하게 갱신한다.
5. `codex/photo-mock-content`를 `main` 대상으로 PR을 만들고 병합한다.

```sh
git switch codex/photo-mock-content
git fetch origin
git rebase --onto origin/main a872bc6
git push --force-with-lease
```

## 11. Studio IVE 형식을 반영한 사진 목록 구현

세 번째 구현 브랜치 `codex/photos-page`에서 [Studio IVE Journal](https://www.studioive.co/journal/)과 승인된 `prototype-b/`를 기준으로 실제 사진 목록 페이지를 만들었다. 비교 기준인 프로토타입 파일은 수정하지 않았다.

디자인 결정:

- 데스크톱은 정확히 3열, 페이지당 9개 작품을 표시한다.
- 숫자 페이지네이션은 목록 하단에 한 번만 둔다.
- 무한 스크롤과 자동 추가 로딩은 사용하지 않는다.
- 이미지는 3:4 프레임으로 통일하고 기본 흑백, 호버·키보드 포커스 시 컬러로 전환한다.
- 캡션 왼쪽에는 작품명, 오른쪽에는 장소와 연도를 배치한다.
- 분류 필터는 아직 승인되지 않았으므로 구현하지 않았다.

정적 URL:

- 첫 페이지: `/photos/`
- 두 번째 페이지부터: `/photos/page/{page}/`

현재 공개 모크 사진은 10개이므로 첫 페이지에 9개, `/photos/page/2/`에 1개가 생성된다. `draft` 사진 2개는 공개 목록에서 제외된다.

## 12. 이미지 최적화와 검증

Astro `Image` 컴포넌트를 사용해 카드 폭에 맞는 여러 크기의 WebP를 생성한다. 정적 이미지 변환에 필요한 Sharp `0.35.3`을 정확한 버전으로 고정했다. 첫 행 세 장은 우선 로딩하고 이후 카드는 지연 로딩한다.

접근성과 상호작용:

- 본문 건너뛰기 링크
- 현재 페이지의 `aria-current`
- 사진별 대체 텍스트
- 키보드로 열고 닫을 수 있는 확대 다이얼로그
- 좌우 화살표로 현재 페이지 사진 이동
- `prefers-reduced-motion` 대응

Docker 개발환경의 Node.js `24.19.0`, pnpm `11.22.0`에서 `pnpm validate`가 통과했다.

- ESLint: 성공
- Prettier 검사: 성공
- Astro 진단: 오류 0, 경고 0, 힌트 0
- 정적 빌드: 성공
- `/photos/`, `/photos/page/2/` 생성 확인
- 반응형 WebP 40개 생성 확인

1440×900 실제 렌더링도 별도로 확인했다.

- 카드 9개와 정확한 3열 구성
- 각 열 너비 약 402px
- 가로 스크롤 없음
- 하단 숫자 페이지네이션
- 두 번째 페이지 카드 1개
- 사진 확대 다이얼로그 정상 동작

## 13. 세 번째 브랜치까지의 병합 순서

사진 목록 브랜치는 앞선 두 작업에 의존한다.

```text
main
└─ codex/photo-content-collection
   └─ codex/photo-mock-content
      └─ codex/photos-page
```

따라서 PR도 `photo-content-collection` → `photo-mock-content` → `photos-page` 순서로 병합한다. 각 선행 PR이 `main`에 들어간 뒤 다음 브랜치를 최신 `main` 위로 재배치하면 해당 PR에는 자기 작업 커밋만 남는다.

두 번째 PR을 먼저 병합하면 아직 검토되지 않은 첫 번째 Photo 스키마 작업까지 함께 들어가므로 순서를 바꾸지 않는다. `--force` 대신 원격의 예상치 못한 변경을 보호하는 `--force-with-lease`를 사용한다.

## 14. PR 리뷰 반영과 사진 목록 마무리

`codex/photos-page` PR에 작성된 Codex 리뷰 세 건을 검토하고 다음과 같이 처리했다.

### 미구현 메뉴 안내

현재 랜딩 페이지에는 `Photographer`와 `Contact` 목적지가 없으므로 빈 페이지로 이동하던 링크를 제거했다. `Photographer`, `Contact`, `Instagram`을 선택하면 각각 현재 준비 중이라는 안내 다이얼로그를 표시한다.

### 라이트박스 제거

기존 라이트박스는 목록 카드용으로 생성된 작은 이미지 URL을 확대 화면에서도 그대로 사용해 큰 화면이나 고해상도 디스플레이에서 선명도가 떨어질 수 있었다.

향후 앨범 단위 콘텐츠까지 고려하면 목록에서 라이트박스를 바로 여는 방식보다 작품 또는 앨범마다 독립된 상세 URL을 제공하는 방식이 적합하다고 판단했다. 곧 교체할 라이트박스의 이미지 처리만 임시로 수정하지 않고 이번 PR에서 라이트박스 마크업, 스크립트와 스타일을 모두 제거했다. 현재 사진 카드는 상세 URL을 구현하기 전까지 클릭되지 않는 일반 이미지다.

상세 URL과 앨범 페이지는 별도 PR에서 구현한다. 상세 페이지 안에서 개별 사진 확대가 필요해질 때 큰 이미지용 반응형 리소스를 사용하는 라이트박스를 다시 검토한다.

### 목록의 흑백 처리

데스크톱 기본 흑백 상태가 마우스가 있는 기기에서만 적용되던 조건을 수정했다. 이제 데스크톱에서는 포인터 종류와 관계없이 기본 흑백이 적용되고, 호버가 가능한 환경에서만 컬러 전환과 확대가 발생한다.

모바일에서 화면 중앙에 완전히 들어온 사진만 컬러로 바꾸는 방식은 구현 가능성을 확인했지만, 모바일 흑백·컬러 정책이 아직 디자인 시스템의 미결정 사항이므로 이번 PR에는 포함하지 않았다.

### 페이지네이션 정리

- 페이지 크기 `9`와 페이지 URL 생성 로직을 `src/lib/content/photo-pagination.ts`로 모았다.
- 첫 페이지와 동적 페이지가 같은 계산 함수를 사용하도록 중복을 제거했다.
- 페이지별 문서 제목과 HTML의 `prev`, `next` 링크를 추가했다.
- 공개 사진 10개 기준으로 첫 페이지 9개, 두 번째 페이지 1개가 생성되는지 확인했다.
- `src/data/photos/README.md`의 페이지당 카드 수를 확정된 디자인 시스템과 일치시켰다.

검증 결과:

- ESLint: 성공
- Prettier 검사: 성공
- Astro 진단: 오류 0, 경고 0, 힌트 0
- 정적 빌드: 성공
- 첫 페이지의 `Next`, 두 번째 페이지의 `Previous` 링크 확인
- 라이트박스 관련 코드가 남아 있지 않음을 확인

로컬 검증 환경의 Node.js는 프로젝트 고정 버전 `24.19.0`이 아닌 `26.5.0`이어서 engine 경고가 출력됐지만 전체 검증은 통과했다. 변경 후 자동 1440×900 시각 검수는 앱 브라우저 연결 오류로 실행하지 못했다.

## 15. 짧은 응답 규칙

반복해서 긴 응답 지시를 작성하지 않도록 `AGENTS.md`에 다음 규칙을 추가했다.

```text
질문이 `YN:`으로 시작하면 설명 없이 `예` 또는 `아니요`만 출력한다.
```

단순 응답 규칙은 별도의 Codex Skill로 만드는 것보다 짧은 프로젝트 지침으로 유지하는 편이 토큰 사용과 관리 비용 면에서 적합하다고 판단했다.
