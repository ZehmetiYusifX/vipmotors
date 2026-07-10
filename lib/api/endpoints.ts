import { apiRequest } from "./client";
import type {
  AuthResponse,
  CarPayload,
  CarRegistrationPayload,
  CarServiceCredentials,
  ClaimCarPayload,
  CreateMaintenancePayload,
  CustomerPayload,
  CustomerSearchQuery,
  ForgotPasswordPayload,
  LoginUserPayload,
  MaintenanceHistoryQuery,
  MaintenanceRecord,
  MotorOil,
  MotorOilPayload,
  MotorOilSearchQuery,
  Product,
  ProductPayload,
  ProductSale,
  RegisterUserPayload,
  ResetPasswordPayload,
  Role,
  SellPayload,
  ServiceItem,
  ServiceItemPayload,
  UnclaimedCar,
  UpdateMaintenancePayload,
  UserCar,
  UserProfile,
  WalletScanPayload,
  WalletScanResult
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
  },
  // Service history for the logged-in user — dedicated endpoint, unlike the
  // car-service one which is gated to operators.
  maintenanceHistory(signal?: AbortSignal) {
    return apiRequest<MaintenanceRecord[]>("/api/v1/users/me/maintenances", {
      role: "USER",
      signal
    });
  },
  forgotPassword(payload: ForgotPasswordPayload) {
    return apiRequest<{ message: string }>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: payload
    });
  },
  resetPassword(payload: ResetPasswordPayload) {
    return apiRequest<{ message: string }>("/api/v1/auth/reset-password", {
      method: "POST",
      body: payload
    });
  }
};

