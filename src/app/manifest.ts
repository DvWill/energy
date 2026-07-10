import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Energy",
    short_name: "Energy",
    description: "Apresentação institucional Energy",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#f95f1b",
  };
}
