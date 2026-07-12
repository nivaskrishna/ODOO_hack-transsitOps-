import { useState } from 'react';
import { mockDrivers, mockTrips } from '../data/mockData';
import type { Driver } from '../data/mockData';
import { Card, CardContent, CardFooter } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { 
  Search, Filter, ShieldCheck, Mail, Phone, Calendar, 
  TrendingUp 
} from 'lucide-react';

export const DriversPage: React.FC = () => {
  const [drivers] = useState<Driver[]>(mockDrivers);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');

  // Dialog state
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search & Filter
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailability = availabilityFilter === 'All' || d.availability === availabilityFilter;
    return matchesSearch && matchesAvailability;
  });

  const getSafetyScoreColor = (score: number) => {
    if (score >= 95) return 'text-brand-success';
    if (score >= 85) return 'text-brand-info';
    if (score >= 75) return 'text-brand-warning';
    return 'text-brand-danger';
  };

  const getAvailabilityBadge = (status: Driver['availability']) => {
    switch (status) {
      case 'Available':
        return <Badge variant="success">Available</Badge>;
      case 'On Trip':
        return <Badge variant="info">On Trip</Badge>;
      case 'Off Duty':
        return <Badge variant="neutral">Off Duty</Badge>;
    }
  };

  const getLicenseBadge = (status: Driver['licenseStatus']) => {
    switch (status) {
      case 'Valid':
        return <Badge variant="success">Valid</Badge>;
      case 'Expiring Soon':
        return <Badge variant="warning">Expiring Soon</Badge>;
      case 'Expired':
        return <Badge variant="danger">Expired</Badge>;
    }
  };

  const handleOpenDetails = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  // Find driver's active or recent trip
  const getDriverActiveTrip = (driverId: string) => {
    return mockTrips.find(t => t.driverId === driverId && t.status === 'In Progress');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Drivers Registry</h1>
          <p className="text-text-secondary text-sm">Review safety scores, licenses, availability status, and contact points.</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card variant="glass">
        <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search driver by name, employee ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary focus:outline-none focus:border-brand-green transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-text-secondary hidden sm:inline" />
            <select
              className="rounded-xl border border-border-primary bg-bg-card text-sm text-text-primary px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-green"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="All">All Availabilities</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Off Duty">Off Duty</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Grid of Profile Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => {
          const activeTrip = getDriverActiveTrip(driver.id);
          return (
            <Card key={driver.id} hoverEffect className="flex flex-col justify-between border-border-primary/80">
              <CardContent className="p-0 space-y-4">
                {/* Header Profile Section */}
                <div className="flex items-center space-x-4">
                  {/* Initials Avatar */}
                  <div className="h-12 w-12 rounded-2xl bg-brand-green/10 text-brand-green font-extrabold flex items-center justify-center text-sm border border-brand-green/20">
                    {driver.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-base leading-snug">{driver.name}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">ID: {driver.id}</p>
                  </div>
                </div>

                {/* Score & Availability row */}
                <div className="grid grid-cols-2 gap-4 py-2 border-y border-border-primary/40">
                  <div>
                    <span className="text-[10px] text-text-secondary uppercase font-semibold">Safety Score</span>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <ShieldCheck className={`h-4 w-4 ${getSafetyScoreColor(driver.safetyScore)}`} />
                      <span className={`text-sm font-extrabold ${getSafetyScoreColor(driver.safetyScore)}`}>
                        {driver.safetyScore}/100
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-secondary uppercase font-semibold">Availability</span>
                    <div className="mt-0.5">{getAvailabilityBadge(driver.availability)}</div>
                  </div>
                </div>

                {/* License and contact summary */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">License:</span>
                    <div className="flex items-center space-x-1.5">
                      {getLicenseBadge(driver.licenseStatus)}
                    </div>
                  </div>
                  {activeTrip && (
                    <div className="flex items-start justify-between">
                      <span className="text-text-secondary">Active Trip:</span>
                      <span className="font-bold text-brand-info truncate max-w-[140px] text-right">
                        {activeTrip.id} ({activeTrip.endLocation.split(' ')[0]})
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-0 pt-4 flex justify-between space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs" 
                  onClick={() => handleOpenDetails(driver)}
                >
                  View Performance
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Driver Details Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDriver ? `Driver profile: ${selectedDriver.name}` : ''}
        description={selectedDriver ? `Employee ID: ${selectedDriver.id}` : ''}
      >
        {selectedDriver && (
          <div className="space-y-5">
            {/* Quick overview */}
            <div className="flex items-center space-x-4 border-b border-border-primary/50 pb-4">
              <div className="h-14 w-14 rounded-2xl bg-brand-green/10 text-brand-green font-extrabold flex items-center justify-center text-lg border border-brand-green/20">
                {selectedDriver.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-text-primary">{selectedDriver.name}</h4>
                  {getAvailabilityBadge(selectedDriver.availability)}
                </div>
                <p className="text-xs text-text-secondary mt-1">Total Shipments Completed: <span className="font-bold text-text-primary">{selectedDriver.tripsCompleted}</span></p>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="space-y-3.5">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Safety Details</span>
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-2xl border border-border-primary bg-bg-secondary/15">
                <div>
                  <span className="text-[10px] text-text-secondary">Driving Safety Score</span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <ShieldCheck className={`h-5 w-5 ${getSafetyScoreColor(selectedDriver.safetyScore)}`} />
                    <span className={`text-base font-extrabold ${getSafetyScoreColor(selectedDriver.safetyScore)}`}>
                      {selectedDriver.safetyScore}%
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary">Eco-Driving Efficiency</span>
                  <div className="flex items-center space-x-1.5 mt-1 text-brand-green font-extrabold">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-base text-text-primary">95%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacts details */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">License & Contact</span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-text-primary">
                  <Calendar className="h-4 w-4 text-text-secondary" />
                  <span>License Expiration: <strong>{selectedDriver.licenseExpiry}</strong> ({getLicenseBadge(selectedDriver.licenseStatus)})</span>
                </div>
                <div className="flex items-center space-x-2 text-text-primary">
                  <Phone className="h-4 w-4 text-text-secondary" />
                  <span>Phone Number: <strong>{selectedDriver.contact}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-text-primary">
                  <Mail className="h-4 w-4 text-text-secondary" />
                  <span>Platform Email: <strong>{selectedDriver.name.toLowerCase().replace(' ', '.')}@transitops.com</strong></span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-3 border-t border-border-primary/40">
              <Button onClick={() => setIsModalOpen(false)}>Close Registry</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
