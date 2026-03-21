import { Divider, Select, Stack, Text } from "@mantine/core";
import { useForm } from "react-hook-form";
import IssuerManager from "./IssuerManager";
import ClientManager from "./ClientManager";
import { useIssuers } from "../hooks/useIssuers";

type SettingsFormValues = {
  issuerId: string;
};

export default function SettingsRegistry() {
  const { issuers } = useIssuers();
  const { watch, setValue } = useForm<SettingsFormValues>({
    defaultValues: { issuerId: "" },
  });

  const issuerId = watch("issuerId");
  const selectedIssuer = issuers.find((issuer) => issuer.id === issuerId) ?? null;
  const issuerOptions = issuers.map((issuer) => ({ value: issuer.id, label: issuer.name }));

  return (
    <Stack gap="md">
      <Text fw={600}>Issuer & Client Registry</Text>
      <IssuerManager />
      <Divider />
      <Select
        label="Select issuer for client registration"
        placeholder="Select issuer"
        data={issuerOptions}
        value={issuerId || null}
        onChange={(value) => setValue("issuerId", value || "")}
        searchable
        clearable
      />
      <ClientManager issuer={selectedIssuer} />
    </Stack>
  );
}
