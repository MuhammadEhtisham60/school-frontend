import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";
import { useSignupMutation } from "@/services/public/authService";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormikText, FormikCheckBox } from "@/components/common/sharedfields";
import { apiHandleToaster } from "@/components/common/tosater/apiHandleToaster";

const signupSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  schoolName: Yup.string().required("School name is required"),
  contact: Yup.string().required("Contact number is required"),
  academicSession: Yup.string().required("Academic session is required"),
  address: Yup.string().required("Address is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
  agreeTerms: Yup.boolean().oneOf([true], "You must accept the terms and conditions"),
});

function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [signup, { isLoading }] = useSignupMutation();

  const handleSubmit = async (values) => {
    try {
      const response = await signup({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        schoolName: values.schoolName,
        address: values.address,
        contact: values.contact,
        academicSession: values.academicSession,
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
      apiHandleToaster.success("Account created successfully!");
      navigate("/backoffice");
    } catch (err) {
      apiHandleToaster.error(err, "Registration failed. Please try again.");
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

      {/* Right - Registration Form */}
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
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Create your account
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started with EduPulse school management platform.
            </p>
          </div>

          <Formik
            initialValues={{
              firstName: "",
              lastName: "",
              email: "",
              schoolName: "",
              contact: "",
              academicSession: "",
              address: "",
              password: "",
              confirmPassword: "",
              agreeTerms: false,
            }}
            validationSchema={signupSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormikText
                    name="firstName"
                    label="First Name"
                    placeholder="John"
                    required
                    className="h-10"
                  />
                  <FormikText
                    name="lastName"
                    label="Last Name"
                    placeholder="Doe"
                    required
                    className="h-10"
                  />
                </div>

                <FormikText
                  name="email"
                  label="Email address"
                  type="email"
                  placeholder="john.doe@example.com"
                  required
                  className="h-10"
                />

                <FormikText
                  name="schoolName"
                  label="School Name"
                  placeholder="e.g. EduPulse Grammar School"
                  required
                  className="h-10"
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormikText
                    name="contact"
                    label="Contact Number"
                    placeholder="e.g. +92 300 1234567"
                    required
                    className="h-10"
                  />
                  <FormikText
                    name="academicSession"
                    label="Academic Session"
                    placeholder="e.g. 2026-27"
                    required
                    className="h-10"
                  />
                </div>

                <FormikText
                  name="address"
                  label="Address"
                  placeholder="e.g. 123 Main St, City"
                  required
                  className="h-10"
                />

                <div className="relative">
                  <FormikText
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="relative">
                  <FormikText
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <FormikCheckBox
                    name="agreeTerms"
                    label="I agree to the Terms of Service and Privacy Policy"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 gradient-primary shadow-glow text-primary-foreground cursor-pointer mt-2"
                >
                  {isLoading ? "Creating account..." : "Sign up"}
                </Button>
              </Form>
            )}
          </Formik>

          <p className="text-center text-sm text-muted-foreground mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
