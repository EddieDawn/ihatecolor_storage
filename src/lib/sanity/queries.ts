const photoProjection = `
  _id,
  "slug": slug.current,
  image {
    "url": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  },
  title,
  altText,
  sortOrder,
  caption,
  location,
  shotAt,
  category,
  albumId
`;

export const allPhotosQuery = `
  *[
    _type == "photo" &&
    !(_id in path("drafts.**"))
  ] | order(sortOrder desc, _id asc) {
    ${photoProjection}
  }
`;

export const landingPageQuery = `
  *[
    _type == "landingPage" &&
    _id == "landingPage"
  ][0] {
    _id,
    heroPhoto->{
      ${photoProjection}
    }
  }
`;
