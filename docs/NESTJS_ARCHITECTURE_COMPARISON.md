# Astro·Sanity 구조를 NestJS와 비교하기

> 작성일: 2026-08-26  
> 대상: NestJS의 Module, Controller, Service, Repository, DTO 구조에 익숙한 개발자

## 1. 문서 목적

이 문서는 현재 Astro·Sanity 코드가 NestJS 애플리케이션의 각 계층과 어떤 점에서 비슷하고 다른지 설명한다. 두 프레임워크의 구조가 완전히 같다는 뜻은 아니며, 기존 NestJS 경험을 이용해 현재 프로젝트의 파일 역할과 데이터 흐름을 이해하기 위한 비교다.

## 2. 구조 대응표

| NestJS에서 익숙한 역할          | 현재 프로젝트                                             | 설명                                                |
| ------------------------------- | --------------------------------------------------------- | --------------------------------------------------- |
| `ConfigModule`, `ConfigService` | `src/lib/sanity/environment.ts`                           | Sanity 접속 환경변수를 읽고 필수값을 검사한다.      |
| 외부 API Provider               | `src/lib/sanity/client.ts`                                | Sanity 클라이언트 객체를 생성한다.                   |
| Repository의 쿼리               | `src/lib/sanity/queries.ts`                               | GROQ로 조회 대상, 필드와 정렬 조건을 정의한다.      |
| 얇은 Repository                 | `src/lib/sanity/fetch.ts`                                 | 클라이언트와 쿼리를 연결해 실제 요청을 보낸다.      |
| DTO 또는 애플리케이션 Entity    | `src/lib/content/photo-model.ts`                          | 화면과 콘텐츠 계층이 사용할 `Photo` 계약을 정의한다. |
| Controller                      | `src/pages/**/*.astro`                                    | URL의 진입점이며 필요한 데이터를 요청한다.          |
| View 또는 Template              | `src/components/**/*.astro`                               | 전달받은 데이터를 HTML 화면으로 표현한다.           |
| Database                        | Sanity Content Lake                                       | 사진 문서와 이미지 asset을 저장한다.                 |
| 관리자 애플리케이션             | `studio/`                                                 | Sanity 데이터를 입력하고 게시하는 관리 화면이다.    |

## 3. `environment.ts`와 NestJS `ConfigModule`

NestJS에서는 일반적으로 `ConfigService`로 환경변수를 읽고 필수값이 없으면 오류를 발생시킨다.

```ts
@Injectable()
export class SanityConfig {
  constructor(private readonly configService: ConfigService) {}

  get projectId(): string {
    return this.configService.getOrThrow("SANITY_PROJECT_ID");
  }
}
```

현재 Astro 프로젝트에서는 DI 컨테이너 없이 일반 함수와 module export를 사용한다.

```ts
const projectId = requireEnvironmentVariable(
  import.meta.env.SANITY_PROJECT_ID,
  "SANITY_PROJECT_ID",
);
```

두 코드의 역할은 같다.

1. 환경변수에서 Sanity 설정을 읽는다.
2. 값이 없거나 빈 문자열이면 즉시 오류를 발생시킨다.
3. 정상적인 값만 다른 Sanity 코드에 제공한다.

실제 값은 Git에서 제외된 루트 `.env.local`에 저장하고, 필요한 변수 이름은 `.env.example`에 기록한다. `src/env.d.ts`는 `import.meta.env`에 어떤 변수가 존재하는지 TypeScript에 알려주는 선언 파일이다.

## 4. `client.ts`와 NestJS 외부 API Provider

NestJS에서는 외부 API 클라이언트를 custom provider로 등록하고 필요한 Service에 주입할 수 있다.

```ts
@Module({
  providers: [
    {
      provide: SANITY_CLIENT,
      useFactory: () => createClient(config),
    },
  ],
  exports: [SANITY_CLIENT],
})
export class SanityModule {}
```

