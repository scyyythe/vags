import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Settings, 
  Shield, 
  Mail, 
  CreditCard, 
  BarChart, 
  Bell, 
  AlertTriangle, 
  Key,
  RefreshCcw
} from "lucide-react";
import { toast } from "sonner";

// Mock settings data
const mockSystemSettings = {
  general: {
    siteName: "Art Gallery",
    siteDescription: "A virtual gallery for artists and collectors",
    contactEmail: "admin@artgallery.com",
    supportEmail: "support@artgallery.com",
    featuredArtworksLimit: 10,
    defaultLanguage: "en",
    maintenanceMode: false,
    registrationOpen: true,
  },
  security: {
    twoFactorAuth: true,
    loginAttempts: 5,
    accountLockDuration: 30, // minutes
    passwordExpiryDays: 90,
    minPasswordLength: 12,
    requireSpecialChars: true,
    ipLogging: true,
    adminActivityLogging: true,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    notifyOnNewArtwork: true,
    notifyOnBids: true,
    notifyOnSales: true,
    notifyOnComments: true,
    notifyOnReports: true,
    dailyDigest: false,
    weeklyDigest: true,
  },
  payment: {
    platformFeePercentage: 10,
    minimumWithdrawalAmount: 50,
    paymentProcessor: "stripe",
    paymentCurrency: "USD",
    supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD"],
    autoPayoutThreshold: 200,
    autoPayoutEnabled: false,
  },
  backups: {
    autoBackup: true,
    backupFrequency: "daily",
    lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    retentionPeriod: 30, // days
    externalStorage: true,
    backupDatabase: true,
    backupMedia: true,
    backupConfigurations: true,
  }
};

