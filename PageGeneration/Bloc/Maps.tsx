import type { BlockData } from "@/store/useBlockStore";
import getStringFields from "../utils/getStringFields";
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
    opts?: Record<string, unknown>,
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
        const maybeL = (window as unknown as { L?: LeafletStatic }).L;
        if (maybeL) return resolve(maybeL);
      }
      existing.addEventListener("load", () =>
        resolve((window as unknown as { L?: LeafletStatic }).L),
      );
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Leaflet script")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.onload = () => {
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

/* ── Pin icon (inline SVG) ── */
function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function NavigationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  );
}

function Maps({ props }: { props: BlockData }) {
  const {
    latitude: latStr = "0",
    longitude: lngStr = "0",
    zoom: zoomStr = "2",
    title = "",
    description = "",
  } = getStringFields(props.data, [
    "latitude",
    "longitude",
    "zoom",
    "title",
    "description",
  ]);
  const lat = parseFloat(latStr) || 0;
  const lng = parseFloat(lngStr) || 0;
  const zoom = parseFloat(zoomStr) || 2;
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const leafletRef = React.useRef<LeafletMap | null>(null);
  const markerRef = React.useRef<LeafletMarker | null>(null);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  React.useEffect(() => {
    if (!mapRef.current) return;

    let mounted = true;

    loadLeaflet()
      .then((L) => {
        if (!mounted || !mapRef.current || !L) return;

        if (leafletRef.current) {
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
          dragging: false,
          touchZoom: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(map);

        leafletRef.current = map;

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

        setTimeout(() => {
          try {
            (
              map as unknown as { invalidateSize?: () => void }
            ).invalidateSize?.();
          } catch {
            /* noop */
          }
        }, 0);
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

  const coordText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  return (
    <div
      className="w-full rounded-lg border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] overflow-hidden group"
      data-uuid={props.id}
    >
      {/* Map */}
      <div
        className="relative w-full cursor-pointer"
        onClick={() => window.open(mapsUrl, "_blank", "noopener")}
      >
        <div ref={mapRef} className="w-full aspect-2/1" style={{ zIndex: 0 }} />
        {/* Gradient overlay at bottom of map */}

        {/* Floating coordinates badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFE66D] border-2 border-black shadow-[2px_2px_0px_#000] text-[0.7rem] font-bold text-black">
          <MapPinIcon className="w-3.5 h-3.5 text-red-500" />
          {coordText}
        </div>
      </div>

      {/* Info section */}
      <div className="px-4 py-3">
        {/* Title */}
        {title && (
          <h3 className="text-sm font-bold uppercase text-black leading-snug">
            {title}
          </h3>
        )}

        {/* Description */}
        {description && (
          <p
            className={`text-xs text-black/70 leading-relaxed ${title ? "mt-1" : ""}`}
          >
            {description}
          </p>
        )}

        {/* If no title and no description, show a default label */}
        {!title && !description && (
          <p className="text-xs font-bold uppercase text-black">Map location</p>
        )}

        {/* Action button */}
        <button
          type="button"
          onClick={() => window.open(mapsUrl, "_blank", "noopener")}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-[3px] border-black bg-black text-white text-xs font-bold uppercase shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer"
        >
          <NavigationIcon className="w-3.5 h-3.5" />
          Open in Google Maps
        </button>
      </div>
    </div>
  );
}

export default Maps;
