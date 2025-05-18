import React from "react";
import { Link } from "react-router-dom";
import ProfileHeader from "@/components/user_dashboard/user_profile/components/ProfileHeader";
import { Button } from "@/components/ui/button";

// Mock data for the demo
const mockUserData = {
  profileImage: "https://i.pravatar.cc/300?img=10",
  name: "Demo User",
  items: 42,
  profileUserId: "demo-user-123",
  cover: "https://images.unsplash.com/photo-1506102383123-c8ef1e872756?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mjd8fGdyYWRpZW50fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60"
};

const FollowDemo = () => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link to="/">
          <Button variant="outline" className="mb-6">
            &larr; Back to Home
          </Button>
        </Link>
        <h1 className="text-2xl font-bold mb-4">Follow Popups Demo</h1>
        <p className="text-gray-600 mb-6">
          Click on the "followers" or "following" text below to open the popups.
        </p>
      </div>

      {/* The ProfileHeader component with the follow modals */}
      <ProfileHeader 
        profileImage={mockUserData.profileImage}
        name={mockUserData.name}
        items={mockUserData.items}
        profileUserId={mockUserData.profileUserId}
        cover={mockUserData.cover}
      />
    </div>
  );
};

export default FollowDemo;
