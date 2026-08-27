import { defineField, defineType } from "sanity";

export const LANDING_PAGE_DOCUMENT_ID = "landingPage";
export const LANDING_PAGE_SCHEMA_TYPE = "landingPage";

export const landingPageType = defineType({
  name: LANDING_PAGE_SCHEMA_TYPE,
  title: "Landing page",
  type: "document",
  description: "랜딩 Hero에 표시할 사진을 관리합니다.",
  fields: [
    defineField({
      name: "heroPhoto",
      title: "Hero photo",
      type: "reference",
      description: "랜딩 첫 화면에 가장 크게 표시되는 사진입니다.",
      to: [{ type: "photo" }],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Landing page" }),
  },
});
