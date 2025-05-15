import { 
  User, Role, Artwork, Exhibition, Bid, Report, 
  ActivityLog, Comment, DashboardStats, Room
} from "../types";

// Helper to create dates in the past
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@artgallery.com",
    role: "admin",
    isActive: true,
    createdAt: daysAgo(120),
    avatar: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81",
    lastActive: new Date(),
  },
  {
    id: "2",
    name: "Moderator User",
    email: "mod@artgallery.com",
    role: "moderator",
    isActive: true,
    createdAt: daysAgo(90),
    avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    lastActive: daysAgo(1),
  },
  {
    id: "3",
    name: "Jane Shaun",
    email: "jane@artgallery.com",
    role: "user",
    isActive: true,
    createdAt: daysAgo(60),
    avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    lastActive: daysAgo(3),
    isFlagged: true,
    reportCount: 2,
  },
  {
    id: "4",
    name: "Angel Cornaro",
    email: "angel@artgallery.com",
    role: "user",
    isActive: true,
    createdAt: daysAgo(45),
    avatar: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    lastActive: daysAgo(5),
  },
  {
    id: "5",
    name: "Banned User",
    email: "banned@artgallery.com",
    role: "user",
    isActive: false,
    createdAt: daysAgo(30),
    avatar: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    lastActive: daysAgo(15),
    isBanned: true,
    reportCount: 5,
  },
];

// Mock Artworks
export const mockArtworks: Artwork[] = [
  {
    id: "1",
    title: "Humanoid Sculpture",
    artist: mockUsers[3],
    imageUrl: "/placeholder.svg",
    description: "A stunning chrome humanoid sculpture with fluid lines.",
    createdAt: daysAgo(20),
    price: 1200,
    isApproved: true,
    isFeatured: true,
    isReported: false,
    categories: ["sculpture", "digital", "3D"],
    likes: 42,
    views: 320,
  },
  {
    id: "2",
    title: "Cloud Formation",
    artist: mockUsers[2],
    imageUrl: "/placeholder.svg",
    description: "Pink and purple cloud formation at sunset.",
    createdAt: daysAgo(15),
    price: 800,
    isApproved: true,
    isFeatured: false,
    isReported: false,
    categories: ["photography", "nature"],
    likes: 28,
    views: 215,
  },
  {
    id: "3",
    title: "Abstract Landscape",
    artist: mockUsers[3],
    imageUrl: "/placeholder.svg",
    description: "A minimalist approach to the countryside.",
    createdAt: daysAgo(10),
    price: 950,
    isApproved: true,
    isFeatured: false,
    isReported: false,
    categories: ["painting", "abstract", "landscape"],
    likes: 36,
    views: 280,
  },
  {
    id: "4",
    title: "Digital Portrait",
    artist: mockUsers[2],
    imageUrl: "/placeholder.svg",
    description: "A futuristic portrait combining human and technology.",
    createdAt: daysAgo(8),
    price: 1500,
    isApproved: true,
    isFeatured: false,
    isReported: true,
    categories: ["digital", "portrait"],
    likes: 56,
    views: 410,
  },
  {
    id: "5",
    title: "Marble Hand",
    artist: mockUsers[3],
    imageUrl: "/placeholder.svg",
    description: "Sculpture of a delicate hand carved in marble.",
    createdAt: daysAgo(5),
    price: 2200,
    isApproved: false,
    isFeatured: false,
    isReported: false,
    categories: ["sculpture", "classical"],
    likes: 18,
    views: 145,
  },
];

// Mock Rooms
const mockRooms: Room[] = [
  {
    id: "1",
    name: "Modern Art Gallery",
    artworks: [mockArtworks[0], mockArtworks[3]],
    theme: "Modern"
  },
  {
    id: "2",
    name: "Nature Collection",
    artworks: [mockArtworks[1], mockArtworks[2]],
    theme: "Nature"
  }
];

// Mock Exhibitions
export const mockExhibitions: Exhibition[] = [
  {
    id: "1",
    title: "Digital Renaissance",
    curator: mockUsers[1],
    description: "Exploring the intersection of classical art and digital media.",
    startDate: daysAgo(15),
    endDate: new Date(new Date().setDate(new Date().getDate() + 15)),
    artworks: [mockArtworks[0], mockArtworks[3]],
    isActive: true,
    visitors: 453,
    theme: "Digital Art",
    rooms: [mockRooms[0]],
  },
  {
    id: "2",
    title: "Natural Perspectives",
    curator: mockUsers[3],
    description: "A collection of works depicting the beauty of our world.",
    startDate: daysAgo(30),
    endDate: daysAgo(5),
    artworks: [mockArtworks[1], mockArtworks[2]],
    isActive: false,
    visitors: 682,
    theme: "Nature",
    rooms: [mockRooms[1]],
  },
];

