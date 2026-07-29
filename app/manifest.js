export const dynamic = "force-static";

export default function manifest() {
  return {
    name: "SAGE Suite",
    short_name: "SAGE",
    description:
      "Compare difficult CNC process plans before machine time is committed, with simulation-backed alternatives, evidence, limits, and qualified human review.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8faf7",
    theme_color: "#071115",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
