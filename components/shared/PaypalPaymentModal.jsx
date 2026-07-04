import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getRequest } from "@/services/apiService";
import topLogo from "@/public/topLogo.png";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_SUBSCRIPTION_CLIENT_ID;
const PAYPAL_PLAN_ID = process.env.NEXT_PUBLIC_PAYPAL_SUBSCRIPTION_PLAN_ID;
const PAYPAL_CURRENCY = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY

const PaypalPaymentModal = ({ open, onOpenChange, onSuccess }) => {
  const [paypalLoading, setPaypalLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setPaypalLoading(true);

    const handleMessage = async (event) => {
      if (event.data?.type === "PAYPAL_SUBSCRIPTION_APPROVED") {
        toast.success("Subscription approved! Updating payment status...");
        try {
          let sessionUser = null;
          if (typeof window !== "undefined") {
            const storedUser = sessionStorage.getItem("user");
            if (storedUser) {
              sessionUser = JSON.parse(storedUser);
            }
          }

          await getRequest("/user/updatePlayerPaymentStatus", {
            payment_status: 1,
            id: sessionUser?.id,
            user_id: sessionUser?.user_id || sessionUser?.id,
          });

          if (sessionUser) {
            sessionUser.payment_status = 1;
            sessionStorage.setItem("user", JSON.stringify(sessionUser));
          }

          toast.success("Payment status updated successfully!");
          onOpenChange(false);

          if (onSuccess) {
            onSuccess();
          }
        } catch (apiErr) {
          console.error("API update error:", apiErr);
          toast.error("Failed to update payment status. Please contact support.");
        } finally {
          setPaypalLoading(false);
        }
      } else if (event.data?.type === "PAYPAL_SUBSCRIPTION_ERROR") {
        toast.error("PayPal Subscription payment failed or was cancelled.");
        console.error("PayPal integration error:", event.data.error);
        setPaypalLoading(false);
      } else if (event.data?.type === "PAYPAL_SUBSCRIPTION_RENDERED") {
        setPaypalLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [open, onOpenChange, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border text-foreground p-6 rounded-2xl max-w-md w-[95%]">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Image src={topLogo} alt="Logo" className="h-16 w-16 object-contain" />
          </div>

          <h3 className="text-xl font-bold text-foreground">
            Subscription Required
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed">
            To submit scores for this leaderboard, you need an active subscription.
          </p>

          <div className="bg-muted/50 w-full p-4 rounded-xl border border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Competition Access
            </p>
            <h4 className="text-base font-bold mt-1 text-foreground">
              SSP International competitions
            </h4>
            <p className="text-p3 text-muted-foreground mt-1">
              (£2 quarterly subscriptions)
            </p>
          </div>

          {paypalLoading && (
            <div className="flex items-center justify-center space-x-2 py-4">
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce delay-100" />
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce delay-200" />
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce delay-300" />
              <span className="text-xs text-muted-foreground">Loading PayPal...</span>
            </div>
          )}

          <div className="w-full pt-2">
            {open && (
              <iframe
                id="paypal-subscription-iframe"
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <style>
                        body {
                          margin: 0;
                          padding: 0 0 30px 0;
                          background: transparent;
                          display: flex;
                          justify-content: center;
                          align-items: flex-start;
                          min-height: 580px;
                          overflow:scroll;
                        }
                        div[id^="paypal-container-"] {
                          width: 100%;
                          max-width: 380px;
                          margin: 0 auto;
                          text-align: center;
                          padding-bottom: 20px;
                        }
                        div[id^="paypal-container-"] > * {
                          margin-left: auto !important;
                          margin-right: auto !important;
                          text-align: center;
                        }
                        div[id^="paypal-container-"] img {
                          max-width: 100% !important;
                          display: block !important;
                          margin: 0 auto 10px auto !important;
                        }
                      </style>
                    </head>
                    <body>
                      <div id="paypal-container-${PAYPAL_PLAN_ID}"></div>
                      
                      <script src="https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&components=hosted-buttons&disable-funding=venmo&currency=${PAYPAL_CURRENCY}"></script>
                      
                      <script>
                        if (window.paypal && window.paypal.HostedButtons) {
                          window.paypal.HostedButtons({
                            hostedButtonId: "${PAYPAL_PLAN_ID}",
                          }).render("#paypal-container-${PAYPAL_PLAN_ID}").then(function() {
                            window.parent.postMessage({ type: 'PAYPAL_SUBSCRIPTION_RENDERED' }, '*');
                          });
                        }
                      </script>
                    </body>
                  </html>
                `}
                className="w-full min-h-[550px] border-none bg-transparent"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaypalPaymentModal;
