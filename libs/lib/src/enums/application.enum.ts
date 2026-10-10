export enum UserRole {
    ADMIN = 'ADMIN',
    REVIEWER = 'REVIEWER',
    SALES = 'SALES'
}

export enum ApplicationStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    UNDER_REVIEW = 'UNDER_REVIEW',
    INFO_REQUIRED = 'INFO_REQUIRED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export type ApplicationDecision =
    | ApplicationStatus.APPROVED
    | ApplicationStatus.REJECTED
    | ApplicationStatus.INFO_REQUIRED;

export enum RiskStatus {
    PENDING = 'PENDING',
    PASSED = 'PASSED',
    FAILED = 'FAILED',
    REQUIRES_MANUAL_REVIEW = 'REQUIRES_MANUAL_REVIEW',
}