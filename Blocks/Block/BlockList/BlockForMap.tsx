import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Copy, ExternalLink, MapPin, Navigation } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Textarea } from "@/src/components/ui/textarea";
import { useBlockStore } from "@/store/useBlockStore";

// Fix for default markers in react-leaflet
interface IconDefaultPrototype {
  _getIconUrl?: unknown;
}
delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
  uuid: string;
}
interface MapData {
  latitude: number;
  longitude: number;
  zoom: number;
}

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component for handling map zoom changes
function MapZoomHandler({
  onZoomChange,
}: {
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}
function fixLatitude(lat: number): number {
  return Math.min(90, Math.max(-90, lat));
}

function fixLongitude(lng: number): number {
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}

function BlockForMap({ isEdit, uuid }: Props) {
  const [mapTitle, setMapTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const updateBlock = useBlockStore((state) => state.updateBlockData);
  const [mapData, setMapData] = useState<MapData>(() => {
    // Default to New York City
    return {
      latitude: 40.7128,
      longitude: -74.006,
      zoom: 13,
    };
  });
  useEffect(() => {
    updateBlock(uuid, {
      description: description,
      latitude: JSON.stringify(mapData.latitude),
      longitude: JSON.stringify(mapData.longitude),
      zoom: JSON.stringify(mapData.zoom),
      title: mapTitle,
    });
  }, [mapData, description, mapTitle, updateBlock, uuid]);
  const [mapKey, setMapKey] = useState(0); // Add key to force map re-render
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.", {
        description: React.createElement(
          "div",
          null,
          "Please use a compatible browser or select your location manually on the map."
        ),
      });
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapData((prev) => ({
          ...prev,
          latitude: fixLatitude(position.coords.latitude),
          longitude: fixLongitude(position.coords.longitude),
          zoom: 13,
        }));
        setMapKey((prev) => prev + 1); // Force map re-render with new center
        setIsDetectingLocation(false);
      },
      (error) => {
        console.error("Error detecting location:", error);
        toast.error("Unable to retrieve your location.", {
          description: React.createElement(
            "div",
            null,
            "Please ensure location services are enabled and try again, or select your location manually on the map."
          ),
        });
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };
  const handleMapClick = (lat: number, lng: number) => {
    setMapData((prev) => ({
      ...prev,
      latitude: fixLatitude(lat),
      longitude: fixLongitude(lng),
    }));
  };

  const handleZoomChange = (zoom: number) => {
    setMapData((prev) => ({
      ...prev,
      zoom: zoom,
    }));
  };
  return (
    <div>
      {isEdit ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
              //   htmlFor={`map-title-${data.id}`}
              >
                Map Title
              </Label>
              <Input
                // id={`map-title-${data.id}`}
                placeholder="Enter map name"
                value={mapTitle}
                onChange={(e) => setMapTitle(e.target.value)}
                className="bg-muted/40"
              />
            </div>
            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={detectCurrentLocation}
                  disabled={isDetectingLocation}
                  className="flex-1"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {isDetectingLocation ? "Detecting..." : "My Location"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Latitude</Label>
              <p className="text-sm font-mono">{mapData.latitude.toFixed(6)}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Longitude</Label>
              <p className="text-sm font-mono">
                {mapData.longitude.toFixed(6)}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Zoom</Label>
              <p className="text-sm font-mono">{mapData.zoom}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Interactive Map</Label>
            <p className="text-xs text-muted-foreground">
              Click anywhere on the map to set your location pin
            </p>
            <div className="h-64 w-full rounded-lg overflow-hidden border border-border">
              <MapContainer
                key={mapKey} // Force re-render when location changes
                center={[mapData.latitude, mapData.longitude]}
                zoom={mapData.zoom}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onLocationSelect={handleMapClick} />
                <MapZoomHandler onZoomChange={handleZoomChange} />
                <Marker position={[mapData.latitude, mapData.longitude]}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-medium">
                        {mapTitle || "Selected Location"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {mapData.latitude.toFixed(6)},{" "}
                        {mapData.longitude.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          <div className="space-y-2">
            <Label
            //   htmlFor={`map-desc-${data.id}`}
            >
              Description (optional)
            </Label>
            <Textarea
              // id={`map-desc-${data.id}`}
              placeholder="Describe this location..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20 bg-muted/40"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Map Preview */}
          <div className="h-48 w-full rounded-lg overflow-hidden border border-border bg-muted/30">
            {mapData.latitude && mapData.longitude ? (
              <MapContainer
                key={`preview-${mapKey}`} // Force re-render when location changes
                center={[mapData.latitude, mapData.longitude]}
                zoom={mapData.zoom}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
                zoomControl={false}
                dragging={false}
                touchZoom={false}
                doubleClickZoom={false}
                scrollWheelZoom={false}
                boxZoom={false}
                keyboard={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[mapData.latitude, mapData.longitude]}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-medium">{mapTitle || "Location"}</p>
                      <p className="text-xs text-muted-foreground">
                        {mapData.latitude.toFixed(6)},{" "}
                        {mapData.longitude.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No location set
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Coordinates Display */}
          {mapData.latitude && mapData.longitude && (
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-mono">
                    {mapData.latitude.toFixed(6)},{" "}
                    {mapData.longitude.toFixed(6)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${mapData.latitude.toFixed(6)}, ${mapData.longitude.toFixed(6)}`
                      );
                      toast.success("Coordinates copied to clipboard");
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => {
                  const url = `https://www.google.com/maps/search/?api=1&query=${mapData.latitude},${mapData.longitude}`;
                  window.open(url, "_blank", "noopener,noreferrer");
                  toast.success("Opening in Google Maps");
                }}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          )}
          {mapTitle && (
            <div>
              <span className="text-xs dark:text-muted-foreground">Title:</span>
              <p className="text-sm dark:text-foreground">{mapTitle}</p>
            </div>
          )}
          {description && (
            <div>
              <span className="text-xs dark:text-muted-foreground">
                Description (Optional):
              </span>
              <p className="text-sm dark:text-foreground">{description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlockForMap;
