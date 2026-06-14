import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";
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
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (values) => {
    // Demo bypass logic
    if (values.email.trim() === "admin@admin.com" && values.password === "admin123") {
      dispatch(
        setCredentials({
          token: "demo-admin-token",
          user: {
            id: "demo-admin",
            email: "admin@admin.com",
            role: "Admin",
            profile: {
              name: "Admin User",
            },
          },
        }),
      );
      apiHandleToaster.success("Welcome back (Demo Admin)!");
      navigate("/backoffice");
      return;
    }

    try {
      const response = await login({
        email: values.email,
        password: values.password,
      }).unwrap();

      const formattedUser = {
        ...response.user,
        role: response.user?.role || "User",
        profile: {
          name:
            `${response.user?.firstName || ""} ${response.user?.lastName || ""}`.trim() ||
            response.user?.email ||
            "User",
        },
      };

      dispatch(
        setCredentials({
          token: response.token,
          user: formattedUser,
        }),
      );
      apiHandleToaster.success("Welcome back!");
      navigate("/backoffice");
    } catch (err) {
      apiHandleToaster.error(err, "Invalid email or password");
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

      {/* Right - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">EduPulse</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in with your registered account or use demo credentials.
            </p>
          </div>

          <Formik
            initialValues={{ email: "", password: "", remember: false }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="space-y-5">
                <FormikText
                  name="email"
                  label="Email address"
                  type="email"
                  placeholder="admin@admin.com"
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
                  <FormikCheckBox name="remember" label="Remember me for 30 days" />
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 gradient-primary shadow-glow text-primary-foreground cursor-pointer"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </Form>
            )}
          </Formik>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
