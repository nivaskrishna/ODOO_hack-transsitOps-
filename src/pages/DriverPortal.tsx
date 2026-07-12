import React, { useState } from 'react';
import type { Trip, Driver } from '../data/mockData';
import { Card, CardHeader, CardDescription, CardContent, CardFooter } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { 
  Truck, LogOut, Navigation, MapPin, ShieldCheck, 
  CheckCircle, XCircle
} from 'lucide-react';

interface DriverPortalProps {
  currentUser: { email: string; role: 'manager' | 'driver'; driverId?: string; name: string };
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  onLogout: () => void;
  onAddNotification: (notification: { title: string; message: string; type: 'license' | 'maintenance' | 'trip' | 'vehicle' }) => void;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({
  currentUser,
  trips,
  setTrips,
  drivers,
  setDrivers,
  onLogout,
  onAddNotification
}) => {
  const driverId = currentUser.driverId || '';
  const currentDriver = drivers.find(d => d.id === driverId);

  // Filter trips assigned to this specific driver
  const myTrips = trips.filter(t => t.driverId === driverId);

  // Modal Dialog states for rejecting a route
  const [rejectingTripId, setRejectingTripId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const handleAcceptRoute = (tripId: string) => {
    // Update trip status to In Progress
    setTrips(prev => prev.map(t => 
      t.id === tripId ? { ...t, status: 'In Progress' as const, progress: 10 } : t
    ));

    // Update driver availability to On Trip
    setDrivers(prev => prev.map(d => 
      d.id === driverId ? { ...d, availability: 'On Trip' as const } : d
    ));

    // Log notification for manager
    onAddNotification({
      title: 'Route Plan Accepted',
      message: `Driver ${currentUser.name} accepted route ${tripId} and is ready to load payload.`,
      type: 'trip'
    });
  };

  const handleOpenReject = (tripId: string) => {
    setRejectingTripId(tripId);
    setFeedback('');
    setIsRejectOpen(true);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTripId || !feedback.trim()) return;

    const tripId = rejectingTripId;

    // Update trip status to Scheduled (or we can mark as Rejected / Unassigned)
    // To make it easy, we can mark the status as 'Scheduled' but set driverId/vehicleId to empty OR mark it as Delayed/Canceled.
    // Let's set status of this trip to Completed/Delayed or let's create a custom message, and free up the driver.
    setTrips(prev => prev.map(t => 
      t.id === tripId ? { ...t, status: 'Delayed' as const, progress: 0 } : t
    ));

    // Free up driver status
    setDrivers(prev => prev.map(d => 
      d.id === driverId ? { ...d, availability: 'Available' as const } : d
    ));

    // Log rejection alert for manager with the driver's feedback reason
    onAddNotification({
      title: `Route Rejected: ${tripId}`,
      message: `Driver ${currentUser.name} rejected route. Reason: "${feedback.trim()}"`,
      type: 'vehicle'
    });

    setIsRejectOpen(false);
    setRejectingTripId(null);
  };

  const getStatusBadge = (status: Trip['status']) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'In Progress':
        return <Badge variant="default">Active Driving</Badge>;
      case 'Delayed':
        return <Badge variant="danger">Rejected / Delayed</Badge>;
      case 'Scheduled':
        return <Badge variant="neutral">Pending Review</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header section */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 rounded-2xl border border-border-primary bg-bg-card shadow-[var(--shadow-soft)] gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-brand-green/10 text-brand-green font-extrabold flex items-center justify-center text-lg border border-brand-green/20">
              {currentDriver?.avatar || 'DR'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Welcome, {currentUser.name}</h1>
              <p className="text-xs text-text-secondary">Driver Portal • Seattle Depot A</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 self-end sm:self-center">
            {currentDriver && (
              <div className="flex items-center space-x-1 text-xs bg-bg-secondary px-3 py-1.5 rounded-xl border border-border-primary/50">
                <ShieldCheck className="h-4 w-4 text-brand-success" />
                <span>Safety Score: <strong className="text-brand-success">{currentDriver.safetyScore}%</strong></span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={onLogout} className="flex items-center space-x-1">
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </Button>
          </div>
        </header>

        {/* Operational status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="glass">
            <CardContent className="p-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Current Status</span>
                <p className="text-base font-bold text-text-primary mt-0.5">
                  {currentDriver?.availability === 'On Trip' ? '🚚 Active on Road' : '🟢 Ready for Dispatch'}
                </p>
              </div>
              <div className={`h-3 w-3 rounded-full ${
                currentDriver?.availability === 'On Trip' ? 'bg-brand-info animate-pulse' : 'bg-brand-success'
              }`} />
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Assigned Plan Routes</span>
                <p className="text-base font-bold text-text-primary mt-0.5">{myTrips.length} routes logged</p>
              </div>
              <div className="p-2 bg-brand-green/10 text-brand-green rounded-lg">
                <Navigation className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Trips Completed</span>
                <p className="text-base font-bold text-text-primary mt-0.5">{currentDriver?.tripsCompleted || 0} runs</p>
              </div>
              <div className="p-2 bg-brand-info/10 text-brand-info rounded-lg">
                <CheckCircle className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Trips Section */}
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center space-x-2">
            <Truck className="h-5 w-5 text-brand-green" />
            <span>Assigned Dispatch Assignments</span>
          </h2>

          <div className="space-y-4">
            {myTrips.length === 0 ? (
              <Card className="text-center py-12 border-dashed border-border-primary">
                <CardContent className="space-y-2">
                  <p className="text-sm text-text-secondary">No routes currently dispatched for you.</p>
                  <p className="text-xs text-text-secondary/70">Check back later or contact Depot Dispatch Office.</p>
                </CardContent>
              </Card>
            ) : (
              myTrips.map((trip) => (
                <Card key={trip.id} className="border-border-primary/80">
                  <CardHeader className="flex flex-row items-center justify-between pb-3 mb-3 border-b border-border-primary/40">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-text-primary">{trip.id}</span>
                        <span className="text-xs text-text-secondary font-semibold font-mono bg-bg-secondary px-2 py-0.5 rounded">
                          {trip.route.name}
                        </span>
                      </div>
                      <CardDescription className="mt-1">Assigned Vehicle: <strong>{trip.vehicleId}</strong></CardDescription>
                    </div>
                    {getStatusBadge(trip.status)}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-text-secondary" />
                        <div>
                          <span className="text-[10px] text-text-secondary uppercase font-semibold block">Origin Hub</span>
                          <span className="font-bold text-text-primary">{trip.startLocation}</span>
                        </div>
                      </div>
                      <span className="text-text-secondary">➔</span>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-brand-green" />
                        <div>
                          <span className="text-[10px] text-text-secondary uppercase font-semibold block">Destination Hub</span>
                          <span className="font-bold text-text-primary">{trip.endLocation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border-primary/45 text-xs">
                      <div>
                        <span className="text-text-secondary block">Total Distance</span>
                        <p className="font-bold text-text-primary mt-0.5 font-mono">{trip.distance} km</p>
                      </div>
                      <div>
                        <span className="text-text-secondary block">Assigned ETA</span>
                        <p className="font-bold text-brand-green mt-0.5">{trip.eta}</p>
                      </div>
                    </div>
                  </CardContent>

                  {/* Actions (Accept/Reject) */}
                  {(trip.status === 'Scheduled' || trip.status === 'Delayed') && (
                    <CardFooter className="flex justify-end space-x-2 pt-4 border-t border-border-primary/40">
                      <Button 
                        variant="outline" 
                        className="text-brand-danger border-brand-danger/25 hover:bg-brand-danger/5 hover:border-brand-danger/40 font-bold flex items-center space-x-1"
                        onClick={() => handleOpenReject(trip.id)}
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject Route</span>
                      </Button>
                      <Button 
                        className="bg-brand-green hover:bg-brand-green/90 text-white font-bold flex items-center space-x-1"
                        onClick={() => handleAcceptRoute(trip.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Accept & Load</span>
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Reject Route Modal (Feedback Form) */}
      <Dialog
        isOpen={isRejectOpen}
        onClose={() => {
          setIsRejectOpen(false);
          setRejectingTripId(null);
        }}
        title={`Reject Dispatch: ${rejectingTripId}`}
        description="Provide feedback to dispatcher explaining why this route plan is rejected."
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs text-text-secondary font-bold uppercase tracking-wider">Reason for Rejection *</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Battery levels insufficient for direct run, bad weather report on pass, driver fatigue check failed..."
              className="w-full rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green resize-y"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-border-primary/40">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                setIsRejectOpen(false);
                setRejectingTripId(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" className="font-bold">
              Submit Rejection Feedback
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
