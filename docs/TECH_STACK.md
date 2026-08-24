# 기술 스택 및 아키텍처 결정

> 상태: Approved / Development Baseline v1.1
>
> 결정일: 2026-08-18
> 최종 갱신일: 2026-08-19

## 1. 문서 목적

이 문서는 `ihatecolor_storage`의 실제 애플리케이션을 구현하기 전에 확정한 기술 스택과 데이터 경계를 기록한다. 구현 과정에서 기술 선택을 변경할 필요가 생기면 변경 이유와 영향을 먼저 검토한 후 이 문서를 갱신한다.

시각 디자인에 관한 기준은 이 문서가 아니라 [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)를 따른다. `prototype-c/`는 랜딩 페이지, `prototype-b/`는 사진 목록 페이지의 시각적 비교 기준이며 실제 애플리케이션 코드와 분리해 보존한다.

## 2. 확정된 기술 스택

| 영역             | 선택                           | 상태      | 선택 이유                                                                                       |
| ---------------- | ------------------------------ | --------- | ----------------------------------------------------------------------------------------------- |
| 웹 프레임워크    | Astro 7.2.2                    | 확정      | 콘텐츠 중심 포트폴리오를 정적으로 생성하고 필요한 부분에만 클라이언트 동작을 추가하기 적합하다. |
| 언어             | TypeScript 6.0.3 / strict mode | 확정      | 콘텐츠와 CMS 응답의 필드 누락 및 타입 오류를 구현 단계에서 발견하기 위해 사용한다.              |
| 패키지 매니저    | pnpm 11.22.0                   | 확정      | 엄격한 의존성 구조, 설치 캐시, 향후 사이트와 CMS Studio를 함께 관리할 가능성을 고려했다.        |
| Node.js          | 24.19.0 LTS                    | 확정      | 회사와 집에서 동일한 실행 환경을 재현할 수 있도록 정확한 버전을 고정한다.                       |
| 초기 콘텐츠 소스 | 로컬 Astro Content Collection  | 확정      | CMS가 준비되기 전에도 실제 데이터 계약에 가까운 모크 콘텐츠로 개발하기 위해 사용한다.           |
| 최종 콘텐츠 소스 | Sanity CMS                     | 확정      | 사진작가가 별도의 개발 작업 없이 사진과 메타데이터를 직접 관리할 수 있는 편집 화면을 제공한다.  |
| 개발환경         | Docker                         | 확정      | 운영체제와 장소에 관계없이 동일한 Node.js와 pnpm 환경을 사용하기 위해 구성한다.                 |
| 에디터 환경      | VS Code Dev Containers         | 확정      | Compose의 `web` 서비스를 재사용하고 프로젝트 확장 프로그램을 자동 설치한다.                     |
| 코드 품질        | ESLint 10.8.1 / Prettier 3.9.6 | 확정      | 정적 분석과 포맷팅의 역할을 분리하고 로컬과 CI에서 동일한 명령을 실행한다.                      |
| CI               | GitHub Actions                 | 구성 완료 | PR과 `main` push에서 `pnpm validate`를 실행한다.                                                |

## 3. 패키지 버전 정책

현재 개발 기반에는 다음 버전을 정확히 고정했다.

- Astro `7.2.2`
- Sharp `0.35.3`
- pnpm `11.22.0`
- TypeScript `6.0.3`
- `@astrojs/check` `0.9.10`
- `@eslint/js` `10.0.1`
- `@typescript-eslint/parser` `8.67.0`
- `typescript-eslint` `8.67.0`
- ESLint `10.8.1`
- `eslint-plugin-astro` `3.1.0`
- Prettier `3.9.6`
- `prettier-plugin-astro` `0.14.1`

다음 버전은 해당 기능을 도입할 때 안정 버전을 확인한 후 고정한다.

- Sanity SDK 및 Studio의 정확한 버전
- 테스트 도구의 정확한 버전

릴리스 후보나 실험 버전은 명시적인 필요가 없는 한 사용하지 않는다. `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`과 Docker 설정을 함께 갱신하고 타입 검사 및 정적 빌드를 다시 수행한다.

`@astrojs/check 0.9.10`의 peer dependency 범위가 TypeScript 7을 지원하지 않아, 지원 범위 내 최신 안정 버전인 TypeScript `6.0.3`을 사용한다.

