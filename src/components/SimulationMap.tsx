import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Route, Stop, Vehicle } from '../types/transit';
import { Eye, MapPin, RefreshCw, Layers } from 'lucide-react';

interface SimulationMapProps {
  stops: Stop[];
  routes: Route[];
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  selectedStopId: string | null;
  onSelectVehicle: (id: string | null) => void;
  onSelectStop: (id: string | null) => void;
}

export const SimulationMap: React.FC<SimulationMapProps> = ({
  stops,
  routes,
  vehicles,
  selectedVehicleId,
  selectedStopId,
  onSelectVehicle,
  onSelectStop,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayersRef = useRef<{ [routeId: string]: L.Polyline }>({});
  const stopMarkersRef = useRef<{ [stopId: string]: L.CircleMarker }>({});
  const vehicleMarkersRef = useRef<{ [vehicleId: string]: L.Marker }>({});

  const [showRoutes, setShowRoutes] = useState(true);
  const [showStopLabels, setShowStopLabels] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [37.4285, -122.1700],
      zoom: 15,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // CartoDB Dark Matter tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(routeLayersRef.current).forEach((layer) => layer.remove());
    routeLayersRef.current = {};

    if (!showRoutes) return;

    const stopMap = new Map(stops.map((s) => [s.id, s]));

    routes.forEach((route) => {
      const latlngs: [number, number][] = [];
      route.stopIds.forEach((sid) => {
        const s = stopMap.get(sid);
        if (s) latlngs.push([s.lat, s.lng]);
      });

      if (latlngs.length > 2) {
        latlngs.push(latlngs[0]);
      }

      // Check if this route is currently selected by vehicle
      const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
      const isRouteSelected = selectedVehicle && selectedVehicle.assignedRouteId === route.id;

      const polyline = L.polyline(latlngs, {
        color: route.color,
        weight: isRouteSelected ? 6 : 4,
        opacity: isRouteSelected ? 1 : 0.7,
        dashArray: route.status === 'Congested' ? '6, 8' : undefined,
      }).addTo(map);

      polyline.bindTooltip(
        `<div class="text-xs font-mono font-bold px-1.5 py-0.5" style="color: ${route.color}">${route.name} (${route.scheduledHeadwayMin}m headway)</div>`,
        { sticky: true }
      );

      routeLayersRef.current[route.id] = polyline;
    });
  }, [routes, stops, showRoutes, selectedVehicleId, vehicles]);

  // Update Stop Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(stopMarkersRef.current).forEach((m) => m.remove());
    stopMarkersRef.current = {};

    stops.forEach((stop) => {
      const isOvercrowded = stop.waitingPassengers > stop.shelterCapacity * 0.8;
      const isSelected = selectedStopId === stop.id;

      const marker = L.circleMarker([stop.lat, stop.lng], {
        radius: isSelected ? 10 : isOvercrowded ? 8 : 6,
        fillColor: isOvercrowded ? '#E04838' : isSelected ? '#D8FF3E' : '#F7F6F0',
        color: '#101820',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.95,
      }).addTo(map);

      marker.on('click', () => {
        onSelectStop(stop.id);
      });

      if (showStopLabels) {
        marker.bindTooltip(
          `
          <div class="p-1 font-sans">
            <div class="font-bold text-xs text-white flex items-center gap-1 font-headline">
              <span>${stop.name}</span>
              <span class="text-[10px] font-mono text-[#D8FF3E]">(${stop.code})</span>
            </div>
            <div class="text-[11px] text-[#F7F6F0]/80 mt-1 font-mono">
              Waiting: <strong class="${isOvercrowded ? 'text-[#E04838]' : 'text-[#D8FF3E]'}">${stop.waitingPassengers}</strong> / ${stop.shelterCapacity} cap
            </div>
          </div>
          `,
          { permanent: false, direction: 'top' }
        );
      }

      stopMarkersRef.current[stop.id] = marker;
    });
  }, [stops, selectedStopId, showStopLabels, onSelectStop]);

  // Update Vehicle Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(vehicleMarkersRef.current).forEach((m) => m.remove());
    vehicleMarkersRef.current = {};

    const routeMap = new Map(routes.map((r) => [r.id, r]));

    vehicles.forEach((vehicle) => {
      const route = vehicle.assignedRouteId ? routeMap.get(vehicle.assignedRouteId) : null;
      const isSelected = selectedVehicleId === vehicle.id;
      const isDelayed = vehicle.status === 'Delayed';
      const routeColor = route?.color || '#69737D';

      const customIcon = L.divIcon({
        className: 'vehicle-marker',
        html: `
          <div class="relative group cursor-pointer">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform ${
              isSelected ? 'scale-125 ring-2 ring-[#D8FF3E] ring-offset-2 ring-offset-[#101820]' : 'hover:scale-110'
            }" style="background-color: ${routeColor}; border: 2px solid #101820;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 6v6"/>
                <path d="M15 6v6"/>
                <path d="M2 12h19.6"/>
                <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.7 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
                <circle cx="7" cy="18" r="2"/>
                <circle cx="15" cy="18" r="2"/>
              </svg>
            </div>
            ${
              isDelayed
                ? '<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E04838] opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-[#E04838]"></span></span>'
                : ''
            }
            <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#101820] text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/20 text-[#F7F6F0]">
              ${vehicle.name.split(' ')[1] || vehicle.id} • ${vehicle.currentOccupancy}/${vehicle.capacity}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([vehicle.lat, vehicle.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        onSelectVehicle(vehicle.id);
      });

      vehicleMarkersRef.current[vehicle.id] = marker;
    });
  }, [vehicles, routes, selectedVehicleId, onSelectVehicle]);

  const handleResetZoom = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([37.4285, -122.1700], 15);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-white/10 bg-[#101820]">
      {/* Leaflet DOM container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Banner Notice */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded bg-[#101820]/90 backdrop-blur-md border border-white/15 text-xs shadow-md">
        <span className="w-2 h-2 rounded-full bg-[#D8FF3E] animate-pulse" />
        <span className="font-mono text-[#D8FF3E] font-semibold text-[11px] tracking-wide">
          SIMULATED GPS STREAM
        </span>
        <span className="text-[#69737D] text-[10px] hidden sm:inline">• Deterministic Mobility Engine</span>
      </div>

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-[#101820]/90 backdrop-blur-md border border-white/15 p-1.5 rounded-lg shadow-md">
        <button
          onClick={() => setShowRoutes(!showRoutes)}
          className={`px-2.5 py-1 text-xs rounded transition flex items-center gap-1 cursor-pointer font-mono ${
            showRoutes ? 'bg-[#D8FF3E] text-[#101820] font-bold' : 'text-[#69737D] hover:text-white'
          }`}
          title="Toggle Route Polylines"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Routes</span>
        </button>

        <button
          onClick={() => setShowStopLabels(!showStopLabels)}
          className={`px-2.5 py-1 text-xs rounded transition flex items-center gap-1 cursor-pointer font-mono ${
            showStopLabels ? 'bg-[#D8FF3E] text-[#101820] font-bold' : 'text-[#69737D] hover:text-white'
          }`}
          title="Toggle Stop Badges"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Stops</span>
        </button>

        <button
          onClick={handleResetZoom}
          className="p-1.5 rounded text-[#69737D] hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="Reset Camera Center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Route Color Legend Bar */}
      <div className="absolute bottom-3 left-3 z-[1000] flex flex-wrap items-center gap-3 px-3 py-1.5 rounded bg-[#101820]/90 backdrop-blur-md border border-white/15 text-[11px] shadow-md">
        <span className="text-[#69737D] font-mono text-[10px] uppercase tracking-wider">Lines:</span>
        {routes.map((r) => (
          <div key={r.id} className="flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
            <span className="text-white">{r.shortCode}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
