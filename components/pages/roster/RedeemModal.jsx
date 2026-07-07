import React from "react";
import { toast } from "react-toastify";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

const REDEEM_OPTIONS = [
    { discountPercent: 20, tokenCost: 20 }
];

const MIN_TOKENS_TO_REDEEM = Math.min(...REDEEM_OPTIONS.map((option) => option.tokenCost));

const RedeemModal = ({ open, onClose, player, data, loading, onRedeemSuccess }) => {
    // Steps: "history" | "select" | "confirm" | "success"
    const [step, setStep] = React.useState("history");
    const [isRedeeming, setIsRedeeming] = React.useState(false);
    const [couponCode, setCouponCode] = React.useState("");
    const [copied, setCopied] = React.useState(false);
    const [selectedOption, setSelectedOption] = React.useState(null);

    const availableTokens = Number(data?.availableTokens) || 0;
    const availableRedeemOptions = REDEEM_OPTIONS.filter(
        (option) => availableTokens >= option.tokenCost
    );

    React.useEffect(() => {
        if (!open) {
            setStep("history");
            setIsRedeeming(false);
            setCouponCode("");
            setCopied(false);
            setSelectedOption(null);
        }
    }, [open]);

    if (!open) return null;

    const handleRedeemClick = () => {
        if (availableTokens < MIN_TOKENS_TO_REDEEM) {
            toast.error(`You need at least ${MIN_TOKENS_TO_REDEEM} tokens to redeem.`, {
                toastId: "insufficient_tokens"
            });
            return;
        }

        setSelectedOption(availableRedeemOptions[0] || null);
        setStep("select");
    };

    const handleNextFromSelection = () => {
        if (!selectedOption) {
            toast.error("Please select a discount option to continue.", {
                toastId: "select_discount_option"
            });
            return;
        }

        setStep("confirm");
    };

    const confirmRedeem = async () => {
        if (!selectedOption) {
            toast.error("Please select a discount option to continue.", {
                toastId: "missing_discount_option"
            });
            setStep("select");
            return;
        }

        setIsRedeeming(true);
        try {
            const admin = JSON.parse(sessionStorage.getItem("adminDetails") || "{}");
            const res = await getRequest(API_ENDPOINTS.REDEEM_TOKENS, {
                user_id: player?.name,
                admin_id: admin?.id,
                discount_percent: selectedOption.discountPercent
            });

            if (res.status === true || res.status === "success") {
                toast.success("Tokens successfully redeemed!", {
                    toastId: "redeem_success"
                });

                const code =
                    res.coupon_code ||
                    res.coupon ||
                    res.code ||
                    (res.data && (res.data.coupon_code || res.data.coupon || res.data.code)) ||
                    `SSP-DISCOUNT-${selectedOption.discountPercent}`;

                setCouponCode(code);
                setStep("success");

                if (onRedeemSuccess) {
                    onRedeemSuccess();
                }
            } else {
                toast.error(res.message || "Failed to redeem tokens.", {
                    toastId: "redeem_fail"
                });
            }
        } catch (err) {
            console.error("Redemption error:", err);
            toast.error("An error occurred during redemption. Please try again.", {
                toastId: "redeem_error"
            });
        } finally {
            setIsRedeeming(false);
        }
    };

    const handleCopy = () => {
        if (!couponCode) return;

        navigator.clipboard.writeText(couponCode);
        setCopied(true);
        toast.success("Coupon code copied to clipboard!", {
            toastId: "copied_success"
        });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCloseSuccess = () => {
        setStep("history");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center px-3">
            <div className="w-full max-w-md bg-card text-card-foreground rounded-xl border border-border shadow-xl overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 border-b border-border">
                    <h2 className="text-lg font-bold text-primary">
                        {step === "select" && "Select Redemption"}
                        {step === "confirm" && "Confirm Redemption"}
                        {step === "success" && "Redemption Successful"}
                        {step === "history" && "Redeem Tokens"}
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl cursor-pointer">
                        x
                    </button>
                </div>

                {step === "select" && (
                    <div className="p-6 space-y-5">
                        <div className="text-sm text-muted-foreground">
                            Continue to make your purchase with {selectedOption.discountPercent}% discount
                        </div>

                        <div className="text-sm text-muted-foreground">
                            20 Tokens will be automatically deducted. This is irreversible.
                        </div>

                        <div className="space-y-3">
                            {availableRedeemOptions.map((option) => {
                                const isSelected =
                                    selectedOption?.discountPercent === option.discountPercent;

                                return (
                                    <button
                                        key={option.discountPercent}
                                        type="button"
                                        onClick={() => setSelectedOption(option)}
                                        className={`w-full rounded-lg border px-4 py-3 text-left transition-colors cursor-pointer ${
                                            isSelected
                                                ? "border-primary bg-primary/10"
                                                : "border-border hover:border-primary/50 hover:bg-muted"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-primary">
                                                {option.discountPercent}% Discount
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {option.tokenCost} Tokens
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setStep("history")}
                                className="px-4 py-1.5 border border-border text-foreground rounded hover:bg-muted transition-colors text-xs font-semibold cursor-pointer"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNextFromSelection}
                                className="px-4 py-1.5 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors text-xs cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {step === "confirm" && (
                    <div className="p-6 space-y-6">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Are you sure you want to redeem tokens for a{" "}
                            <span className="text-primary font-bold">
                                {selectedOption?.discountPercent}% discount
                            </span>
                            ?
                            <br />
                            <br />
                            <span className="text-primary font-bold">
                                {selectedOption?.tokenCost} tokens
                            </span>{" "}
                            will be deducted from your available balance of{" "}
                            <span className="text-primary font-bold">{availableTokens}</span>.
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                disabled={isRedeeming}
                                onClick={() => setStep("select")}
                                className="px-4 py-1.5 border border-border text-foreground rounded hover:bg-muted transition-colors text-xs font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isRedeeming}
                                onClick={confirmRedeem}
                                className="px-4 py-1.5 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors text-xs cursor-pointer"
                            >
                                {isRedeeming ? "Redeeming..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                )}

                {step === "success" && (
                    <div className="p-6 space-y-6 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2 border border-green-500/20">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-green-600 dark:text-green-400">Coupon Generated!</h3>
                            <p className="text-xs text-muted-foreground">
                                Your {selectedOption?.discountPercent}% discount coupon code has been successfully generated. Copy this code to redeem your discount.
                            </p>
                        </div>

                        <div className="bg-muted/50 border border-border rounded-xl p-4 flex flex-col items-center justify-center gap-3 relative overflow-hidden shadow-inner">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Your Coupon Code</span>
                            <span className="text-2xl font-mono font-black text-primary tracking-widest uppercase select-all">
                                {couponCode}
                            </span>
                            <button
                                onClick={handleCopy}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    copied
                                        ? "bg-green-600 text-white"
                                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                        Copy Code
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex justify-center gap-3 pt-2">
                            <button
                                onClick={handleCloseSuccess}
                                className="px-5 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors text-xs cursor-pointer shadow-lg shadow-primary/20"
                            >
                                Done & Close
                            </button>
                        </div>
                    </div>
                )}

                {step === "history" && (
                    <>
                        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                            <div className="border border-border p-3 text-sm bg-muted/30 rounded-lg">
                                <p className="font-bold mb-2 text-primary">Discounts offered by SPONSOR</p>

                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-end">
                                        <span className="text-primary font-semibold">Discount</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>20 Tokens</span>
                                        <span>20%</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="font-bold text-base mb-3 text-primary">{player?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    Total Tokens Earned <span className="text-primary font-semibold">{player?.total_token ?? 0}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Total Tokens Redeemed <span className="text-primary font-semibold">{data?.redeemedTokens}</span>
                                </p>
                            </div>

                            <div className="text-sm text-foreground">
                                View Store Price to redeem (no discount) -
                                <span
                                    onClick={handleRedeemClick}
                                    className="text-primary underline cursor-pointer hover:text-primary/80"
                                >
                                     {" "}Click here
                                </span>
                            </div>

                            <div className="text-sm text-foreground">
                                You have:{" "}
                                <span className="text-primary font-bold">{availableTokens}</span>{" "}
                                Tokens to{" "}
                                <span
                                    onClick={handleRedeemClick}
                                    className="text-primary underline cursor-pointer hover:text-primary/80"
                                >
                                    Redeem for 20% Discount
                                </span>
                            </div>

                            {data?.coupons && data.coupons.length > 0 && (
                                <div>
                                    <p className="font-bold border-t border-border pt-3 mb-2 text-primary">
                                        YOUR COUPONS
                                    </p>
                                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1 mb-4">
                                        {data.coupons.map((coupon, idx) => (
                                            <div
                                                key={coupon.id || idx}
                                                className="flex items-center justify-between border border-primary/20 bg-primary/5 rounded-lg p-2 text-xs"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-primary select-all tracking-wider">
                                                            {coupon.coupon_code}
                                                        </span>
                                                        <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1 py-0.5 rounded uppercase font-bold">
                                                            {coupon.discount_percent}% OFF
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Expires: <span className="text-foreground/80 font-medium">{coupon.expiry_date}</span>
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(coupon.coupon_code);
                                                        toast.success(`Coupon ${coupon.coupon_code} copied!`, {
                                                            toastId: `copy_coupon_${coupon.coupon_code}`
                                                        });
                                                    }}
                                                    className="px-2.5 py-1 bg-primary text-primary-foreground font-bold rounded text-[10px] hover:bg-primary/90 transition-colors cursor-pointer"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="font-bold border-t border-border pt-3 mb-2 text-primary uppercase">
                                    Tokens HISTORY
                                </p>

                                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                                    {loading ? (
                                        <p className="text-center text-sm text-muted-foreground">Loading...</p>
                                    ) : data && data?.history?.length === 0 ? (
                                        <p className="text-center text-sm text-muted-foreground">
                                            No history found
                                        </p>
                                    ) : (
                                        data &&
                                        data?.history?.map((item, index) => (
                                            <div
                                                key={index}
                                                className="text-xs border-b border-border pb-2"
                                            >
                                                <div className="flex justify-between">
                                                    <div>
                                                        <span className="text-primary font-bold pr-5">
                                                            {index + 1}
                                                        </span>
                                                        <span className="text-foreground">{item.date}</span>
                                                    </div>

                                                    <span className="text-muted-foreground">totals 1</span>
                                                </div>
                                                <div className="text-muted-foreground">{item.ladder_name}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-3 border-t border-border flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-1 bg-primary text-primary-foreground font-semibold rounded hover:bg-primary/90 transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RedeemModal;