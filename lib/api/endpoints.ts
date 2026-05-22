import { apiRequest } from "./client";
import type {
  AuthResponse,
  CarServiceCredentials,
  CreateMaintenancePayload,
  LoginUserPayload,
  MaintenanceRecord,
  MotorOil,
  MotorOilPayload,
  MotorOilSearchQuery,
  Product,
  ProductPayload,
  RegisterUserPayload,
  SellPayload,
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

export const productsApi = {
  getAll(signal?: AbortSignal) {
    return apiRequest<Product[]>("/api/v1/products", { signal });
  },
  getById(id: number) {
    return apiRequest<Product>(`/api/v1/products/${id}`);
  },
  create(payload: ProductPayload) {
    return apiRequest<Product>("/api/v1/products", {
      method: "POST",
      role: "CAR_SERVICE",
      body: payload
    });
  },
  update(id: number, payload: ProductPayload) {
    return apiRequest<Product>(`/api/v1/products/${id}`, {
      method: "PUT",
      role: "CAR_SERVICE",
      body: payload
    });
  },
  remove(id: number) {
    return apiRequest<void>(`/api/v1/products/${id}`, {
      method: "DELETE",
      role: "CAR_SERVICE"
    });
  },
  updateByPartNumber(partNumber: string, payload: ProductPayload) {
    return apiRequest<Product>(
      `/api/v1/products/part-number/${encodeURIComponent(partNumber)}`,
      {
        method: "PUT",
        role: "CAR_SERVICE",
        body: payload
      }
    );
  },
  removeByPartNumber(partNumber: string) {
    return apiRequest<void>(
      `/api/v1/products/part-number/${encodeURIComponent(partNumber)}`,
      {
        method: "DELETE",
        role: "CAR_SERVICE"
      }
    );
  },
  lookup(partNumber: string) {
    return apiRequest<Product>(
      `/api/v1/products/lookup/${encodeURIComponent(partNumber)}`
    );
  },
  search(partNumber: string, signal?: AbortSignal) {
    return apiRequest<Product>("/api/v1/products/search", {
      query: { partNumber },
      signal
    });
  },
  sell(payload: SellPayload) {
    return apiRequest<Product>("/api/v1/products/sell", {
      method: "POST",
      role: "CAR_SERVICE",
      body: payload
    });
  }
};

export const motorOilsApi = {
  getAll(signal?: AbortSignal) {
    return apiRequest<MotorOil[]>("/api/v1/motor-oils", { signal });
  },
  getById(id: number) {
    return apiRequest<MotorOil>(`/api/v1/motor-oils/${id}`);
  },
  create(payload: MotorOilPayload) {
    return apiRequest<MotorOil>("/api/v1/motor-oils", {
      method: "POST",
      role: "CAR_SERVICE",
      body: payload
    });
  },
  createWithImage(payload: MotorOilPayload, image: File) {
    const fd = new FormData();
    fd.append("productName", payload.productName);
    fd.append("viscosity", payload.viscosity);
    fd.append("oilType", payload.oilType);
    fd.append("standardApproval", payload.standardApproval);
    fd.append("specification", payload.specification);
    fd.append("description", payload.description);
    fd.append("oilPrice", String(payload.oilPrice));
    fd.append("oilImage", image);
    return apiRequest<MotorOil>("/api/v1/motor-oils/image", {
      method: "POST",
      role: "CAR_SERVICE",
      formData: fd
    });
  },
  update(id: number, payload: MotorOilPayload) {
    return apiRequest<MotorOil>(`/api/v1/motor-oils/${id}`, {
      method: "PUT",
      role: "CAR_SERVICE",
      body: payload
    });
  },
  remove(id: number) {
    return apiRequest<void>(`/api/v1/motor-oils/${id}`, {
      method: "DELETE",
      role: "CAR_SERVICE"
    });
  },
  search(query: MotorOilSearchQuery, signal?: AbortSignal) {
    const q: Record<string, string | number | undefined> = {
      productName: query.productName,
      viscosity: query.viscosity,
      oilType: query.oilType,
      standardApproval: query.standardApproval,
      specification: query.specification
    };
    return apiRequest<MotorOil[]>("/api/v1/motor-oils/search", {
      query: q,
      signal
    });
  }
};
