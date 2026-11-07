export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number | null;
  image: string | null;
};

export type OrderItem = {
  id: number | string;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: number | string;
  status: string;
  total: number;
  createdAt: string | null;
  items: OrderItem[];
};

export type Paginated<T> = {
  items: T[];
  page: number;
  lastPage: number;
};

export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  values?: Record<string, string>;
  orderId?: string;
};
