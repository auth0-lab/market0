import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Auth0 AI | Market0",
    short_name: "Market0",
    description: "Market0 is a demo app that showcases secure auth patterns for GenAI apps",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