현재 프로젝트의 `src/lib/sanity/client.ts`도 Sanity 클라이언트를 한 번 구성한다.

```ts
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2026-08-26",
  useCdn: false,
});
```

차이는 객체를 전달하는 방식이다.

```text
NestJS
DI 컨테이너에 Provider 등록
        ↓
constructor에서 주입

Astro
module에서 객체 export
        ↓
필요한 파일에서 import
```

현재 규모에서는 별도의 `SanityModule` 클래스와 DI 컨테이너를 흉내 내는 것보다 일반적인 TypeScript module을 사용하는 편이 단순하다.

## 5. `queries.ts`와 Repository 조회 조건

Prisma를 사용하는 NestJS Repository라면 다음과 같이 사진의 조회 조건을 작성할 수 있다.

```ts
return this.prisma.photo.findMany({
  where: {
    published: true,
  },
  orderBy: {
    sortOrder: "asc",
  },
});
```

Sanity에서는 SQL이나 Prisma query object 대신 GROQ를 사용한다.

```groq
*[
  _type == "photo" &&
  !(_id in path("drafts.**"))
] | order(sortOrder asc, _id asc)
```

`src/lib/sanity/queries.ts`는 다음 내용을 정의한다.

- 어떤 Sanity 문서 타입을 조회할지
- draft를 제외할지
- 어떤 필드를 응답에 포함할지
- 어떤 순서로 정렬할지
- reference로 연결된 문서를 실제 데이터로 펼칠지

따라서 이 파일은 Repository 안의 SQL, Prisma 조회 조건 또는 TypeORM QueryBuilder 코드와 가장 비슷하다. 쿼리 자체는 네트워크 요청을 보내지 않는다.

## 6. `fetch.ts`와 얇은 Repository

NestJS에서는 Repository 또는 Service가 클라이언트와 쿼리를 결합해 실제 데이터를 요청한다.

```ts
@Injectable()
export class PhotoRepository {
  constructor(
    @Inject(SANITY_CLIENT)
    private readonly sanityClient: SanityClient,
  ) {}

  findAll() {
    return this.sanityClient.fetch(ALL_PHOTOS_QUERY);
  }
}
```

현재 프로젝트에서는 클래스 대신 함수를 사용한다.

```ts
export function fetchAllPhotosFromSanity(): Promise<unknown> {
  return sanityClient.fetch(allPhotosQuery);
}
```

`fetch.ts`의 책임은 의도적으로 작다.

1. 사용할 Sanity 클라이언트를 선택한다.
2. 실행할 GROQ 쿼리를 전달한다.
3. 외부 응답을 반환한다.

현재 반환 타입은 `unknown`이다. 외부 시스템이 보내는 값은 TypeScript interface만으로 안전하다고 보장할 수 없기 때문이다. 다음 응답 검증 계층을 통과하기 전까지는 Sanity 응답을 애플리케이션 `Photo`로 취급하지 않는다.

## 7. `photo-model.ts`와 DTO·애플리케이션 Entity

Sanity 원본 문서는 다음과 같은 CMS 전용 구조를 가진다.

```text
_id
slug.current
image.asset reference
```

화면은 CMS 내부 구조를 직접 알 필요가 없다. 화면이 사용하는 구조는 `src/lib/content/photo-model.ts`에 별도로 정의한다.

```ts
export interface Photo {
  id: string;
  slug: string;
  image: PhotoImage;
  title: string;
  altText: string;
  sortOrder: number;
}
```

NestJS와 비교하면 다음 변환과 비슷하다.

```text
Prisma 또는 외부 API 원본 모델
              ↓
         Mapper 변환
              ↓
Controller가 반환할 Response DTO
```

현재 프로젝트의 최종 흐름도 다음과 같다.

```text
Sanity 원본 응답
       ↓
Zod 런타임 검증
       ↓
Photo 어댑터
       ↓
애플리케이션 Photo
```

