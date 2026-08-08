export type Locale = "ru" | "kk";

export type Category = {
  id: string;
  slug: string;
  nameRu: string;
  nameKk: string;
  sortOrder: number;
  isVisible: boolean;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  slug: string;
  nameRu: string;
  nameKk?: string;
  descriptionRu?: string;
  descriptionKk?: string;
  price: number;
  imageUrl?: string;
  sortOrder: number;
  isAvailable: boolean;
  isVisiblePublic: boolean;
  isVisibleDineIn: boolean;
  isFeatured: boolean;
  isSpicy: boolean;
  isNew: boolean;
  isArchived: boolean;
  needsReview: boolean;
  pieceCount?: number;
  source: "menu_pdf" | "sushi_graphic" | "promotion_graphic";
};

export type SetItem = {
  setId: string;
  itemSlug: string;
  quantity: number;
};

export type Promotion = {
  id: string;
  titleRu: string;
  titleKk?: string;
  descriptionRu: string;
  descriptionKk?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  status: "draft" | "active" | "expired";
  minimumOrder?: number;
  type: "gift" | "discount" | "delivery" | "set";
  needsReview: boolean;
};

export type RestaurantTable = {
  id: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
};

export type CartLine = {
  item: MenuItem;
  quantity: number;
};

export type OrderType = "delivery" | "dine_in";
export type OrderStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancelled";

export type OrderSnapshotItem = {
  menuItemId: string;
  itemNameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  lineTotal: number;
};
