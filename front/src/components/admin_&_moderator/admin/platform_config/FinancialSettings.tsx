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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const paymentSchema = z.object({
  stripePublicKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  paypalClientId: z.string().optional(),
  paypalClientSecret: z.string().optional(),
});

const FinancialSettings = () => {
  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      stripePublicKey: "",
      stripeSecretKey: "",
      paypalClientId: "",
      paypalClientSecret: "",
    },
  });

  const onPaymentSubmit = (data: z.infer<typeof paymentSchema>) => {
    toast.success("Payment settings updated successfully");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xs">Payment Gateways</CardTitle>
          <CardDescription className="text-[11px]">
            Configure payment processing services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
              <div className="space-y-4">
                {/* Stripe Section */}
                <div className="border-b pb-4">
                  <h3 className="text-xs font-semibold mb-2">Stripe</h3>
                  <div className="space-y-2">
                    <FormField
                      control={paymentForm.control}
                      name="stripePublicKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px]">Public Key</FormLabel>
                          <FormControl>
                            <Input className="text-[11px]" {...field} type="password" />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={paymentForm.control}
                      name="stripeSecretKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px]">Secret Key</FormLabel>
                          <FormControl>
                            <Input className="text-[11px]" {...field} type="password" />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* PayPal Section */}
                <div>
                  <h3 className="text-xs font-semibold mb-2">PayPal</h3>
                  <div className="space-y-2">
                    <FormField
                      control={paymentForm.control}
                      name="paypalClientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px]">Client ID</FormLabel>
                          <FormControl>
                            <Input className="text-[11px]" {...field} type="password" />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={paymentForm.control}
                      name="paypalClientSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px]">Client Secret</FormLabel>
                          <FormControl>
                            <Input className="text-[11px]" {...field} type="password" />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" size="sm" className="text-[11px] rounded-full h-8">
                Save Payment Settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSettings;
