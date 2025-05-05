import { useNavigate } from "react-router-dom";
import useUserDetails from "./useUserDetails";

const ArtistName = ({ artistId }: { artistId: string }) => {
  const { username, firstName, lastName, isLoading, error } = useUserDetails(artistId);
  const navigate = useNavigate();

  if (isLoading) {
    return <p>Loading artist name...</p>;
  }

  if (error) {
    return <p>Error loading artist name</p>;
  }

  const artistName = firstName && lastName ? `${firstName} ${lastName}` : username || "Unknown Artist";

  return <span onClick={() => navigate(`/userprofile/${artistId}`)}>by {artistName}</span>;
};
