export type User = { id: string; email: string; role: "USER" | "ADMIN" };
export type Session = { token: string; user: User };
export type Vehicle = {
  id: string;
  make: string;
  model: string;
  category: string;
  price: string;
  quantity: number;
  updatedAt?: string;
};
export type Inventory = {
  items: Vehicle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
export type Summary = {
  listings: number;
  units: number;
  outOfStock: number;
  value: string;
};