Zod 검증과 어댑터는 이후 단계에서 구현한다.

## 8. `src/pages`와 Controller

NestJS Controller는 URL 요청의 진입점이다.

```ts
@Controller("photos")
export class PhotoController {
  @Get()
  findAll() {
    return this.photoService.findAll();
  }
}
```

Astro는 `src/pages`의 파일 경로로 URL을 만든다.

```text
src/pages/index.astro
→ /

src/pages/photos/index.astro
→ /photos

src/pages/photos/page/[page].astro
→ /photos/page/{page}
```

따라서 `src/pages/**/*.astro`는 요청 진입점이라는 점에서 Controller와 비슷하다. 다만 Astro 페이지는 데이터를 요청하는 역할뿐 아니라 최종 HTML을 조립하는 역할도 일부 담당한다.

## 9. `src/components`와 View

NestJS를 JSON API 서버로만 사용했다면 직접 대응되는 계층이 없을 수 있다. NestJS MVC 방식의 template 또는 일반적인 프론트엔드 View와 비슷하다.

```text
페이지가 데이터 조회
        ↓
컴포넌트에 props 전달
        ↓
컴포넌트가 HTML 생성
```

예를 들어 `src/components/photos/PhotoJournalView.astro`는 사진 목록 라우트가 전달한 사진과 페이지네이션 정보를 화면으로 표현한다. 이 컴포넌트는 Sanity SDK나 GROQ를 직접 호출하지 않는다.

## 10. 전체 요청 흐름 비교

일반적인 NestJS 구조는 다음과 같다.

```text
Controller
    ↓
PhotoService
    ↓
PhotoRepository
    ↓
Prisma
    ↓
Database
```

현재 프로젝트가 목표로 하는 구조는 다음과 같다.

```text
src/pages/**/*.astro
Controller 역할
    ↓
getPhotos()
PhotoService 역할
    ↓
응답 검증 + Photo 어댑터
DTO validation + Mapper 역할
    ↓
src/lib/sanity/fetch.ts
Repository 역할
    ↓
sanityClient + GROQ query
외부 API Provider + 조회 조건
    ↓
Sanity Content Lake
외부 Database 역할
```

## 11. NestJS와의 중요한 차이

### Module 클래스가 없다

Astro에는 NestJS의 `@Module()`과 같은 애플리케이션 DI module 체계가 없다. 파일 단위의 ES module과 `import`/`export`로 의존성을 연결한다.

### Service가 반드시 클래스일 필요가 없다

NestJS Service는 DI를 위해 보통 `@Injectable()` 클래스가 된다. 현재 Astro 프로젝트에서는 상태를 보관하지 않는 작은 기능을 일반 함수로 구현한다.

### 페이지가 HTML 생성에 참여한다

NestJS API Controller는 보통 JSON을 반환하지만 Astro 페이지는 빌드 시 데이터를 가져와 HTML을 직접 생성한다.

### Sanity는 애플리케이션 내부 DB가 아니다

Prisma는 애플리케이션이 직접 연결하는 데이터베이스 ORM이지만 Sanity는 Content Lake와 관리 Studio를 함께 제공하는 외부 CMS다. 웹 애플리케이션은 `@sanity/client`와 GROQ를 통해 게시된 콘텐츠를 조회한다.

## 12. 현재 구현 상태

완료된 계층:

```text
환경변수 설정
    ↓
Sanity 클라이언트
    ↓
GROQ 쿼리
    ↓
Sanity fetch 함수
```

아직 구현하지 않은 계층:

```text
Sanity 응답 Zod 검증
    ↓
Sanity 응답 → Photo 변환 어댑터
    ↓
getPhotos()의 Sanity 전환
    ↓
페이지의 원격 이미지 렌더링
```

따라서 현재 페이지는 아직 로컬 Astro Content Collection을 사용한다. Sanity 조회 기반은 준비됐지만 화면 데이터 소스가 교체된 상태는 아니다.
