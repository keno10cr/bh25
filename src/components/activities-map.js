"use client";

import { useEffect, useRef } from "react";
import styles from "./activities-map.module.css";

const FALLBACK_COLORS = {
  Beaches: "#2e86ab",
  "Blessed House": "#0a4c3a",
  Waterfalls: "#3d8b6e",
  Tours: "#e8a838",
};

const MAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

const MAPLIBRE_JS =
  "https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js";
const MAPLIBRE_CSS =
  "https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css";

function loadCss() {
  if (document.querySelector(`link[data-maplibre="css"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = MAPLIBRE_CSS;
  link.setAttribute("data-maplibre", "css");
  document.head.appendChild(link);
}

function loadMapLibre() {
  if (window.maplibregl?.Map) return Promise.resolve(window.maplibregl);
  loadCss();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-maplibre="js"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.maplibregl), {
        once: true,
      });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = MAPLIBRE_JS;
    script.async = true;
    script.setAttribute("data-maplibre", "js");
    script.onload = () => resolve(window.maplibregl);
    script.onerror = () => reject(new Error("MapLibre failed to load"));
    document.head.appendChild(script);
  });
}

function pinColor(activity) {
  return (
    activity.pinColor ||
    activity.legendItems?.[0]?.color ||
    FALLBACK_COLORS[activity.category] ||
    "#0a4c3a"
  );
}

export default function ActivitiesMap({
  activities = [],
  legendItems = [],
  selectedSlug = "",
  onSelect,
  fitToPins = true,
  showLegend = true,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const activitiesRef = useRef(activities);
  const onSelectRef = useRef(onSelect);
  const selectedSlugRef = useRef(selectedSlug);
  const prevSlugRef = useRef("");

  activitiesRef.current = activities;
  onSelectRef.current = onSelect;
  selectedSlugRef.current = selectedSlug;

  const pinKey = activities
    .map(
      (activity) =>
        `${activity.number}:${activity.slug}:${activity.coordinates?.lat}:${activity.coordinates?.lng}:${pinColor(activity)}`
    )
    .join("|");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let cancelled = false;

    async function initMap() {
      const maplibre = await loadMapLibre();
      if (cancelled || !containerRef.current || !maplibre?.Map) return;

      const points = activitiesRef.current.filter(
        (activity) => activity.coordinates?.lat && activity.coordinates?.lng
      );

      mapRef.current?.remove?.();
      const map = new maplibre.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: points[0]
          ? [points[0].coordinates.lng, points[0].coordinates.lat]
          : [-82.68, 9.58],
        zoom: !fitToPins && points.length === 1 ? 13 : 9.6,
        attributionControl: false,
      });
      map.addControl(
        new maplibre.NavigationControl({ visualizePitch: false }),
        "top-right"
      );
      map.addControl(
        new maplibre.AttributionControl({ compact: true }),
        "bottom-left"
      );
      mapRef.current = map;

      const addPins = () => {
        markersRef.current.forEach((marker) => marker.remove?.());
        markersRef.current = [];

        points.forEach((activity) => {
          const wrap = document.createElement("div");
          wrap.className = styles.pinWrap;

          const el = document.createElement("button");
          el.type = "button";
          el.className = styles.pin;
          el.style.backgroundColor = pinColor(activity);
          el.textContent = String(activity.number || "");
          el.title = `${activity.number || ""} ${activity.title || activity.name}`;
          el.setAttribute("aria-label", activity.title || activity.name);
          el.addEventListener("click", (event) => {
            event.stopPropagation();
            onSelectRef.current?.(activity);
          });
          wrap.appendChild(el);

          if (activity.slug === selectedSlugRef.current) {
            wrap.classList.add(styles.pinSelected);
            wrap.style.zIndex = "20";
          }

          const marker = new maplibre.Marker({ element: wrap, anchor: "center" })
            .setLngLat([activity.coordinates.lng, activity.coordinates.lat])
            .addTo(map);
          marker._bhSlug = activity.slug;
          marker._bhEl = wrap;
          markersRef.current.push(marker);
        });

        if (fitToPins && points.length > 1) {
          const bounds = new maplibre.LngLatBounds();
          points.forEach((activity) => {
            bounds.extend([activity.coordinates.lng, activity.coordinates.lat]);
          });
          bounds.extend([-82.9, 9.78]);
          bounds.extend([-82.5, 9.42]);
          map.fitBounds(bounds, { padding: 36, maxZoom: 10, duration: 0 });
        }
      };

      if (map.loaded()) addPins();
      else map.on("load", addPins);
    }

    initMap();

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove?.());
      markersRef.current = [];
      mapRef.current?.remove?.();
      mapRef.current = null;
    };
  }, [pinKey, fitToPins]);

  useEffect(() => {
    markersRef.current.forEach((marker) => {
      const selected = marker._bhSlug === selectedSlug;
      const el = marker.getElement?.() || marker._bhEl;
      if (!el || !marker._bhSlug) return;
      el.classList.toggle(styles.pinSelected, selected);
      el.style.zIndex = selected ? "20" : "1";
    });

    const previousSlug = prevSlugRef.current;
    prevSlugRef.current = selectedSlug;

    if (!fitToPins) return;
    const map = mapRef.current;
    if (!map?.flyTo || !selectedSlug || !previousSlug || previousSlug === selectedSlug) {
      return;
    }

    const activity = activitiesRef.current.find((item) => item.slug === selectedSlug);
    if (!activity?.coordinates) return;

    map.flyTo({
      center: [activity.coordinates.lng, activity.coordinates.lat],
      zoom: Math.max(map.getZoom?.() || 11, 12),
      duration: 700,
    });
  }, [selectedSlug, pinKey, fitToPins]);

  const legend =
    legendItems.length > 0
      ? legendItems
      : Object.entries(FALLBACK_COLORS).map(([title, color]) => ({
          title,
          color,
        }));

  return (
    <div className={styles.mapPane}>
      <div ref={containerRef} className={styles.map} />
      {showLegend ? (
        <div className={styles.legend}>
          {legend.map((item) => (
            <span key={item.slug || item.title} className={styles.legendItem}>
              <i style={{ backgroundColor: item.color || "#0a4c3a" }} />
              {item.title}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
