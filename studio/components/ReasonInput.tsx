import { Badge, Card, Stack, Text } from "@sanity/ui";
import type { StringInputProps } from "sanity";

const reasonLabels: Record<string, string> = {
  "speaking-keynote": "Book Speaking & Keynote",
  "speaking-training": "Book EQ & Resilience Training",
  "speaking-workshop": "Book Guided Healing Workshop",
  "book-inquiry": "Book Inquiries",
  "bulk-orders": "Bulk Book Orders",
  "media-interview": "Media / Interview Request",
  partnership: "Partnership Request",
  other: "Other Request",
};

export function getReasonLabel(value: unknown) {
  if (typeof value !== "string" || !value) {
    return "No reason selected";
  }

  return reasonLabels[value] ?? value;
}

export function ReasonInput(props: StringInputProps) {
  const value = typeof props.value === "string" ? props.value : "";
  const label = getReasonLabel(value);

  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      <Card border radius={2} padding={3} tone="transparent">
        <Stack space={2}>
          <Text size={1} muted>
            Friendly reason label
          </Text>
          <div>
            <Badge tone={value ? "primary" : "default"}>{label}</Badge>
          </div>
          {value && value !== label ? (
            <Text size={1} muted>
              Stored key: {value}
            </Text>
          ) : null}
        </Stack>
      </Card>
    </Stack>
  );
}
