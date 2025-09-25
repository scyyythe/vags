import { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";

export interface Credential {
  id: string;
  device: string;
  date: string;
  isCurrentSession: boolean;
}

const [credentials, setCredentials] = useState<Credential[]>([]);

useEffect(() => {
  apiClient.get("/sessions/").then((res) => setCredentials(res.data));
}, []);

const removeDevice = async (id: string) => {
  await apiClient.delete(`/sessions/${id}/`);
  setCredentials((prev) => prev.filter((cred) => cred.id !== id));
};
