import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { toast } from "sonner";
import { ConfigToggle } from "@/components/admin_&_moderator/admin/ConfigToggle";

const configSchema = z.object({
  biddingTimeLimit: z.string().min(1, { message: "Value required" }),
  minBidIncrement: z.string().min(1, { message: "Value required" }),
  sellerCommissionRate: z.string().min(1, { message: "Value required" }),
});

const GeneralSettings = () => {
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

  const onConfigSubmit = (data: z.infer<typeof configSchema>) => {
    toast.success("Platform configuration updated successfully");
  };

  const handleToggle = (setting: keyof typeof platformConfig, checked: boolean) => {
    setPlatformConfig({
      ...platformConfig,
      [setting]: checked,
    });
    toast.success(`${setting} ${checked ? "enabled" : "disabled"} successfully`, {
      closeButton: true,
    });
  };

  return (
    <div className="space-y-4">
      {/* Feature Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs">Feature Controls</CardTitle>
          <CardDescription className="text-[11px]">
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

      {/* Default Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs">Default Rules</CardTitle>
          <CardDescription className="text-[11px]">
            Configure default platform-wide rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...configForm}>
            <form onSubmit={configForm.handleSubmit(onConfigSubmit)} className="space-y-4">
              <FormField
                control={configForm.control}
                name="biddingTimeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px]">Bidding Time Limit (hours)</FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-full h-8 text-[10px]"
                        {...field}
                        type="number"
                        min="1"
                        style={{ fontSize: "11px" }}
                      />
                    </FormControl>
                    <FormDescription className="text-[11px]">
                      Default time period for auctions
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={configForm.control}
                name="minBidIncrement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px]">Minimum Bid Increment (%)</FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-full h-8 text-[10px]"
                        {...field}
                        type="number"
                        min="1"
                        max="100"
                        style={{ fontSize: "11px" }}
                      />
                    </FormControl>
                    <FormDescription className="text-[11px]">
                      Minimum percentage increase for new bids
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={configForm.control}
                name="sellerCommissionRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px]">Seller Commission Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-full h-8 text-[10px]"
                        {...field}
                        type="number"
                        min="0"
                        max="100"
                        style={{ fontSize: "11px" }}
                      />
                    </FormControl>
                    <FormDescription className="text-[11px]">
                      Platform fee taken from sales
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <Button type="submit" size="sm" className="text-[10px] h-7 rounded-full">
                Save Settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;
