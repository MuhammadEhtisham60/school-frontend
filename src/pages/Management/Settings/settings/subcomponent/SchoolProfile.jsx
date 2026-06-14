import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/services/private/profileService";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormikText } from "@/components/common/sharedfields";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";
import { apiHandleToaster } from "@/components/common/tosater/apiHandleToaster";

const profileSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  schoolName: Yup.string().required("School name is required"),
  contact: Yup.string().required("Contact number is required"),
  academicSession: Yup.string().required("Academic session is required"),
  address: Yup.string().required("Address is required"),
});

export function SchoolProfile() {
  const dispatch = useDispatch();
  const { data, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  if (isLoading) {
    return (
      <Card className="p-6 shadow-card">
        <h3 className="font-semibold text-lg mb-4">School Profile</h3>
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-10 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const profile = data || {};

  const initialValues = {
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    email: profile.email || "",
    schoolName: profile.schoolName || "",
    contact: profile.contact || "",
    academicSession: profile.academicSession || "",
    address: profile.address || "",
  };

  const handleSubmit = async (values) => {
    try {
      const response = await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        schoolName: values.schoolName,
        address: values.address,
        contact: values.contact,
        academicSession: values.academicSession,
      }).unwrap();

      const formattedUser = {
        ...response,
        role: response.role || "User",
        profile: {
          name:
            `${response.firstName || ""} ${response.lastName || ""}`.trim() ||
            response.email ||
            "User",
        },
      };

      dispatch(
        setCredentials({
          token: localStorage.getItem("token"),
          user: formattedUser,
        }),
      );
      apiHandleToaster.success("Profile updated successfully!");
    } catch (err) {
      apiHandleToaster.error(err, "Failed to update profile");
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <h3 className="font-semibold text-lg mb-4">School Profile</h3>
      <Formik
        initialValues={initialValues}
        validationSchema={profileSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {() => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormikText name="firstName" label="First Name" required />
              <FormikText name="lastName" label="Last Name" required />
            </div>

            <FormikText
              name="email"
              label="Email address"
              readOnly
              className="bg-muted/30 cursor-not-allowed"
            />

            <FormikText name="schoolName" label="School Name" required />

            <div className="grid grid-cols-2 gap-4">
              <FormikText name="contact" label="Contact Number" required />
              <FormikText name="academicSession" label="Academic Session" required />
            </div>

            <FormikText name="address" label="Address" required />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isUpdating}
                className="gradient-primary text-primary-foreground border-0 shadow-glow cursor-pointer"
              >
                {isUpdating ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
}
