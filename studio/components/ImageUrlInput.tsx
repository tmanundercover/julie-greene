import { Box, Card, Stack, Text } from "@sanity/ui";
import type { StringInputProps } from "sanity";

export function ImageUrlInput(props: StringInputProps) {
  const value = typeof props.value === "string" ? props.value.trim() : "";

  return (
    <Stack space={3}>
      {props.renderDefault(props)}

      {value ? (
        <Card border radius={2} padding={3} tone="transparent">
          <Stack space={3}>
            <Text size={1} muted>
              URL preview
            </Text>
            <Box
              style={{
                background: "var(--card-muted-bg-color)",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <img
                alt="Preview from URL"
                src={value}
                style={{
                  display: "block",
                  maxHeight: 260,
                  objectFit: "contain",
                  width: "100%",
                }}
              />
            </Box>
          </Stack>
        </Card>
      ) : null}
    </Stack>
  );
}
