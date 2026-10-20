import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Eye, EyeOff, Sparkles, ShieldCheck, Briefcase, UserCheck } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";
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

  const performLogin = (role = "Super Admin", email = "admin@admin.com", name = "Admin User") => {
    dispatch(
      setCredentials({
        token: "demo-token-" + Date.now(),
        user: {
          id: "demo-" + role.toLowerCase().replace(/\s+/g, "-"),
          email,
          role,
          profile: {
            name,
          },
        },
      }),
    );
    apiHandleToaster.success(`Welcome back (${role})!`);
    navigate("/backoffice");
  };

  const handleSubmit = (values) => {
    const rawEmail = (values.email || "").toLowerCase();
    let role = "Super Admin";
    let name = "Admin User";

    if (rawEmail.includes("teacher")) {
      role = "Teacher";
      name = "Sara Mahmood (Teacher)";
    } else if (rawEmail.includes("accountant")) {
      role = "Accountant";
      name = "Saima Akhtar (Accountant)";
    } else if (values.email) {
      name = values.email.split("@")[0].replace(/[._]/g, " ");
      name = name.charAt(0).toUpperCase() + name.slice(1);
    }

    performLogin(role, values.email || "admin@admin.com", name);
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
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">EduPulse</span>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Client Demo Mode Active
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Instant login enabled — explore the platform with one click.
            </p>
          </div>

          {/* Quick One-Click Demo Login Button */}
          <Button
            type="button"
            onClick={() => performLogin("Super Admin", "admin@admin.com", "Admin User")}
            className="w-full h-12 text-base font-semibold gradient-hero shadow-glow text-white cursor-pointer hover:opacity-95 transition-all flex items-center justify-center gap-2 rounded-xl"
          >
            <Sparkles className="h-5 w-5" /> One-Click Demo Login
          </Button>

          {/* Role selector chips */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground text-center">
              Or sign in directly as a specific role:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => performLogin("Super Admin", "admin@admin.com", "Admin User")}
                className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/40 transition-colors text-xs font-medium text-center cursor-pointer shadow-sm"
              >
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Super Admin</span>
              </button>
              <button
                type="button"
                onClick={() => performLogin("Teacher", "teacher@admin.com", "Sara Mahmood")}
                className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/40 transition-colors text-xs font-medium text-center cursor-pointer shadow-sm"
              >
                <UserCheck className="h-4 w-4 text-emerald-500" />
                <span>Teacher</span>
              </button>
              <button
                type="button"
                onClick={() => performLogin("Accountant", "accountant@admin.com", "Saima Akhtar")}
                className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/40 transition-colors text-xs font-medium text-center cursor-pointer shadow-sm"
              >
                <Briefcase className="h-4 w-4 text-amber-500" />
                <span>Accountant</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <span className="relative bg-background px-3 text-xs uppercase text-muted-foreground font-medium">
              or enter credentials
            </span>
          </div>

          <Formik
            initialValues={{ email: "admin@admin.com", password: "admin123", remember: true }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="space-y-4">
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
                  className="w-full h-11 gradient-primary shadow-glow text-primary-foreground cursor-pointer"
                >
                  Sign in
                </Button>
              </Form>
            )}
          </Formik>

          <p className="text-center text-sm text-muted-foreground mt-3">
            Demo credentials: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">admin@admin.com</code> / <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
