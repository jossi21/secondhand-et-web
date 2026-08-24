export type Condition = "brand_new" | "lightly_used" | "fair_condition";
export type ListingStatus = "active" | "sold" | "removed";
export type UserRole = "buyer" | "seller" | "admin";

export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string | null;
  isVerified: boolean;
  role: UserRole;
}

export interface UserContact {
  type: string;
  value: string;
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
  phone?: string;
  contacts?: UserContact[];
  password: string;
  city?: string;
  role: "buyer" | "seller";
}

export interface UpdateUserCommand {
  fullName?: string;
  phone?: string;
  city?: string;
  isVerified?: boolean;
  contacts?: UserContact[];
}

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  isVerified: boolean;
  role: UserRole;
  contacts?: UserContact[];
  createdAt: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  icon: string | null;
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
  contacts?: SellerContact[];
}

export interface PaginatedListingResponse {
  data: ListingResponse[];
  total: number;
  page: number;
  limit: number;
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

export interface SellerDashboardResponse {
  activeListings: number;
  soldListings: number;
  totalViews: number;
  averageRating: number;
  listings: ListingResponse[];
  recentRatings: RatingResponse[];
  recentReports: ReportResponse[];
}

export interface BuyerDashboardResponse {
  savedListingsCount: number;
  ratingsGivenCount: number;
  reportsFiledCount: number;
  savedListings: SavedListingResponse[];
  ratingsGiven: RatingResponse[];
}

export interface SavedListingResponse {
  id: string;
  listingId: string;
  listing: ListingResponse;
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

export interface ListingImageResponse {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ListingResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: "brand_new" | "lightly_used" | "fair_condition";
  status: "active" | "sold" | "removed";
  city: string;
  neighborhood?: string;
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

export interface SellerContact {
  type: string;
  value: string;
}

export interface ToggleSavedListingResponse {
  saved: boolean;
}

export interface SellerRatingSummary {
  average: number;
  count: number;
  ratings: RatingResponse[];
}
