import { adaptSanityLandingPage } from "../sanity/photo-adapter";
import { fetchLandingPageFromSanity } from "../sanity/fetch";
import { parseSanityLandingPageResponse } from "../sanity/response-schemas";
import type { LandingPagePhotoSelection } from "./landing-page-model";

export async function getLandingPagePhotos(): Promise<LandingPagePhotoSelection> {
  const response = await fetchLandingPageFromSanity();
  const validatedLandingPage = parseSanityLandingPageResponse(response);
  const landingPage = adaptSanityLandingPage(validatedLandingPage);

  if (landingPage === null) {
    throw new Error("Sanity landingPage is missing. Select one hero photo in Studio.");
  }

  return landingPage;
}
