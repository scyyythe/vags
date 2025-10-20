import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Camera, Save, Shield, Bell, Globe, Key, User, Mail, Phone, Eye, EyeOff, FileCheck } from "lucide-react";
import useUserQuery from "@/hooks/users/useUserQuery";
import { getLoggedInUserId } from "@/auth/decode";

const ModeratorProfileSettings = () => {
  const userId = getLoggedInUserId();
  const { data: moderator, isLoading } = useUserQuery(userId);
  
  const [profileData, setProfileData] = useState({
    firstName: moderator?.first_name || "",
    lastName: moderator?.last_name || "",
    email: moderator?.email || "",
    phone: (moderator as any)?.phone_number || "",
    bio: (moderator as any)?.bio || "",
    timezone: (moderator as any)?.timezone || "UTC",
    language: (moderator as any)?.language || "en",
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: "30",
    passwordExpiry: "90",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    systemAlerts: true,
    contentReports: true,
    userViolations: true,
    autoModeration: true,
    escalationAlerts: true,
  });

  const [moderationSettings, setModerationSettings] = useState({
    autoApprove: false,
    strictMode: true,
    reportThreshold: "medium",
    workingHours: "24/7",
    contentReviewQueue: true,
  });

  const [preferences, setPreferences] = useState({
    theme: "light",
    dashboardLayout: "grid",
    itemsPerPage: "25",
    autoRefresh: true,
  });

  // Modal states
  const [changePhotoOpen, setChangePhotoOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [securitySettingsOpen, setSecuritySettingsOpen] = useState(false);

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Photo upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully", { closeButton: true });
  };

  const handleSaveSecurity = () => {
    toast.success("Security settings updated", { closeButton: true });
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences updated", { closeButton: true });
  };

  const handleSaveModeration = () => {
    toast.success("Moderation settings updated", { closeButton: true });
  };

  const handleSavePreferences = () => {
    toast.success("Preferences updated", { closeButton: true });
  };

  // Photo upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB", { closeButton: true });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file", { closeButton: true });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = () => {
    if (selectedFile) {
      // Simulate upload process
      toast.success("Profile photo updated successfully", { closeButton: true });
      setChangePhotoOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  // Password change handlers
  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match", { closeButton: true });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters", { closeButton: true });
      return;
    }
    // Simulate password change
    toast.success("Password changed successfully", { closeButton: true });
    setChangePasswordOpen(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const initials = moderator?.first_name
    ? moderator.first_name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "M";

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-md font-bold">Profile Settings</h1>
          <p className="text-[10px] text-muted-foreground">
            Manage your moderator profile and account preferences
          </p>
        </div>
        <Badge className="bg-blue-600 text-[10px]">Moderator</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xs flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-[10px]">
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {moderator && moderator.profile_picture ? (
                  <AvatarImage src={moderator.profile_picture} alt={`${moderator.first_name} ${moderator.last_name}`} />
                ) : (
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-[10px] rounded-full h-7"
                  onClick={() => setChangePhotoOpen(true)}
                >
                  <Camera className="h-3 w-3 mr-1" />
                  Change Photo
                </Button>
                <p className="text-[9px] text-muted-foreground mt-1">
                  JPG, PNG up to 2MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[11px]">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="h-8 text-[10px]"
                  placeholder="Enter your first name"
                  style={{ fontSize: '10px' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[11px]">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="h-8 text-[10px]"
                  placeholder="Enter your last name"
                  style={{ fontSize: '10px' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="h-8 text-[10px]"
                placeholder="Enter your email address"
                style={{ fontSize: '10px' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[11px] flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="h-8 text-[10px]"
                placeholder="Enter your phone number"
                style={{ fontSize: '10px' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-[11px]">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="text-[10px] h-20"
                placeholder="Tell us about yourself..."
                style={{ fontSize: '10px' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-[11px]">Timezone</Label>
                <Select value={profileData.timezone} onValueChange={(value) => setProfileData({ ...profileData, timezone: value })}>
                  <SelectTrigger className="h-8 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC" className="text-[10px]">UTC</SelectItem>
                    <SelectItem value="EST" className="text-[10px]">Eastern Time</SelectItem>
                    <SelectItem value="PST" className="text-[10px]">Pacific Time</SelectItem>
                    <SelectItem value="GMT" className="text-[10px]">GMT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language" className="text-[11px]">Language</Label>
                <Select value={profileData.language} onValueChange={(value) => setProfileData({ ...profileData, language: value })}>
                  <SelectTrigger className="h-8 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en" className="text-[10px]">English</SelectItem>
                    <SelectItem value="es" className="text-[10px]">Spanish</SelectItem>
                    <SelectItem value="fr" className="text-[10px]">French</SelectItem>
                    <SelectItem value="de" className="text-[10px]">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSaveProfile} className="text-[10px] rounded-full h-8">
              <Save className="h-3 w-3 mr-1" />
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">Account Type</span>
                <Badge className="bg-blue-600 text-[10px]">Moderator</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">Member Since</span>
                <span className="text-[11px] font-medium">Feb 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">Last Login</span>
                <span className="text-[11px] font-medium">1 hour ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">Status</span>
                <Badge className="bg-green-600 text-[10px]">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">Reports Reviewed</span>
                <span className="text-[11px] font-medium">1,247</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-[10px] rounded-full h-7"
                onClick={() => setChangePasswordOpen(true)}
              >
                <Key className="h-3 w-3 mr-1" />
                Change Password
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-[10px] rounded-full h-7"
                onClick={() => setSecuritySettingsOpen(true)}
              >
                <Shield className="h-3 w-3 mr-1" />
                Security Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Moderation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Moderation Settings
          </CardTitle>
          <CardDescription className="text-[10px]">
            Configure your moderation preferences and workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium">Auto Approve</p>
                  <p className="text-[10px] text-muted-foreground">Automatically approve safe content</p>
                </div>
                <Switch
                  checked={moderationSettings.autoApprove}
                  onCheckedChange={(checked) => setModerationSettings({ ...moderationSettings, autoApprove: checked })}
                  className="scale-75"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium">Strict Mode</p>
                  <p className="text-[10px] text-muted-foreground">Use stricter moderation guidelines</p>
                </div>
                <Switch
                  checked={moderationSettings.strictMode}
                  onCheckedChange={(checked) => setModerationSettings({ ...moderationSettings, strictMode: checked })}
                  className="scale-75"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium">Content Review Queue</p>
                  <p className="text-[10px] text-muted-foreground">Show pending content for review</p>
                </div>
                <Switch
                  checked={moderationSettings.contentReviewQueue}
                  onCheckedChange={(checked) => setModerationSettings({ ...moderationSettings, contentReviewQueue: checked })}
                  className="scale-75"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px]">Report Threshold</Label>
                <Select value={moderationSettings.reportThreshold} onValueChange={(value) => setModerationSettings({ ...moderationSettings, reportThreshold: value })}>
                  <SelectTrigger className="h-8 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low" className="text-[10px]">Low</SelectItem>
                    <SelectItem value="medium" className="text-[10px]">Medium</SelectItem>
                    <SelectItem value="high" className="text-[10px]">High</SelectItem>
                    <SelectItem value="critical" className="text-[10px]">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px]">Working Hours</Label>
                <Select value={moderationSettings.workingHours} onValueChange={(value) => setModerationSettings({ ...moderationSettings, workingHours: value })}>
                  <SelectTrigger className="h-8 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24/7" className="text-[10px]">24/7</SelectItem>
                    <SelectItem value="business" className="text-[10px]">Business Hours</SelectItem>
                    <SelectItem value="weekdays" className="text-[10px]">Weekdays Only</SelectItem>
                    <SelectItem value="custom" className="text-[10px]">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Button onClick={handleSaveModeration} className="text-[10px] rounded-full h-8">
            <Save className="h-3 w-3 mr-1" />
            Save Moderation Settings
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Preferences
          </CardTitle>
          <CardDescription className="text-[10px]">
            Choose what notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium">Email Notifications</p>
                  <p className="text-[10px] text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                  className="scale-75"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium">System Alerts</p>
                  <p className="text-[10px] text-muted-foreground">Platform maintenance and updates</p>
                </div>
                <Switch
                  checked={notificationSettings.systemAlerts}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, systemAlerts: checked })}
                  className="scale-75"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium">Content Reports</p>
                  <p className="text-[10px] text-muted-foreground">New content reports and violations</p>
                </div>
                <Switch
                  checked={notificationSettings.contentReports}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, contentReports: checked })}
                  className="scale-75"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium">User Violations</p>
                  <p className="text-[10px] text-muted-foreground">User policy violations and warnings</p>
                </div>
                <Switch
                  checked={notificationSettings.userViolations}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, userViolations: checked })}
                  className="scale-75"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium">Auto Moderation</p>
                  <p className="text-[10px] text-muted-foreground">Automated moderation actions</p>
                </div>
                <Switch
                  checked={notificationSettings.autoModeration}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, autoModeration: checked })}
                  className="scale-75"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium">Escalation Alerts</p>
                  <p className="text-[10px] text-muted-foreground">Cases requiring escalation</p>
                </div>
                <Switch
                  checked={notificationSettings.escalationAlerts}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, escalationAlerts: checked })}
                  className="scale-75"
                />
              </div>
            </div>
          </div>
          <Button onClick={handleSaveNotifications} className="text-[10px] rounded-full h-8">
            <Save className="h-3 w-3 mr-1" />
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-xs flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Interface Preferences
          </CardTitle>
          <CardDescription className="text-[10px]">
            Customize your moderator panel experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px]">Theme</Label>
                <Select value={preferences.theme} onValueChange={(value) => setPreferences({ ...preferences, theme: value })}>
                  <SelectTrigger className="h-8 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light" className="text-[10px]">Light</SelectItem>
                    <SelectItem value="dark" className="text-[10px]">Dark</SelectItem>
                    <SelectItem value="auto" className="text-[10px]">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px]">Dashboard Layout</Label>
                <Select value={preferences.dashboardLayout} onValueChange={(value) => setPreferences({ ...preferences, dashboardLayout: value })}>
                  <SelectTrigger className="h-8 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid" className="text-[10px]">Grid</SelectItem>
                    <SelectItem value="list" className="text-[10px]">List</SelectItem>
                    <SelectItem value="compact" className="text-[10px]">Compact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px]">Items Per Page</Label>
                <Select value={preferences.itemsPerPage} onValueChange={(value) => setPreferences({ ...preferences, itemsPerPage: value })}>
                  <SelectTrigger className="h-8 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10" className="text-[10px]">10 items</SelectItem>
                    <SelectItem value="25" className="text-[10px]">25 items</SelectItem>
                    <SelectItem value="50" className="text-[10px]">50 items</SelectItem>
                    <SelectItem value="100" className="text-[10px]">100 items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium">Auto Refresh</p>
                  <p className="text-[10px] text-muted-foreground">Automatically refresh data</p>
                </div>
                <Switch
                  checked={preferences.autoRefresh}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, autoRefresh: checked })}
                />
              </div>
            </div>
          </div>
          <Button onClick={handleSavePreferences} className="text-[10px] rounded-full h-8">
            <Save className="h-3 w-3 mr-1" />
            Save Preferences
          </Button>
        </CardContent>
      </Card> */}

      {/* Change Photo Modal */}
      <Dialog open={changePhotoOpen} onOpenChange={setChangePhotoOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[13px]">Change Profile Photo</DialogTitle>
            <DialogDescription className="text-[10px]">
              Upload a new profile photo. Maximum file size is 2MB.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                {previewUrl ? (
                  <AvatarImage src={previewUrl} alt="Preview" />
                ) : moderator && moderator.profile_picture ? (
                  <AvatarImage src={moderator.profile_picture} alt="Current" />
                ) : (
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                )}
              </Avatar>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px]">Select Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="h-8 text-[10px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              size="sm"
              className="text-[11px] rounded-full h-7"
              onClick={handlePhotoUpload}
              disabled={!selectedFile}
            >
              Upload Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-[400px] max-w-[400px] rounded-md">
          <DialogHeader>
            <DialogTitle className="text-[13px]">Change Password</DialogTitle>
            <DialogDescription className="text-[10px]">
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px]">Current Password</Label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="h-8 text-[10px] pr-8"
                  placeholder="Enter your current password"
                  style={{ fontSize: '10px' }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-8 w-8 p-0"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px]">New Password</Label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="h-8 text-[10px] pr-8"
                  placeholder="Enter your new password"
                  style={{ fontSize: '10px' }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-8 w-8 p-0"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px]">Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="h-8 text-[10px] pr-8"
                  placeholder="Confirm your new password"
                  style={{ fontSize: '10px' }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-8 w-8 p-0"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              size="sm"
              className="text-[11px] rounded-full h-7"
              onClick={handlePasswordChange}
              disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            >
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Security Settings Modal */}
      <Dialog open={securitySettingsOpen} onOpenChange={setSecuritySettingsOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[400px] rounded-md">
          <DialogHeader>
            <DialogTitle className="text-[13px]">Security Settings</DialogTitle>
            <DialogDescription className="text-[10px]">
              Configure your account security preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium">Two-Factor Authentication</p>
                <p className="text-[10px] text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })}
                className="scale-75"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium">Login Notifications</p>
                <p className="text-[10px] text-muted-foreground">Get notified of new logins</p>
              </div>
              <Switch
                checked={securitySettings.loginNotifications}
                onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, loginNotifications: checked })}
                className="scale-75"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[11px]">Session Timeout (minutes)</Label>
                <Select value={securitySettings.sessionTimeout} onValueChange={(value) => setSecuritySettings({ ...securitySettings, sessionTimeout: value })}>
                  <SelectTrigger className="h-8 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15" className="text-[10px]">15 minutes</SelectItem>
                    <SelectItem value="30" className="text-[10px]">30 minutes</SelectItem>
                    <SelectItem value="60" className="text-[10px]">1 hour</SelectItem>
                    <SelectItem value="120" className="text-[10px]">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px]">Password Expiry (days)</Label>
                <Select value={securitySettings.passwordExpiry} onValueChange={(value) => setSecuritySettings({ ...securitySettings, passwordExpiry: value })}>
                  <SelectTrigger className="h-8 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30" className="text-[10px]">30 days</SelectItem>
                    <SelectItem value="60" className="text-[10px]">60 days</SelectItem>
                    <SelectItem value="90" className="text-[10px]">90 days</SelectItem>
                    <SelectItem value="never" className="text-[10px]">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              size="sm"
              className="text-[10px] rounded-full h-7"
              onClick={() => {
                handleSaveSecurity();
                setSecuritySettingsOpen(false);
              }}
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModeratorProfileSettings;
