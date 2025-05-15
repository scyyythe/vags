import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Role } from "../types";
import { getCurrentUser } from "../data/mockData";
import { toast } from "sonner";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, you'd make an API call here
      // For demo, we'll simulate authentication with mock data
      
      // Simple validation
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      // Determine which role to log in as from the email
      const roleFromEmail = email.includes("admin") 
        ? "admin" 
        : email.includes("mod") 
          ? "moderator" 
          : "user";
      
      // Get the mock user for the given role
      const user = getCurrentUser(roleFromEmail);
      
      // Store in state and localStorage
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      
      toast.success(`Logged in as ${user.name} (${user.role})`);
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    toast.info("You have been logged out");
  };

  // For demo purposes - allows switching between roles
  const setRole = (role: Role) => {
    const user = getCurrentUser(role);
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    toast.success(`Switched to ${role} role`);
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    setRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
