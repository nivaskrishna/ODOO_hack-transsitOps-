import { useState, useEffect } from 'react';
import type { Trip, Vehicle, Driver } from '../data/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { 
  Clock, Map 
} from 'lucide-react';


const INDIAN_CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  'Mumbai Hub A': { lat: 19.0760, lon: 72.8777 },
  'Delhi Depot': { lat: 28.6139, lon: 77.2090 },
  'Bengaluru Distribution': { lat: 12.9716, lon: 77.5946 },
  'Chennai Terminal': { lat: 13.0827, lon: 80.2707 },
  'Kolkata Cargo': { lat: 22.5726, lon: 88.3639 },
  'Hyderabad Hub': { lat: 17.3850, lon: 78.4867 },
  'Pune Depot': { lat: 18.5204, lon: 73.8567 },
  'Ahmedabad Depot': { lat: 23.0225, lon: 72.5714 }
};

interface TripsPageProps {
  trips: Trip[];
  selectedTripId: string | null;
  onSelectTrip: (trip: Trip | null) => void;
  vehicles: Vehicle[];
  drivers: Driver[];
  onManagerCompleteTrip: (tripId: string) => void;
}

export const TripsPage: React.FC<TripsPageProps> = ({ 
  trips,
  selectedTripId, 
  onSelectTrip,
  vehicles,
  drivers,
  onManagerCompleteTrip
}) => {
  const [filterStatus, setFilterStatus] = useState<'All' | 'In Progress' | 'Pending Completion' | 'Completed' | 'Scheduled'>('All');

  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Currently viewed trip details (defaults to first or selected)
  const currentTrip = trips.find(t => t.id === selectedTripId) || trips[0];

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !leafletLoaded || !currentTrip) return;

    const startCoord = INDIAN_CITY_COORDINATES[currentTrip.startLocation];
    const endCoord = INDIAN_CITY_COORDINATES[currentTrip.endLocation];

    const container = L.DomUtil.get('leaflet-map');
    if (container !== null) {
      container._leaflet_id = null;
    }

    const map = L.map('leaflet-map', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    if (startCoord && endCoord) {
      const p1: [number, number] = [startCoord.lat, startCoord.lon];
      const p2: [number, number] = [endCoord.lat, endCoord.lon];

      const iconStart = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #6B7280; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const iconEnd = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #00B67A; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,182,122,0.6);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      L.marker(p1, { icon: iconStart }).addTo(map).bindPopup(`<b>Origin:</b> ${currentTrip.startLocation}`).openPopup();
      L.marker(p2, { icon: iconEnd }).addTo(map).bindPopup(`<b>Destination:</b> ${currentTrip.endLocation}`);

      const polyline = L.polyline([p1, p2], {
        color: '#00B67A',
        weight: 4,
        dashArray: currentTrip.status === 'In Progress' ? '8, 8' : undefined
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

      if (currentTrip.status === 'In Progress') {
        const ratio = currentTrip.progress / 100;
        const currentLat = p1[0] + (p2[0] - p1[0]) * ratio;
        const currentLon = p1[1] + (p2[1] - p1[1]) * ratio;

        const iconVehicle = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #3B82F6; color: white; display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 12px rgba(59,130,246,0.8);" class="animate-bounce">
            <svg style="width: 10px; height: 10px;" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path></svg>
          </div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        L.marker([currentLat, currentLon], { icon: iconVehicle }).addTo(map)
          .bindPopup(`<b>Current:</b> ${currentTrip.vehicleId} (${currentTrip.progress}%)`);
      }
    }
  }, [leafletLoaded, currentTrip]);

  const filteredTrips = trips.filter(t => filterStatus === 'All' || t.status === filterStatus);

  const getStatusBadge = (status: Trip['status']) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'In Progress':
        return <Badge variant="default">In Progress</Badge>;
      case 'Delayed':
        return <Badge variant="danger">Delayed</Badge>;
      case 'Scheduled':
        return <Badge variant="neutral">Scheduled</Badge>;
      case 'Pending Completion':
        return <Badge variant="warning">Awaiting Approval</Badge>;
    }
  };

  const getVehicleName = (vehicleId: string) => {
    const v = vehicles.find(item => item.id === vehicleId);
    return v ? v.name : vehicleId;
  };

  const getDriverName = (driverId: string) => {
    const d = drivers.find(item => item.id === driverId);
    return d ? d.name : driverId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Active Shipments</h1>
        <p className="text-text-secondary text-sm">Dispatched logistics runs, navigation telemetry, and milestones tracking.</p>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Trips List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Status Tabs */}
          <div className="flex space-x-2 pb-2">
            {(['All', 'In Progress', 'Pending Completion', 'Completed', 'Scheduled'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filterStatus === tab
                    ? 'bg-bg-card text-text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab === 'All' ? 'All' : tab}
              </button>
            ))}
          </div>

          {/* Cards List */}
          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {filteredTrips.length === 0 ? (
              <div className="text-center py-8 text-sm text-text-secondary">
                No trips found matching filter.
              </div>
            ) : (
              filteredTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => onSelectTrip(trip)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    currentTrip.id === trip.id
                      ? 'bg-bg-card border-brand-green shadow-sm ring-1 ring-brand-green/20'
                      : 'bg-bg-card border-border-primary hover:border-text-secondary/20 shadow-[var(--shadow-soft)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-text-primary">{trip.id}</span>
                    {getStatusBadge(trip.status)}
                  </div>
                  <div className="flex items-center space-x-2 mt-3 text-xs">
                    <span className="font-semibold text-text-primary">{trip.startLocation.split(' ')[0]}</span>
                    <span className="text-text-secondary">➔</span>
                    <span className="font-semibold text-text-primary">{trip.endLocation.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-primary/40 text-[11px] text-text-secondary">
                    <span>{getVehicleName(trip.vehicleId)}</span>
                    <span className="font-mono">{trip.distance} km</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Detailed View */}
        <div className="lg:col-span-2 space-y-6">
          {currentTrip ? (
            <>
              {/* GIS Mock Map Tracking */}
              <Card variant="glass">
                <CardHeader className="flex flex-row items-start justify-between pb-2 border-b-0 mb-0">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center space-x-2">
                      <Map className="h-4 w-4 text-brand-green" />
                      <span>GIS Route Tracking</span>
                    </CardTitle>
                    <CardDescription>{currentTrip.route.name}</CardDescription>
                  </div>
                  <Badge variant={currentTrip.status === 'Completed' ? 'success' : 'default'}>
                    {currentTrip.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Route Visual Drawing */}
                  <div className="relative h-64 bg-bg-secondary border border-border-primary rounded-2xl overflow-hidden shadow-inner p-0 z-0">
                    <div id="leaflet-map" className="w-full h-full" />
                  </div>

                  {/* Route milestones overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border-primary/50 text-xs">
                    <div>
                      <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Driver Assigned</span>
                      <p className="font-bold text-text-primary mt-0.5">{getDriverName(currentTrip.driverId)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Vehicle Assigned</span>
                      <p className="font-bold text-text-primary mt-0.5">{getVehicleName(currentTrip.vehicleId)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Total Distance</span>
                      <p className="font-bold text-text-primary mt-0.5 font-mono">{currentTrip.distance} km</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">ETA / Arrival</span>
                      <p className="font-bold text-brand-green mt-0.5">
                        {currentTrip.status === 'Completed' ? 'Delivered' : currentTrip.eta}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {currentTrip.status === 'Pending Completion' && (
                <Card className="border-brand-warning bg-brand-warning/10 dark:bg-brand-warning/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-brand-warning">
                      ⚠️ Delivery Review Pending Sign-Off
                    </CardTitle>
                    <CardDescription className="text-xs">
                      The driver has completed this shipment and requested route closure. Please verify and confirm to release the driver and vehicle assets.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <Button 
                      className="w-full bg-brand-success hover:bg-brand-success/90 text-white font-bold text-xs py-2"
                      onClick={() => onManagerCompleteTrip(currentTrip.id)}
                    >
                      ✅ Approve & Release Fleet Assets
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Shipping Progress Milestones Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-text-secondary" />
                    <span>Run Progress Log</span>
                  </CardTitle>
                  <CardDescription>Chronological timeline milestones during transport</CardDescription>
                </CardHeader>
                <CardContent className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-border-primary">
                  {currentTrip.timeline.map((step, idx) => (
                    <div key={idx} className="relative flex flex-col space-y-1">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[22.5px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                        step.time === 'Pending' ? 'bg-border-primary' : 'bg-brand-green'
                      }`} />
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono font-bold text-text-secondary bg-bg-secondary px-1.5 py-0.5 rounded">
                          {step.time}
                        </span>
                        <span className="font-bold text-sm text-text-primary">{step.status}</span>
                      </div>
                      <p className="text-xs text-text-secondary">{step.location} — {step.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-20 text-text-secondary">
              No shipment details loaded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
