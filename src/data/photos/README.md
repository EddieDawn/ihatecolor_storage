# 로컬 Photo 콘텐츠 작성 규칙

사진 한 장을 하나의 작품으로 관리한다. 각 작품은 별도 디렉터리에 `index.md`와 로컬 이미지 파일을 함께 둔다.

```text
src/data/photos/
  stable-photo-id/
    index.md
    image.jpg
```

`index.md`는 다음 형식을 사용한다.

```yaml
---
id: stable-photo-id
slug: public-photo-slug
image: ./image.jpg
title: 작품명
altText: 사진에 보이는 핵심 장면을 설명하는 대체 텍스트
status: draft
sortOrder: 0
caption: 선택적인 짧은 설명
location: 선택적인 공개 가능 촬영 장소
shotAt: "2026-08-19"
category: 선택적인 범주
albumId: 선택적인 향후 앨범 ID
---
```

## 제약 조건

- `id`, `slug`, `sortOrder`는 전체 사진에서 각각 고유해야 한다.
- `id`는 데이터 소스가 바뀌어도 유지하며 디렉터리명과 같게 작성하는 것을 권장한다.
- `slug`는 소문자 영문, 숫자, 단일 하이픈만 사용한다.
- `status`는 `draft` 또는 `published`만 허용한다.
- `sortOrder`는 0 이상의 정수다.
- `shotAt`은 `YYYY`, `YYYY-MM`, `YYYY-MM-DD` 중 하나로 작성하고 YAML 날짜 변환을 피하기 위해 따옴표로 감싼다.
- 선택 필드는 값이 없으면 빈 문자열 대신 필드 자체를 생략한다.
- 본문은 현재 사용하지 않으므로 비워 둔다.

`getPhotos()`는 기본적으로 `published` 사진만 반환한다. 관리·검증 용도로 초안을 포함하려면 `getPhotos({ status: "all" })`을 사용한다.
