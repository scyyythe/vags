export type Role = "admin" | "moderator" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  avatar: string;
  lastActive?: Date;
  isBanned?: boolean;
  isFlagged?: boolean;
  reportCount?: number;
}

export interface Artwork {
  id: string;
  title: string;
  artist: User;
  imageUrl: string;
  description: string;
  createdAt: Date;
  price?: number;
  bids?: Bid[];
  isApproved: boolean;
  isFeatured: boolean;
  isReported: boolean;
  categories: string[];
  likes: number;
  views: number;
}

export interface Exhibition {
  id: string;
  title: string;
  curator: User;
  description: string;
  startDate: Date;
  endDate: Date;
  artworks: Artwork[];
  isActive: boolean;
  visitors: number;
  theme: string;
  rooms: Room[];
}

export interface Room {
  id: string;
  name: string;
  artworks: Artwork[];
  theme: string;
}

export interface Bid {
  id: string;
  artwork: Artwork;
  bidder: User;
  amount: number;
  status: "pending" | "approved" | "rejected" | "won" | "lost";
  createdAt: Date;
  isSuspicious: boolean;
}

export interface Report {
  id: string;
  reportType: "user" | "artwork" | "comment";
  reportedId: string;
  reporter: User;
  assignedTo?: User;
  status: "pending" | "investigating" | "resolved" | "escalated";
  createdAt: Date;
  description: string;
  notes?: string;
  priority: "low" | "medium" | "high";
}

export interface ActivityLog {
  id: string;
  user: User;
  action: string;
  targetType: "user" | "artwork" | "exhibition" | "bid" | "report";
  targetId: string;
  createdAt: Date;
  details?: string;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  createdAt: Date;
  artworkId?: string;
  exhibitionId?: string;
  parentId?: string;
  isDeleted: boolean;
  isFlagged: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalArtworks: number;
  newArtworksToday: number;
  pendingReports: number;
  activeExhibitions: number;
  activeBids: number;
  totalSales: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}
