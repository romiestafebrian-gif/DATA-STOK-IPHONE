export type iPhoneName = "Iphone 11" | "Iphone 12" | "Iphone 13" | "Iphone 14" | "Iphone 15" | "Iphone 16" | "Iphone 17" | "Iphone 18";
export type iPhoneSeries = "Reguler" | "Pro" | "Pro Max";
export type iPhoneStorage = "128 GB" | "256 GB" | "512 GB";
export type iPhoneCategory = "Inter" | "Ibox" | "Blibli";
export type TransactionType = "IN" | "OUT";

export interface InventoryItem {
  id: string;
  name: iPhoneName;
  series: iPhoneSeries;
  storage: iPhoneStorage;
  category: iPhoneCategory;
  date: string; // ISO string
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  supplier: string;
  type: TransactionType;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  role: "Admin" | "User";
}

export interface AppSettings {
  waNumber: string;
  waToken: string;
  lowStockThreshold: number;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}
