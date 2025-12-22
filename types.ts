export enum UserRole {
  PASSENGER = 'PASSENGER',
  OPERATOR = 'OPERATOR',
  PAYER = 'PAYER' // Third-party payer
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number; // Liquid USDC in Web3 Wallet
}

export interface TransitRoute {
  id: string;
  name: string; // e.g., "Line 45 Express"
  origin: string;
  destination: string;
  price: number; // USDC
  schedule: string; // e.g., "Every 15 mins"
  type: 'BUS' | 'TRAIN' | 'METRO' | 'FERRY';
  imageUrl: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderAddress: string;
  text: string;
  timestamp: number;
  isAi?: boolean;
}

export interface Ticket {
  id: string;
  routeId: string;
  routeName: string;
  passengerName: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
  purchaseDate: string;
  expiryDate: string;
  qrData: string;
  txHash: string;
  imageUrl: string;
}

export interface PaymentLink {
  id: string;
  routeId: string;
  passengerName: string;
  amount: number;
  note?: string;
  createdAt: number;
  expiresAt: number | null;
  isPaid: boolean;
  creatorAddress: string;
}

export interface AnalyticsData {
  dailyRevenue: { date: string; amount: number }[];
  popularRoutes: { name: string; ticketsSold: number }[];
  totalRevenue: number;
  activeRiders: number;
}

// --- VAULT & REWARDS TYPES ---

export interface NFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  dateEarned: string;
}

export interface VaultState {
  balance: number; // Deposited USDC (Converted to USYC)
  lockedAmount: number;
  yieldEarned: number;
  points: number; // Loyalty points
  apy: number; // Current APY percentage
  nfts: NFT[];
  lockPeriod: 'NONE' | '30_DAYS' | '90_DAYS' | '1_YEAR';
}