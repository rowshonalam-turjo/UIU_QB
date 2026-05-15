import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UIU Question Bank — Every past paper. One archive." },
      { name: "description", content: "Community-curated archive of CT, Mid, Final, Assignment and Viva materials for United International University students. Search, preview and download instantly." },
      { property: "og:title", content: "UIU Question Bank" },
      { property: "og:description", content: "Every UIU past paper. One beautiful, searchable archive." },
    ],
  }),
  component: HomePage,
});
