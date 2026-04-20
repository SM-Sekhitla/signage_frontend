// types/portfolioItems.ts

export interface PortfolioItem {
  id: string;

  installerId: string;

  imageUrl: string;
  title: string;
  description?: string;

  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItemCreate {
  installerId: string;
  imageUrl: string;
  title: string;
  description?: string;
}

export interface PortfolioItemUpdate {
  imageUrl?: string;
  title?: string;
  description?: string;
}

export type PortfolioItemOut = PortfolioItem;