import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import ramaniLogo from "@/assets/ramani-logo.png";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneDigits, setPhoneDigits] = useState<string[]>(Array(10).fill(""));
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(4).fill(""));
  const [notifyUpdates, setNotifyUpdates] = useState(false);
  const phoneInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const DUMMY_OTP = "1234";

  useEffect(() => {
    if (open && step === "phone") {
      setTimeout(() => phoneInputRefs.current[0]?.focus(), 100);
    }
  }, [open, step]);

  const handlePhoneDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newDigits = [...phoneDigits];
    newDigits[index] = value;
    setPhoneDigits(newDigits);

    if (value && index < 9) {
      phoneInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePhoneKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !phoneDigits[index] && index > 0) {
      phoneInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    if (value && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOtp = () => {
    const phone = phoneDigits.join("");
    if (phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a 10-digit mobile number",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "OTP Sent",
      description: `Verification code sent to +91 ${phone}`,
    });
    setStep("otp");
    setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
  };

  const loginMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, isOtpLogin: true }),
        credentials: "include"
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Login failed");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome!",
        description: data.message || "Login successful"
      });
      onOpenChange(false);
      resetForm();
      setLocation("/");
    },
    onError: (error: Error) => {
      if (error.message.includes("not found")) {
        registerMutation.mutate(phoneDigits.join(""));
      } else {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name: `User ${phone.slice(-4)}`,
          email: `${phone}@ramani.com`
        }),
        credentials: "include"
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Registration failed");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome to Ramani Fashion!",
        description: "Your account has been created successfully"
      });
      onOpenChange(false);
      resetForm();
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleVerifyOtp = () => {
    const otp = otpDigits.join("");
    
    if (otp !== DUMMY_OTP) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP",
        variant: "destructive"
      });
      return;
    }

    const phone = phoneDigits.join("");
    loginMutation.mutate(phone);
  };

  const resetForm = () => {
    setStep("phone");
    setPhoneDigits(Array(10).fill(""));
    setOtpDigits(Array(4).fill(""));
  };

  const handleEdit = () => {
    setStep("phone");
    setOtpDigits(Array(4).fill(""));
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[500px]">
          {/* Left Panel - Branding */}
          <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-pink-50 to-pink-100">
            <div className="max-w-sm space-y-6">
              <img 
                src={ramaniLogo} 
                alt="Ramani Fashion" 
                className="w-64 h-auto mx-auto"
                data-testid="img-ramani-logo"
              />
              <div className="space-y-3 text-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Welcome to Ramani Fashion
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Discover exquisite sarees and ethnic wear that blend tradition with contemporary elegance
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="flex flex-col p-8 lg:p-12 bg-white">
            {step === "phone" ? (
              <div className="flex-1 flex flex-col justify-center space-y-6">
                <div className="space-y-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900" data-testid="text-login-title">
                    Enter Mobile Number
                  </h1>
                  <p className="text-sm text-gray-500">
                    We'll send you a verification code
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-2 border-gray-200 rounded-lg px-4 py-3 focus-within:border-primary transition-colors">
                    <span className="text-lg">🇮🇳</span>
                    <span className="font-semibold text-sm text-gray-700">+91</span>
                    <div className="flex-1 flex gap-1.5">
                      {phoneDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (phoneInputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handlePhoneDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handlePhoneKeyDown(index, e)}
                          className="w-7 h-9 text-center text-base font-semibold border-b-2 border-gray-300 bg-transparent focus:outline-none focus:border-primary transition-colors"
                          data-testid={`input-phone-digit-${index}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="notify-updates"
                      checked={notifyUpdates}
                      onCheckedChange={(checked) => setNotifyUpdates(checked === true)}
                      data-testid="checkbox-notify-updates"
                    />
                    <label
                      htmlFor="notify-updates"
                      className="text-sm text-gray-600 cursor-pointer"
                    >
                      Notify me for any updates & offers
                    </label>
                  </div>

                  <Button
                    onClick={handleSendOtp}
                    disabled={phoneDigits.join("").length !== 10}
                    className="w-full rounded-lg h-12 text-base font-semibold bg-pink-500 hover:bg-pink-600"
                    data-testid="button-continue"
                  >
                    Continue
                  </Button>

                  <div className="space-y-2 text-center">
                    <p className="text-xs text-gray-500">
                      I accept that I have read & understood{" "}
                      <a href="#" className="text-primary hover:underline" data-testid="link-privacy-policy">
                        Privacy Policy
                      </a>
                      {" "}and{" "}
                      <a href="#" className="text-primary hover:underline" data-testid="link-terms">
                        T&Cs
                      </a>
                    </p>
                    <a 
                      href="#" 
                      className="text-sm text-primary hover:underline block" 
                      data-testid="link-trouble-login"
                    >
                      Trouble logging in?
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center space-y-6">
                <div className="space-y-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900" data-testid="text-otp-title">
                    OTP Verification
                  </h1>
                  <p className="text-sm text-gray-500">
                    We have sent verification code to
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">+91 {phoneDigits.join("")}</span>
                    <button
                      onClick={handleEdit}
                      className="text-primary text-sm hover:underline"
                      data-testid="button-edit-phone"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-center gap-3">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        data-testid={`input-otp-digit-${index}`}
                      />
                    ))}
                  </div>

                  <Button
                    onClick={handleVerifyOtp}
                    disabled={otpDigits.join("").length !== 4 || loginMutation.isPending || registerMutation.isPending}
                    className="w-full rounded-lg h-12 text-base font-semibold bg-pink-500 hover:bg-pink-600"
                    data-testid="button-verify-otp"
                  >
                    {loginMutation.isPending || registerMutation.isPending ? "Verifying..." : "Verify"}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    Test OTP: <span className="font-semibold">{DUMMY_OTP}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