export const userCarsApi = {
  add(payload: CarPayload) {
    return apiRequest<UserCar>("/api/v1/users/me/cars", {
      method: "POST",
      role: "USER",
      body: payload
    });
  },
  update(carId: number, payload: CarPayload) {
    return apiRequest<UserCar>(`/api/v1/users/me/cars/${carId}`, {
      method: "PUT",
      role: "USER",
      body: payload
    });
  },
  remove(carId: number) {
    return apiRequest<void>(`/api/v1/users/me/cars/${carId}`, {
      method: "DELETE",
      role: "USER"
    });
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
  // Customer base lookup. Both params are optional: `search` matches
  // name/phone/plate, `plateNumber` filters by exact plate. With neither it
  // lists the whole base. Backend may return a single object or an array, so
  // callers must normalise.
  searchCustomers(query: CustomerSearchQuery = {}, signal?: AbortSignal) {
    return apiRequest<UserProfile | UserProfile[]>(
      "/api/v1/car-services/customers",
      {
        role: "CAR_SERVICE",
        query: { search: query.search, plateNumber: query.plateNumber },
        signal
      }
    );
  },
  getCustomer(customerId: number) {
    return apiRequest<UserProfile>(
      `/api/v1/car-services/customers/${customerId}`,
      { role: "CAR_SERVICE" }
    );
  },
  createCustomer(payload: CustomerPayload) {
    return apiRequest<UserProfile>("/api/v1/car-services/customers", {
      method: "POST",
      role: "CAR_SERVICE",
      body: payload
    });
  },
  updateCustomer(customerId: number, payload: CustomerPayload) {
    return apiRequest<UserProfile>(
      `/api/v1/car-services/customers/${customerId}`,
      {
        method: "PUT",
        role: "CAR_SERVICE",
        body: payload
      }
    );
  },
  deleteCustomer(customerId: number) {
    return apiRequest<void>(`/api/v1/car-services/customers/${customerId}`, {
      method: "DELETE",
      role: "CAR_SERVICE"
    });
  },
  // Register a car into the registry standalone (no owner account yet). The
  // owner later claims it by plate via carsApi.claim; their phone must match the
  // ownerPhoneNumber supplied here. Backend: POST /api/v1/cars (CAR_SERVICE/OWNER).
  registerCar(payload: CarRegistrationPayload) {
    return apiRequest<UserCar>("/api/v1/cars", {
      method: "POST",
      role: "CAR_SERVICE",
      body: payload
    });
  },
  // Admin-registered cars nobody has claimed yet (anonymous owners). Optional
  // search matches plate, owner phone, VIN, brand and model.
  unclaimedCars(search?: string, signal?: AbortSignal) {
    return apiRequest<UnclaimedCar[]>("/api/v1/cars/unclaimed", {
      role: "CAR_SERVICE",
      query: { search },
      signal
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
  },
  updateMaintenance(maintenanceId: number, payload: UpdateMaintenancePayload) {
    return apiRequest<MaintenanceRecord>(
      `/api/v1/car-services/maintenances/${maintenanceId}`,
      {
        method: "PUT",
        role: "CAR_SERVICE",
        body: payload
      }
    );
  },
  maintenanceHistory(
    query: MaintenanceHistoryQuery = {},
    role: Role = "CAR_SERVICE",
    signal?: AbortSignal
  ) {
    return apiRequest<MaintenanceRecord[]>("/api/v1/car-services/maintenances", {
      role,
      query: {
        plateNumber: query.plateNumber,
        customerId: query.customerId
      },
      signal
    });
  }
};

// Plate-first onboarding flow. A service can register a car standalone; the
// real owner later claims it by plate so the service history follows their
// account. All three require an authenticated identity and operate against the
// current user — this is a USER-app flow, distinct from `userCarsApi` (which
// edits cars already on the account) and `carServiceOps` (operator customers).
export const carsApi = {
  register(payload: CarPayload) {
    return apiRequest<UserCar>("/api/v1/cars", {
      method: "POST",
      role: "USER",
      body: payload
    });
  },
  claim(payload: ClaimCarPayload) {
    return apiRequest<UserCar>("/api/v1/cars/claim", {
      method: "POST",
      role: "USER",
      body: payload
    });
  },
  // Looks up a claimable car by plate. Resolves with the car when unowned
  // (200); the backend returns 404 when no such car exists and 409 when it is
  // already registered to another user — callers should branch on those.
  searchByPlate(plateNumber: string, signal?: AbortSignal) {
    return apiRequest<UserCar>("/api/v1/cars/search", {
      role: "USER",
      query: { plateNumber },
      signal
    });
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
  uploadImages(id: number, images: File[]) {
    const fd = new FormData();
    for (const image of images) {
      fd.append("images", image);
    }
    return apiRequest<Product>(`/api/v1/products/${id}/images`, {
      method: "POST",
      role: "CAR_SERVICE",
      formData: fd
    });
  },
  removeImage(id: number, path: string) {
    return apiRequest<Product>(`/api/v1/products/${id}/images`, {
      method: "DELETE",
      role: "CAR_SERVICE",
      query: { path }
    });
  },
  search(partNumber: string, signal?: AbortSignal) {
    return apiRequest<Product>("/api/v1/products/search", {
      query: { partNumber },
      signal
    });
  },
  sell(payload: SellPayload) {
    return apiRequest<ProductSale>("/api/v1/products/sell", {
      method: "POST",
      role: "CAR_SERVICE",
      body: payload
    });
  },
  pendingSales(signal?: AbortSignal) {
    return apiRequest<ProductSale[]>("/api/v1/products/sales/pending", {
      role: "CAR_SERVICE",
      signal
    });
  },
  confirmSale(saleId: number) {
    return apiRequest<ProductSale>(`/api/v1/products/sales/${saleId}/confirm`, {
      method: "POST",
      role: "CAR_SERVICE"
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
  updateWithImage(id: number, payload: MotorOilPayload, image: File) {
    const fd = new FormData();
    fd.append("productName", payload.productName);
    fd.append("viscosity", payload.viscosity);
    fd.append("oilType", payload.oilType);
    fd.append("standardApproval", payload.standardApproval);
    fd.append("specification", payload.specification);
    fd.append("description", payload.description);
    fd.append("oilPrice", String(payload.oilPrice));
    fd.append("oilImage", image);
    return apiRequest<MotorOil>(`/api/v1/motor-oils/${id}`, {
      method: "PUT",
      role: "CAR_SERVICE",
      formData: fd
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

export const walletApi = {
  /**
   * Triggers the automatic wallet update: persists any supplied service data,
   * then live-refreshes the pass on Apple Wallet (APNs) and Google Wallet.
   * `scanSecret` is only needed when the backend has WALLET_SCAN_SECRET set.
   */
  scan(payload: WalletScanPayload, scanSecret?: string) {
    return apiRequest<WalletScanResult>("/api/v1/wallet/scan", {
      method: "POST",
      body: payload,
      headers: scanSecret ? { "X-Scan-Secret": scanSecret } : undefined
    });
  }
};

export const servicesApi = {
  getAll(signal?: AbortSignal, role: Role = "USER") {
    return apiRequest<ServiceItem[]>("/api/v1/services", {
      role,
      signal
    });
  },
  getById(id: number) {
    return apiRequest<ServiceItem>(`/api/v1/services/${id}`, {
      role: "CAR_SERVICE"
    });
  },
  create(payload: ServiceItemPayload) {
    return apiRequest<ServiceItem>("/api/v1/services", {
      method: "POST",
      role: "CAR_SERVICE",
      body: payload
    });
  },
  update(id: number, payload: ServiceItemPayload) {
    return apiRequest<ServiceItem>(`/api/v1/services/${id}`, {
      method: "PUT",
      role: "CAR_SERVICE",
      body: payload
    });
  },
  remove(id: number) {
    return apiRequest<void>(`/api/v1/services/${id}`, {
      method: "DELETE",
      role: "CAR_SERVICE"
    });
  }
};
