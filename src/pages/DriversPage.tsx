import { useState } from 'react';
import type { Driver, Trip } from '../data/mockData';
import { Card, CardContent, CardFooter } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { 
  Search, Filter, ShieldCheck, Mail, Phone, Calendar, 
  TrendingUp, Plus
} from 'lucide-react';
import emailjs from '@emailjs/browser';

interface DriversPageProps {
  drivers: Driver[];
  onAddDriver: (driver: Driver) => void;
  trips: Trip[];
  onBlockDriver: (driverId: string, reason?: string) => void;
  onUnblockDriver: (driverId: string) => void;
  onDeleteDriver: (driverId: string) => void;
  onRestoreDriver: (driverId: string) => void;
}

export const DriversPage: React.FC<DriversPageProps> = ({
  drivers,
  onAddDriver,
  trips,
  onBlockDriver,
  onUnblockDriver,
  onDeleteDriver,
  onRestoreDriver
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');

  // Add Driver state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDriver, setNewDriver] = useState<Partial<Driver>>({
    id: '',
    name: '',
    avatar: '',
    safetyScore: 95,
    licenseStatus: 'Valid',
    licenseExpiry: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contact: '',
    availability: 'Available',
    tripsCompleted: 0
  });

  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; pass: string; name: string } | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.id || !newDriver.name) return;

    const initials = newDriver.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const tempPassword = 'pass_' + Math.floor(1000 + Math.random() * 9000);
    const emailStr = newDriver.name.toLowerCase().replace(/\s+/g, '.') + '@transitops.com';

    const driverToAdd: Driver = {
      id: newDriver.id,
      name: newDriver.name,
      avatar: initials || 'DR',
      safetyScore: newDriver.safetyScore || 90,
      licenseStatus: newDriver.licenseStatus as Driver['licenseStatus'] || 'Valid',
      licenseExpiry: newDriver.licenseExpiry || '',
      contact: newDriver.contact || '',
      availability: newDriver.availability as Driver['availability'] || 'Available',
      tripsCompleted: 0,
      password: tempPassword,
      needsPasswordChange: true,
      photoUrl: newDriver.photoUrl,
      licensePhotoUrl: newDriver.licensePhotoUrl,
      aadhaarCardUrl: newDriver.aadhaarCardUrl,
      panCardUrl: newDriver.panCardUrl,
      personalEmail: newDriver.personalEmail
    };

    onAddDriver(driverToAdd);
    setIsAddOpen(false);

    if (newDriver.personalEmail) {
      emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: newDriver.personalEmail,
          driver_name: newDriver.name,
          driver_id: newDriver.id,
          driver_password: tempPassword,
          portal_email: emailStr
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      ).catch(console.error);
    }
    
    setCreatedCredentials({
      email: emailStr,
      pass: tempPassword,
      name: newDriver.name
    });
    
    setNewDriver({
      id: '',
      name: '',
      avatar: '',
      safetyScore: 95,
      licenseStatus: 'Valid',
      licenseExpiry: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contact: '',
      availability: 'Available',
      tripsCompleted: 0,
      photoUrl: '',
      licensePhotoUrl: '',
      aadhaarCardUrl: '',
      panCardUrl: '',
      personalEmail: ''
    });
  };

  // Dialog state
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [registryFilter, setRegistryFilter] = useState<'Active' | 'Blocked' | 'Deleted'>('Active');

  // Search & Filter
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailability = availabilityFilter === 'All' || d.availability === availabilityFilter;
    
    if (registryFilter === 'Active') {
      return matchesSearch && matchesAvailability && !d.isDeleted && !d.isBlocked;
    }
    if (registryFilter === 'Blocked') {
      return matchesSearch && matchesAvailability && d.isBlocked && !d.isDeleted;
    }
    if (registryFilter === 'Deleted') {
      return matchesSearch && !!d.isDeleted;
    }
    return false;
  });

  const handleOpenBlockModal = (driverId: string) => {
    const reason = prompt("Enter suspension/blocking reason details:", "Speeding alerts flagged by AI sensors");
    if (reason !== null) {
      onBlockDriver(driverId, reason);
    }
  };

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
    return trips.find(t => t.driverId === driverId && t.status === 'In Progress');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Drivers Registry</h1>
          <p className="text-text-secondary text-sm">Review safety scores, licenses, availability status, and contact points.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="flex items-center space-x-1.5 self-start">
          <Plus className="h-4 w-4" />
          <span>Add Driver</span>
        </Button>
      </div>

      {/* Registry Filters Tabs */}
      <div className="flex space-x-2 border-b border-border-primary/40 pb-2">
        <button
          onClick={() => setRegistryFilter('Active')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            registryFilter === 'Active'
              ? 'bg-brand-green text-white shadow-sm'
              : 'text-text-secondary bg-bg-secondary/20 hover:bg-bg-secondary/40 hover:text-text-primary'
          }`}
        >
          👤 Active Registry
        </button>
        <button
          onClick={() => setRegistryFilter('Blocked')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            registryFilter === 'Blocked'
              ? 'bg-brand-warning text-white shadow-sm'
              : 'text-text-secondary bg-bg-secondary/20 hover:bg-bg-secondary/40 hover:text-text-primary'
          }`}
        >
          🚫 Blocked Operators ({drivers.filter(d => d.isBlocked && !d.isDeleted).length})
        </button>
        <button
          onClick={() => setRegistryFilter('Deleted')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            registryFilter === 'Deleted'
              ? 'bg-brand-danger text-white shadow-sm'
              : 'text-text-secondary bg-bg-secondary/20 hover:bg-bg-secondary/40 hover:text-text-primary'
          }`}
        >
          ♻️ Deleted Recovery Bin ({drivers.filter(d => d.isDeleted).length})
        </button>
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

              <CardFooter className="p-0 pt-4 flex flex-col space-y-2 border-t border-border-primary/40 mt-3">
                {registryFilter === 'Active' && (
                  <>
                    <div className="flex justify-between items-center w-full text-[10px] text-text-secondary">
                      <span>Email: <strong>{driver.name.toLowerCase().replace(/\s+/g, '.')}@transitops.com</strong></span>
                      <span>Pass: <strong className="text-brand-green font-mono">{driver.password || 'driver123'}</strong></span>
                    </div>
                    <div className="flex space-x-2 w-full">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs" 
                        onClick={() => handleOpenDetails(driver)}
                      >
                        View Details
                      </Button>
                      <button
                        className="px-2.5 py-1 text-xs text-brand-warning bg-brand-warning/10 hover:bg-brand-warning/20 border border-brand-warning/20 rounded-xl transition-colors cursor-pointer"
                        onClick={() => handleOpenBlockModal(driver.id)}
                        title="Block Driver"
                      >
                        🚫
                      </button>
                      <button
                        className="px-2.5 py-1 text-xs text-brand-danger bg-brand-danger/10 hover:bg-brand-danger/20 border border-brand-danger/20 rounded-xl transition-colors cursor-pointer"
                        onClick={() => onDeleteDriver(driver.id)}
                        title="Delete Driver"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}

                {registryFilter === 'Blocked' && (
                  <>
                    <div className="w-full text-xs text-brand-warning font-semibold">
                      Reason: {driver.blockedReason || 'Suspended'}
                    </div>
                    <div className="flex space-x-2 w-full mt-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs" 
                        onClick={() => handleOpenDetails(driver)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        className="bg-brand-success hover:bg-brand-success/90 text-white font-bold flex-1"
                        onClick={() => onUnblockDriver(driver.id)}
                      >
                        🟢 Unblock
                      </Button>
                    </div>
                  </>
                )}

                {registryFilter === 'Deleted' && (
                  <div className="flex w-full">
                    <Button
                      size="sm"
                      className="bg-brand-green hover:bg-brand-green/90 text-white font-bold flex-1"
                      onClick={() => onRestoreDriver(driver.id)}
                    >
                      ♻️ Restore Profile
                    </Button>
                  </div>
                )}
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
                {selectedDriver.personalEmail && (
                  <div className="flex items-center space-x-2 text-text-primary">
                    <Mail className="h-4 w-4 text-text-secondary" />
                    <span>Personal Email: <strong>{selectedDriver.personalEmail}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            {(selectedDriver.photoUrl || selectedDriver.licensePhotoUrl || selectedDriver.aadhaarCardUrl || selectedDriver.panCardUrl) && (
              <div className="space-y-2.5">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Compliance Documents</span>
                <div className="grid grid-cols-2 gap-4">
                  {selectedDriver.photoUrl && (
                    <div>
                      <span className="text-[10px] text-text-secondary">Driver Photo</span>
                      <img src={selectedDriver.photoUrl} alt="Driver" className="w-full h-24 object-cover rounded-lg mt-1 border border-border-primary bg-bg-secondary" />
                    </div>
                  )}
                  {selectedDriver.licensePhotoUrl && (
                    <div>
                      <span className="text-[10px] text-text-secondary">License</span>
                      <img src={selectedDriver.licensePhotoUrl} alt="License" className="w-full h-24 object-cover rounded-lg mt-1 border border-border-primary bg-bg-secondary" />
                    </div>
                  )}
                  {selectedDriver.aadhaarCardUrl && (
                    <div>
                      <span className="text-[10px] text-text-secondary">Aadhaar Card</span>
                      <img src={selectedDriver.aadhaarCardUrl} alt="Aadhaar" className="w-full h-24 object-cover rounded-lg mt-1 border border-border-primary bg-bg-secondary" />
                    </div>
                  )}
                  {selectedDriver.panCardUrl && (
                    <div>
                      <span className="text-[10px] text-text-secondary">PAN Card</span>
                      <img src={selectedDriver.panCardUrl} alt="PAN" className="w-full h-24 object-cover rounded-lg mt-1 border border-border-primary bg-bg-secondary" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-3 border-t border-border-primary/40">
              <Button onClick={() => setIsModalOpen(false)}>Close Registry</Button>
            </div>
          </div>
        )}
      </Dialog>
      {/* Add Driver Dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Driver"
        description="Add a new operator to the logistics platform registry."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Employee ID *</label>
              <input
                type="text"
                placeholder="e.g. D-07"
                required
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newDriver.id}
                onChange={(e) => setNewDriver({ ...newDriver, id: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                required
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newDriver.name}
                onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Safety Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="95"
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newDriver.safetyScore || ''}
                onChange={(e) => setNewDriver({ ...newDriver, safetyScore: parseInt(e.target.value) || 90 })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Availability</label>
              <select
                className="rounded-xl border border-border-primary bg-bg-card text-sm text-text-primary px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-green"
                value={newDriver.availability}
                onChange={(e) => setNewDriver({ ...newDriver, availability: e.target.value as any })}
              >
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="Off Duty">Off Duty</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">License Status</label>
              <select
                className="rounded-xl border border-border-primary bg-bg-card text-sm text-text-primary px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-green"
                value={newDriver.licenseStatus}
                onChange={(e) => setNewDriver({ ...newDriver, licenseStatus: e.target.value as any })}
              >
                <option value="Valid">Valid</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">License Expiry Date</label>
              <input
                type="date"
                required
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newDriver.licenseExpiry}
                onChange={(e) => setNewDriver({ ...newDriver, licenseExpiry: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Phone Number *</label>
              <input
                type="text"
                placeholder="e.g. +1 (555) 019-1234"
                required
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newDriver.contact}
                onChange={(e) => setNewDriver({ ...newDriver, contact: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Personal Email *</label>
              <input
                type="email"
                placeholder="e.g. john@example.com"
                required
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newDriver.personalEmail || ''}
                onChange={(e) => setNewDriver({ ...newDriver, personalEmail: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Driver Photo URL</label>
              <input
                type="text"
                placeholder="https://example.com/photo.png"
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newDriver.photoUrl || ''}
                onChange={(e) => setNewDriver({ ...newDriver, photoUrl: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">License Photo URL</label>
              <input
                type="text"
                placeholder="https://example.com/license.png"
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newDriver.licensePhotoUrl || ''}
                onChange={(e) => setNewDriver({ ...newDriver, licensePhotoUrl: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Aadhaar Card URL</label>
              <input
                type="text"
                placeholder="https://example.com/aadhaar.png"
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newDriver.aadhaarCardUrl || ''}
                onChange={(e) => setNewDriver({ ...newDriver, aadhaarCardUrl: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">PAN Card URL</label>
              <input
                type="text"
                placeholder="https://example.com/pan.png"
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newDriver.panCardUrl || ''}
                onChange={(e) => setNewDriver({ ...newDriver, panCardUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Register Driver</Button>
          </div>
        </form>
      </Dialog>

      {/* Driver Credentials Dialog */}
      <Dialog
        isOpen={createdCredentials !== null}
        onClose={() => setCreatedCredentials(null)}
        title="Driver Credentials Generated"
        description="Share these security details with the operator for their initial portal access."
      >
        {createdCredentials && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-semibold">
              🎉 Registration Complete! Driver profile has been integrated.
            </div>

            <div className="p-4 rounded-xl bg-bg-secondary/40 border border-border-primary space-y-3">
              <div>
                <span className="text-[10px] text-text-secondary uppercase font-bold block">Operator Name</span>
                <span className="text-sm font-bold text-text-primary">{createdCredentials.name}</span>
              </div>
              <div className="border-t border-border-primary/40 pt-2">
                <span className="text-[10px] text-text-secondary uppercase font-bold block">Portal Email / Username</span>
                <span className="text-sm font-mono font-bold text-text-primary select-all">{createdCredentials.email}</span>
              </div>
              <div className="border-t border-border-primary/40 pt-2">
                <span className="text-[10px] text-text-secondary uppercase font-bold block">Temporary Password</span>
                <span className="text-sm font-mono font-bold text-brand-info select-all">{createdCredentials.pass}</span>
              </div>
            </div>

            <div className="p-3 bg-brand-info/10 text-brand-info rounded-xl text-[11px] leading-relaxed">
              💡 <strong>Compliance Note:</strong> The driver will be forced to change this passcode to a private custom password on their initial login.
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setCreatedCredentials(null)}>Acknowledge & Close</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
