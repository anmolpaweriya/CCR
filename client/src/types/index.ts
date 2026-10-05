export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  skills: string[];
  interests: string[];
  locationZone: string;
  availability: string;
  reputationScore: number;
  completedContributions: number;
  badges: string[];
  isVerified: boolean;
  isSuspended?: boolean;
}

export interface Wallet {
  cashCredits: number;
  goodwillCredits: number;
  withdrawableCashCredits: number;
  pendingCashCredits: number;
  totalCashEarned: number;
  totalCashSpent: number;
  totalGoodwillEarned: number;
  totalGoodwillSpent: number;
}

export type CreditType = 'cash_credit' | 'goodwill_credit';

export interface CreditTransaction {
  _id: string;
  user: string;
  creditType: CreditType;
  transactionType:
    | 'TOPUP'
    | 'WITHDRAWAL'
    | 'ASSISTANCE_PAYMENT'
    | 'ASSISTANCE_EARNING'
    | 'RESOURCE_PAYMENT'
    | 'RESOURCE_EARNING'
    | 'GOODWILL_REWARD'
    | 'REFUND'
    | 'ADJUSTMENT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string;
  referenceId: string;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REVERTED';
  createdAt: string;
}

export interface AssistanceRequest {
  _id: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  estimatedDuration: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  preferredDate: string;
  preferredTime: string;
  approximateLocation: string;
  creditValue: number;
  requestType: 'STANDARD' | 'GOODWILL';
  status:
    | 'OPEN'
    | 'MATCHING'
    | 'ACCEPTED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'VERIFICATION_PENDING'
    | 'VERIFIED'
    | 'CANCELLED'
    | 'DISPUTED';
  requester: User;
  selectedContributor?: User;
  appliedContributors?: User[];
  aiValuation?: {
    recommendedCredits: number;
    reasons: string[];
  };
  completionNotes?: string;
  createdAt: string;
}

export interface Resource {
  _id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  condition: 'LIKE_NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR';
  availability: 'IMMEDIATE' | 'WEEKDAYS' | 'WEEKENDS' | 'UPON_REQUEST';
  locationZone: string;
  owner: User;
  creditPrice: number;
  deposit?: number;
  status: 'AVAILABLE' | 'RESERVED' | 'BORROWED' | 'RETURN_PENDING' | 'RETURNED' | 'UNAVAILABLE';
  rules: string[];
  createdAt: string;
}

export interface ResourceRequest {
  _id: string;
  resource: Resource | string;
  requester: User;
  owner: User;
  startDate: string;
  endDate: string;
  days: number;
  isGoodwill: boolean;
  creditsOffered: number;
  message?: string;
  status:
    | 'PENDING'
    | 'ACCEPTED'
    | 'DECLINED'
    | 'HANDED_OVER'
    | 'RETURN_PENDING'
    | 'RETURN_VERIFIED'
    | 'CANCELLED'
    | 'DISPUTED';
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type:
    | 'MATCH_FOUND'
    | 'REQUEST_ACCEPTED'
    | 'REQUEST_COMPLETED'
    | 'VERIFICATION_REQUIRED'
    | 'CREDITS_RECEIVED'
    | 'GOODWILL_REQUEST'
    | 'GOODWILL_ACCEPTED'
    | 'RESOURCE_REQUEST'
    | 'RESOURCE_RETURN'
    | 'WITHDRAWAL_STATUS'
    | 'DISPUTE_UPDATE';
  link?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Withdrawal {
  _id: string;
  user: User;
  amount: number;
  creditType: 'cash_credit';
  payoutMethod: 'UPI' | 'BANK_TRANSFER';
  payoutDetails: string;
  status: 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  adminReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalAssistanceRequests: number;
  completedAssistance: number;
  totalResources: number;
  borrowedResources: number;
  cashCirculation: number;
  goodwillCirculation: number;
  pendingWithdrawals: number;
  pendingDisputes: number;
  demoPayments: number;
}
