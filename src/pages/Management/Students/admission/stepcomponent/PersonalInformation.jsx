import { Section } from "./Section";
import {
  FormikText,
  FormikDatePicker,
  FormikRadio,
  FormikFile,
  FormikCheckBox,
} from "@/components/common/sharedfields";

export function PersonalInformation() {
  return (
    <Section title="Basic Information" desc="Student's personal details">
      <FormikText name="fullName" label="Full Name" placeholder="e.g. Ali Khan" required />
      <FormikText name="fatherName" label="Father's Name" placeholder="e.g. Ahmed Khan" required />
      <FormikDatePicker name="dob" label="Date of Birth" required />
      <FormikRadio name="gender" label="Gender" required options={["Male", "Female", "Other"]} />
      <FormikText name="cnic" label="B-Form / CNIC" placeholder="12345-1234567-1" required />
      <FormikFile name="photo" label="Profile Photo" required />
      <FormikCheckBox
        name="is_active"
        label="Active Status"
        description="Toggle to activate or deactivate the student profile"
        variant="switch"
        required
        full
      />
    </Section>
  );
}
