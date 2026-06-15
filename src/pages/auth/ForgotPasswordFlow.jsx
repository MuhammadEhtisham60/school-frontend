import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { GraduationCap, Eye, EyeOff, ArrowLeft, Mail, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormikText } from "@/components/common/sharedfields";
import { apiHandleToaster } from "@/components/common/tosater/apiHandleToaster";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useResetPasswordMutation,
} from "@/services/public/authService";

const STEPS = {
  REQUEST: "REQUEST",
  VERIFY: "VERIFY",
  RESET: "RESET",
};

const requestSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
});

const resetSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
});

function ForgotPasswordFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.REQUEST);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // API mutations
  const [forgotPassword, { isLoading: isRequesting }] = useForgotPasswordMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  // Timer for resend OTP cooldown
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Step 1: Submit Email
  const handleRequestOtp = async (values) => {
    try {
      await forgotPassword(values.email).unwrap();
      setEmail(values.email);
      apiHandleToaster.success("A 6-digit OTP verification code has been sent to your email.");
      setStep(STEPS.VERIFY);
      setCountdown(300); // 5-minute cooldown
    } catch (err) {
      apiHandleToaster.error(err, "Failed to send reset code. Please check your email.");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;

    try {
      await verifyOtp({ email, otp: otpCode }).unwrap();
      apiHandleToaster.success("OTP verified successfully! Please enter your new password.");
      setStep(STEPS.RESET);
    } catch (err) {
      apiHandleToaster.error(err, "Invalid or expired OTP verification code.");
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;

    try {
      await resendOtp(email).unwrap();
      apiHandleToaster.success("A new OTP reset code has been sent to your email.");
      setCountdown(300); // Reset countdown
    } catch (err) {
      apiHandleToaster.error(err, "Failed to resend code. Please try again later.");
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (values) => {
    try {
      await resetPassword({
        email,
        otp: otpCode,
        password: values.password,
        confirmPassword: values.confirmPassword,
      }).unwrap();

      apiHandleToaster.success("Password reset successful! Redirecting to login page...");
      navigate("/login");
    } catch (err) {
      apiHandleToaster.error(err, "Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative flex-col items-center justify-center p-12 text-primary-foreground overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-10 h-40 w-40 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm shadow-lg">
            <GraduationCap className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">EduPulse</h1>
          <p className="max-w-sm text-lg text-white/80 leading-relaxed">
            Modern school management platform — streamline admissions, attendance, exams and more.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6 text-center text-sm text-white/70">
            <div>
              <p className="text-2xl font-bold text-white">500+</p>
              <p>Schools</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">50k+</p>
              <p>Students</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p>Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">EduPulse</span>
          </div>

          {/* Form Header */}
          {step === STEPS.REQUEST && (
            <div className="space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Forgot Password</h2>
              <p className="text-sm text-muted-foreground">
                Enter your registered email address to receive a 6-digit OTP reset code.
              </p>
            </div>
          )}

          {step === STEPS.VERIFY && (
            <div className="space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Verify OTP Code</h2>
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit verification code to{" "}
                <span className="font-medium text-foreground">{email}</span>. The code is valid for
                5 minutes.
              </p>
            </div>
          )}

          {step === STEPS.RESET && (
            <div className="space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <KeyRound className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Reset Password</h2>
              <p className="text-sm text-muted-foreground">
                Create a new secure password for your account.
              </p>
            </div>
          )}

          {/* Form Content */}
          {step === STEPS.REQUEST && (
            <Formik
              initialValues={{ email: "" }}
              validationSchema={requestSchema}
              onSubmit={handleRequestOtp}
            >
              {() => (
                <Form className="space-y-5">
                  <FormikText
                    name="email"
                    label="Email address"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="h-11"
                  />

                  <Button
                    type="submit"
                    disabled={isRequesting}
                    className="w-full h-11 gradient-primary shadow-glow text-primary-foreground cursor-pointer"
                  >
                    {isRequesting ? "Sending reset code..." : "Send OTP Code"}
                  </Button>

                  <div className="flex items-center justify-center mt-2">
                    <Link
                      to="/login"
                      className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to sign in
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          {step === STEPS.VERIFY && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2 flex flex-col items-center justify-center">
                <label className="text-sm font-medium self-start">
                  Enter 6-Digit OTP <span className="text-destructive">*</span>
                </label>
                <div className="py-2">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={(value) => setOtpCode(value.replace(/\D/g, ""))}
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="h-12 w-12 text-lg font-bold" />
                      <InputOTPSlot index={1} className="h-12 w-12 text-lg font-bold" />
                      <InputOTPSlot index={2} className="h-12 w-12 text-lg font-bold" />
                      <InputOTPSlot index={3} className="h-12 w-12 text-lg font-bold" />
                      <InputOTPSlot index={4} className="h-12 w-12 text-lg font-bold" />
                      <InputOTPSlot index={5} className="h-12 w-12 text-lg font-bold" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isVerifying || otpCode.length !== 6}
                className="w-full h-11 gradient-primary shadow-glow text-primary-foreground cursor-pointer"
              >
                {isVerifying ? "Verifying code..." : "Verify OTP"}
              </Button>

              <div className="space-y-3 flex flex-col items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isResending}
                  className="w-full h-11 cursor-pointer transition-all duration-300"
                >
                  {isResending
                    ? "Resending..."
                    : countdown > 0
                      ? `Resend OTP in ${formatCountdown(countdown)}`
                      : "Resend OTP"}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep(STEPS.REQUEST)}
                  className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Try another email
                </button>
              </div>
            </form>
          )}

          {step === STEPS.RESET && (
            <Formik
              initialValues={{ password: "", confirmPassword: "" }}
              validationSchema={resetSchema}
              onSubmit={handleResetPassword}
            >
              {() => (
                <Form className="space-y-5">
                  <div className="relative">
                    <FormikText
                      name="password"
                      label="New Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <FormikText
                      name="confirmPassword"
                      label="Confirm New Password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={isResetting}
                    className="w-full h-11 gradient-primary shadow-glow text-primary-foreground cursor-pointer"
                  >
                    {isResetting ? "Updating password..." : "Reset Password"}
                  </Button>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordFlow;
