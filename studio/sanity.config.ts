import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "rrguet8j";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineConfig({
  name: "transform-hw-studio",
  title: "Transformative Healing & Wellness",
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
