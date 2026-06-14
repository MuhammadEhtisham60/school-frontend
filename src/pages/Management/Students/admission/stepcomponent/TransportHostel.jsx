import { useFormikContext } from "formik";
import { Section } from "./Section";
import { FormikCheckBox, FormikSelect } from "@/components/common/sharedfields";

export function TransportHostel() {
  const { values } = useFormikContext();
  return (
    <Section title="Transport & Hostel" desc="Optional facilities">
      <FormikCheckBox
        name="transport"
        label="Transport Required"
        description="School bus pickup & drop"
        variant="switch"
        full
      />
      {values.transport && (
        <FormikSelect
          name="busRoute"
          label="Bus Route"
          placeholder="Select route"
          full
          options={[
            "Route A — North",
            "Route B — South",
            "Route C — East",
            "Route D — West",
          ]}
        />
      )}
      <FormikCheckBox
        name="hostel"
        label="Hostel Required"
        description="On-campus accommodation"
        variant="switch"
        full
      />
    </Section>
  );
}
