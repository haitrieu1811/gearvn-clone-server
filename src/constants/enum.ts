export enum UserType {
  Admin,
  Staff,
  Guest
}

export enum UserStatus {
  Normal,
  Blocked
}

export enum UserVerifyStatus {
  Unverified,
  Verified
}

export enum Gender {
  Male,
  Female,
  Other
}

export enum AddressType {
  Home,
  Office
}

export enum OrderStatus {
  All,
  New,
  Processing,
  Delivering,
  Succeed,
  Cancelled
}

export enum BlogStatus {
  Pending,
  Resolved,
  Rejected
}

export enum TokenType {
  Access,
  Refresh,
  EmailVerify,
  ForgotPassword
}
