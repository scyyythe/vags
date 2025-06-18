import React from 'react';
import ArtCard from '../../Bidding/cards/BidCard';

const artworks = [
    {
        id: "1",
        title: "Human Metaloid",
        artist: "Jane Shaun",
        artistAvatar: "https://randomuser.me/api/portraits/women/1.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        image: "https://i.pinimg.com/736x/ee/25/b5/ee25b5fcde96a813deed82b3469805e2.jpg",
        endTime: "2d : 15h : 20m",
        likes: 12000,
        views: 34000,
        highestBid: 95000,
        timeRemaining: { hrs: 2, mins: 15, secs: 20 },
      },
      {
        id: "2",
        title: "Dissolution of Soul",
        artist: "Rick Splin",
        artistAvatar: "https://i.pinimg.com/474x/09/82/70/09827028e812b74970caa859cbf3dec5.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        image: "https://i.pinimg.com/474x/41/ff/68/41ff685dd8f538b1e1e5b4116991dbfc.jpg",
        endTime: "2d : 15h : 20m",
        likes: 12000,
        views: 34000,
        highestBid: 95000,
        timeRemaining: { hrs: 2, mins: 15, secs: 20 },
      },
      {
        id: "3",
        title: "Lost Skull",
        artist: "Jurk Flans",
        artistAvatar: "https://i.pinimg.com/474x/76/81/9f/76819f10e7acdf48403d2b6e7134b347.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        image: "https://i.pinimg.com/736x/47/8d/a5/478da58eee635ab3be6e65fba0595222.jpg",
        endTime: "2d : 15h : 20m",
        likes: 12000,
        views: 34000,
        highestBid: 95000,
        timeRemaining: { hrs: 2, mins: 15, secs: 20 },
      },
      {
        id: "4",
        title: "Space Connection",
        artist: "Lohr Barns",
        artistAvatar: "https://i.pinimg.com/474x/f1/16/6d/f1166dfe695a098adae052509fdedc00.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        image: "https://i.pinimg.com/736x/d4/e9/fa/d4e9fa9888d3ee4edc6a06e0cb72d811.jpg",
        endTime: "2d : 15h : 20m",
        likes: 12000,
        views: 34000,
        highestBid: 95000,
        timeRemaining: { hrs: 2, mins: 15, secs: 20 },
      },
];

const ArtGrid = ({ activeTab }: { activeTab: string }) => {
  const isWideGrid = activeTab === 'created' || activeTab === 'onSale';
  const gridColsClass = isWideGrid 
    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  return (
    <div className={`grid ${gridColsClass} gap-6 mt-6`}>
    </div>
  );
};

export default ArtGrid;
