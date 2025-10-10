import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

export function useGcashTip() {
  /**
   * Sends a GCash tip to an artist
   * @param amount - Donation amount
   * @param artistId - Artist's user ID
   * @param artId - (Optional) Artwork ID
   */
  const sendGcashTip = async (amount: string, artistId: string, artId?: string) => {
    try {
      const senderId = localStorage.getItem("user_id");
      if (!senderId) {
        toast.error("Please log in before sending a tip.");
        return;
      }

      const { data } = await apiClient.post("/tip/", {
        sender: senderId,
        receiver: artistId,
        art: artId || null,
        amount,
        currency: "PHP",
        payment_method: "GCash",
        payment_status: "Completed",
      });

      toast.success(`You successfully sent ₱${amount} to the artist!`);
      return data;
    } catch (err: any) {
      console.error("GCash tip failed:", err);
      console.error("Response data:", err.response?.data);
      toast.error(err.response?.data?.error || "❌ Failed to send GCash tip. Please try again.");
      throw err;
    }
  };

  return { sendGcashTip };
}
