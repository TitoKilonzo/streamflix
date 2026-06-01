export type ContentType = 'movie' | 'series' | 'documentary' | 'live';

export interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  seasonNumber: number;
  duration: string;
  videoUrl: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  category: ContentType;
  genres: string[];
  type: 'movie' | 'series' | 'documentary' | 'live';
  videoUrl: string;
  trailerUrl: string;
  posterUrl: string;
  backdropUrl: string;
  rating: string;
  year: number;
  duration: string; // e.g., "2h 15m" or "10 Episodes"
  cast: string[];
  subtitles: string[]; // e.g., ["English", "Spanish", "French", "Swahili"]
  audioLanguages: string[]; // e.g., ["English", "Spanish", "Swahili"]
  isTrending?: boolean;
  isNewRelease?: boolean;
  isPopular?: boolean;
  episodes?: Episode[];
  isPremiumOnly?: boolean;
  likes?: number;
  introStart?: number; // seconds
  introEnd?: number; // seconds
}

export interface Profile {
  id: string;
  name: string;
  avatarUrl: string;
  isKids: boolean;
  watchlist: string[]; // movie IDs
  continueWatching: {
    movieId: string;
    episodeId?: string;
    position: number; // in seconds
    duration: number; // total duration in seconds
    updatedAt: string;
  }[];
  downloads: {
    movieId: string;
    progress: number;
    isCompleted: boolean;
    downloadedAt: string;
    fileSize: string;
  }[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  subscription: 'none' | 'basic' | 'standard' | 'premium';
  subscriptionStatus: 'active' | 'canceled' | 'expired';
  billingCycle: 'monthly' | 'yearly';
  profiles: Profile[];
  currentProfileId?: string;
  createdAt: string;
  phoneNumber?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'info' | 'release' | 'billing' | 'download';
  movieId?: string;
}

export interface Transaction {
  id: string;
  userEmail: string;
  plan: 'basic' | 'standard' | 'premium';
  amount: number;
  paymentMethod: 'Stripe' | 'M-Pesa';
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
}
