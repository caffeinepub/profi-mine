import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface MiningProject {
    id: Uint8Array;
    fcf?: number;
    lom?: number;
    npv?: number;
    ocf?: number;
    roi?: number;
    ebitda?: number;
    romTonnage: number;
    recoveryRate: number;
    commodityPrice: number;
    owner: Principal;
    capex: number;
    annualOpex?: number;
    averageTaxRate: number;
    name: string;
    discountRate: number;
    depreciation: number;
    processingCost: number;
    annualProduction?: number;
    lastModified: bigint;
    creationDate: bigint;
    miningCost: number;
    strippingRatio: number;
    paybackPeriod?: number;
    gAndACost: number;
    oreGrade: number;
    oreReserves: number;
    annualRevenue?: number;
}
export interface SensitivityRange {
    max: number;
    min: number;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ExportLimit {
    CSV_AND_PDF_COMBINED_MAX: bigint;
    MAX_OPERATIONS_PDF_AND_CSV: bigint;
}
export type SubscriptionTier = {
    __kind__: "premium";
    premium: ExportLimit;
} | {
    __kind__: "free";
    free: ExportLimit;
} | {
    __kind__: "basic";
    basic: ExportLimit;
};
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface LogEntry {
    message: string;
    timestamp: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    lastResetTimestamp: bigint;
    exportsRemainingAnnual: bigint;
    name: string;
    tier: SubscriptionTier;
    modelsCreatedAnnual: bigint;
    isActive: boolean;
    email?: string;
    romUsageCount: bigint;
    organization?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    _initializeAccessControl(): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    canExport(): Promise<boolean>;
    clearPersistentLogs(): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createPremiumCheckoutSession(successUrl: string, cancelUrl: string): Promise<string>;
    decrementExportCount(): Promise<void>;
    deleteProject(id: Uint8Array): Promise<void>;
    fullResetExports(principalId: Principal): Promise<void>;
    getAllUserProfiles(): Promise<Array<[string, UserProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPersistentLogs(): Promise<Array<[bigint, LogEntry]>>;
    getProject(id: Uint8Array): Promise<MiningProject>;
    getProjectsByOwner(owner: Principal): Promise<Array<MiningProject>>;
    getRomUsageCount(): Promise<bigint>;
    getSensitivityRanges(): Promise<Array<[string, SensitivityRange]>>;
    getSortedProjects(sortBy: string): Promise<Array<MiningProject>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSubscriptionTierInfo(): Promise<Array<SubscriptionTier>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    handleStripeWebhook(sessionId: string, eventType: string): Promise<void>;
    incrementRomUsage(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isCurrentUserActive(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    markUserAsPremium(): Promise<void>;
    refreshProjects(): Promise<void>;
    resetRomUsage(principalId: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveProject(project: MiningProject): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    setUserActiveStatus(userId: string, active: boolean): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateSensitivityRange(setting: string, update: SensitivityRange): Promise<void>;
    updateSubscription(principalId: Principal): Promise<void>;
    upgradeSubscription(_tier: string, _planType: string | null): Promise<void>;
}
