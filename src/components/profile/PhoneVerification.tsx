import React, { useState } from "react";
import { Phone, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";

interface PhoneVerificationProps {
  phone?: string;
  isVerified: boolean;
  onVerified: () => void;
}

const DEMO_OTP = "123456";
const PHONE_VERIFIED_KEY = "medicgo_phone_verified";

export const getPhoneVerifiedStatus = (): boolean => {
  return localStorage.getItem(PHONE_VERIFIED_KEY) === "true";
};

export const setPhoneVerifiedStatus = (verified: boolean): void => {
  localStorage.setItem(PHONE_VERIFIED_KEY, verified ? "true" : "false");
};

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  phone,
  isVerified,
  onVerified,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [phoneNumber, setPhoneNumber] = useState(phone || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("0")) {
      return `+62${digits.slice(1)}`;
    }
    if (digits.startsWith("62")) {
      return `+${digits}`;
    }
    if (phone.startsWith("+")) {
      return phone;
    }
    return `+62${digits}`;
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      toast({
        title: "Nomor tidak valid",
        description: "Masukkan nomor telepon yang valid",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "OTP Terkirim (Demo)",
      description: `Gunakan kode: ${DEMO_OTP}`,
    });
    setStep("otp");
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Kode tidak valid",
        description: "Masukkan 6 digit kode OTP",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (otp === DEMO_OTP) {
      setStep("success");
      setPhoneVerifiedStatus(true);
      toast({
        title: "Verifikasi Berhasil",
        description: "Nomor telepon Anda telah diverifikasi",
      });

      setTimeout(() => {
        setIsOpen(false);
        onVerified();
      }, 1500);
    } else {
      toast({
        title: "Kode OTP Salah",
        description: `Gunakan kode demo: ${DEMO_OTP}`,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleResendOTP = async () => {
    setOtp("");
    await handleSendOTP();
  };

  const resetModal = () => {
    setStep("phone");
    setOtp("");
    setPhoneNumber(phone || "");
  };

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <ShieldCheck className="h-4 w-4" />
        <span>Terverifikasi</span>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          resetModal();
          setIsOpen(true);
        }}
        className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-600 dark:hover:bg-amber-950"
      >
        <Phone className="h-4 w-4" />
        Verifikasi
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Verifikasi Nomor Telepon
            </DialogTitle>
            <DialogDescription>
              {step === "phone" &&
                "Masukkan nomor telepon Anda untuk menerima kode OTP"}
              {step === "otp" &&
                "Masukkan kode 6 digit yang dikirim ke nomor Anda"}
              {step === "success" && "Nomor telepon berhasil diverifikasi!"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {step === "phone" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 bg-muted rounded-md border text-sm text-muted-foreground">
                      +62
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="81234567890"
                      value={phoneNumber
                        .replace(/^\+?62/, "")
                        .replace(/^0/, "")}
                      onChange={(e) =>
                        setPhoneNumber(e.target.value.replace(/\D/g, ""))
                      }
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mode demo - gunakan kode: <strong>{DEMO_OTP}</strong>
                  </p>
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleSendOTP}
                  disabled={loading || phoneNumber.length < 9}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4" />
                      Kirim Kode OTP (Demo)
                    </>
                  )}
                </Button>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Kode dikirim ke <strong>{formatPhone(phoneNumber)}</strong>
                  </p>

                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>

                  <p className="text-xs text-muted-foreground">
                    Kode demo: <strong>{DEMO_OTP}</strong>
                  </p>
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Verifikasi
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Kirim ulang kode
                </Button>
              </div>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-center text-muted-foreground">
                  Nomor telepon Anda telah berhasil diverifikasi
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
