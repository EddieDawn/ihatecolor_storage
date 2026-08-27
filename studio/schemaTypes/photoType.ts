import { defineField, defineType } from "sanity";

const partialDatePattern =
  /^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const photoType = defineType({
  name: "photo",
  title: "Photo",
  type: "document",
  initialValue: async (_parameters, context) => {
    const client = context.getClient({ apiVersion: "2026-08-26" });
    const highestSortOrder = await client.fetch<number | null>(
      `*[_type == "photo" && defined(sortOrder)]
        | order(sortOrder desc)[0].sortOrder`,
    );

    return { sortOrder: (highestSortOrder ?? 0) + 1 };
  },
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "공개 URL에서 사진을 식별하는 고유한 이름입니다. 소문자, 숫자, 단일 하이픈(-)만 사용할 수 있습니다. 예: sham-cat",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value?.current) return true;

          return slugPattern.test(value.current)
            ? true
            : "소문자, 숫자, 단일 하이픈(-)만 사용할 수 있습니다. 예: sham-cat";
        }),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "altText",
      title: "Alternative text",
      type: "string",
      description:
        "사진을 보지 못하는 사용자가 장면을 이해할 수 있게 설명합니다.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order",
      type: "number",
      description:
        "새 사진에는 현재 최댓값의 다음 숫자가 자동 입력되며, 큰 숫자의 사진이 먼저 표시됩니다.",
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),
    defineField({
      name: "shotAt",
      title: "Shot at",
      type: "string",
      description: "YYYY, YYYY-MM 또는 YYYY-MM-DD 형식으로 입력합니다.",
      validation: (rule) =>
        rule.custom((value) =>
          value === undefined || partialDatePattern.test(value)
            ? true
            : "YYYY, YYYY-MM 또는 YYYY-MM-DD 형식이어야 합니다.",
        ),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
    }),
    defineField({
      name: "albumId",
      title: "Album ID",
      type: "string",
      description: "앨범 기능을 구현하기 전까지 사용하는 선택 필드입니다.",
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "sortOrderDesc",
      by: [{ field: "sortOrder", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "location",
      media: "image",
    },
  },
});