const SystemSettings = () => {
  const [settings, setSettings] = useState(mockSystemSettings);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSaveSettings = (section: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`${section} settings saved successfully`);
    }, 1000);
  };

  const handleBackupNow = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSettings(prev => ({
        ...prev,
        backups: {
          ...prev.backups,
          lastBackup: new Date()
        }
      }));
      toast.success("Manual backup completed successfully");
    }, 2000);
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Configure basic settings for your gallery platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Gallery Name</Label>
                  <Input 
                    id="siteName" 
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting("general", "siteName", e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input 
                    id="contactEmail" 
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => updateSetting("general", "contactEmail", e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Gallery Description</Label>
                <Textarea 
                  id="siteDescription" 
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSetting("general", "siteDescription", e.target.value)} 
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input 
                    id="supportEmail" 
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => updateSetting("general", "supportEmail", e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="featuredArtworksLimit">Featured Artworks Limit</Label>
                  <Input 
                    id="featuredArtworksLimit" 
                    type="number"
                    value={settings.general.featuredArtworksLimit}
                    onChange={(e) => updateSetting("general", "featuredArtworksLimit", parseInt(e.target.value))} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <Select 
                    value={settings.general.defaultLanguage}
                    onValueChange={(value) => updateSetting("general", "defaultLanguage", value)}
                  >
                    <SelectTrigger id="defaultLanguage">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Maintenance Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Put the gallery into maintenance mode
                    </p>
                  </div>
                  <Switch 
                    checked={settings.general.maintenanceMode}
                    onCheckedChange={(checked) => updateSetting("general", "maintenanceMode", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Open Registration</h4>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register
                    </p>
                  </div>
                  <Switch 
                    checked={settings.general.registrationOpen}
                    onCheckedChange={(checked) => updateSetting("general", "registrationOpen", checked)}
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings("General")} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save General Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all admin accounts
                    </p>
                  </div>
                  <Switch 
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) => updateSetting("security", "twoFactorAuth", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Admin Activity Logging</h4>
                    <p className="text-sm text-muted-foreground">
                      Log all admin actions for audit
                    </p>
                  </div>
                  <Switch 
                    checked={settings.security.adminActivityLogging}
                    onCheckedChange={(checked) => updateSetting("security", "adminActivityLogging", checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                  <Input 
                    id="loginAttempts" 
                    type="number"
                    value={settings.security.loginAttempts}
                    onChange={(e) => updateSetting("security", "loginAttempts", parseInt(e.target.value))} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountLockDuration">Account Lock Duration (minutes)</Label>
                  <Input 
                    id="accountLockDuration" 
                    type="number"
                    value={settings.security.accountLockDuration}
                    onChange={(e) => updateSetting("security", "accountLockDuration", parseInt(e.target.value))} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="passwordExpiryDays">Password Expiry (days)</Label>
                  <Input 
                    id="passwordExpiryDays" 
                    type="number"
                    value={settings.security.passwordExpiryDays}
                    onChange={(e) => updateSetting("security", "passwordExpiryDays", parseInt(e.target.value))} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minPasswordLength">Minimum Password Length</Label>
                  <Input 
                    id="minPasswordLength" 
                    type="number"
                    value={settings.security.minPasswordLength}
                    onChange={(e) => updateSetting("security", "minPasswordLength", parseInt(e.target.value))} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Require Special Characters</h4>
                    <p className="text-sm text-muted-foreground">
                      Password must contain special characters
                    </p>
                  </div>
                  <Switch 
                    checked={settings.security.requireSpecialChars}
                    onCheckedChange={(checked) => updateSetting("security", "requireSpecialChars", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">IP Logging</h4>
                    <p className="text-sm text-muted-foreground">
                      Log IP addresses for security monitoring
                    </p>
                  </div>
                  <Switch 
                    checked={settings.security.ipLogging}
                    onCheckedChange={(checked) => updateSetting("security", "ipLogging", checked)}
                  />
                </div>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Security Best Practices</AlertTitle>
                <AlertDescription>
                  Regularly rotate admin passwords and review security logs. Enable 2FA for all administrator accounts.
                </AlertDescription>
              </Alert>
              
              <Button onClick={() => handleSaveSettings("Security")} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Security Settings"}
              </Button>
              
              <div className="pt-4">
                <Button variant="outline" className="gap-1">
                  <Key className="h-4 w-4" />
                  <span>Manage API Keys</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system and user notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications to users
                    </p>
                  </div>
                  <Switch 
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateSetting("notifications", "emailNotifications", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Send browser push notifications
                    </p>
                  </div>
                  <Switch 
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => updateSetting("notifications", "pushNotifications", checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">New Artwork Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Notify when new artwork is added
                    </p>
                  </div>
                  <Switch 
                    checked={settings.notifications.notifyOnNewArtwork}
                    onCheckedChange={(checked) => updateSetting("notifications", "notifyOnNewArtwork", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Bid Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Notify on new bids
                    </p>
                  </div>
                  <Switch 
                    checked={settings.notifications.notifyOnBids}
                    onCheckedChange={(checked) => updateSetting("notifications", "notifyOnBids", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Sales Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Notify on completed sales
                    </p>
                  </div>
                  <Switch 
                    checked={settings.notifications.notifyOnSales}
                    onCheckedChange={(checked) => updateSetting("notifications", "notifyOnSales", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Comment Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Notify on new comments
                    </p>
                  </div>
                  <Switch 
                    checked={settings.notifications.notifyOnComments}
                    onCheckedChange={(checked) => updateSetting("notifications", "notifyOnComments", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Report Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Notify admins on new reports
                    </p>
                  </div>
                  <Switch 
                    checked={settings.notifications.notifyOnReports}
                    onCheckedChange={(checked) => updateSetting("notifications", "notifyOnReports", checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Daily Digest</h4>
                    <p className="text-sm text-muted-foreground">
                      Send daily summary email to admins
                    </p>
                  </div>
                  <Switch 
                    checked={settings.notifications.dailyDigest}
                    onCheckedChange={(checked) => updateSetting("notifications", "dailyDigest", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Weekly Digest</h4>
                    <p className="text-sm text-muted-foreground">
                      Send weekly summary email to admins
                    </p>
                  </div>
                  <Switch 
                    checked={settings.notifications.weeklyDigest}
                    onCheckedChange={(checked) => updateSetting("notifications", "weeklyDigest", checked)}
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings("Notification")} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Notification Settings"}
              </Button>
              
              <div className="pt-4">
                <Button variant="outline" className="gap-1">
                  <Mail className="h-4 w-4" />
                  <span>Test Notification</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Settings
              </CardTitle>
              <CardDescription>Configure payment and transaction settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platformFee">Platform Fee (%)</Label>
                  <Input 
                    id="platformFee" 
                    type="number"
                    value={settings.payment.platformFeePercentage}
                    onChange={(e) => updateSetting("payment", "platformFeePercentage", parseInt(e.target.value))} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minimumWithdrawal">Minimum Withdrawal Amount</Label>
                  <Input 
                    id="minimumWithdrawal" 
                    type="number"
                    value={settings.payment.minimumWithdrawalAmount}
                    onChange={(e) => updateSetting("payment", "minimumWithdrawalAmount", parseInt(e.target.value))} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="paymentProcessor">Payment Processor</Label>
                  <Select 
                    value={settings.payment.paymentProcessor}
                    onValueChange={(value) => updateSetting("payment", "paymentProcessor", value)}
                  >
                    <SelectTrigger id="paymentProcessor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentCurrency">Default Currency</Label>
                  <Select 
                    value={settings.payment.paymentCurrency}
                    onValueChange={(value) => updateSetting("payment", "paymentCurrency", value)}
                  >
                    <SelectTrigger id="paymentCurrency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                      <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
                      <SelectItem value="AUD">Australian Dollar (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="autoPayoutThreshold">Auto Payout Threshold</Label>
                  <Input 
                    id="autoPayoutThreshold" 
                    type="number"
                    value={settings.payment.autoPayoutThreshold}
                    onChange={(e) => updateSetting("payment", "autoPayoutThreshold", parseInt(e.target.value))} 
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4 pt-8">
                  <div>
                    <h4 className="font-medium">Auto Payout Enabled</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically pay artists when threshold is reached
                    </p>
                  </div>
                  <Switch 
                    checked={settings.payment.autoPayoutEnabled}
                    onCheckedChange={(checked) => updateSetting("payment", "autoPayoutEnabled", checked)}
                  />
                </div>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Payment Integration Required</AlertTitle>
                <AlertDescription>
                  You need to connect your Stripe or PayPal account in the integrations section for payments to function.
                </AlertDescription>
              </Alert>
              
              <Button onClick={() => handleSaveSettings("Payment")} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Payment Settings"}
              </Button>
              
              <div className="pt-4">
                <Button variant="outline" className="gap-1">
                  <CreditCard className="h-4 w-4" />
                  <span>Configure Payment Integrations</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Backup Settings */}
        <TabsContent value="backups">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCcw className="h-5 w-5" />
                Backup & Recovery
              </CardTitle>
              <CardDescription>Configure backup and data retention settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Last Backup</h3>
                  <p className="text-sm text-muted-foreground">
                    {settings.backups.lastBackup.toLocaleString()}
                  </p>
                </div>
                <Button onClick={handleBackupNow} disabled={isLoading}>
                  {isLoading ? "Backing up..." : "Backup Now"}
                </Button>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Automatic Backups</h4>
                    <p className="text-sm text-muted-foreground">
                      Create backups on a schedule
                    </p>
                  </div>
                  <Switch 
                    checked={settings.backups.autoBackup}
                    onCheckedChange={(checked) => updateSetting("backups", "autoBackup", checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select 
                    value={settings.backups.backupFrequency}
                    onValueChange={(value) => updateSetting("backups", "backupFrequency", value)}
                  >
                    <SelectTrigger id="backupFrequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="retentionPeriod">Retention Period (days)</Label>
                  <Input 
                    id="retentionPeriod" 
                    type="number"
                    value={settings.backups.retentionPeriod}
                    onChange={(e) => updateSetting("backups", "retentionPeriod", parseInt(e.target.value))} 
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4 pt-8">
                  <div>
                    <h4 className="font-medium">External Storage</h4>
                    <p className="text-sm text-muted-foreground">
                      Store backups in external location
                    </p>
                  </div>
                  <Switch 
                    checked={settings.backups.externalStorage}
                    onCheckedChange={(checked) => updateSetting("backups", "externalStorage", checked)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Database</h4>
                    <p className="text-sm text-muted-foreground">
                      Backup database
                    </p>
                  </div>
                  <Switch 
                    checked={settings.backups.backupDatabase}
                    onCheckedChange={(checked) => updateSetting("backups", "backupDatabase", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Media Files</h4>
                    <p className="text-sm text-muted-foreground">
                      Backup uploaded media
                    </p>
                  </div>
                  <Switch 
                    checked={settings.backups.backupMedia}
                    onCheckedChange={(checked) => updateSetting("backups", "backupMedia", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h4 className="font-medium">Configurations</h4>
                    <p className="text-sm text-muted-foreground">
                      Backup system settings
                    </p>
                  </div>
                  <Switch 
                    checked={settings.backups.backupConfigurations}
                    onCheckedChange={(checked) => updateSetting("backups", "backupConfigurations", checked)}
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings("Backup")} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Backup Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
