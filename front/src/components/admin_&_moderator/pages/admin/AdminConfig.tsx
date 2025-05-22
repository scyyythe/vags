import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfigToggle } from "@/components/admin_&_moderator/admin/ConfigToggle";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const configSchema = z.object({
  biddingTimeLimit: z.string().min(1, {
    message: "Value required",
  }),
  minBidIncrement: z.string().min(1, {
    message: "Value required",
  }),
  sellerCommissionRate: z.string().min(1, {
    message: "Value required",
  }),
});

const paymentSchema = z.object({
  stripePublicKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  paypalClientId: z.string().optional(),
  paypalClientSecret: z.string().optional(),
});

const AdminConfig = () => {
  const [platformConfig, setPlatformConfig] = useState({
    biddingEnabled: true,
    postingEnabled: true,
    registrationEnabled: true,
    exhibitionsEnabled: true,
  });

  const configForm = useForm<z.infer<typeof configSchema>>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      biddingTimeLimit: "48",
      minBidIncrement: "5",
      sellerCommissionRate: "10",
    },
  });

  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      stripePublicKey: "",
      stripeSecretKey: "",
      paypalClientId: "",
      paypalClientSecret: "",
    },
  });

  const onConfigSubmit = (data: z.infer<typeof configSchema>) => {
    console.log("Config form submitted:", data);
    toast.success("Platform configuration updated successfully");
  };

  const onPaymentSubmit = (data: z.infer<typeof paymentSchema>) => {
    console.log("Payment form submitted:", data);
    toast.success("Payment settings updated successfully");
  };

  const handleToggle = (setting: keyof typeof platformConfig, checked: boolean) => {
    setPlatformConfig({
      ...platformConfig,
      [setting]: checked,
    });
    toast.success(`${setting} ${checked ? "enabled" : "disabled"} successfully`);
  };

  const handleMaintenanceMode = () => {
    toast.success("Maintenance mode activated. Platform will be unavailable to users in 5 minutes.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Platform Configuration</h1>
        <p className="text-xs text-muted-foreground">
          Configure global platform settings and features
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-grid sm:grid-cols-3">
          <TabsTrigger value="general" className="text-xs">
            General Settings
          </TabsTrigger>
          <TabsTrigger value="financial" className="text-xs">
            Financial Settings
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="text-xs">
            Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Feature Controls</CardTitle>
              <CardDescription className="text-xs">
                Enable or disable platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <ConfigToggle
                  id="bidding"
                  label="Bidding"
                  description="Allow users to place bids on artworks"
                  defaultChecked={platformConfig.biddingEnabled}
                  onToggle={(checked) => handleToggle("biddingEnabled", checked)}
                />
                <ConfigToggle
                  id="posting"
                  label="Artwork Posting"
                  description="Allow users to post new artworks"
                  defaultChecked={platformConfig.postingEnabled}
                  onToggle={(checked) => handleToggle("postingEnabled", checked)}
                />
                <ConfigToggle
                  id="registration"
                  label="User Registration"
                  description="Allow new users to register on the platform"
                  defaultChecked={platformConfig.registrationEnabled}
                  onToggle={(checked) => handleToggle("registrationEnabled", checked)}
                />
                <ConfigToggle
                  id="exhibitions"
                  label="Exhibitions"
                  description="Allow creation and viewing of exhibitions"
                  defaultChecked={platformConfig.exhibitionsEnabled}
                  onToggle={(checked) => handleToggle("exhibitionsEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Default Rules</CardTitle>
              <CardDescription className="text-xs">
                Configure default platform-wide rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...configForm}>
                <form
                  onSubmit={configForm.handleSubmit(onConfigSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={configForm.control}
                    name="biddingTimeLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Bidding Time Limit (hours)</FormLabel>
                        <FormControl>
                          <Input className="text-xs" {...field} type="number" min="1" />
                        </FormControl>
                        <FormDescription className="text-2xs">
                          Default time period for auctions
                        </FormDescription>
                        <FormMessage className="text-2xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={configForm.control}
                    name="minBidIncrement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Minimum Bid Increment (%)</FormLabel>
                        <FormControl>
                          <Input className="text-xs" {...field} type="number" min="1" max="100" />
                        </FormControl>
                        <FormDescription className="text-2xs">
                          Minimum percentage increase for new bids
                        </FormDescription>
                        <FormMessage className="text-2xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={configForm.control}
                    name="sellerCommissionRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Seller Commission Rate (%)</FormLabel>
                        <FormControl>
                          <Input className="text-xs" {...field} type="number" min="0" max="100" />
                        </FormControl>
                        <FormDescription className="text-2xs">
                          Platform fee taken from sales
                        </FormDescription>
                        <FormMessage className="text-2xs" />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="sm" className="text-xs">
                    Save Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment Gateways</CardTitle>
              <CardDescription className="text-xs">
                Configure payment processing services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...paymentForm}>
                <form
                  onSubmit={paymentForm.handleSubmit(onPaymentSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h3 className="text-xs font-semibold mb-2">Stripe</h3>
                      <div className="space-y-2">
                        <FormField
                          control={paymentForm.control}
                          name="stripePublicKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Public Key</FormLabel>
                              <FormControl>
                                <Input className="text-xs" {...field} type="password" />
                              </FormControl>
                              <FormMessage className="text-2xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={paymentForm.control}
                          name="stripeSecretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Secret Key</FormLabel>
                              <FormControl>
                                <Input className="text-xs" {...field} type="password" />
                              </FormControl>
                              <FormMessage className="text-2xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold mb-2">PayPal</h3>
                      <div className="space-y-2">
                        <FormField
                          control={paymentForm.control}
                          name="paypalClientId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Client ID</FormLabel>
                              <FormControl>
                                <Input className="text-xs" {...field} type="password" />
                              </FormControl>
                              <FormMessage className="text-2xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={paymentForm.control}
                          name="paypalClientSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Client Secret</FormLabel>
                              <FormControl>
                                <Input className="text-xs" {...field} type="password" />
                              </FormControl>
                              <FormMessage className="text-2xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="sm" className="text-xs">
                    Save Payment Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">System Maintenance</CardTitle>
              <CardDescription className="text-xs">
                Manage system downtime and maintenance operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold">Maintenance Mode</h3>
                  <p className="text-2xs text-muted-foreground mb-2">
                    Put the platform in maintenance mode to prevent users from accessing it while
                    updates are performed.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs"
                    onClick={handleMaintenanceMode}
                  >
                    Enable Maintenance Mode
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-xs font-semibold">Database Backups</h3>
                  <p className="text-2xs text-muted-foreground mb-2">
                    Backup the entire platform database to secure your data.
                  </p>
                  <Button variant="outline" size="sm" className="text-xs mr-2">
                    Create Backup
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Restore Backup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminConfig;