## 4. 콘텐츠 모델

초기 구현에서 사진 한 장을 하나의 독립된 작품으로 취급한다.

### 4.1 Photo

필수 필드:

| 필드        | 목적                                           |
| ----------- | ---------------------------------------------- |
| `id`        | 데이터 소스가 바뀌어도 작품을 식별하는 영구 ID |
| `slug`      | `/photos/[slug]` 형식의 안정적인 공개 URL      |
| `image`     | 로컬 이미지 또는 CMS 이미지 참조               |
| `title`     | 작품명                                         |
| `altText`   | 이미지의 의미를 전달하는 대체 텍스트           |
| `status`    | `draft` 또는 `published` 게시 상태             |
| `sortOrder` | 목록과 랜딩에서의 표시 순서                    |

선택 필드:

| 필드       | 목적                                 |
| ---------- | ------------------------------------ |
| `caption`  | 작품에 대한 짧은 설명                |
| `location` | 공개 가능한 촬영 장소                |
| `shotAt`   | 공개 가능한 촬영일 또는 연도         |
| `category` | 필터나 분류에 사용할 범주            |
| `albumId`  | 향후 앨범 기능을 위한 선택적 연결 ID |

`id`와 `slug`는 앨범에 종속시키지 않는다. 향후 앨범이 추가되더라도 기존 사진 URL을 유지해 URL 변경과 리디렉션을 최소화한다.

### 4.2 향후 Album 확장

초기 버전에는 앨범 기능을 구현하지 않는다. 필요해지면 `Album 1 : N Photo` 관계를 추가하고 `Photo.albumId`로 연결한다.

- 기존 독립 사진은 앨범이 없는 상태로 유지할 수 있다.
- 필요하면 기존 사진을 `Singles`와 같은 기본 앨범으로 마이그레이션할 수 있다.
- 앨범 추가가 기존 `Photo`의 영구 ID와 URL을 변경해서는 안 된다.

## 5. 로컬 모크 콘텐츠

초기 콘텐츠는 로컬 Astro Content Collection으로 관리한다. 사진 한 장마다 데이터 파일과 이미지를 함께 둔다.

```text
src/data/photos/
  mock-photo-01/
    index.md
    image.jpg
  mock-photo-02/
    index.md
    image.jpg
```

`index.md`의 frontmatter는 `Photo` 모델을 따르고 본문은 비워둘 수 있다. 로컬 이미지는 Astro가 크기 추론과 이미지 최적화를 수행할 수 있도록 `src/` 아래에 둔다.

현재 `src/content.config.ts`의 `photos` 컬렉션이 이 계약을 검증한다. `id`, `slug`, `image`, `title`, `altText`, `status`, `sortOrder`가 누락되거나 형식에 맞지 않으면 Astro 동기화와 빌드가 실패한다. 세부 작성 규칙과 frontmatter 예시는 [`src/data/photos/README.md`](../src/data/photos/README.md)에 기록한다.

애플리케이션은 `src/lib/content/photos.ts`의 조회 함수만 사용한다. 이 계층은 다음 규칙을 적용한다.

- 기본 조회에서는 `published` 사진만 반환한다.
- `id`, `slug`, `sortOrder` 중복을 오류로 처리한다.
- `sortOrder` 오름차순으로 정렬한다.
- UI가 로컬 파일 구조나 Astro 컬렉션 엔트리에 직접 의존하지 않게 한다.

모크 데이터는 정상적인 예시만 포함하지 않는다. 다음 상태도 함께 준비한다.

- 세로형, 가로형, 정사각형과 극단적인 비율의 이미지
- 짧은 제목과 긴 제목
- 선택 메타데이터가 없는 사진
- 빈 목록과 사진 한 장만 있는 목록
- 페이지네이션 경계보다 많은 사진
- `draft`와 `published` 상태

현재 `src/data/photos/`에는 위 조건을 검증하기 위한 13개 모크 작품이 있다. 기존 프로토타입 사진의 복사본, 개발 fixture 전용 극단 비율 이미지 2개와 정확한 `1254×1254` 정사각형 이미지 1개를 사용하며, 실제 포트폴리오 콘텐츠로 취급하지 않는다.

