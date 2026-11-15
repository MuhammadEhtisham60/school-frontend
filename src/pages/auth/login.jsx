import { useNavigate, Link, useLocation, Navigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Eye, EyeOff, ShieldCheck, Loader2, Lock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, isTokenValid } from "@/store/slices/authSlice";
import { useLoginMutation } from "@/services/public/authService";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormikText, FormikCheckBox } from "@/components/common/sharedfields";
import { apiHandleToaster } from "@/components/common/tosater/apiHandleToaster";

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().required("Password is required"),
  remember: Yup.boolean(),
});

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();

  const from = location.state?.from?.pathname || "/backoffice";

  if (isAuthenticated && isTokenValid(token)) {
    return <Navigate to="/backoffice" replace />;
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await login({
        email: values.email.trim(),
        password: values.password,
      }).unwrap();

      dispatch(
        setCredentials({
          token: response.token,
          refreshToken: response.refreshToken,
          expiresAt: response.expiresAt,
          user: response.user,
        }),
      );

      const displayName =
        response?.user?.profile?.name ||
        `${response?.user?.firstName || ""} ${response?.user?.lastName || ""}`.trim() ||
        response?.user?.email;

      apiHandleToaster.success(`Welcome back, ${displayName}!`);
      navigate(from, { replace: true });
    } catch (err) {
      apiHandleToaster.error(err, "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative flex-col items-center justify-center p-12 text-primary-foreground overflow-hidden">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-10 h-40 w-40 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm shadow-lg">
            <GraduationCap className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">The Force School System</h1>
          <p className="max-w-sm text-lg text-white/80 leading-relaxed">
            Enterprise school management portal — secure JWT access for administration, academics, payroll, and student records.
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white/90">
            <ShieldCheck className="h-4 w-4" />
            <span>24-Hour Encrypted JWT Session Protection</span>
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">The Force School System</span>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Lock className="h-3.5 w-3.5" /> Authorized Access Only
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Sign in to your account</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your administrator credentials to access the management dashboard.
            </p>
          </div>

          <Formik
            initialValues={{ email: "", password: "", remember: true }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <FormikText
                  name="email"
                  label="Email address"
                  type="email"
                  placeholder="name@school.com"
                  required
                  className="h-11"
                />

                <div className="relative">
                  <FormikText
                    name="password"
                    label="Password"
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

                <div className="flex items-center justify-between">
                  <FormikCheckBox name="remember" label="Keep session active (24h)" />
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className="w-full h-11 gradient-primary shadow-glow text-primary-foreground cursor-pointer"
                >
                  {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading || isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
