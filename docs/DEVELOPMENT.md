# Docker 개발환경 사용법

## 1. 전제 조건

- Docker Desktop 또는 Docker Engine과 Docker Compose가 실행 중이어야 한다.
- 소스 코드는 Git 원격 저장소로 회사와 집 사이에서 동기화한다.
- Node.js와 pnpm을 호스트에 별도로 설치할 필요는 없다.
- 개발 컨테이너에는 Git과 SSH 클라이언트가 포함된다.

## 2. 개발 서버 시작

프로젝트 루트에서 실행한다.

```powershell
docker compose up --build --detach web
```

이 명령은 개발 컨테이너와 Astro 개발 서버를 함께 시작한다. 별도의 컨테이너 셸에서 `pnpm dev`를 다시 실행하지 않는다.

컨테이너 상태를 확인한다.

```powershell
docker compose ps
```

`web` 서비스가 `healthy`라면 다음 주소에서 상태를 확인할 수 있다.

- 개발 서버: `http://localhost:4321/`
- 상태 확인: `http://localhost:4321/health`

현재 루트 페이지는 제품 UI를 구현하기 전의 빈 자리표시자다. 제품 화면은 `prototype-c/`와 `docs/DESIGN_SYSTEM.md`를 기준으로 별도 구현한다.

### VS Code Dev Container로 열기

1. 호스트 VS Code에 `Dev Containers`와 `Containers` 확장 프로그램을 설치한다.
2. 프로젝트 폴더를 연다.
3. 명령 팔레트에서 `Dev Containers: Reopen in Container`를 실행한다.
4. 최초 생성이 끝나면 Astro, ESLint, Prettier, YAML, markdownlint 확장 프로그램이 컨테이너에 자동 설치된다.

Dev Container는 별도 개발환경을 만들지 않고 `compose.yaml`의 `web` 서비스를 그대로 재사용한다.
Astro 개발 서버는 컨테이너의 대표 프로세스로 실행되며 서버 로그는 Docker 로그에서 확인한다.

## 3. 로그 확인

```powershell
docker compose logs --follow web
```

## 4. 전체 검증

개발 서버가 실행 중이면 기존 컨테이너에서 검증한다.

```powershell
docker compose exec web pnpm validate
```

개발 서버를 시작하지 않고 일회성 컨테이너에서 검증하려면 다음 명령을 사용한다.

```powershell
docker compose run --rm --no-deps web sh -lc "pnpm install --frozen-lockfile --store-dir /pnpm/store && pnpm validate"
```

검사는 다음을 보장한다.

- `pnpm-lock.yaml`과 설치된 의존성이 일치한다.
- ESLint 정적 분석 오류가 없다.
- 관리 대상 파일이 Prettier 포맷과 일치한다.
- Astro와 TypeScript 진단 오류가 없다.
- 정적 사이트 출력이 정상적으로 생성된다.

필요하면 각 검사를 따로 실행할 수 있다.

```sh
pnpm lint
pnpm format:check
pnpm check
pnpm build
```

## 5. 컨테이너 셸 사용

개발 서버가 실행 중일 때 컨테이너 내부 셸을 연다.

```powershell
docker compose exec web sh
```

실제 고정 버전은 다음 명령으로 확인할 수 있다.

```sh
node --version
pnpm --version
pnpm exec astro --version
git --version
git branch --show-current
```

Git과 SSH 클라이언트는 이미지에 포함되지만 GitHub 인증 정보나 SSH 개인 키 자체를 이미지에 넣지는 않는다. `push`와 `pull` 인증은 호스트의 Git credential 또는 SSH agent 전달을 별도로 사용한다.

## 6. 종료

컨테이너와 네트워크를 종료한다. 의존성 volume은 유지된다.

```powershell
docker compose down
```

Astro 개발 서버도 컨테이너와 함께 종료된다.

## 7. 회사와 집에서 이어서 작업하기

1. Git에서 최신 변경사항을 받는다.
2. Docker 엔진을 실행한다.
3. 필요한 경우 `.env.example`을 참고해 로컬 `.env`를 만든다.
4. `docker compose up --build --detach web`을 실행한다.
5. `docker compose ps`에서 `healthy` 상태를 확인한다.

기본 포트 `4321`이 이미 사용 중이면 로컬 `.env`에 다른 호스트 포트를 지정한다.

```dotenv
ASTRO_PORT=4322
```

이 경우 컨테이너 내부 포트는 그대로 `4321`이고 접속 주소만 `http://localhost:4322`로 바뀐다.

## 8. 의존성 보안 원칙

pnpm은 검토되지 않은 의존성 설치 스크립트를 기본적으로 차단한다. 현재는 Astro가 사용하는 `esbuild`만 `pnpm-workspace.yaml`에서 허용한다.

새 의존성을 추가한 뒤 `ERR_PNPM_IGNORED_BUILDS`가 발생하면 모든 스크립트를 일괄 허용하지 않는다. 해당 패키지의 목적과 설치 스크립트를 검토한 후 필요한 패키지만 `allowBuilds`에 추가한다.

## 9. Pull Request CI

`.github/workflows/ci.yml`은 다음 시점에 `pnpm validate`를 실행한다.

- `main` 브랜치를 대상으로 하는 Pull Request
- `main` 브랜치에 반영된 push
- GitHub Actions 화면에서의 수동 실행

PR에 새 커밋이 추가되면 같은 PR의 이전 CI 실행은 취소되고 최신 커밋만 검사한다. 현재 CI는 애플리케이션의 정적 빌드를 검사하지만 개발용 `Dockerfile`의 이미지 빌드는 반복하지 않는다.

CI 실패 시 병합을 실제로 막으려면 Workflow를 원격 저장소에 먼저 push하고 한 번 실행한 뒤 GitHub에서 Ruleset을 설정한다.

1. `Settings → Rules → Rulesets`로 이동한다.
2. 기본 브랜치인 `main`을 대상으로 Branch Ruleset을 만든다.
3. `Require a pull request before merging`을 활성화한다.
4. `Require status checks to pass`를 활성화한다.
5. `Validate and build`를 필수 Check로 추가한다.

Ruleset은 GitHub 서버 설정이므로 Git 저장소의 파일에는 포함되지 않는다.
