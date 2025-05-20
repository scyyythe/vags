export interface Exhibit {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  likes: number;
  views: number;
  isSolo: boolean;
  collaborators?: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  status: "on_going" | "closed"; 
}
