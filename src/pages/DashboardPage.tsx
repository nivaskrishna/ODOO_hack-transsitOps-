import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { MiniTrend } from '../components/MiniTrend';
import type { Trip, Vehicle, Driver, ExpenseRecord } from '../data/mockData';
import { Dialog } from '../components/Dialog';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  TrendingUp, Users, Truck, DollarSign, Leaf,
  ArrowRight, ShieldCheck, MapPin, Navigation, Clock 
} from 'lucide-react';
const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  'Mumbai Hub A': { lat: 19.0760, lon: 72.8777 },
  'Delhi Depot': { lat: 28.6139, lon: 77.2090 },
  'Bengaluru Distribution': { lat: 12.9716, lon: 77.5946 },
  'Chennai Terminal': { lat: 13.0827, lon: 80.2707 },
  'Kolkata Cargo': { lat: 22.5726, lon: 88.3639 },
  'Hyderabad Hub': { lat: 17.3850, lon: 78.4867 },
  'Pune Depot': { lat: 18.5204, lon: 73.8567 },
  'Ahmedabad Depot': { lat: 23.0225, lon: 72.5714 }
};

const calculateHaversineDistance = (city1: string, city2: string): number => {
  const coord1 = CITY_COORDINATES[city1];
  const coord2 = CITY_COORDINATES[city2];
  if (!coord1 || !coord2) return 150;
  const R = 6371; // km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lon - coord1.lon) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
};
interface DashboardPageProps {
  onNavigate: (tab: string) => void;
  onSelectTrip: (trip: Trip) => void;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  expenses: ExpenseRecord[];
  onDispatchTrip: (tripData: {
    vehicleId: string;
    driverId: string;
    startLocation: string;
    endLocation: string;
    routeName: string;
    distance: number;
  }) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onNavigate, 
  onSelectTrip,
  vehicles,
  drivers,
  trips,
  expenses,
  onDispatchTrip
}) => {
  // Centralized calculations
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'Active').length;
  const utilizationRate = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;
  
  const totalDrivers = drivers.length;
  const availableDrivers = drivers.filter(d => d.availability === 'Available').length;
  
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Dispatch Dialog State
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [dispatchData, setDispatchData] = useState({
    vehicleId: '',
    driverId: '',
    startLocation: 'Mumbai Hub A',
    endLocation: 'Delhi Depot',
    routeName: 'Mumbai to Delhi Direct Route',
    distance: 1420
  });

  // Calculate Geolocation distance reactively
  useEffect(() => {
    if (dispatchData.startLocation && dispatchData.endLocation) {
      const dist = calculateHaversineDistance(dispatchData.startLocation, dispatchData.endLocation);
      const cleanStart = dispatchData.startLocation.split(' ')[0];
      const cleanEnd = dispatchData.endLocation.split(' ')[0];
      setDispatchData(prev => ({
        ...prev,
        distance: dist,
        routeName: `${cleanStart} to ${cleanEnd} Direct Route`
      }));
    }
  }, [dispatchData.startLocation, dispatchData.endLocation]);

  const availableVehicles = vehicles.filter(v => v.status === 'Active');
  const availDrivers = drivers.filter(d => d.availability === 'Available');

  // Auto-select first available items when modal opens
  useEffect(() => {
    if (isDispatchOpen) {
      setDispatchData(prev => ({
        ...prev,
        vehicleId: availableVehicles[0]?.id || '',
        driverId: availDrivers[0]?.id || ''
      }));
    }
  }, [isDispatchOpen]);

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchData.vehicleId || !dispatchData.driverId) return;
    onDispatchTrip(dispatchData);
    setIsDispatchOpen(false);
  };
  
  // High-fidelity chart datasets
  const activeWeeklyData = [
    { name: 'Mon', Completed: 3, Scheduled: 4 },
    { name: 'Tue', Completed: 5, Scheduled: 5 },
    { name: 'Wed', Completed: 4, Scheduled: 6 },
    { name: 'Thu', Completed: 6, Scheduled: 5 },
    { name: 'Fri', Completed: 7, Scheduled: 8 },
    { name: 'Sat', Completed: 4, Scheduled: 5 },
    { name: 'Sun', Completed: 3, Scheduled: 3 }
  ];

  const financialData = [
    { name: 'May', Revenue: 14200, Expenses: 8900 },
    { name: 'Jun', Revenue: 17500, Expenses: 10400 },
    { name: 'Jul', Revenue: 21900, Expenses: 12300 }
  ];

  const fleetEnergyData = [
    { name: 'Electric', value: 5, color: '#00B67A' },
    { name: 'Diesel', value: 2, color: '#1A252C' },
    { name: 'Hybrid', value: 1, color: '#3B82F6' }
  ];

  const fuelCostTrend = [
    { day: 'Mon', ElectricCost: 95, DieselCost: 310 },
    { day: 'Tue', ElectricCost: 110, DieselCost: 290 },
    { day: 'Wed', ElectricCost: 85, DieselCost: 350 },
    { day: 'Thu', ElectricCost: 130, DieselCost: 380 },
    { day: 'Fri', ElectricCost: 120, DieselCost: 320 },
    { day: 'Sat', ElectricCost: 75, DieselCost: 180 },
    { day: 'Sun', ElectricCost: 60, DieselCost: 120 }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
            Fleet Overview
          </h1>
          <p className="text-text-secondary text-sm">
            Sustainable operations dashboard. Real-time telemetry, routing, & intelligence.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => setIsDispatchOpen(true)}>
            Dispatch Route
          </Button>
          <Button size="sm" className="bg-brand-green hover:bg-brand-green/90" onClick={() => onNavigate('Vehicles')}>
            View Fleet
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Card variant="glass" hoverEffect onClick={() => onNavigate('Vehicles')}>
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Fleet Utilization</p>
              <h3 className="text-2xl font-black text-text-primary mt-1">{utilizationRate}%</h3>
              <p className="text-xs text-brand-success font-medium flex items-center mt-2">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.5% vs last week
              </p>
            </div>
            <div className="flex flex-col items-end justify-between h-16">
              <div className="p-2 bg-brand-green/10 rounded-xl text-brand-green">
                <Truck className="h-5 w-5" />
              </div>
              <MiniTrend data={[88, 89, 90, 88, 91, 92]} color="#00B67A" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card variant="glass" hoverEffect onClick={() => onNavigate('Drivers')}>
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Drivers Active</p>
              <h3 className="text-2xl font-black text-text-primary mt-1">{totalDrivers - availableDrivers} / {totalDrivers}</h3>
              <p className="text-xs text-text-secondary font-medium flex items-center mt-2">
                <span className="h-2 w-2 rounded-full bg-brand-success mr-1.5 animate-pulse" />
                {availableDrivers} available
              </p>
            </div>
            <div className="flex flex-col items-end justify-between h-16">
              <div className="p-2 bg-brand-info/10 rounded-xl text-brand-info">
                <Users className="h-5 w-5" />
              </div>
              <MiniTrend data={[3, 4, 3, 5, 4, 5]} color="#3B82F6" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card variant="glass" hoverEffect onClick={() => onNavigate('Fuel & Expenses')}>
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Carbon Savings</p>
              <h3 className="text-2xl font-black text-brand-green mt-1">1.42 Tons</h3>
              <p className="text-xs text-brand-green font-medium flex items-center mt-2">
                <Leaf className="h-3.5 w-3.5 mr-1" />
                Equivalent to 64 trees
              </p>
            </div>
            <div className="flex flex-col items-end justify-between h-16">
              <div className="p-2 bg-brand-success/15 rounded-xl text-brand-success">
                <Leaf className="h-5 w-5" />
              </div>
              <MiniTrend data={[1.1, 1.2, 1.25, 1.3, 1.38, 1.42]} color="#22C55E" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card variant="glass" hoverEffect onClick={() => onNavigate('Fuel & Expenses')}>
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Monthly Expenses</p>
              <h3 className="text-2xl font-black text-text-primary mt-1">${totalExpenses.toLocaleString()}</h3>
              <p className="text-xs text-brand-danger font-medium flex items-center mt-2">
                +4.2% (maintenance due)
              </p>
            </div>
            <div className="flex flex-col items-end justify-between h-16">
              <div className="p-2 bg-brand-warning/10 rounded-xl text-brand-warning">
                <DollarSign className="h-5 w-5" />
              </div>
              <MiniTrend data={[5600, 5800, 6200, 6000, 6400, 6380]} color="#F59E0B" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activities Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fleet Activity Tracking</CardTitle>
            <CardDescription>Completed vs scheduled shipments over the current week</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeWeeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B67A" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00B67A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                <Area type="monotone" dataKey="Completed" stroke="#00B67A" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                <Area type="monotone" dataKey="Scheduled" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorScheduled)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fleet Energy Split Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Composition</CardTitle>
            <CardDescription>Energy source segmentation of active vehicles</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between">
            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetEnergyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={80}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {fleetEnergyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Vehicles`]} />
                </PieChart>
              </ResponsiveContainer>
              {/* Circular KPI indicators inside Pie */}
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-text-primary">62.5%</span>
                <p className="text-[10px] text-brand-green uppercase font-bold tracking-wider mt-0.5">Electric Core</p>
              </div>
            </div>
            {/* Legend Indicators */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2 border-t border-border-primary/50 pt-3">
              {fleetEnergyData.map((entry) => (
                <div key={entry.name}>
                  <div className="flex items-center justify-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="font-semibold text-text-primary">{entry.name}</span>
                  </div>
                  <span className="text-text-secondary text-[11px] mt-0.5 block">{entry.value} trucks</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses vs Revenue Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Operating Profitability</CardTitle>
            <CardDescription>Monthly financials comparison (USD)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => [`$${value}`]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Revenue" fill="#00B67A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#E7ECEF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fuel & Power cost trend Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Fuel & Power Cost Trend</CardTitle>
            <CardDescription>Comparison of charging costs vs diesel expenses (USD)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fuelCostTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => [`$${value}`]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="ElectricCost" name="Electric charging" stroke="#00B67A" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="DieselCost" name="Diesel refuel" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Panel: Recent Trips & Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips Table List */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border-primary/50 pb-4 mb-4">
            <div>
              <CardTitle>Active Shipments</CardTitle>
              <CardDescription>Live telemetry tracking for in-transit orders</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-brand-green font-semibold" onClick={() => onNavigate('Trips')}>
              See all trips
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-primary text-text-secondary font-semibold text-xs uppercase bg-bg-secondary/20">
                    <th className="p-4">Trip ID</th>
                    <th className="p-4">Route</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Progress</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary/40">
                  {trips.slice(0, 3).map((trip: Trip) => (
                    <tr key={trip.id} className="hover:bg-bg-secondary/10 transition-colors">
                      <td className="p-4 font-bold text-text-primary">{trip.id}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-text-primary font-medium">{trip.startLocation.split(' ')[0]}</span>
                          <span className="text-text-secondary">➔</span>
                          <span className="text-text-primary font-medium">{trip.endLocation.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={
                          trip.status === 'Completed' ? 'success' :
                          trip.status === 'In Progress' ? 'default' :
                          trip.status === 'Delayed' ? 'danger' : 'neutral'
                        }>
                          {trip.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-border-primary rounded-full h-1.5 overflow-hidden">
                            <div className="bg-brand-green h-1.5 rounded-full" style={{ width: `${trip.progress}%` }} />
                          </div>
                          <span className="text-xs font-bold text-text-secondary">{trip.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-brand-green font-semibold text-xs hover:bg-brand-green/5"
                          onClick={() => onSelectTrip(trip)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Fleet GIS Live Mock Preview */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Fleet GIS Center</CardTitle>
            <CardDescription>Active GPS signals Seattle-Portland corridor</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {/* Map Art representation */}
            <div className="relative h-44 bg-bg-secondary border border-border-primary rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-4">
              {/* Map background grids and tracks */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
              {/* Diagonal routes */}
              <svg className="absolute inset-0 w-full h-full text-border-primary stroke-current" fill="none">
                <path d="M 50,40 Q 150,100 200,80 T 350,150" strokeWidth="4" strokeLinecap="round" />
                <path d="M 50,40 Q 150,100 200,80 T 350,150" stroke="#00B67A" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" className="animate-[pulse_1.5s_infinite]" />
              </svg>
              
              {/* Vehicle indicators */}
              <div className="absolute left-[38%] top-[39%] translate-x-[-50%] translate-y-[-50%] flex flex-col items-center">
                <div className="bg-brand-green text-white p-1 rounded-full shadow-[0_0_12px_#00B67A] relative animate-bounce">
                  <Navigation className="h-3.5 w-3.5 rotate-90" />
                </div>
                <span className="bg-bg-card border border-border-primary text-[8px] font-bold px-1 py-0.5 rounded shadow mt-1 whitespace-nowrap">Van-01 (Active)</span>
              </div>

              <div className="absolute left-[70%] top-[68%] translate-x-[-50%] translate-y-[-50%] flex flex-col items-center">
                <div className="bg-brand-info text-white p-1 rounded-full shadow-[0_0_12px_#3B82F6] relative">
                  <Navigation className="h-3.5 w-3.5 rotate-180" />
                </div>
                <span className="bg-bg-card border border-border-primary text-[8px] font-bold px-1 py-0.5 rounded shadow mt-1 whitespace-nowrap">Truck-02 (Active)</span>
              </div>

              {/* Seattle and Portland tags */}
              <div className="absolute left-6 top-6 text-left flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-text-secondary" />
                <span className="text-[10px] font-bold text-text-secondary">Seattle</span>
              </div>
              <div className="absolute right-6 bottom-6 text-right flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-brand-green" />
                <span className="text-[10px] font-bold text-brand-green">Portland</span>
              </div>
            </div>

            {/* Metrics below map */}
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-1.5">
                  <Clock className="h-3.5 w-3.5 text-text-secondary" />
                  <span className="text-text-secondary">Next Delivery (TR-1001)</span>
                </div>
                <span className="font-bold text-text-primary">11:45 AM (45m)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-green" />
                  <span className="text-text-secondary">Signals Connection</span>
                </div>
                <Badge variant="success">Online</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dispatch Route Dialog */}
      <Dialog
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
        title="AI Optimized Dispatch Center"
        description="Configure route telemetry and assign an available vehicle and driver."
      >
        <form onSubmit={handleDispatchSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Start Hub Location</label>
              <select
                required
                className="rounded-xl border border-border-primary bg-bg-card text-sm text-text-primary px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-green"
                value={dispatchData.startLocation}
                onChange={(e) => setDispatchData({ ...dispatchData, startLocation: e.target.value })}
              >
                {Object.keys(CITY_COORDINATES).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Destination Hub</label>
              <select
                required
                className="rounded-xl border border-border-primary bg-bg-card text-sm text-text-primary px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-green"
                value={dispatchData.endLocation}
                onChange={(e) => setDispatchData({ ...dispatchData, endLocation: e.target.value })}
              >
                {Object.keys(CITY_COORDINATES).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Route Name</label>
              <input
                type="text"
                required
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={dispatchData.routeName}
                onChange={(e) => setDispatchData({ ...dispatchData, routeName: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Calculated Distance (km)</label>
              <input
                type="number"
                required
                readOnly
                className="rounded-xl border border-border-primary bg-bg-secondary text-sm text-text-secondary px-3 py-2 focus:outline-none cursor-not-allowed font-mono font-bold"
                value={dispatchData.distance}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Available Vehicle *</label>
              <select
                required
                className="rounded-xl border border-border-primary bg-bg-card text-sm text-text-primary px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-green"
                value={dispatchData.vehicleId}
                onChange={(e) => setDispatchData({ ...dispatchData, vehicleId: e.target.value })}
              >
                {availableVehicles.length === 0 ? (
                  <option value="">No Active Vehicles Available</option>
                ) : (
                  availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.id} - {v.name} ({v.fuelType})</option>
                  ))
                )}
              </select>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Available Driver *</label>
              <select
                required
                className="rounded-xl border border-border-primary bg-bg-card text-sm text-text-primary px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-green"
                value={dispatchData.driverId}
                onChange={(e) => setDispatchData({ ...dispatchData, driverId: e.target.value })}
              >
                {availDrivers.length === 0 ? (
                  <option value="">No Available Drivers</option>
                ) : (
                  availDrivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} (Safety: {d.safetyScore}%)</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {availableVehicles.length === 0 || availDrivers.length === 0 ? (
            <div className="p-3 bg-brand-danger/10 text-brand-danger rounded-xl text-xs font-semibold flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4" />
              <span>All drivers or vehicles are currently dispatched. Free up resources first.</span>
            </div>
          ) : null}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsDispatchOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={availableVehicles.length === 0 || availDrivers.length === 0}>
              Dispatch Route
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
