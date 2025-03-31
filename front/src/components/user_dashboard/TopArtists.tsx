import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const TopArtists = () => {
  const artists = [
    {
      id: "1",
      name: "Jamelina Knacha",
      followers: "21,800",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1374&auto=format&fit=crop",
    },
    {
      id: "2",
      name: "Gertruda Le Rosa",
      followers: "18,600",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1470&auto=format&fit=crop",
    },
    {
      id: "3",
      name: "Jerald Richards",
      followers: "15,200",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1374&auto=format&fit=crop",
    },
    {
      id: "4",
      name: "Jacob Uiosa",
      followers: "12,700",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1374&auto=format&fit=crop",
    },
    {
      id: "5",
      name: "Chandani Tenaya",
      followers: "10,400",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1374&auto=format&fit=crop",
    },
  ];

  return (
    <div className="bg-secondary/30 rounded-3xl p-6">
      <h2 className="text-xl font-bold mb-4">Top Artist</h2>
      <div className="space-y-4">
        {artists.map((artist) => (
          <div key={artist.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={artist.image} alt={artist.name} />
                <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">{artist.name}</h3>
                <div className="text-xs text-muted-foreground">{artist.followers} followers</div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full text-xs py-1 h-8">Follow</Button>
          </div>
        ))}
      </div>
      <button className="w-full text-center text-sm mt-4 text-muted-foreground hover:text-foreground transition-colors">
        View more
      </button>
    </div>
  );
};

export default TopArtists;