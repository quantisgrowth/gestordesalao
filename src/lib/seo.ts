export const pageHead = (title: string, description: string) => ({
  meta: [
    { title: `${title} · Gestor de Salão` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · Gestor de Salão` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
