export type Role = "USER" | "CAR_SERVICE";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: number;
  plateNumber: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  carBrand: string;
  brandModel: string;
  year: number;
  firstRegisteredKm: number;
  currentKm: number;
  oilBrand: string | null;
  oilType: string | null;
  lastServiceDate: string | null;
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
  fullName: string;
  email: string;
  password: string;
  plateNumber: string;
  phoneNumber: string;
  carBrand: string;
  brandModel: string;
  year: number;
  firstRegisteredKm: number;
  currentKm: number;
  lastServiceDate: string;
}

export interface LoginUserPayload {
  plateNumber: string;
  password: string;
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
