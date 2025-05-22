import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg
              viewBox="0 0 24 24"
              className="h-12 w-12 text-brand-red"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M22.672 7.991L13 2.28a2.276 2.276 0 0 0-2 0L1.328 7.991A2.275 2.275 0 0 0 0 10v0a2.276 2.276 0 0 0 2.272 2.273h.004L11 13l8.724-.727h.004A2.276 2.276 0 0 0 22 10v0a2.275 2.275 0 0 0-.672-2.009z" />
              <path d="M2.5 13v3.5a3.5 3.5 0 0 0 7 0v-2.31l-6.004-.501A1.913 1.913 0 0 1 2.5 13z" />
              <path d="M12 22a1 1 0 0 1-1-1v-6.927l-1.5-.125v5.29a1 1 0 1 1-2 0v-5.415l-1.5-.125v2.302a1.5 1.5 0 0 1-3 0v-2.447a3.93 3.93 0 0 0 3.404-3.86l8.592.735v7.943a3 3 0 0 1-2.996 2.999l-2.79.002A.912.912 0 0 1 12 22z" />
              <path d="M14.5 13v3.5a3.5 3.5 0 0 0 7 0v-2.31l-6.004-.501A1.913 1.913 0 0 1 14.5 13z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Digital Art Platform</h1>
          <p className="text-gray-600 mt-2">Admin and Moderator Control Panel</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Portal</CardTitle>
              <CardDescription>
                Platform configuration, user management, financial oversight, and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Admins handle system oversight, platform configuration, financial infrastructure, security, and compliance.
                </p>
                <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1">
                  <li>Manage platform modules and settings</li>
                  <li>Configure financial infrastructure</li>
                  <li>Handle legal and security compliance</li>
                  <li>Access complete platform analytics</li>
                  <li>Manage all user accounts</li>
                </ul>
                <div className="pt-4">
                  <Link to="/admin">
                    <Button className="w-full">Access Admin Dashboard</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Moderator Portal</CardTitle>
              <CardDescription>
                Content review, report handling, user moderation, and community management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Moderators focus on enforcing rules, handling reports, reviewing suspicious activity, and supporting the user community.
                </p>
                <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1">
                  <li>Review and manage content reports</li>
                  <li>Monitor for rule violations</li>
                  <li>Handle user disputes</li>
                  <li>Issue warnings and temporary restrictions</li>
                  <li>Provide support to community members</li>
                </ul>
                <div className="pt-4">
                  <Link to="/moderator">
                    <Button className="w-full" variant="outline">Access Moderator Dashboard</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
