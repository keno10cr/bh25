"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import MapLockButton from "@/components/map-lock-button";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./activities-map.module.css";

const COORDS_COPY = {
  en: {
    copy: "Copy coordinates",
    copied: "Coordinates copied. Paste them into Google Maps or your GPS app.",
  },
  es: {
    copy: "Copiar coordenadas",
    copied: "Coordenadas copiadas. Péguelas en Google Maps o en su app de GPS.",
  },
  de: {
    copy: "Koordinaten kopieren",
    copied: "Koordinaten kopiert. Fügen Sie sie in Google Maps oder Ihre GPS App ein.",
  },
  nl: {
    copy: "Coördinaten kopiëren",
    copied: "Coördinaten gekopieerd. Plak ze in Google Maps of je GPS app.",
  },
  fr: {
    copy: "Copier les coordonnées",
    copied: "Coordonnées copiées. Vous pouvez les coller dans Google Maps ou votre app GPS.",
  },
  ja: {
    copy: "座標をコピー",
    copied: "座標をコピーしました。Google マップや GPS アプリに貼り付けてください。",
  },
  pt: {
    copy: "Copiar coordenadas",
    copied: "Coordenadas copiadas. Cole no Google Maps ou no seu app de GPS.",
  },
  ar: {
    copy: "نسخ الإحداثيات",
    copied: "تم نسخ الإحداثيات. الصقها في خرائط Google أو تطبيق GPS.",
  },
};

async function writeClipboard(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  const ok = document.execCommand("copy");
  field.remove();
  if (!ok) throw new Error("Copy failed");
}

const GESTURE_HANDLERS = [
  "dragPan",
  "scrollZoom",
  "touchZoomRotate",
  "doubleClickZoom",
  "dragRotate",
  "touchPitch",
  "boxZoom",
  "keyboard",
];

function applyLock(map, locked) {
  if (!map) return;
  GESTURE_HANDLERS.forEach((name) => {
    const handler = map[name];
    if (!handler) return;
    if (locked) handler.disable?.();
    else handler.enable?.();
  });
}