빈 목록과 한 장 목록은 별도 데이터 파일을 중복해 만들지 않고 `src/lib/content/photo-scenarios.ts`에서 재현한다. 사진 목록은 페이지당 9개를 사용하며 페이지네이션 경계 시나리오는 호출 시 전달한 `pageSize + 1`개를 반환한다.

사진 목록의 로컬 이미지는 Astro `Image` 컴포넌트와 Sharp를 통해 여러 크기의 WebP로 정적 최적화한다. 목록 첫 행의 세 이미지만 우선 로딩하고 나머지는 지연 로딩한다.

초기에는 실제 네트워크 API가 없으므로 MSW와 같은 API 모킹 도구를 도입하지 않는다. CMS 연동이나 네트워크 오류 테스트가 필요해지는 시점에 추가한다.

## 6. CMS 전환 원칙

최종 운영에서는 사진작가가 Sanity Studio에 로그인해 사진과 공개 정보를 관리한다.

- 로컬 모크 데이터와 Sanity 응답은 동일한 애플리케이션 `Photo` 모델로 정규화한다.
- 화면 컴포넌트에서 Sanity SDK를 직접 호출하지 않는다.
- 콘텐츠 조회 계층 또는 어댑터를 두어 로컬 소스와 Sanity 소스를 교체한다.
- 별도의 커스텀 관리자 화면과 범용 백엔드 API는 초기 범위에 포함하지 않는다.
- 사진을 공개한 뒤 사이트에 반영하는 빌드 및 배포 방식은 배포 환경을 결정할 때 확정한다.

## 7. 사진 권한과 EXIF 정책

사진의 초상권과 사용 허가 여부는 사진을 게시하는 사진작가가 판단한다. 사이트는 그 판단을 대신하지 않는다.

기술적으로는 다음 원칙을 적용한다.

- 원본 사진은 CMS의 정책에 따라 보관할 수 있다.
- 공개 웹 이미지에서는 GPS, 촬영 시각, 기기 정보 등 불필요한 EXIF를 제거한다.
- 저작권자 표기가 필요하면 원본 EXIF에 의존하지 않고 별도의 구조화된 필드로 관리한다.
- CMS의 이미지 변환 결과에서 메타데이터가 실제로 제거되는지 출시 전에 검증한다.
- 필요하면 사진작가가 확인할 수 있는 비공개 게시 승인 필드를 CMS에 추가한다.

## 8. Docker 개발환경 원칙

Docker는 개발 도구 버전을 통일하지만 소스 코드와 비밀값을 자동으로 동기화하지는 않는다. 다음 요소를 함께 사용한다.

- Git 원격 저장소로 소스와 lockfile 동기화
- Node.js `24.19.0` 고정
- pnpm 안정 버전 고정
- Astro 개발 서버 포트 노출
- 소스 디렉터리 bind mount
- `node_modules` 및 pnpm 저장소용 Docker named volume 또는 BuildKit cache
- `.env.example`로 필요한 환경변수 이름만 문서화
- 실제 Sanity 토큰과 비밀값은 Git에 커밋하지 않음

초기 Docker 구성은 Astro 애플리케이션 하나만 실행한다. 관리형 Sanity를 사용하므로 데이터베이스나 CMS 서버를 로컬 Compose 서비스로 먼저 추가하지 않는다. 실제로 두 번째 서비스가 필요해질 때 `compose.yaml`을 확장한다.

Astro 개발 서버는 컨테이너의 대표 프로세스로 실행한다. `docker compose up`으로 컨테이너와 서버를 함께 시작하고, `/health` healthcheck로 준비 상태를 확인하며, `docker compose down`으로 함께 종료한다.

현재 구현 파일:

