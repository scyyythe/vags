import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/user_dashboard/navbar/Header";

const mockArtworks = [
  {
    name: "Abstract Harmony",
    artist: "Ava Smith",
    volume: "1,250.00",
    change24h: "-5.00%",
    change7d: "+12.50%",
    floorPrice: "2.5 ETH",
    owners: "321",
    items: "50",
    image: "https://i.pinimg.com/736x/32/b3/45/32b3451cdffcb95c5ec9213018865cfb.jpg",
  },
  {
    name: "Dreamscape",
    artist: "Leo Torres",
    volume: "980.75",
    change24h: "+3.20%",
    change7d: "+18.75%",
    floorPrice: "1.8 ETH",
    owners: "289",
    items: "40",
    image: "https://i.pinimg.com/736x/11/91/0b/11910b6edec56cc6c643adce667e70f1.jpg",
  },
  {
    name: "Ethereal Bloom",
    artist: "Maya Liu",
    volume: "1,050.00",
    change24h: "+2.00%",
    change7d: "+15.00%",
    floorPrice: "2.2 ETH",
    owners: "300",
    items: "60",
    image: "https://i.pinimg.com/736x/b9/01/c2/b901c239acdeb4f6d6385a57ae3c15c0.jpg",
  },
  {
    name: "Golden Visions",
    artist: "Isaac Kim",
    volume: "1,300.00",
    change24h: "-1.00%",
    change7d: "+10.00%",
    floorPrice: "3.0 ETH",
    owners: "350",
    items: "55",
    image: "https://i.pinimg.com/736x/24/f6/7f/24f67f0e5d7cdeb8c0357e5e7e69b57f.jpg",
  },
  {
    name: "Lunar Echoes",
    artist: "Sophia Reyes",
    volume: "1,100.00",
    change24h: "-3.00%",
    change7d: "+9.00%",
    floorPrice: "2.7 ETH",
    owners: "310",
    items: "52",
    image: "https://i.pinimg.com/736x/86/05/e7/8605e7a8d7c03c99b54eaa3d55934048.jpg",
  },
  {
    name: "Silent Depths",
    artist: "Daniel Cruz",
    volume: "950.00",
    change24h: "+1.50%",
    change7d: "+11.20%",
    floorPrice: "1.9 ETH",
    owners: "270",
    items: "48",
    image: "https://i.pinimg.com/736x/b0/c0/d3/b0c0d35060782d6faebe2f0e23708d8d.jpg",
  },
  {
    name: "Nova Spectrum",
    artist: "Elena Petrova",
    volume: "1,600.00",
    change24h: "+0.80%",
    change7d: "+14.60%",
    floorPrice: "3.5 ETH",
    owners: "390",
    items: "62",
    image: "https://i.pinimg.com/736x/2b/c3/97/2bc397ecaca6493498080453541b214a.jpg",
  },
  {
    name: "Whispers of Color",
    artist: "Kai Nakamura",
    volume: "870.00",
    change24h: "-4.00%",
    change7d: "+8.20%",
    floorPrice: "1.6 ETH",
    owners: "260",
    items: "42",
    image: "https://i.pinimg.com/736x/0d/66/9b/0d669bce1c119453adc25b7022532827.jpg",
  },
  {
    name: "Timeless Flow",
    artist: "Zara Quinn",
    volume: "1,450.00",
    change24h: "+5.00%",
    change7d: "+17.50%",
    floorPrice: "2.9 ETH",
    owners: "345",
    items: "58",
    image: "https://i.pinimg.com/736x/98/69/14/9869148d1d764025df7942c843bdd704.jpg",
  },
  {
    name: "Mirror of Realms",
    artist: "Omar El-Amin",
    volume: "990.00",
    change24h: "-2.00%",
    change7d: "+7.80%",
    floorPrice: "2.0 ETH",
    owners: "295",
    items: "49",
    image: "https://i.pinimg.com/736x/f8/12/18/f812181288e23b0032968812c16294ec.jpg",
  },
];

export default function TopSellingArtworks() {
  const [timeRange, setTimeRange] = useState("Last 7 days");

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
        <Header />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 mt-[2.5rem]">
            <h1 className="text-xl font-bold">Top Selling Artworks</h1>
            <div className="flex items-center gap-2 text-xs">
            <Button variant="outline" className="text-xs">Art Style</Button>
            <Button variant="outline" className="text-xs">Medium</Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 text-xs">
                    <Calendar size={14} /> {timeRange}
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="text-xs">
                <DropdownMenuItem onClick={() => setTimeRange("Last 7 days")}>Last 7 days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("Last 30 days")}>Last 30 days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("All time")}>All time</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </div>
        </div>

        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto text-sm">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="text-xs">Artwork Title</TableHead>
                <TableHead className="text-xs">Total Sales</TableHead>
                <TableHead className="text-xs">24h Trend</TableHead>
                <TableHead className="text-xs">7-Day Trend</TableHead>
                <TableHead className="text-xs">Starting Price</TableHead>
                <TableHead className="text-xs">Buyers</TableHead>
                <TableHead className="text-xs">Editions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {mockArtworks.slice(0, 10).map((art, i) => (
                <TableRow key={i} className="text-sm">
                    <TableCell className="flex items-center gap-4 min-w-[200px] text-sm">
                    <img
                        src={art.image}
                        alt={art.name}
                        className="w-8 h-8 object-cover rounded-full"
                    />
                    <div>
                        <div className="font-medium text-xs">{art.name}</div>
                        <div className="text-muted-foreground text-[11px]">by {art.artist}</div>
                    </div>
                    </TableCell>
                    <TableCell className="text-xs">{art.volume}</TableCell>
                    <TableCell className={cn("text-xs", art.change24h.startsWith("-") ? "text-red-500" : "text-green-500")}>{art.change24h}</TableCell>
                    <TableCell className={cn("text-xs", art.change7d.startsWith("-") ? "text-red-500" : "text-green-500")}>{art.change7d}</TableCell>
                    <TableCell className="text-xs">{art.floorPrice}</TableCell>
                    <TableCell className="text-xs">{art.owners}</TableCell>
                    <TableCell className="text-xs">{art.items}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
    </div>
  );
}
