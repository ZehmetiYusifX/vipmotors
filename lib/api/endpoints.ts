import { apiRequest } from "./client";
import type {
  AuthResponse,
  CarServiceCredentials,
  CreateMaintenancePayload,
  LoginUserPayload,
  MaintenanceRecord,
  RegisterUserPayload,
  UserProfile
} from "./types";

export const userAuth = {
  register(payload: RegisterUserPayload) {
    return apiRequest<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: payload
    });
  },
  login(payload: LoginUserPayload) {
    return apiRequest<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: payload
    });
  },
  me() {
    return apiRequest<UserProfile>("/api/v1/users/me", { role: "USER" });
  }
};

export const carServiceAuth = {
  register(payload: CarServiceCredentials) {
    return apiRequest<AuthResponse>("/api/v1/car-services/auth/register", {
      method: "POST",
      body: payload
    });
  },
  login(payload: CarServiceCredentials) {
    return apiRequest<AuthResponse>("/api/v1/car-services/auth/login", {
      method: "POST",
      body: payload
    });
  }
};

export const carServiceOps = {
  findCustomerByPlate(plateNumber: string) {
    return apiRequest<UserProfile>("/api/v1/car-services/customers", {
      role: "CAR_SERVICE",
      query: { plateNumber }
    });
  },
  createMaintenance(payload: CreateMaintenancePayload) {
    return apiRequest<MaintenanceRecord>(
      "/api/v1/car-services/maintenances",
      {
        method: "POST",
        role: "CAR_SERVICE",
        body: payload
      }
    );
  }
};
