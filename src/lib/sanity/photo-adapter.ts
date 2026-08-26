import type { LandingPagePhotoSelection } from "../content/landing-page-model";
import type { Photo } from "../content/photo-model";
import type {
  SanityLandingPageResponse,
  SanityPhotoResponse,
  SanityPhotosResponse,
} from "./response-schemas";

export function adaptSanityPhoto(photo: SanityPhotoResponse): Photo {
  return {
    id: photo._id,
    slug: photo.slug,
    image: {
      url: photo.image.url,
      width: photo.image.width,
      height: photo.image.height,
    },
    title: photo.title,
    altText: photo.altText,
    sortOrder: photo.sortOrder,
    ...(photo.caption === null ? {} : { caption: photo.caption }),
    ...(photo.location === null ? {} : { location: photo.location }),
    ...(photo.shotAt === null ? {} : { shotAt: photo.shotAt }),
    ...(photo.category === null ? {} : { category: photo.category }),
    ...(photo.albumId === null ? {} : { albumId: photo.albumId }),
  };
}

export function adaptSanityPhotos(photos: SanityPhotosResponse): Photo[] {
  return photos.map(adaptSanityPhoto);
}

export function adaptSanityLandingPage(
  landingPage: SanityLandingPageResponse,
): LandingPagePhotoSelection | null {
  if (landingPage === null) {
    return null;
  }

  return {
    heroPhoto: adaptSanityPhoto(landingPage.heroPhoto),
    storyPhotos: adaptSanityPhotos(landingPage.storyPhotos),
  };
}
