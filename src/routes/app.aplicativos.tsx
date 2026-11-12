import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { AppShowcase } from "@/components/previews/AppShowcase";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/app/aplicativos")({
  head: () => pageHead("Aplicativos", "Prévias do cliente e do gestor dentro da web."),
  component: Aplicativos,
});
function Aplicativos() {
  return (
    <>
      <PageHeader
        title="Aplicativos"
        description="Experimente a navegação do cliente e do gestor em uma prévia mobile."
      />
      <AppShowcase />
    </>
  );
}
