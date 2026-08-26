import { sanityClient } from "./client";
import { allPhotosQuery, landingPageQuery } from "./queries";

export function fetchAllPhotosFromSanity(): Promise<unknown> {
  return sanityClient.fetch(allPhotosQuery);
}

export function fetchLandingPageFromSanity(): Promise<unknown> {
  return sanityClient.fetch(landingPageQuery);
}
