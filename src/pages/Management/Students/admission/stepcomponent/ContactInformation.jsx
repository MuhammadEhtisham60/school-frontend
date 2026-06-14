import { Section } from "./Section";
import { FormikText, FormikTextArea } from "@/components/common/sharedfields";

export function ContactInformation() {
  return (
    <Section title="Contact Information" desc="How can we reach the student?">
      <FormikText name="mobile" label="Mobile Number" placeholder="03XX-XXXXXXX" required />
      <FormikText name="altContact" label="Alternate Contact" placeholder="Optional" />
      <FormikText name="email" type="email" label="Email" placeholder="student@example.com" />
      <FormikText name="city" label="City" placeholder="Faisalabad" />
      <FormikTextArea
        name="address"
        label="Full Address"
        placeholder="House #, Street, Area"
        full
      />
    </Section>
  );
}
