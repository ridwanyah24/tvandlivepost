export type UserVerificationRequest = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    password: string;
    verificationCode: string;
  };


export type Address = {
    localGovernment: string;
    state: string;
    schoolAddress: string;
  };
  
export type SchoolInformation = {
    name: string;
    description: string;
    schoolType: string;
    email: string;
    phoneNumber: string;
    shortName: string;
    country: string;
    foundingDate: string;
    schoolMotto: string;
    website: string;
    address: Address;
  };
  
export type IdCard = {
    idType: string;
    idNumber: string;
  };
  
export type OwnerInformation = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    country: string;
    nationality: string;
    address: string;
    idCard: IdCard;
  };
  
export type OnboardingState = {
    CAC: File | null;
    logo: File | null;
    utilityBill: File | null;
    plan: string;
    type: string[];
    size: string;
    schoolInformation: SchoolInformation | null;
    ownerInformation: OwnerInformation[];
  };

export type UserRole = "superAdmin" | "admin" | "teacher" | "student";

export interface School {
  schoolId:string;
  roles: UserRole[];
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  schools: School[];
}

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoggedIn: boolean;
  role: string | null;
}


