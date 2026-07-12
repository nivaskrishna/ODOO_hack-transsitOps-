import { useState } from 'react';
import type { 
  Vehicle, 
  MaintenanceRecord 
} from '../data/mockData';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/Table';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Dialog } from '../components/Dialog';
import { 
  Search, Filter, Zap, Fuel, Plus, ChevronLeft, ChevronRight, Eye 
} from 'lucide-react';

interface VehiclesPageProps {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  maintenance: MaintenanceRecord[];
  onDeleteVehicle: (vehicleId: string) => void;
  onRestoreVehicle: (vehicleId: string) => void;
}

export const VehiclesPage: React.FC<VehiclesPageProps> = ({
  vehicles,
  setVehicles,
  maintenance,
  onDeleteVehicle,
  onRestoreVehicle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [energyFilter, setEnergyFilter] = useState('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [fleetFilter, setFleetFilter] = useState<'Active' | 'Deleted'>('Active');

  // Selected Vehicle Modal Detail
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Vehicle state (mock)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    id: '',
    name: '',
    category: 'Electric Van',
    capacity: '',
    odometer: 0,
    status: 'Active',
    fuelType: 'Electric',
    fuelEfficiency: '',
    lastService: new Date().toISOString().split('T')[0],
    nextService: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Filter & Search Logic
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchesEnergy = energyFilter === 'All' || v.fuelType === energyFilter;
    
    if (fleetFilter === 'Active') {
      return matchesSearch && matchesStatus && matchesEnergy && !v.isDeleted;
    } else {
      return matchesSearch && !!v.isDeleted;
    }
  });

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + itemsPerPage);

  const getVehicleIcon = (fuelType: Vehicle['fuelType']) => {
    switch (fuelType) {
      case 'Electric':
        return (
          <div className="h-10 w-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green border border-brand-green/20">
            <Zap className="h-5 w-5" />
          </div>
        );
      case 'Diesel':
        return (
          <div className="h-10 w-10 rounded-xl bg-charcoal/10 flex items-center justify-center text-charcoal border border-charcoal/20 dark:bg-border-primary/20 dark:text-text-primary">
            <Fuel className="h-5 w-5" />
          </div>
        );
      case 'Hybrid':
        return (
          <div className="h-10 w-10 rounded-xl bg-brand-info/10 flex items-center justify-center text-brand-info border border-brand-info/20">
            <Zap className="h-5 w-5" />
          </div>
        );
    }
  };

  const getStatusBadge = (status: Vehicle['status']) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success">Active</Badge>;
      case 'Maintenance':
        return <Badge variant="warning">Maintenance</Badge>;
      case 'Out of Service':
        return <Badge variant="danger">Out of Service</Badge>;
    }
  };

  const handleOpenDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.id || !newVehicle.name) return;

    const vehicleToAdd: Vehicle = {
      id: newVehicle.id,
      name: newVehicle.name,
      category: newVehicle.category as Vehicle['category'],
      capacity: newVehicle.capacity || 'N/A',
      odometer: Number(newVehicle.odometer) || 0,
      status: newVehicle.status as Vehicle['status'],
      fuelType: newVehicle.fuelType as Vehicle['fuelType'],
      fuelEfficiency: newVehicle.fuelEfficiency || 'N/A',
      lastService: newVehicle.lastService || '',
      nextService: newVehicle.nextService || ''
    };

    setVehicles(prev => [vehicleToAdd, ...prev]);
    setIsAddOpen(false);
    
    setNewVehicle({
      id: '',
      name: '',
      category: 'Electric Van',
      capacity: '',
      odometer: 0,
      status: 'Active',
      fuelType: 'Electric',
      fuelEfficiency: '',
      lastService: new Date().toISOString().split('T')[0],
      nextService: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const selectedMaintenance: MaintenanceRecord[] = selectedVehicle 
    ? maintenance.filter(m => m.vehicleId === selectedVehicle.id) 
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Vehicles Fleet</h1>
          <p className="text-text-secondary text-sm">Monitor energy performance, maintenance alerts, and telematics logs.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="flex items-center space-x-1.5 self-start">
          <Plus className="h-4 w-4" />
          <span>Add Vehicle</span>
        </Button>
      </div>

      {/* Fleet Filters Tabs */}
      <div className="flex space-x-2 border-b border-border-primary/40 pb-2">
        <button
          onClick={() => {
            setFleetFilter('Active');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            fleetFilter === 'Active'
              ? 'bg-brand-green text-white shadow-sm'
              : 'text-text-secondary bg-bg-secondary/20 hover:bg-bg-secondary/40 hover:text-text-primary'
          }`}
        >
          🚚 Active Fleet
        </button>
        <button
          onClick={() => {
            setFleetFilter('Deleted');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            fleetFilter === 'Deleted'
              ? 'bg-brand-danger text-white shadow-sm'
              : 'text-text-secondary bg-bg-secondary/20 hover:bg-bg-secondary/40 hover:text-text-primary'
          }`}
        >
          ♻️ Deleted Vehicles Recovery ({vehicles.filter(v => v.isDeleted).length})
        </button>
      </div>

      {/* Search and Filters */}
      <Card variant="glass">
        <CardContent className="p-0 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by vehicle ID, manufacturer, category..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary focus:outline-none focus:border-brand-green transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          {/* Filter Status */}
          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-text-secondary hidden sm:inline" />
            <select
              className="rounded-xl border border-border-primary bg-bg-card text-sm text-text-primary px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-green"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Out of Service">Out of Service</option>
            </select>

            {/* Filter Fuel Type */}
            <select
              className="rounded-xl border border-border-primary bg-bg-card text-sm text-text-primary px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-green"
              value={energyFilter}
              onChange={(e) => {
                setEnergyFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Energies</option>
              <option value="Electric">Electric</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Fleet table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Asset ID</TableHead>
            <TableHead>Vehicle Name</TableHead>
            <TableHead>Classification</TableHead>
            <TableHead>Telemetry Status</TableHead>
            <TableHead>Odometer</TableHead>
            <TableHead>Efficiency Index</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedVehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-text-secondary">
                No vehicles matched the search criteria.
              </TableCell>
            </TableRow>
          ) : (
            paginatedVehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>{getVehicleIcon(vehicle.fuelType)}</TableCell>
                <TableCell className="font-bold text-text-primary">{vehicle.id}</TableCell>
                <TableCell className="font-medium text-text-primary">{vehicle.name}</TableCell>
                <TableCell className="text-text-secondary">{vehicle.category}</TableCell>
                <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                <TableCell className="font-mono text-xs">{vehicle.odometer.toLocaleString()} km</TableCell>
                <TableCell className="font-mono text-xs text-brand-green font-bold">
                  {vehicle.fuelEfficiency}
                </TableCell>
                <TableCell className="text-right flex items-center justify-end space-x-2">
                  {fleetFilter === 'Active' ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 flex items-center justify-center"
                        onClick={() => handleOpenDetails(vehicle)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4 text-text-secondary hover:text-text-primary" />
                      </Button>
                      <button
                        className="h-8 px-2 py-1 text-xs text-brand-danger bg-brand-danger/10 hover:bg-brand-danger/20 border border-brand-danger/20 rounded-xl transition-colors cursor-pointer"
                        onClick={() => onDeleteVehicle(vehicle.id)}
                        title="Delete Vehicle"
                      >
                        🗑️
                      </button>
                    </>
                  ) : (
                    <button
                      className="h-8 px-3 py-1 text-xs text-brand-green bg-brand-green/10 hover:bg-brand-green/20 border border-brand-green/20 rounded-xl transition-colors cursor-pointer font-bold"
                      onClick={() => onRestoreVehicle(vehicle.id)}
                    >
                      ♻️ Restore
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-secondary">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredVehicles.length)} of {filteredVehicles.length} vehicles
          </p>
          <div className="flex space-x-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex items-center text-xs font-semibold px-3 text-text-primary">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Vehicle Details Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedVehicle ? `${selectedVehicle.id} - ${selectedVehicle.name}` : ''}
        description={selectedVehicle ? `${selectedVehicle.category} Telemetry` : ''}
      >
        {selectedVehicle && (
          <div className="space-y-4">
            {selectedVehicle.vehicleImageUrl && (
              <div className="w-full h-40 bg-bg-secondary/50 rounded-xl overflow-hidden border border-border-primary flex items-center justify-center">
                <img src={selectedVehicle.vehicleImageUrl} alt={selectedVehicle.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 border-b border-border-primary/50 pb-4">
              {selectedVehicle.registrationNumber && (
                <div>
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Registration</span>
                  <p className="text-sm font-bold text-text-primary mt-0.5">{selectedVehicle.registrationNumber}</p>
                </div>
              )}
              {selectedVehicle.chassisNumber && (
                <div>
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Chassis Number</span>
                  <p className="text-sm font-bold text-text-primary mt-0.5 font-mono">{selectedVehicle.chassisNumber}</p>
                </div>
              )}
              <div>
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Payload Capacity</span>
                <p className="text-sm font-bold text-text-primary mt-0.5">{selectedVehicle.capacity}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Current Odometer</span>
                <p className="text-sm font-bold text-text-primary mt-0.5 font-mono">{selectedVehicle.odometer.toLocaleString()} km</p>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Fuel/Power Type</span>
                <p className="text-sm font-bold text-text-primary mt-0.5">{selectedVehicle.fuelType}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Avg Efficiency</span>
                <p className="text-sm font-bold text-brand-green mt-0.5 font-mono">{selectedVehicle.fuelEfficiency}</p>
              </div>
            </div>

            <div className="border-b border-border-primary/50 pb-4">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Service History Dates</span>
              <div className="flex justify-between items-center mt-1">
                <div>
                  <span className="text-xs text-text-secondary">Last Inspected</span>
                  <p className="text-xs font-semibold text-text-primary mt-0.5">{selectedVehicle.lastService}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-text-secondary">Next Service Due</span>
                  <p className="text-xs font-semibold text-brand-warning mt-0.5">{selectedVehicle.nextService}</p>
                </div>
              </div>
            </div>

            {/* Maintenance Log */}
            <div>
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide block mb-2">Maintenance History</span>
              {selectedMaintenance.length === 0 ? (
                <p className="text-xs text-text-secondary">No recorded active service logs.</p>
              ) : (
                <div className="space-y-2">
                  {selectedMaintenance.map((record) => (
                    <div key={record.id} className="flex justify-between items-center text-xs p-2.5 rounded-lg border border-border-primary bg-bg-secondary/10">
                      <div>
                        <span className="font-bold text-text-primary">{record.type}</span>
                        <div className="flex items-center space-x-1.5 text-text-secondary text-[10px] mt-0.5">
                          <span>{record.date}</span>
                          <span>•</span>
                          <span>{record.workshop}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-text-primary">${record.cost}</span>
                        <div className="mt-0.5">
                          <Badge variant={record.status === 'Completed' ? 'success' : record.status === 'In Progress' ? 'warning' : 'neutral'}>
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-2">
              <Button onClick={() => setIsModalOpen(false)}>Close Details</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Add Vehicle Modal */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Fleet Vehicle"
        description="Register a new cargo vehicle in the operations registry."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Vehicle ID *</label>
              <input
                type="text"
                placeholder="e.g. Van-09"
                required
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newVehicle.id}
                onChange={(e) => setNewVehicle({ ...newVehicle, id: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Model Name *</label>
              <input
                type="text"
                placeholder="e.g. Tesla Semi"
                required
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newVehicle.name}
                onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Fuel Type</label>
              <select
                className="rounded-xl border border-border-primary bg-bg-card text-sm text-text-primary px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-green"
                value={newVehicle.fuelType}
                onChange={(e) => setNewVehicle({ 
                  ...newVehicle, 
                  fuelType: e.target.value as Vehicle['fuelType'],
                  category: e.target.value === 'Electric' ? 'Electric Van' : 'Heavy Duty Diesel',
                  fuelEfficiency: e.target.value === 'Electric' ? '25 kWh/100km' : '32 L/100km'
                })}
              >
                <option value="Electric">Electric (Low Carbon)</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Payload Capacity</label>
              <input
                type="text"
                placeholder="e.g. 1,500 kg"
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newVehicle.capacity}
                onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Initial Odometer (km)</label>
              <input
                type="number"
                placeholder="0"
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newVehicle.odometer || ''}
                onChange={(e) => setNewVehicle({ ...newVehicle, odometer: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Fuel Efficiency</label>
              <input
                type="text"
                placeholder="e.g. 24 kWh/100km"
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newVehicle.fuelEfficiency}
                onChange={(e) => setNewVehicle({ ...newVehicle, fuelEfficiency: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Registration Number</label>
              <input
                type="text"
                placeholder="e.g. CA-12345"
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newVehicle.registrationNumber || ''}
                onChange={(e) => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Chassis Number</label>
              <input
                type="text"
                placeholder="e.g. VIN123456789"
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newVehicle.chassisNumber || ''}
                onChange={(e) => setNewVehicle({ ...newVehicle, chassisNumber: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1 col-span-2">
              <label className="text-xs text-text-secondary font-bold uppercase">Vehicle Image URL</label>
              <input
                type="text"
                placeholder="https://example.com/image.png"
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newVehicle.vehicleImageUrl || ''}
                onChange={(e) => setNewVehicle({ ...newVehicle, vehicleImageUrl: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Register Vehicle</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
