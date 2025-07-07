import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/user_dashboard/navbar/Header";
import { useExhibitReview } from "@/hooks/exhibit/useExhibitReview";
interface Collaborator {
  id: number;
  name: string;
  profile_picture: string;
  slotsToFill: number;
  slotsFilled: number;
  inProgress: boolean;
}

interface ExhibitDetails {
  title: string;
  category: string;
  type: string;
  startDate: string;
  endDate: string;
  description: string;
  collaborators: Array<{ name: string; profile_picture: string }>;
}

type ExhibitMode = "monitor" | "review" | "ready";

const ExhibitReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const exhibitId = new URLSearchParams(location.search).get("id");

  const { data: exhibit, isLoading, error } = useExhibitReview(exhibitId || "");

  // For demo purposes, we're using the mode from the URL or default to "review"
  // const exhibitId = new URLSearchParams(location.search).get('id') || "3";
  const exhibitMode: ExhibitMode = "review";
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })} - ${endDate.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}`;
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/addexhibit/${exhibitId}?mode=edit`);
  };

  const handlePublish = () => {
    if (!isReadyToPublish) {
      toast({
        title: "Cannot publish yet",
        description: "All collaborator slots must be filled before publishing.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Exhibit Published",
      description: "Your exhibit has been successfully published!",
    });
    navigate("/exhibits");
  };
  if (isLoading) {
    return <div className="p-10 text-sm">Loading exhibit review...</div>;
  }

  if (error || !exhibit) {
    return <div className="p-10 text-sm text-red-600">Failed to load exhibit review.</div>;
  }
  const collaborators: Collaborator[] = exhibit.collaborators.map((collab: any) => {
    const slotsForUser = exhibit.slots.filter((slot: any) => slot.contributor.id === collab.id);
    const slotsToFill = 2;
    return {
      id: collab.id,
      name: collab.name,
      profile_picture: collab.profile_picture || "",
      slotsToFill,
      slotsFilled: slotsForUser.length,
      inProgress: slotsForUser.length < slotsToFill,
    };
  });
  const totalSlots = collaborators.reduce((acc, curr) => acc + curr.slotsToFill, 0);
  const filledSlots = collaborators.reduce((acc, curr) => acc + curr.slotsFilled, 0);

  const completionPercentage = Math.floor((filledSlots / totalSlots) * 100);

  // Determine if exhibit is ready to publish (all slots filled)
  const isReadyToPublish = filledSlots === totalSlots;

  return (
    <div>
      <div className="mb-20">
        <Header />
      </div>
      {/* Back button */}
      <div className="ml-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
          <i className="bx bx-chevron-left text-xl mr-2"></i>Go back
        </button>
      </div>

      <div className="mx-auto px-10 py-6">
        {/* Exhibit Review Header */}
        <div className="mb-6">
          <h1 className="text-[13px] font-semibold mb-1">Exhibit Review</h1>
          <p className="text-[11px] text-gray-600">
            Review all details before publishing your exhibit. Make sure collaborators have filled their slots.
          </p>
        </div>

        {/* Banner Image */}
        <div className="w-full rounded-lg h-72 mb-8 relative overflow-hidden bg-cover bg-center">
          <img src={exhibit.banner} alt="Exhibit Gallery Preview" className="w-full h-full object-cover" />

          <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-white">
            <h1 className="text-md font-bold mb-2">{exhibit.title}</h1>
            <p className="text-[11px]">
              {new Date(exhibit.startDate).toLocaleDateString()} - {new Date(exhibit.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Exhibit Details */}
          <div>
            <h3 className="text-xs font-medium mb-4">Exhibit Details</h3>
            <Card className="p-5">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 text-[10px] font-medium mb-1">Title</p>
                  <p className="text-[11px]">{exhibit.title}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-[10px] font-medium mb-1">Category</p>
                  <p className="text-[11px]">{exhibit.category}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-[10px] font-medium mb-1">Exhibit Type</p>
                  <p className="text-[11px]">{exhibit.type}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-[10px] font-medium mb-1">Duration</p>
                  <p className="text-[11px]">{formatDateRange(exhibit.startDate, exhibit.endDate)}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-[10px] font-medium mb-1">Description</p>
                  <p className="text-[11px]">{exhibit.description}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-[10px] font-medium mb-1">Collaborators</p>
                  <div className="flex flex-col gap-2 mt-1">
                    {exhibit.collaborators.map((collaborator, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={collaborator.profile_picture} alt={collaborator.name} />
                          <AvatarFallback className="text-[11px] bg-gray-600 text-white">
                            {collaborator.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <span className="text-[11px]">{collaborator.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Environment & Slots */}
          <div>
            <h3 className="text-xs font-medium mb-4">Environment & Slots</h3>
            <Card className="p-5">
              <div className="mb-4">
                <img
                  src="https://i.pinimg.com/736x/a1/a8/42/a1a842b4254e1c79b2491caa0f5520e1.jpg"
                  alt="Gallery Space"
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center flex">
                  <div className="h-2.5 w-2.5 bg-gray-800 rounded-full mr-2"></div>
                  <p className="text-[10px] text-gray-600">Your slots</p>
                </div>
                <div className="text-center flex">
                  <div className="h-2.5 w-2.5 bg-blue-500 rounded-full mr-2"></div>
                  <p className="text-[10px] text-gray-600">Maya's slots</p>
                </div>
                <div className="text-center flex">
                  <div className="h-2.5 w-2.5 bg-red-500 rounded-full mr-2"></div>
                  <p className="text-[10px] text-gray-600">Angel's slots</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Slot 1 */}
                <div className="w-[120px] h-[75px] rounded-md p-2 text-center flex flex-col items-center justify-start">
                  <img
                    src="https://i.pinimg.com/736x/19/dd/6a/19dd6a09150116940f1470e42d54b0cc.jpg"
                    alt="Artwork slot"
                    className="w-full h-16 object-cover rounded-sm mb-2"
                  />
                </div>

                {/* Slot 2 */}
                <div className="w-[120px] h-[75px] rounded-md p-2 text-center flex flex-col items-center justify-start">
                  <img
                    src="https://i.pinimg.com/736x/94/2c/35/942c35f24718efeafac5fb77067b4604.jpg"
                    alt="Artwork slot"
                    className="w-full h-16 object-cover rounded-sm mb-2"
                  />
                </div>

                {/* Slot 3 */}
                <div className="w-[120px] h-[75px] rounded-md p-2 text-center flex flex-col items-center justify-start">
                  <img
                    src="https://i.pinimg.com/736x/d9/d1/13/d9d11380d789d981001068d8a28fe1ef.jpg"
                    alt="Artwork slot"
                    className="w-full h-16 object-cover rounded-sm mb-2"
                  />
                </div>

                {/* Slot 4 */}
                <div className="w-[120px] h-[75px] rounded-md p-2 text-center flex flex-col items-center justify-start">
                  <img
                    src="https://i.pinimg.com/736x/5a/39/dd/5a39ddaf10f622ac82d11a7d56d3ba39.jpg"
                    alt="Artwork slot"
                    className="w-full h-16 object-cover rounded-sm mb-2"
                  />
                </div>

                {/* Slot 5 */}
                <div className="w-[120px] p-2 text-center flex flex-col items-center justify-start">
                  <div className="border rounded-md w-[100px] h-[65px]">
                    <div className="relative top-4">
                      <p className="text-[10px] font-semibold">7</p>
                      <p className="text-[10px] text-gray-500">Alex Chen's slot</p>
                    </div>
                  </div>
                </div>

                {/* Slot 6 */}
                <div className="w-[120px] p-2 text-center flex flex-col items-center justify-start">
                  <div className="border rounded-md w-[100px] h-[65px]">
                    <div className="relative top-4">
                      <p className="text-[10px] font-semibold">8</p>
                      <p className="text-[10px] text-gray-500">Jera's slot</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Collaborator Status */}
          <div>
            <h3 className="text-xs font-medium mb-4">Collaborator Status</h3>
            <div className="space-y-4">
              {collaborators.map((collaborator) => (
                <Card key={collaborator.id} className="p-4 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={collaborator.profile_picture} alt={collaborator.name} />
                        <AvatarFallback className="text-[11px] bg-gray-600 text-white">
                          {collaborator.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="text-[11px] font-medium">{collaborator.name}</p>
                        <p className="text-[10px] text-gray-500">
                          {collaborator.slotsFilled} of {collaborator.slotsToFill} slots filled
                        </p>
                      </div>
                    </div>
                    {collaborator.inProgress && (
                      <Badge className="bg-yellow-100 text-yellow-800 text-[10px] font-medium px-2 py-0.5 rounded-full">
                        In Progress
                      </Badge>
                    )}
                  </div>
                  <Progress
                    value={(collaborator.slotsFilled / collaborator.slotsToFill) * 100}
                    className="h-1.5 bg-gray-200 [&>*]:bg-yellow-500"
                  />
                </Card>
              ))}
            </div>

            {/* Overall Completion */}
            <div className="mt-10">
              <h3 className="text-xs font-medium mb-2">Overall Completion</h3>
              <Card className="p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-medium text-blue-900">{completionPercentage}% Complete</span>
                  <span className="text-[10px] text-gray-500">
                    {filledSlots} of {totalSlots} slots filled
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-1.5 bg-gray-200 [&>*]:bg-yellow-500" />
              </Card>
            </div>

            {/* Preview Button */}
            <div className="mt-7">
              <button
                type="button"
                className="bg-gray-900 text-white text-[10px] px-5 py-2 rounded-full hover:bg-gray-800"
                onClick={() => {
                  navigate("/gallery3d-preview");
                }}
              >
                Preview in 3D View
              </button>
              <p className="text-[10px] text-muted-foreground mt-2">
                Opens your current selections in an interactive virtual gallery.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button className="text-[11px] px-8 py-1.5 border rounded-full" onClick={handleEdit}>
            Edit
          </button>
          <button
            onClick={handlePublish}
            disabled={!isReadyToPublish}
            className={`text-white text-[11px] px-6 py-1.5 border rounded-full ${
              isReadyToPublish ? "bg-red-700 hover:bg-red-600" : "bg-red-300 cursor-not-allowed"
            }`}
          >
            Publish Exhibit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExhibitReview;
