export enum UserStatus {
  Active,
  Banned
}

export enum UserRole {
  Admin,
  Customer,
  Seller
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

export enum PurchaseStatus {
  All,
  InCart,
  Ordered
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

export enum MediaType {
  Image,
  Video
}

export enum ReceiveMethod {
  AtHome,
  AtStore,
  AtPostOffice,
  Other
}

export enum PaymentMethod {
  Cash,
  Card
}
