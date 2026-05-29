export type Role = "USER" | "CAR_SERVICE";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserCar {
  id: number;
  plateNumber: string;
  vinCode: string | null;
  carBrand: string;
  brandModel: string;
  year: number;
  firstRegisteredKm: number;
  currentKm: number;
  oilBrand: string | null;
  oilType: string | null;
  lastServiceDate: string | null;
}

export interface UserProfile {
  id: number;
  plateNumber: string;
  fullName: string | null;
  phoneNumber: string;
  email: string;
  vinCode: string | null;
  carBrand: string | null;
  brandModel: string | null;
  year: number | null;
  firstRegisteredKm: number | null;
  currentKm: number | null;
  oilBrand: string | null;
  oilType: string | null;
  lastServiceDate: string | null;
  cars: UserCar[];
  role: Role;
}

export interface MaintenanceRecord {
  id: number;
  appUserId: number;
  appUserFullName: string;
  customerPlateNumber: string;
  carServiceId: number;
  carServiceUsername: string;
  oilBrand: string;
  oilType: string;
  serviceKm: number;
  serviceDate: string;
}

export interface RegisterUserPayload {
  email: string;
  plateNumber: string;
  phoneNumber: string;
}

export interface LoginUserPayload {
  phoneNumber: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otpCode: string;
  newPassword: string;
}

export interface CarServiceCredentials {
  username: string;
  password: string;
}

export interface CreateMaintenancePayload {
  plateNumber: string;
  oilBrand: string;
  oilType: string;
  serviceKm: number;
  serviceDate: string;
}

export interface Product {
  id: number;
  product: string;
  partNumber: string;
  brand: string;
  price: number;
  count: number;
  model: string[];
  similarProducts: string[];
}

export interface ProductPayload {
  product: string;
  partNumber: string;
  brand: string;
  price: number;
  count: number;
  model: string[];
  similarProducts: string[];
}

export interface SellPayload {
  partNumber: string;
  count: number;
}

export interface MotorOil {
  id: number;
  productName: string;
  viscosity: string;
  oilType: string;
  standardApproval: string;
  specification: string;
  description: string;
  oilImage: string | null;
  oilPrice: number | null;
}

export interface MotorOilPayload {
  productName: string;
  viscosity: string;
  oilType: string;
  standardApproval: string;
  specification: string;
  description: string;
  oilPrice: number;
}

export interface MotorOilSearchQuery {
  productName?: string;
  viscosity?: string;
  oilType?: string;
  standardApproval?: string;
  specification?: string;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}
