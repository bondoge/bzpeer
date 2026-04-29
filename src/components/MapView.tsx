import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { VisibleInstitution } from '../types';
import { hexToRgba } from '../utils/colors';

// Free Positron style — swap for another free style URL if needed
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

interface MapViewProps {
  visibleInstitutions: VisibleInstitution[];
  onInstitutionClick: (id: string) => void;
  selectedInstitutionId: string | null;
  shouldFitBounds: boolean;
  onFitBoundsDone: () => void;
}

function markerSize(authorCount: number, zoom: number): number {
  const base = Math.max(22, Math.min(52, 18 + authorCount * 5));
  // Subtle zoom scaling: slightly smaller when zoomed out, larger zoomed in
  const zoomFactor = 0.75 + Math.min(1, zoom / 9) * 0.5;
  return Math.round(base * zoomFactor);
}

function buildMarkerElement(
  inst: VisibleInstitution,
  isSelected: boolean,
  zoom: number
): HTMLElement {
  const size = markerSize(inst.authorCount, zoom);
  const primaryColor = inst.paperColors[0] ?? '#5B8CFF';

  // outer: zero-size shell — MapLibre owns its transform for geo-positioning.
  // We must never animate or set transform on this element ourselves.
  const outer = document.createElement('div');
  outer.style.cssText = 'position:relative;width:0;height:0;cursor:pointer;';

  // bubble: our layer — safe to animate because MapLibre never touches it.
  // Centered on the anchor point with translate so scale stays visually correct.
  const bubble = document.createElement('div');
  const shadow = isSelected
    ? `0 0 0 3px ${hexToRgba(primaryColor, 0.35)}, 0 4px 18px ${hexToRgba(primaryColor, 0.4)}`
    : '0 2px 10px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.05)';

  bubble.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: ${hexToRgba(primaryColor, isSelected ? 0.2 : 0.13)};
    border: ${isSelected ? '2.5px' : '2px'} solid ${isSelected ? primaryColor : 'rgba(255,255,255,0.9)'};
    box-shadow: ${shadow};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  `;

  const dotsWrap = document.createElement('div');
  dotsWrap.style.cssText = `
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: ${Math.round(size * 0.18)}px;
  `;

  inst.paperColors.forEach(color => {
    const dot = document.createElement('div');
    const dotSize = Math.max(5, Math.min(13, Math.round(size * 0.24)));
    dot.style.cssText = `
      width: ${dotSize}px;
      height: ${dotSize}px;
      border-radius: 50%;
      background: ${color};
      flex-shrink: 0;
      box-shadow: 0 1px 3px ${hexToRgba(color, 0.5)};
    `;
    dotsWrap.appendChild(dot);
  });
  bubble.appendChild(dotsWrap);

  // Tooltip is a child of bubble so it inherits the bubble's coordinate space.
  // bubble has no overflow:hidden so the tooltip is never clipped.
  const tooltip = document.createElement('div');
  tooltip.className = 'inst-marker-tooltip';
  tooltip.innerHTML = `<strong>${inst.name}</strong><span>${inst.paperIds.length} paper${inst.paperIds.length !== 1 ? 's' : ''} · ${inst.authorCount} author${inst.authorCount !== 1 ? 's' : ''}</span>`;
  bubble.appendChild(tooltip);

  outer.appendChild(bubble);

  // Hover: animate only the bubble — never the outer element
  outer.addEventListener('mouseenter', () => {
    bubble.style.transform = 'translate(-50%, -50%) scale(1.12)';
    tooltip.style.opacity = '1';
  });
  outer.addEventListener('mouseleave', () => {
    bubble.style.transform = 'translate(-50%, -50%)';
    tooltip.style.opacity = '0';
  });

  return outer;
}

export function MapView({
  visibleInstitutions,
  onInstitutionClick,
  selectedInstitutionId,
  shouldFitBounds,
  onFitBoundsDone,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  // Keep latest callback in a ref so zoom handler doesn't go stale
  const onClickRef = useRef(onInstitutionClick);
  useEffect(() => { onClickRef.current = onInstitutionClick; }, [onInstitutionClick]);

  const renderMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();

    const zoom = map.getZoom();

    visibleInstitutions.forEach(inst => {
      const isSelected = inst.id === selectedInstitutionId;
      const el = buildMarkerElement(inst, isSelected, zoom);

      el.addEventListener('click', e => {
        e.stopPropagation();
        onClickRef.current(inst.id);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([inst.lon, inst.lat])
        .addTo(map);

      markersRef.current.set(inst.id, marker);
    });
  }, [visibleInstitutions, selectedInstitutionId]);

  // Keep latest renderMarkers in a ref for the zoom handler
  const renderRef = useRef(renderMarkers);
  useEffect(() => { renderRef.current = renderMarkers; }, [renderMarkers]);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [10, 35],
      zoom: 2,
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    // zoomend (not zoom) — rebuilding markers at 60fps during zoom animation
    // causes them to flicker and appear off-position mid-frame
    const onZoomEnd = () => renderRef.current();
    map.on('zoomend', onZoomEnd);

    mapRef.current = map;

    return () => {
      map.off('zoomend', onZoomEnd);
      markersRef.current.forEach(m => m.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-render markers when data or selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.isStyleLoaded()) {
      renderMarkers();
    } else {
      map.once('load', renderMarkers);
    }
  }, [renderMarkers]);

  // Fit bounds
  useEffect(() => {
    if (!shouldFitBounds) return;

    const map = mapRef.current;
    if (!map || visibleInstitutions.length === 0) {
      onFitBoundsDone();
      return;
    }

    const fit = () => {
      const bounds = new maplibregl.LngLatBounds();
      visibleInstitutions.forEach(i => bounds.extend([i.lon, i.lat]));
      map.fitBounds(bounds, {
        padding: { top: 70, bottom: 160, left: 310, right: 70 },
        maxZoom: 9,
        duration: 900,
      });
      onFitBoundsDone();
    };

    if (map.isStyleLoaded()) {
      fit();
    } else {
      map.once('load', fit);
    }
  // shouldFitBounds is the intentional trigger; others are stable at time of firing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFitBounds]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
