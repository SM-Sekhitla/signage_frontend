// types/profile.ts

export interface Profile {
  id: string;

  bio?: string;
  companyLogo?: string;
  companyName?: string;
  companyPortfolioUrl?: string;
  contactNumber?: string;

  fullName: string;

  profilePhoto?: string;
  province?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ProfileCreate {
  bio?: string;
  companyLogo?: string;
  companyName?: string;
  companyPortfolioUrl?: string;
  contactNumber?: string;

  fullName: string;

  profilePhoto?: string;
  province?: string;
}

export interface ProfileUpdate {
  bio?: string;
  companyLogo?: string;
  companyName?: string;
  companyPortfolioUrl?: string;
  contactNumber?: string;

  fullName?: string;

  profilePhoto?: string;
  province?: string;
}

export type ProfileOut = Profile;