export type Condition = "brand_new" | "lightly_used" | "fair_condition";
export type ListingStatus = "active" | "sold" | "removed";
export type UserRole = "buyer" | "seller" | "admin";

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
  children?: CategoryResponse[];
  createdAt: string;
}

export interface ListingImageResponse {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ListingSellerInfo {
  id: string;
  fullName: string;
  isVerified: boolean;
  averageRating: number;
}

export interface ListingResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: Condition;
  status: ListingStatus;
  city: string;
  neighborhood: string | null;
  viewCount: number;
  sellerId: string;
  categoryId: string;
  images: ListingImageResponse[];
  seller?: ListingSellerInfo;
  createdAt: string;
}

export interface PaginatedListingResponse {
  data: ListingResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string | null;
  isVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: UserInfo;
}
