import { createFileRoute } from "@tanstack/react-router";
import { ThemeProvider } from "@/hooks/use-theme";
import { MapView } from "@/components/customer/MapView";
import { TopBar } from "@/components/customer/TopBar";
import { BottomSheet } from "@/components/customer/BottomSheet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moldingo — Transport rapid în Moldova" },
      {
        name: "description",
        content: "Comandă o cursă în câteva secunde. Șoferi verificați, prețuri corecte, oriunde în Moldova.",
      },
      { property: "og:title", content: "Moldingo — Transport rapid în Moldova" },
      {
        property: "og:description",
        content: "Comandă o cursă în câteva secunde. Șoferi verificați, prețuri corecte.",
      },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ],
  }),
  component: CustomerHome,
});

function CustomerHome() {
  return (
    <ThemeProvider>
      <main className="relative h-screen w-screen overflow-hidden bg-background">
        <MapView />
        <TopBar />
        <BottomSheet />
      </main>
    </ThemeProvider>
  );
}
