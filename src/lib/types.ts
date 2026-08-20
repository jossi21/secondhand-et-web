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
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: UserInfo;
}

export interface LoginCommand {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterCommand {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  city?: string;
  role: "buyer" | "seller";
}

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  isVerified: boolean;
  role: UserRole;
  createdAt: string;
}

export interface RatingResponse {
  id: string;
  score: number;
  comment?: string;
  fromUserId: string;
  fromUserName?: string;
  toUserId: string;
  toUserName?: string;
  createdAt: string;
}

export interface ReportResponse {
  id: string;
  reason: string;
  listingId: string;
  listingTitle?: string;
  reportedById: string;
  reportedByName?: string;
  createdAt: string;
}
