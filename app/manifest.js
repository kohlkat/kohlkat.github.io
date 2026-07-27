export const dynamic = "force-static";

export default function manifest() {
  return {
    name: "SAGE Suite",
    short_name: "SAGE",
    description:
      "Manufacturing decision intelligence for reviewable CNC process planning, simulation-backed alternatives, evidence, and human approval.",
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