const FALLBACK_COLORS = {
  Beaches: "#2e86ab",
  "Blessed House": "#0a4c3a",
  Waterfalls: "#3d8b6e",
  Tours: "#e8a838",
  Transport: "#3d5a73",
  Dining: "#c4783a",
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

const CENTRAL_AMERICA = {
  center: [-85.5, 12.8],
  zoom: 4.15,
};

const INTRO_FLY_MS = 8000;

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
  showCoordinates = null,
  views = [],
  initialViewId = "",
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const activitiesRef = useRef(activities);
  const onSelectRef = useRef(onSelect);
  const selectedSlugRef = useRef(selectedSlug);
  const prevSlugRef = useRef("");
  const lockedRef = useRef(true);
  const { language } = useLanguage();
  const coordsCopy = COORDS_COPY[language] || COORDS_COPY.en;
  const [coordsCopied, setCoordsCopied] = useState(false);
  const copiedTimerRef = useRef(null);
  const [locked, setLocked] = useState(true);
  const [activeViewId, setActiveViewId] = useState(initialViewId);

  lockedRef.current = locked;

  useEffect(() => {
    applyLock(mapRef.current, locked);
  }, [locked]);

  const goToView = (view) => {
    const map = mapRef.current;
    if (!map?.flyTo || !view) return;
    setActiveViewId(view.id);
    map.flyTo({
      center: view.center,
      zoom: view.zoom,
      duration: 1400,
      essential: true,
    });
  };

  const coordsText =
    showCoordinates?.lat != null && showCoordinates?.lng != null
      ? `${Number(showCoordinates.lat).toFixed(5)}, ${Number(
          showCoordinates.lng
        ).toFixed(5)}`
      : "";

  const copyCoordinates = async () => {
    if (!coordsText) return;
    try {
      await writeClipboard(coordsText);
      setCoordsCopied(true);
      window.clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = window.setTimeout(() => setCoordsCopied(false), 2600);
    } catch {
      setCoordsCopied(false);
    }
  };

  useEffect(() => () => window.clearTimeout(copiedTimerRef.current), []);

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
      const useIntroZoom = points.length >= 1;
      const map = new maplibre.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: useIntroZoom
          ? CENTRAL_AMERICA.center
          : [-82.68, 9.58],
        zoom: useIntroZoom ? CENTRAL_AMERICA.zoom : 9.6,
        attributionControl: false,
      });
      applyLock(map, lockedRef.current);
      map.addControl(
        new maplibre.NavigationControl({ showCompass: false }),
        "top-right"
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

        if (!points.length) return;

        if (fitToPins && points.length > 1) {
          const bounds = new maplibre.LngLatBounds();
          points.forEach((activity) => {
            bounds.extend([activity.coordinates.lng, activity.coordinates.lat]);
          });
          bounds.extend([-82.9, 9.78]);
          bounds.extend([-82.5, 9.42]);
          map.fitBounds(bounds, {
            padding: 36,
            maxZoom: 10,
            duration: INTRO_FLY_MS,
            essential: true,
          });
          return;
        }

        const focus = points.find((item) => item.slug === selectedSlugRef.current)
          || points[0];
        map.flyTo({
          center: [focus.coordinates.lng, focus.coordinates.lat],
          zoom: 13,
          duration: INTRO_FLY_MS,
          essential: true,
        });
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

  const focusLegendItem = (item) => {
    const map = mapRef.current;
    const maplibre = window.maplibregl;
    if (!map?.flyTo || !maplibre) return;

    const title = String(item?.title || "").trim().toLowerCase();
    if (!title) return;

    const matches = activitiesRef.current.filter((activity) => {
      if (!activity?.coordinates?.lat || !activity?.coordinates?.lng) return false;
      const category = String(activity.category || "").trim().toLowerCase();
      if (category === title) return true;
      const labels = Array.isArray(activity.legendItems)
        ? activity.legendItems
        : [];
      return labels.some(
        (entry) => String(entry?.title || "").trim().toLowerCase() === title
      );
    });

    if (!matches.length) {
      // Single pin maps often use a custom legend label (e.g. Blessed House)
      const fallback = activitiesRef.current.filter(
        (activity) => activity?.coordinates?.lat && activity?.coordinates?.lng
      );
      if (fallback.length === 1) {
        map.flyTo({
          center: [fallback[0].coordinates.lng, fallback[0].coordinates.lat],
          zoom: Math.max(map.getZoom?.() || 12, 13),
          duration: 900,
          essential: true,
        });
        onSelectRef.current?.(fallback[0]);
      }
      return;
    }

    if (matches.length === 1) {
      map.flyTo({
        center: [matches[0].coordinates.lng, matches[0].coordinates.lat],
        zoom: Math.max(map.getZoom?.() || 12, 13),
        duration: 900,
        essential: true,
      });
      onSelectRef.current?.(matches[0]);
      return;
    }

    const bounds = new maplibre.LngLatBounds();
    matches.forEach((activity) => {
      bounds.extend([activity.coordinates.lng, activity.coordinates.lat]);
    });
    map.fitBounds(bounds, {
      padding: 48,
      maxZoom: 12.5,
      duration: 900,
      essential: true,
    });
  };

  return (
    <div className={styles.mapPane}>
      <div className={styles.mapFrame}>
        <div ref={containerRef} className={styles.map} />
        <MapLockButton
          locked={locked}
          onToggle={() => setLocked((value) => !value)}
        />
      </div>
      {coordsText ? (
        <div className={styles.coordsBar}>
          <span className={styles.coordsRow}>
            <span className={styles.coordsText}>{coordsText}</span>
            <button
              type="button"
              className={styles.copyCoordsBtn}
              onClick={copyCoordinates}
              aria-label={coordsCopy.copy}
              title={coordsCopy.copy}
            >
              {coordsCopied ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect
                    x="9"
                    y="9"
                    width="11"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M5 15V5a2 2 0 0 1 2-2h10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </span>
        </div>
      ) : null}
      {typeof document !== "undefined"
        ? createPortal(
            <div
              className={`${styles.toast} ${coordsCopied ? styles.toastVisible : ""}`}
              role="status"
              aria-live="polite"
            >
              {coordsCopied ? coordsCopy.copied : ""}
            </div>,
            document.body
          )
        : null}
      {showLegend || views.length > 0 ? (
        <div className={styles.legend}>
          {views.length > 0 ? (
            <div className={styles.viewSwitch} role="group">
              {views.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  className={`${styles.viewBtn} ${
                    activeViewId === view.id ? styles.viewBtnActive : ""
                  }`}
                  aria-pressed={activeViewId === view.id}
                  onClick={() => goToView(view)}
                >
                  {view.label}
                </button>
              ))}
            </div>
          ) : null}
          {showLegend && legend.map((item) => (
            <button
              key={item.slug || item.title}
              type="button"
              className={styles.legendItem}
              onClick={() => focusLegendItem(item)}
            >
              <i style={{ backgroundColor: item.color || "#0a4c3a" }} />
              {item.title}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
