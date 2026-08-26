export interface PhotoImage {
  url: string;
  width: number;
  height: number;
}

export interface Photo {
  id: string;
  slug: string;
  image: PhotoImage;
  title: string;
  altText: string;
  sortOrder: number;
  caption?: string;
  location?: string;
  shotAt?: string;
  category?: string;
  albumId?: string;
}
