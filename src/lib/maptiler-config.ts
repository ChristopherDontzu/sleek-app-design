export type MapLibreMapStyle = "light" | "dark";

/** Continental Europe — bias geocoding for transport routes. */
export const MAPTILER_EUROPE_BBOX = "5.9,34.5,40.2,71.5";

/** Chișinău default map center [lng, lat]. */
export const DEFAULT_MAP_CENTER: [number, number] = [28.8353, 47.0105];
export const DEFAULT_MAP_ZOOM = 12;

const CARTO_LIGHT_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";
const CARTO_DARK_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

// MapTiler keys are publishable; protect via Allowed-Origins in MapTiler dashboard.
const MAPTILER_API_KEY = "JwLJUnzW3EcifAYu1Ncf";

export function getMapTilerApiKey(): string {
  return MAPTILER_API_KEY.trim();
}

export function isMapTilerConfigured(): boolean {
  return getMapTilerApiKey().length > 0;
}

export function getMapTilerGeocodingBaseUrl(): string {
  return "https://api.maptiler.com/geocoding";
}

export function getMapLibreStyleUrl(style: MapLibreMapStyle): string {
  const key = getMapTilerApiKey();
  if (!key) {
    return style === "dark" ? CARTO_DARK_STYLE : CARTO_LIGHT_STYLE;
  }
  const mapId = style === "dark" ? "streets-v2-dark" : "streets-v2";
  return `https://api.maptiler.com/maps/${mapId}/style.json?key=${encodeURIComponent(key)}`;
}

export function mapTilerLanguageParam(language?: "ro" | "ru" | "en"): string {
  if (language === "ro") return "ro,en";
  if (language === "ru") return "ru,en";
  return "en";
}
