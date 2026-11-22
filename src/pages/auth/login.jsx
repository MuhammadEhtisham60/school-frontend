import { useNavigate, Link, useLocation, Navigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, isTokenValid } from "@/store/slices/authSlice";
import { useLoginMutation } from "@/services/public/authService";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormikText } from "@/components/common/sharedfields";
import { apiHandleToaster } from "@/components/common/tosater/apiHandleToaster";

const loginSchema = Yup.object().shape({
  email: Yup.string().trim().required("Roll number or email is required"),
  password: Yup.string().required("Password is required"),
  remember: Yup.boolean(),
});

const PORTAL_ROLES = [
  { id: "student", label: "Student", placeholder: "Enter your ID or email" },
  { id: "teacher", label: "Teacher", placeholder: "Enter your email" },
  { id: "parent", label: "Parent", placeholder: "Enter your email" },
  { id: "admin", label: "Admin", placeholder: "Enter admin email" },
];

function SchoolCrestIcon() {
  return (
    <svg width="36" height="40" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 2L33 7.5V19.5C33 28.8 26.6 35.8 18 38.5C9.4 35.8 3 28.8 3 19.5V7.5L18 2Z"
        fill="#FFFFFF"
        stroke="#F4B400"
        strokeWidth="2.5"
      />
      <path d="M10 13.5C12.8 13.5 15.5 14.3 18 15.8C20.5 14.3 23.2 13.5 26 13.5V25.5C23.2 25.5 20.5 26.2 18 27.6C15.5 26.2 12.8 25.5 10 25.5V13.5Z" fill="#16489D" />
      <path d="M18 15.8V27.6" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M18 8L19.5 11.2H16.5L18 8Z" fill="#F4B400" />
    </svg>
  );
}

