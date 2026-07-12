import { useState } from 'react';
import type { MaintenanceRecord, Vehicle } from '../data/mockData';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { 
  Wrench, DollarSign, Calendar, 
  MapPin, Plus, ClipboardList, Check 
} from 'lucide-react';

interface MaintenancePageProps {
  maintenance: MaintenanceRecord[];
  setMaintenance: React.Dispatch<React.SetStateAction<MaintenanceRecord[]>>;
  vehicles: Vehicle[];
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({
  maintenance,
  setMaintenance,
  vehicles
}) => {
  const records = maintenance;
  const setRecords = setMaintenance;
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // Modal details
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Maintenance record form modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<MaintenanceRecord>>({
    id: '',
    vehicleId: 'Van-01',
    type: '',
    status: 'Scheduled',
    cost: 0,
    date: new Date().toISOString().split('T')[0],
    workshop: '',
    urgency: 'Medium',
    notes: ''
  });

  const getVehicleName = (vehicleId: string) => {
    const v = vehicles.find(item => item.id === vehicleId);
    return v ? v.name : vehicleId;
  };

  const getUrgencyBadge = (urgency: MaintenanceRecord['urgency']) => {
    switch (urgency) {
      case 'High':
        return <Badge variant="danger">High Priority</Badge>;
      case 'Medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'Low':
        return <Badge variant="neutral">Routine</Badge>;
    }
  };

  const getStatusBadge = (status: MaintenanceRecord['status']) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'In Progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'Scheduled':
        return <Badge variant="neutral">Scheduled</Badge>;
    }
  };

  const handleResolveRecord = (id: string) => {
    setRecords(prev => prev.map(rec => 
      rec.id === id ? { ...rec, status: 'Completed' as const } : rec
    ));
    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord(prev => prev ? { ...prev, status: 'Completed' as const } : null);
    }
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.type || !newRecord.workshop) return;
    const item: MaintenanceRecord = {
      id: `M-${Math.floor(100 + Math.random() * 900)}`,
      vehicleId: newRecord.vehicleId || 'Van-01',
      type: newRecord.type || '',
      status: newRecord.status as MaintenanceRecord['status'] || 'Scheduled',
      cost: newRecord.cost || 0,
      date: newRecord.date || '',
      workshop: newRecord.workshop || '',
      urgency: newRecord.urgency as MaintenanceRecord['urgency'] || 'Medium',
      notes: newRecord.notes || ''
    };
    setRecords([item, ...records]);
    setIsAddOpen(false);
    // Reset Form
    setNewRecord({
      id: '',
      vehicleId: 'Van-01',
      type: '',
      status: 'Scheduled',
      cost: 0,
      date: new Date().toISOString().split('T')[0],
      workshop: '',
      urgency: 'Medium',
      notes: ''
    });
  };

  const filteredRecords = records.filter(r => filterStatus === 'All' || r.status === filterStatus);

  // Summary figures
  const totalCost = records.filter(r => r.status === 'Completed').reduce((sum, r) => sum + r.cost, 0);
  const activeInShop = records.filter(r => r.status === 'In Progress').length;
  const scheduledInspections = records.filter(r => r.status === 'Scheduled').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Maintenance Logs</h1>
          <p className="text-text-secondary text-sm">Schedule inspections, repair tasks, safety updates, and expense tallies.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="flex items-center space-x-1.5 self-start">
          <Plus className="h-4 w-4" />
          <span>Log Maintenance</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Completed Repairs Value</span>
              <h3 className="text-2xl font-black text-text-primary mt-1">${totalCost.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-brand-green/10 rounded-xl text-brand-green">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Vehicles In Shop</span>
              <h3 className="text-2xl font-black text-brand-warning mt-1">{activeInShop} active</h3>
            </div>
            <div className="p-2.5 bg-brand-warning/10 rounded-xl text-brand-warning">
              <Wrench className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Scheduled Inspections</span>
              <h3 className="text-2xl font-black text-brand-info mt-1">{scheduledInspections} pending</h3>
            </div>
            <div className="p-2.5 bg-brand-info/10 rounded-xl text-brand-info">
              <ClipboardList className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1.5 p-1 bg-bg-secondary rounded-xl max-w-sm">
        {['All', 'Scheduled', 'In Progress', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              (tab === 'All' ? filterStatus === 'All' : filterStatus === tab)
                ? 'bg-bg-card text-text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid list of maintenance logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecords.map((record) => (
          <Card key={record.id} hoverEffect className="border-border-primary/80 flex flex-col justify-between">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-text-primary">{record.id}</span>
                    <span className="text-xs text-text-secondary font-mono">({record.vehicleId})</span>
                  </div>
                  <h4 className="font-extrabold text-base text-text-primary mt-1">{record.type}</h4>
                </div>
                <div className="flex flex-col items-end space-y-1.5">
                  {getStatusBadge(record.status)}
                  {getUrgencyBadge(record.urgency)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-border-primary/40">
                <div>
                  <span className="text-text-secondary block">Workshop</span>
                  <div className="flex items-center space-x-1 mt-0.5 text-text-primary font-semibold">
                    <MapPin className="h-3.5 w-3.5 text-text-secondary" />
                    <span>{record.workshop}</span>
                  </div>
                </div>
                <div>
                  <span className="text-text-secondary block">Repair Cost</span>
                  <p className="font-bold text-text-primary mt-0.5 font-mono text-sm">${record.cost.toLocaleString()}</p>
                </div>
              </div>

              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                {record.notes}
              </p>
            </CardContent>

            <div className="flex items-center justify-between border-t border-border-primary/40 pt-4 mt-4">
              <div className="flex items-center space-x-1 text-xs text-text-secondary">
                <Calendar className="h-3.5 w-3.5" />
                <span>Due: {record.date}</span>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs font-semibold"
                  onClick={() => {
                    setSelectedRecord(record);
                    setIsModalOpen(true);
                  }}
                >
                  Inspect
                </Button>
                {record.status !== 'Completed' && (
                  <Button 
                    size="sm" 
                    className="h-8 text-xs bg-brand-green hover:bg-brand-green/90 text-white font-semibold flex items-center space-x-1"
                    onClick={() => handleResolveRecord(record.id)}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Done</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Record Inspect Details Dialog */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRecord ? `Service ID: ${selectedRecord.id}` : ''}
        description={selectedRecord ? `Log for ${getVehicleName(selectedRecord.vehicleId)}` : ''}
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 border-b border-border-primary/50 pb-4">
              <div>
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Vehicle Code</span>
                <p className="text-sm font-bold text-text-primary mt-0.5">{selectedRecord.vehicleId}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Workshop Name</span>
                <p className="text-sm font-bold text-text-primary mt-0.5">{selectedRecord.workshop}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Estimated Cost</span>
                <p className="text-sm font-bold text-text-primary mt-0.5 font-mono">${selectedRecord.cost}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Log Date</span>
                <p className="text-sm font-bold text-text-primary mt-0.5">{selectedRecord.date}</p>
              </div>
            </div>

            <div className="space-y-2 border-b border-border-primary/50 pb-4">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide block">Priority & Status</span>
              <div className="flex space-x-2">
                {getStatusBadge(selectedRecord.status)}
                {getUrgencyBadge(selectedRecord.urgency)}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide block">Diagnostics / Notes</span>
              <p className="text-xs text-text-secondary leading-relaxed bg-bg-secondary/20 border border-border-primary/50 p-3 rounded-xl">
                {selectedRecord.notes}
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-border-primary/40">
              {selectedRecord.status !== 'Completed' && (
                <Button 
                  className="bg-brand-green hover:bg-brand-green/90 text-white font-semibold"
                  onClick={() => handleResolveRecord(selectedRecord.id)}
                >
                  Mark Completed
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close Log</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Add Maintenance record Dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule Repair Job"
        description="Add a diagnostic task or scheduled inspection for active vehicles."
      >
        <form onSubmit={handleAddRecord} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Assign Vehicle *</label>
              <select
                className="rounded-xl border border-border-primary bg-bg-card text-sm text-text-primary px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-green"
                value={newRecord.vehicleId}
                onChange={(e) => setNewRecord({ ...newRecord, vehicleId: e.target.value })}
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.id} - {v.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Inspection / Task Type *</label>
              <input
                type="text"
                placeholder="e.g. Brake Replacement"
                required
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newRecord.type}
                onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Workshop Name *</label>
              <input
                type="text"
                placeholder="e.g. SafeStop Brake Co."
                required
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newRecord.workshop}
                onChange={(e) => setNewRecord({ ...newRecord, workshop: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Estimated Cost (USD)</label>
              <input
                type="number"
                placeholder="0"
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newRecord.cost || ''}
                onChange={(e) => setNewRecord({ ...newRecord, cost: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Urgency Priority</label>
              <select
                className="rounded-xl border border-border-primary bg-bg-card text-sm text-text-primary px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-green"
                value={newRecord.urgency}
                onChange={(e) => setNewRecord({ ...newRecord, urgency: e.target.value as any })}
              >
                <option value="Low">Low (Routine)</option>
                <option value="Medium">Medium</option>
                <option value="High">High Priority</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Scheduled Date</label>
              <input
                type="date"
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newRecord.date}
                onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <label className="text-xs text-text-secondary font-bold uppercase">Diagnostics Details / Notes</label>
            <textarea
              placeholder="Provide diagnostic insights or details of reported vehicle errors..."
              rows={3}
              className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green resize-y"
              value={newRecord.notes}
              onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Log Schedule</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
