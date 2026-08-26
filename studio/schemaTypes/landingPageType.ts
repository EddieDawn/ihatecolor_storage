import { defineArrayMember, defineField, defineType } from "sanity";

export const LANDING_PAGE_DOCUMENT_ID = "landingPage";
export const LANDING_PAGE_SCHEMA_TYPE = "landingPage";

export const landingPageType = defineType({
  name: LANDING_PAGE_SCHEMA_TYPE,
  title: "Landing page",
  type: "document",
  description: "랜딩 페이지에 표시할 사진과 순서를 관리합니다.",
  fields: [
    defineField({
      name: "heroPhoto",
      title: "Hero photo",
      type: "reference",
      description: "랜딩 첫 화면에 가장 크게 표시되는 사진입니다.",
      to: [{ type: "photo" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "storyPhotos",
      title: "Story photos",
      type: "array",
      description:
        "배열 순서대로 사진 에세이의 01번부터 06번 위치에 표시됩니다.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "photo" }],
        }),
      ],
      validation: (rule) => rule.required().min(6).max(6).unique(),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Landing page" }),
  },
});
