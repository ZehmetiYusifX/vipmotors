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
  nextServiceKm: number | null;
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
  nextServiceKm: number | null;
  oilBrand: string | null;
  oilType: string | null;
  lastServiceDate: string | null;
  cars: UserCar[];
  role: Role;
}

export interface MaintenanceRecord {
  id: number;
  appUserId: number;
  userCarId?: number;
  carName?: string | null;
  appUserFullName: string;
  customerPlateNumber: string;
  carServiceId: number;
  carServiceUsername: string;
  serviceItemId?: number;
  serviceItemTitle?: string;
  serviceItemType?: ServiceType;
  workDescription?: string;
  oilBrand: string;
  oilType: string;
  oilLiters?: number | null;
  serviceKm: number;
  nextServiceKm: number | null;
  oilFilterChanged: boolean;
  fuelFilterChanged: boolean;
  airFilterChanged: boolean;
  cabinFilterChanged: boolean;
  serviceDate: string;
  /** Planned date of the next service/oil change, if the operator set one. */
  nextServiceDate: string | null;
}

export interface RegisterUserPayload {
  email: string;
  phoneNumber: string;
  password: string;
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

export interface CarPayload {
  plateNumber: string;
  vinCode: string;
  carBrand: string;
  brandModel: string;
  year: number;
  firstRegisteredKm: number;
  currentKm: number;
  oilBrand: string | null;
  oilType: string | null;
  lastServiceDate: string | null;
}

/**
 * Body for POST /api/v1/cars — an operator (CAR_SERVICE / OWNER) registers a car
 * into the registry standalone. Unlike {@link CarPayload}, it carries the
 * owner's phone number: the real owner later claims the car by plate, and their
 * phone must match this value. Plate, phone, brand and model are required; VIN
 * is optional.
 */
export interface CarRegistrationPayload {
  plateNumber: string;
  ownerPhoneNumber: string;
  vinCode: string;
  carBrand: string;
  brandModel: string;
  year: number;
  firstRegisteredKm: number;
  currentKm: number;
  oilBrand: string | null;
  oilType: string | null;
  lastServiceDate: string | null;
}

export interface CarServiceCredentials {
  username: string;
  password: string;
}

/**
 * Body for POST /api/v1/cars/claim — the logged-in user attaches an existing
 * (unowned) car to their own account by plate. Only the plate is required.
 */
export interface ClaimCarPayload {
  plateNumber: string;
}

/**
 * A car an operator registered into the registry that no user has claimed yet
 * (anonymous owner). Listed in the customer base; `ownerPhoneNumber` is the
 * phone the future owner must match to claim it.
 */
export interface UnclaimedCar {
  id: number;
  plateNumber: string;
  ownerPhoneNumber: string | null;
  vinCode: string | null;
  carBrand: string | null;
  brandModel: string | null;
  year: number | null;
  firstRegisteredKm: number | null;
  currentKm: number | null;
  oilBrand: string | null;
  oilType: string | null;
  lastServiceDate: string | null;
  creationTime: string | null;
}

export interface CreateMaintenancePayload {
  plateNumber: string;
  serviceItemId: number;
  workDescription?: string;
  oilBrand: string;
  oilType: string;
  oilLiters?: number | null;
  serviceKm: number;
  nextServiceKm?: number;
  oilFilterChanged?: boolean;
  fuelFilterChanged?: boolean;
  airFilterChanged?: boolean;
  cabinFilterChanged?: boolean;
  serviceDate: string;
  /** Planned date of the next service/oil change — optional. */
  nextServiceDate?: string | null;
}

/**
 * Body for PUT /api/v1/car-services/maintenances/{id} — same data as create but
 * without the plate number: the record stays bound to its car.
 */
export type UpdateMaintenancePayload = Omit<CreateMaintenancePayload, "plateNumber">;

export interface MaintenanceHistoryQuery {
  plateNumber?: string;
  customerId?: number;
}

/**
 * Body for car-service customer create/update. Mirrors the flat shape the
 * backend expects (single primary car embedded). `password` is required when
 * creating and omitted when left blank on update; `enabled` toggles the account.
 */
export interface CustomerPayload {
  phoneNumber: string;
  fullName: string;
  email: string;
  password?: string;
  plateNumber: string;
  vinCode: string;
  carBrand: string;
  brandModel: string;
  year: number;
  firstRegisteredKm: number;
  currentKm: number;
  oilBrand: string | null;
  oilType: string | null;
  lastServiceDate: string | null;
  enabled: boolean;
}

export interface Product {
  id: number;
  product: string;
  partNumber: string;
  brand: string;
  status?: string | null;
  category: string | null;
  price: number;
  /** Price of the non-original (aftermarket) variant, if stocked. */
  aftermarketPrice: number | null;
  /** When true the price is internal-only and hidden from customers on the storefront. */
  hidePrice: boolean;
  count: number;
  /** Stock count of the non-original (aftermarket) variant, if stocked. */
  aftermarketCount: number | null;
  shelf: number | null;
  /** Public image paths (under /uploads/products/) — prefix with API_BASE_URL to display. */
  images: string[];
  engineCode: string[];
  model: string[];
  similarProducts: string[];
  crossReferenceOemEquivalents: string[];
}

export interface ProductPayload {
  product: string;
  partNumber: string;
  brand: string;
  category: string | null;
  price: number;
  /** Optional non-original (aftermarket) variant price. */
  aftermarketPrice: number | null;
  /** Hide the price from customers on the storefront. */
  hidePrice: boolean;
  count: number;
  /** Optional non-original (aftermarket) variant stock count. */
  aftermarketCount: number | null;
  shelf: number | null;
  engineCode: string[];
  model: string[];
  similarProducts: string[];
  crossReferenceOemEquivalents: string[];
}

export interface SellPayload {
  partNumber: string;
  count: number;
}

export type ServiceType = "OIL_CHANGE" | "GENERAL";

export interface ServiceItem {
  id: number;
  type: ServiceType;
  icon: string;
  title: string;
  description: string;
}

export interface ServiceItemPayload {
  type: ServiceType;
  icon: string;
  title: string;
  description: string;
}

export interface CustomerSearchQuery {
  search?: string;
  plateNumber?: string;
}

export type SaleStatus = "PENDING" | "CONFIRMED";

export interface ProductSale {
  id: number;
  status: SaleStatus;
  partNumber: string;
  count: number;
  productCount: number;
  requestedBy: string | null;
  confirmedBy: string | null;
  createdAt: string | null;
  confirmedAt: string | null;
  product: Product | null;
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

/**
 * Body for POST /api/v1/wallet/scan — identifies the pass by plate and
 * optionally carries fresh service data. Even with no service fields the call
 * still pushes a live refresh to the customer's wallet card.
 */
export interface WalletScanPayload {
  plateNumber: string;
  currentKm?: number;
  nextServiceKm?: number;
  oilBrand?: string;
  oilType?: string;
  lastServiceDate?: string;
}

/** Outcome of a scan-triggered wallet update. */
export interface WalletScanResult {
  plateNumber: string;
  serialNumber: string;
  /** Apple Wallet devices registered for this pass with the PassKit web service. */
  appleDevicesRegistered: number;
  /** How many of the registered devices were successfully notified via APNs. */
  applePushesSent: number;
  /** Whether the Google Wallet object was patched successfully. */
  googleUpdated: boolean;
  /** Whether stored service data was modified by this scan. */
  dataChanged: boolean;
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