function SchoolIllustration() {
  return (
    <svg
      viewBox="0 0 600 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-h-full h-auto select-none"
      preserveAspectRatio="xMidYMax meet"
    >
      {/* Clouds */}
      <path
        d="M52 72C42 72 34 65 34 56C34 48 40 41 48 40C53 31 63 26 74 28C86 24 100 32 103 44C110 46 115 52 115 59C115 67 108 72 99 72H52Z"
        fill="#FFFFFF"
      />
      <path
        d="M322 44C315 44 310 39 310 33C310 27 315 22 322 22C326 16 334 14 342 16C351 13 361 18 364 26C370 28 374 33 374 38C374 42 369 44 363 44H322Z"
        fill="#FFFFFF"
      />

      {/* Sun */}
      <circle cx="496" cy="56" r="42" fill="#FDE08D" />

      {/* Ground strip */}
      <rect x="0" y="246" width="600" height="34" fill="#BBD5EE" />

      {/* Left Wing */}
      <rect x="34" y="158" width="114" height="88" fill="#F4F8FD" stroke="#9CBCE0" strokeWidth="2" />
      <rect x="30" y="150" width="118" height="10" fill="#EBB400" />
      <rect x="58" y="182" width="22" height="28" rx="1" fill="#A6C8EB" />
      <rect x="100" y="182" width="22" height="28" rx="1" fill="#A6C8EB" />

      {/* Right Wing */}
      <rect x="452" y="158" width="114" height="88" fill="#F4F8FD" stroke="#9CBCE0" strokeWidth="2" />
      <rect x="452" y="150" width="118" height="10" fill="#EBB400" />
      <rect x="478" y="182" width="22" height="28" rx="1" fill="#A6C8EB" />
      <rect x="520" y="182" width="22" height="28" rx="1" fill="#A6C8EB" />

      {/* Flagpole */}
      <rect x="298" y="34" width="4" height="34" fill="#133A7C" />
      <path d="M302 35L332 42L302 49V35Z" fill="#16489D" />

      {/* Main Building */}
      <rect x="148" y="114" width="304" height="132" fill="#F8FBFF" stroke="#9CBCE0" strokeWidth="2" />

      {/* Roof Triangle */}
      <polygon points="136,114 300,66 464,114" fill="#FBE18D" stroke="#EBB400" strokeWidth="3" />

      {/* Clock */}
      <circle cx="300" cy="95" r="14" fill="#FFFFFF" stroke="#0D254B" strokeWidth="3" />
      <path d="M300 87V95L305 98" stroke="#0D254B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Columns */}
      <rect x="166" y="126" width="14" height="120" fill="#DFECFA" />
      <rect x="206" y="126" width="14" height="120" fill="#DFECFA" />
      <rect x="380" y="126" width="14" height="120" fill="#DFECFA" />
      <rect x="420" y="126" width="14" height="120" fill="#DFECFA" />

      {/* Upper Windows */}
      <rect x="242" y="138" width="26" height="30" rx="1" fill="#A6C8EB" />
      <rect x="332" y="138" width="26" height="30" rx="1" fill="#A6C8EB" />

      {/* Door */}
      <rect x="282" y="186" width="36" height="60" rx="3" fill="#16489D" />

      {/* Steps */}
      <rect x="262" y="244" width="76" height="6" fill="#DCE8F5" />
      <rect x="252" y="250" width="96" height="6" fill="#CEDEEF" />

      {/* Left Tree */}
      <rect x="14" y="218" width="8" height="34" fill="#9A7248" />
      <circle cx="18" cy="204" r="24" fill="#82C9B8" />

      {/* Right Tree */}
      <rect x="578" y="218" width="8" height="34" fill="#9A7248" />
      <circle cx="582" cy="204" r="24" fill="#82C9B8" />
    </svg>
  );
}

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState("student");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();

  const from = location.state?.from?.pathname || "/backoffice";

  if (isAuthenticated && isTokenValid(token)) {
    return <Navigate to="/backoffice" replace />;
  }

  const activePortal =
    PORTAL_ROLES.find((r) => r.id === selectedPortal) || PORTAL_ROLES[0];

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
        })
      );

      const displayName =
        response?.user?.profile?.name ||
        `${response?.user?.firstName || ""} ${response?.user?.lastName || ""}`.trim() ||
        response?.user?.email;

      apiHandleToaster.success(`Welcome back, ${displayName}!`);
      navigate(from, { replace: true });
    } catch (err) {
      apiHandleToaster.error(err, "Invalid roll number/email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-dvh w-full overflow-hidden flex flex-col lg:flex-row">
      {/* Left - Illustrated School Branding Panel */}
      <div className="hidden lg:flex lg:w-[54%] h-full bg-[#D7E8FA] relative flex-col justify-between overflow-hidden">
        <div className="px-12 pt-8 xl:pt-12 space-y-5 xl:space-y-8 z-10 shrink-0">
          {/* School Logo + Name */}
          <div className="flex items-center gap-3.5">
            <SchoolCrestIcon />
            <span className="text-lg xl:text-xl font-extrabold tracking-wide text-[#0D254B] uppercase">
              The Force School System
            </span>
          </div>

          {/* Headline & Subtitle */}
          <div className="max-w-lg space-y-2.5 xl:space-y-4">
            <h1 className="text-3xl xl:text-[42px] font-extrabold tracking-tight text-[#0D254B] leading-[1.12]">
              Learning, connected in one place.
            </h1>
            <p className="text-sm xl:text-base text-[#3D5578] leading-relaxed max-w-md">
              Access classes, results, attendance and announcements from any device.
            </p>
          </div>
        </div>

        {/* Bottom School Illustration */}
        <div className="w-full flex-1 min-h-0 flex items-end">
          <SchoolIllustration />
        </div>
      </div>

      {/* Right - Floating Login Card */}
      <div className="flex w-full lg:w-[46%] h-full items-center justify-center bg-[#F4F8FE] p-4 sm:p-8 overflow-hidden">
        <div className="w-full max-w-[400px] rounded-2xl bg-white p-6 sm:p-7 shadow-[0_12px_40px_-10px_rgba(15,40,85,0.12)] border border-[#E6EEF8]">
          {/* Mobile Header */}
          <div className="flex items-center gap-2.5 lg:hidden mb-6 pb-4 border-b border-[#EEF4FB]">
            <SchoolCrestIcon />
            <span className="text-base font-extrabold text-[#0D254B] uppercase">
              The Force School System
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-[#0D254B]">
              Welcome back
            </h2>
            <p className="text-sm text-[#5A6E8C]">Log in to your portal</p>
          </div>

          {/* Segmented Role Tabs */}
          <div className="mt-5 grid grid-cols-4 rounded-xl bg-[#EEF4FB] p-1 gap-1">
            {PORTAL_ROLES.map((role) => {
              const active = selectedPortal === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedPortal(role.id)}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    active
                      ? "bg-white text-[#16489D] shadow-sm"
                      : "text-[#5A6E8C] hover:text-[#0D254B]"
                  }`}
                >
                  {role.label}
                </button>
              );
            })}
          </div>

          <Formik
            initialValues={{ email: "", password: "", remember: true }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="mt-5 space-y-4">
                <FormikText
                  name="email"
                  label={
                    selectedPortal === "student" ? "Roll number or email" : "Email address"
                  }
                  type="text"
                  placeholder={activePortal.placeholder}
                  required
                  className="h-11 rounded-xl border-[#C8D6E8] bg-white text-[#0D254B] placeholder:text-[#8FA2BC]"
                />

                <div className="relative">
                  <FormikText
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    className="h-11 pr-10 rounded-xl border-[#C8D6E8] bg-white text-[#0D254B] placeholder:text-[#8FA2BC]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-[#7A8CA5] hover:text-[#0D254B] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-[#3D5578] cursor-pointer select-none">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={values.remember}
                      onClick={() => setFieldValue("remember", !values.remember)}
                      className={`h-4 w-4 rounded-[5px] border flex items-center justify-center transition-colors cursor-pointer ${
                        values.remember
                          ? "bg-[#16489D] border-[#16489D] text-white"
                          : "bg-white border-[#B4C5DA] hover:border-[#16489D]"
                      }`}
                    >
                      {values.remember && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>
                    <span>Keep me signed in</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#16489D] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className="w-full h-11 rounded-xl bg-[#16489D] hover:bg-[#123B82] text-white font-semibold shadow-sm cursor-pointer border-0"
                >
                  {(isLoading || isSubmitting) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading || isSubmitting ? "Logging in..." : "Log in"}
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
