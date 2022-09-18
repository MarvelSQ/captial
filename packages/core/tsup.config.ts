import { defineConfig } from "tsup";

export default defineConfig((options) => {
  return [
    {
      legacyOutput: true,
      format: ["cjs"],
      outDir: "lib",
    },
    {
      legacyOutput: true,
      dts: true,
      outDir: "types",
      format: [],
    },
    {
      legacyOutput: true,
      format: ["esm"],
      outDir: ".",
    },
  ];
});
