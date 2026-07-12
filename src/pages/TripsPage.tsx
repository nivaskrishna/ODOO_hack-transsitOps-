import { useState } from 'react';
import type { Trip, Vehicle, Driver } from '../data/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { 
  Navigation, Clock, Map 
} from 'lucide-react';

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

  // Currently viewed trip details (defaults to first or selected)
  const currentTrip = trips.find(t => t.id === selectedTripId) || trips[0];

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
                  <div className="relative h-64 bg-bg-secondary border border-border-primary rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-4">
                    {/* Grids */}
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_28px]" />
                    
                    {/* Visual route curve */}
                    <svg className="absolute inset-0 w-full h-full text-border-primary stroke-current" fill="none">
                      <path d="M 60,80 Q 200,160 250,90 T 450,150" strokeWidth="5" strokeLinecap="round" />
                      {currentTrip.status !== 'Scheduled' && (
                        <path 
                          d="M 60,80 Q 200,160 250,90 T 450,150" 
                          stroke="#00B67A" 
                          strokeWidth="3.5" 
                          strokeLinecap="round" 
                          strokeDasharray="8 5" 
                          className="animate-[pulse_1.5s_infinite]" 
                        />
                      )}
                    </svg>

                    {/* Progress details indicator on map */}
                    {currentTrip.status === 'In Progress' && (
                      <div 
                        className="absolute flex flex-col items-center"
                        style={{
                          left: `${currentTrip.progress}%`,
                          top: `${60 - Math.sin((currentTrip.progress / 100) * Math.PI) * 15}%`
                        }}
                      >
                        <div className="bg-brand-green text-white p-1.5 rounded-full shadow-[0_0_15px_rgba(0,182,122,0.6)] animate-bounce relative">
                          <Navigation className="h-4 w-4 rotate-90" />
                        </div>
                        <span className="bg-bg-card border border-border-primary text-[8px] font-bold px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap">
                          {currentTrip.vehicleId} ({currentTrip.progress}%)
                        </span>
                      </div>
                    )}

                    {/* Departure Pins */}
                    <div className="absolute left-10 top-[28%] flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-text-secondary border-2 border-white shadow" />
                      <span className="bg-bg-card text-[9px] font-bold px-1.5 py-0.5 rounded border border-border-primary shadow mt-1 whitespace-nowrap">
                        {currentTrip.startLocation.split(' ')[0]}
                      </span>
                    </div>

                    {/* Arrival Pins */}
                    <div className="absolute right-12 top-[60%] flex flex-col items-center">
                      <div className="h-3.5 w-3.5 rounded-full bg-brand-green border-2 border-white shadow" />
                      <span className="bg-bg-card text-[9px] font-bold px-1.5 py-0.5 rounded border border-brand-green/20 shadow mt-1 whitespace-nowrap">
                        {currentTrip.endLocation.split(' ')[0]}
                      </span>
                    </div>

                    {/* Telemetry statistics overlay */}
                    {currentTrip.status === 'In Progress' && (
                      <div className="absolute left-4 bottom-4 p-3 bg-bg-card/90 backdrop-blur-sm rounded-xl border border-border-primary/80 shadow-md text-xs space-y-1">
                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Remaining</p>
                        <p className="font-bold text-text-primary flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-brand-green" />
                          {currentTrip.eta}
                        </p>
                      </div>
                    )}
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