- `Dockerfile`: Node.js `24.19.0`, pnpm `11.22.0`, Git과 SSH 클라이언트를 포함한 개발 이미지
- `compose.yaml`: Astro 개발 서버, bind mount, `node_modules`와 pnpm 저장소 volume, healthcheck
- `.dockerignore`: 이미지 빌드에 불필요한 프로토타입, 문서, 로컬 출력과 비밀값 제외
- `.env.example`: 호스트의 Astro 포트 예시
- `pnpm-workspace.yaml`: 의존성 설치 스크립트 중 `esbuild`만 명시적으로 허용
- `.devcontainer/devcontainer.json`: 기존 Compose의 `web` 서비스를 재사용하는 VS Code Dev Container
- `.vscode/extensions.json`: 프로젝트 및 컨테이너에 필요한 VS Code 확장 프로그램 추천 목록
- `.vscode/settings.json`: 저장 시 포맷, ESLint 자동 수정과 Astro 포매터 설정
- `eslint.config.js`: TypeScript와 Astro를 검사하는 ESLint Flat Config
- `.prettierrc.mjs`: Astro 공식 Prettier 플러그인 설정
- `.github/workflows/ci.yml`: PR과 `main` push에서 품질 검사와 정적 빌드를 실행하는 GitHub Actions Workflow

Windows와 Docker Desktop의 bind mount에서도 파일 변경을 감지할 수 있도록 개발 컨테이너에서는 polling을 사용한다. Astro 텔레메트리는 컨테이너에서 비활성화한다.

VS Code에서는 Dev Containers 확장 프로그램으로 프로젝트를 열면 Astro, ESLint, Prettier, YAML, markdownlint 확장 프로그램이 컨테이너에 자동 설치된다. Dev Containers와 Containers 확장 프로그램 자체는 호스트 VS Code에 설치한다. 비교 기준인 `prototype-b/`와 `prototype-c/`는 ESLint와 Prettier 검사 대상에서 제외한다.

상세 실행 방법은 [`DEVELOPMENT.md`](./DEVELOPMENT.md)를 따른다.

## 9. 검증 및 CI

### 9.1 현재 검증 파이프라인

`pnpm validate`는 다음 명령을 순서대로 실행한다.

1. ESLint로 JavaScript, TypeScript와 Astro 정적 분석
2. Prettier로 관리 대상 파일의 포맷 검사
3. `astro check`로 Astro와 TypeScript 진단
4. `astro build`로 정적 사이트 생성 검증

GitHub Actions는 `main` 대상 PR, `main` push와 수동 실행에서 같은 `pnpm validate` 명령을 사용한다. Node.js와 pnpm 버전은 로컬 및 Docker 환경과 동일하게 고정한다.

현재 `Dockerfile`은 배포용 이미지가 아니라 개발환경 이미지다. 따라서 PR CI에서는 `docker build`를 필수 검사로 실행하지 않는다. 실제 배포용 이미지가 생기면 별도의 Docker 빌드 작업을 추가한다.

Workflow 파일만으로 병합이 차단되지는 않는다. GitHub Ruleset에서 `main` 브랜치의 `Validate and build` Check를 필수 상태 검사로 별도 지정해야 한다. Ruleset은 GitHub 저장소 설정이므로 이 저장소 파일만으로 관리되지 않는다.

### 9.2 추후 도입할 검증 도구

- Vitest: 콘텐츠 변환, 스키마와 유틸리티 단위 테스트
- Playwright: 랜딩, 사진 목록, 페이지네이션, 라이트박스와 키보드 동작 검증
- 배포용 Docker 빌드 검사: 운영 이미지가 추가된 이후 도입

## 10. 초기 구현 순서

1. [완료] Astro와 TypeScript strict 프로젝트 초기화
2. [완료] pnpm 및 Node.js 버전 고정
3. [완료] Docker 개발환경과 실행 명령 구성
4. [완료] VS Code Dev Container와 코드 품질 도구 구성
5. [완료] GitHub Actions 검증 Workflow 작성
6. [완료] `Photo` 스키마와 로컬 Content Collection 작성
7. [진행 중] 모크 콘텐츠 기반 사진 목록과 페이지네이션 구현 완료, 랜딩·상세 흐름은 예정
8. [진행 중] 목록 이미지 최적화와 기본 접근성 적용 완료, 자동화 테스트는 예정
9. [예정] Sanity 스키마 및 콘텐츠 어댑터 연결
10. [예정] 배포 환경과 CMS 게시 후 갱신 방식을 확정

## 11. 공식 참고 문서

- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Images](https://docs.astro.build/en/guides/images/)
- [pnpm Docker](https://pnpm.io/docker)
- [pnpm Build Settings](https://pnpm.io/settings/build)
- [Node.js 릴리스 현황](https://nodejs.org/en/about/previous-releases)
- [Sanity 이미지 타입](https://www.sanity.io/docs/studio/image-type)
