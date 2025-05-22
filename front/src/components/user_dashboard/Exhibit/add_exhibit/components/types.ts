import { User } from "@/hooks/users/useUserQuery";
// Artist type definition
export type Artist = {
  id: number;
  name: string;
  avatar: string;
};

// View mode type definition
export type ViewMode = "owner" | "collaborator" | "review" | "monitoring" | "preview";

// Environment definition
export type Environment = {
  id: number;
  image: string;
  slots: number;
};

// Artwork definition
export type Artwork = {
  id: number;
  image: string;
};

// Exhibit data structure
export type ExhibitData = {
  title: string;
  category: string;
  artworkStyle: string;
  exhibitType: string;
  startDate: string;
  endDate: string;
  description: string;
  selectedEnvironment: number;
  bannerImage: string | null;
  collaborators: User[];
  slotOwnerMap: Record<number, number>;
  slotArtworkMap: Record<number, number>;
  status?: string;
};

// Submission status type
export type SubmissionStatus = {
  total: number;
  filled: number;
  percentage: number;
};