// Mock Bids
export const mockBids: Bid[] = [
  {
    id: "1",
    artwork: mockArtworks[0],
    bidder: mockUsers[2],
    amount: 1300,
    status: "pending",
    createdAt: daysAgo(2),
    isSuspicious: false,
  },
  {
    id: "2",
    artwork: mockArtworks[0],
    bidder: mockUsers[3],
    amount: 1350,
    status: "approved",
    createdAt: daysAgo(1),
    isSuspicious: false,
  },
  {
    id: "3",
    artwork: mockArtworks[4],
    bidder: mockUsers[2],
    amount: 2500,
    status: "rejected",
    createdAt: daysAgo(3),
    isSuspicious: true,
  },
];

// Mock Reports
export const mockReports: Report[] = [
  {
    id: "1",
    reportType: "artwork",
    reportedId: mockArtworks[3].id,
    reporter: mockUsers[2],
    assignedTo: mockUsers[1],
    status: "investigating",
    createdAt: daysAgo(2),
    description: "This artwork appears to contain inappropriate content.",
    priority: "medium",
  },
  {
    id: "2",
    reportType: "user",
    reportedId: mockUsers[4].id,
    reporter: mockUsers[3],
    status: "pending",
    createdAt: daysAgo(1),
    description: "User is engaging in harassment through comments.",
    priority: "high",
  },
  {
    id: "3",
    reportType: "comment",
    reportedId: "comment-123",
    reporter: mockUsers[3],
    assignedTo: mockUsers[1],
    status: "resolved",
    createdAt: daysAgo(5),
    description: "Inappropriate language in comment.",
    notes: "Comment removed and user warned.",
    priority: "low",
  },
];

// Mock Activity Logs
export const mockActivityLogs: ActivityLog[] = [
  {
    id: "1",
    user: mockUsers[0],
    action: "banned_user",
    targetType: "user",
    targetId: mockUsers[4].id,
    createdAt: daysAgo(15),
    details: "User banned for multiple violations.",
  },
  {
    id: "2",
    user: mockUsers[1],
    action: "approved_artwork",
    targetType: "artwork",
    targetId: mockArtworks[0].id,
    createdAt: daysAgo(20),
    details: "Artwork approved for gallery display.",
  },
  {
    id: "3",
    user: mockUsers[1],
    action: "rejected_bid",
    targetType: "bid",
    targetId: mockBids[2].id,
    createdAt: daysAgo(3),
    details: "Bid rejected due to suspicious activity.",
  },
  {
    id: "4",
    user: mockUsers[0],
    action: "featured_artwork",
    targetType: "artwork",
    targetId: mockArtworks[0].id,
    createdAt: daysAgo(10),
    details: "Artwork featured on front page.",
  },
];

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: "1",
    user: mockUsers[2],
    content: "This is absolutely stunning work!",
    createdAt: daysAgo(15),
    artworkId: mockArtworks[0].id,
    isDeleted: false,
    isFlagged: false,
  },
  {
    id: "2",
    user: mockUsers[4],
    content: "[This comment was removed for violating community guidelines]",
    createdAt: daysAgo(14),
    artworkId: mockArtworks[0].id,
    isDeleted: true,
    isFlagged: true,
  },
  {
    id: "3",
    user: mockUsers[3],
    content: "I love the use of color in this piece.",
    createdAt: daysAgo(10),
    artworkId: mockArtworks[1].id,
    isDeleted: false,
    isFlagged: false,
  },
];

// Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalUsers: 156,
  newUsersToday: 8,
  totalArtworks: 432,
  newArtworksToday: 12,
  pendingReports: 5,
  activeExhibitions: 2,
  activeBids: 24,
  totalSales: 68400,
};

// Chart Data for Dashboard
export const mockUserActivityData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "New Users",
      data: [45, 52, 38, 65, 78, 86],
      backgroundColor: "rgba(155, 135, 245, 0.5)",
      borderColor: "rgba(155, 135, 245, 1)",
      borderWidth: 2,
    },
    {
      label: "Active Users",
      data: [125, 138, 142, 155, 168, 176],
      backgroundColor: "rgba(20, 184, 166, 0.5)",
      borderColor: "rgba(20, 184, 166, 1)",
      borderWidth: 2,
    },
  ],
};

export const mockSalesData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Sales ($)",
      data: [8500, 12000, 9800, 14500, 18200, 16800],
      backgroundColor: "rgba(255, 87, 87, 0.5)",
      borderColor: "rgba(255, 87, 87, 1)",
      borderWidth: 2,
    },
  ],
};

// Function to get a user by role
export const getUsersByRole = (role: Role): User[] => {
  return mockUsers.filter(user => user.role === role);
};

// Function to get current user by role for testing purposes
export const getCurrentUser = (role: Role): User => {
  const filteredUsers = mockUsers.filter(user => user.role === role);
  return filteredUsers.length > 0 ? filteredUsers[0] : mockUsers[0];
};
