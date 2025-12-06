import type { BlockData } from "@/store/useBlockStore";
import getStringField from "../utils/getStringField";
import React from "react";

// Minimal local types for Leaflet pieces we use to avoid `any`.
type LeafletMap = {
  setView?: (coords: [number, number], zoom: number) => void;
  remove?: () => void;
};

type LeafletStatic = {
  map: (el: HTMLElement, opts?: Record<string, unknown>) => LeafletMap;
  tileLayer: (
    url: string,
    opts?: Record<string, unknown>
  ) => { addTo: (map: LeafletMap) => void };
  marker?: (coords: [number, number]) => {
    addTo: (map: LeafletMap) => LeafletMarker;
  };
};

type LeafletMarker = {
  setLatLng?: (coords: [number, number]) => void;
  addTo?: (map: LeafletMap) => LeafletMarker;
};

// Load Leaflet from CDN (UMD) and inject stylesheet. Exposes `window.L`.
let leafletLoader: Promise<LeafletStatic | undefined> | null = null;
function loadLeaflet(): Promise<LeafletStatic | undefined> {
  if (typeof window === "undefined")
    return Promise.reject(new Error("No window available"));
  const win = window as unknown as { L?: LeafletStatic };
  if (win.L) return Promise.resolve(win.L);
  if (leafletLoader) return leafletLoader;

  leafletLoader = new Promise((resolve, reject) => {
    const cssHref = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    if (!document.querySelector(`link[href="${cssHref}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssHref;
      document.head.appendChild(link);
    }

    const scriptSrc = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    const existing = document.querySelector(`script[src="${scriptSrc}"]`);
    if (existing) {
      const winL = (window as unknown as { L?: LeafletStatic }).L;
      if (winL) return resolve(winL);
      const ready = (existing as HTMLScriptElement & { readyState?: string })
        .readyState;
      if (ready === "complete" || ready === "loaded") {
        // script tag present and appears loaded; resolve with window.L if available
        const maybeL = (window as unknown as { L?: LeafletStatic }).L;
        if (maybeL) return resolve(maybeL);
      }
      existing.addEventListener("load", () =>
        resolve((window as unknown as { L?: LeafletStatic }).L)
      );
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Leaflet script"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.onload = () => {
      // mark script as loaded for future calls
      try {
        script.setAttribute("data-leaflet-loaded", "1");
      } catch {
        /* noop */
      }
      const loaded = (window as unknown as { L?: LeafletStatic }).L;
      if (loaded) resolve(loaded);
      else reject(new Error("Leaflet loaded but `L` not found on window"));
    };
    script.onerror = () => reject(new Error("Failed to load Leaflet script"));
    document.body.appendChild(script);
  });

  return leafletLoader;
}

function Maps({ props }: { props: BlockData }) {
  const latStr = getStringField(props.data, "latitude") ?? "0";
  const lngStr = getStringField(props.data, "longitude") ?? "0";
  const zoomStr = getStringField(props.data, "zoom") ?? "2";
  const lat = parseFloat(latStr) || 0;
  const lng = parseFloat(lngStr) || 0;
  const zoom = parseFloat(zoomStr) || 2;
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const leafletRef = React.useRef<LeafletMap | null>(null);
  const markerRef = React.useRef<LeafletMarker | null>(null);

  React.useEffect(() => {
    if (!mapRef.current) return;

    let mounted = true;

    // Ensure Leaflet is loaded from CDN, then initialize/update map
    loadLeaflet()
      .then((L) => {
        if (!mounted || !mapRef.current || !L) return;

        if (leafletRef.current) {
          // Map already created: update marker position but do NOT change map view (keep map static)
          if (
            markerRef.current &&
            typeof markerRef.current.setLatLng === "function"
          ) {
            markerRef.current.setLatLng([lat, lng]);
          }
          return;
        }

        const map = L.map(mapRef.current, {
          center: [lat, lng],
          zoom,
          // make the map static / non-interactive
          dragging: false,
          touchZoom: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          zoomControl: false,
          attributionControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        leafletRef.current = map;

        // add a marker at the given coordinates and keep it when coords update
        try {
          const winL = window as unknown as {
            L?: LeafletStatic & { marker?: (...a: unknown[]) => unknown };
          };
          const markerFactory = winL.L?.marker;
          if (markerFactory) {
            const mUnknown = markerFactory([lat, lng], {
              interactive: false,
            }) as unknown;
            const m = mUnknown as LeafletMarker | undefined;
            if (m && typeof m.addTo === "function")
              markerRef.current = m.addTo(map);
          }
        } catch {
          /* noop */
        }

        // debug
        console.debug("Leaflet map created", {
          el: mapRef.current,
          lat,
          lng,
          zoom,
        });

        // Sometimes the container may be hidden or resized by parent layout; ensure Leaflet lays out
        try {
          // call invalidateSize after a tick to allow layout to settle
          setTimeout(() => {
            try {
              (
                map as unknown as { invalidateSize?: () => void }
              ).invalidateSize?.();
            } catch {
              /* noop */
            }
          }, 0);
        } catch {
          /* noop */
        }
      })
      .catch((err) => {
        console.error("Leaflet load failed:", err);
      });

    return () => {
      mounted = false;
      if (
        leafletRef.current &&
        typeof leafletRef.current.remove === "function"
      ) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
      if (markerRef.current) {
        // try removing marker from map if supported, then clear ref
        try {
          (
            markerRef.current as LeafletMarker & { remove?: () => void }
          ).remove?.();
        } catch {
          /* noop */
        }
        markerRef.current = null;
      }
    };
  }, [lat, lng, zoom]);

  return (
    <div
      ref={mapRef}
      className="w-full aspect-video rounded-md cursor-pointer"
      data-uuid={props.id}
      onClick={() => {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, "_blank", "noopener");
      }}
    ></div>
  );
}

export default Maps;
