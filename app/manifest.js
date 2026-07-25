export const dynamic = "force-static";

export default function manifest() {
  return {
    name: "SAGE Suite",
    short_name: "SAGE",
    description:
      "Manufacturing intelligence for reviewable CNC process plans, evidence-linked advice, fail-closed checks, and human decisions.",
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
