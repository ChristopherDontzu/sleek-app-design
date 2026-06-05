import { useEffect, useRef } from "react";
import maplibregl, { Map as MLMap, Marker } from "maplibre-gl";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  getMapLibreStyleUrl,
} from "@/lib/maptiler-config";
import { useTheme } from "@/hooks/use-theme";

export interface DriverMarker {
  id: string;
  lng: number;
  lat: number;
}

interface MapViewProps {
  drivers?: DriverMarker[];
  userLocation?: { lng: number; lat: number } | null;
  className?: string;
}

// Răspândite pe teritoriul Moldovei (orașe reale) ca demo să nu pară "în linie" la zoom mic.
const DEMO_DRIVERS: DriverMarker[] = [
  { id: "chisinau", lng: 28.8353, lat: 47.0105 },
  { id: "balti",    lng: 27.9293, lat: 47.7615 },
  { id: "cahul",    lng: 28.1908, lat: 45.9078 },
  { id: "ungheni",  lng: 27.7956, lat: 47.2089 },
  { id: "orhei",    lng: 28.8242, lat: 47.3833 },
  { id: "comrat",   lng: 28.6589, lat: 46.2983 },
  { id: "soroca",   lng: 28.2989, lat: 48.1547 },
  { id: "tiraspol", lng: 29.6433, lat: 46.8403 },
];

export function MapView({
  drivers = DEMO_DRIVERS,
  userLocation = null,
  className,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);
  const driverMarkersRef = useRef<Marker[]>([]);
  const userMarkerRef = useRef<Marker | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getMapLibreStyleUrl(theme),
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(getMapLibreStyleUrl(theme));
  }, [theme]);

  useEffect(() => {
    if (!mapRef.current) return;
    driverMarkersRef.current.forEach((m) => m.remove());
    driverMarkersRef.current = drivers.map((d) => {
      const el = document.createElement("div");
      el.className = "moldingo-driver-marker";
      return new maplibregl.Marker({ element: el })
        .setLngLat([d.lng, d.lat])
        .addTo(mapRef.current!);
    });
  }, [drivers]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (userLocation) {
      const el = document.createElement("div");
      el.className = "moldingo-user-marker";
      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);
    }
  }, [userLocation]);

  const recenter = () => {
    if (!mapRef.current) return;
    const target = userLocation ?? { lng: DEFAULT_MAP_CENTER[0], lat: DEFAULT_MAP_CENTER[1] };
    mapRef.current.flyTo({ center: [target.lng, target.lat], zoom: 14, duration: 800 });
  };

  return (
    <div className={className} style={{ position: "absolute", inset: 0 }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      <button
        onClick={recenter}
        aria-label="Recenter map"
        className="absolute right-4 bottom-[42vh] z-10 flex h-12 w-12 items-center justify-center rounded-full bg-card text-foreground shadow-[var(--shadow-card)] border border-border transition hover:scale-105 active:scale-95"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      </button>
    </div>
  );
}
