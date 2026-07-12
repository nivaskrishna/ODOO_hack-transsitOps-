export interface Vehicle {
  id: string;
  name: string;
  category: 'Electric Van' | 'Heavy Duty Diesel' | 'Hybrid Cargo' | 'Light Courier';
  capacity: string;
  odometer: number;
  status: 'Active' | 'Maintenance' | 'Out of Service';
  fuelType: 'Electric' | 'Diesel' | 'Hybrid';
  fuelEfficiency: string; // e.g. "18 kWh/100km" or "8.5 L/100km"
  lastService: string;
  nextService: string;
  vehicleImageUrl?: string;
  registrationNumber?: string;
  chassisNumber?: string;
  isDeleted?: boolean;
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  safetyScore: number;
  licenseStatus: 'Valid' | 'Expiring Soon' | 'Expired';
  licenseExpiry: string;
  contact: string;
  availability: 'Available' | 'On Trip' | 'Off Duty';
  tripsCompleted: number;
  password?: string;
  needsPasswordChange?: boolean;
  isDeleted?: boolean;
  isBlocked?: boolean;
  blockedReason?: string;
  photoUrl?: string;
  licensePhotoUrl?: string;
  aadhaarCardUrl?: string;
  panCardUrl?: string;
  personalEmail?: string;
  phoneNumber?: string;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  startLocation: string;
  endLocation: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed' | 'Pending Completion';
  progress: number; // 0 to 100
  distance: number; // km
  departureTime: string;
  arrivalTime: string;
  eta: string;
  route: { name: string; coordinates: [number, number][] }; // mock coordinates for visual path
  timeline: {
    time: string;
    status: string;
    location: string;
    description: string;
  }[];
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  cost: number;
  date: string;
  workshop: string;
  urgency: 'Low' | 'Medium' | 'High';
  notes: string;
}

export interface ExpenseRecord {
  id: string;
  vehicleId: string;
  date: string;
  category: 'Fuel' | 'Tolls' | 'Maintenance' | 'Insurance' | 'Driver Payout';
  amount: number;
  description: string;
}

export interface CopilotInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  message: string;
  category: 'Maintenance' | 'Fuel' | 'Driver' | 'Utilization' | 'Optimization';
  recommendation: string;
}

export interface SystemNotification {
  id: string;
  type: 'license' | 'maintenance' | 'trip' | 'vehicle';
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

export const mockVehicles: Vehicle[] = [
  { id: 'Van-01', name: 'Rivian EDV 500', category: 'Electric Van', capacity: '1,200 kg', odometer: 24500, status: 'Active', fuelType: 'Electric', fuelEfficiency: '22 kWh/100km', lastService: '2026-05-10', nextService: '2026-11-10' },
  { id: 'Truck-02', name: 'Volvo FH Electric', category: 'Electric Van', capacity: '18,000 kg', odometer: 48900, status: 'Active', fuelType: 'Electric', fuelEfficiency: '110 kWh/100km', lastService: '2026-06-01', nextService: '2026-12-01' },
  { id: 'Van-03', name: 'Ford E-Transit', category: 'Light Courier', capacity: '1,600 kg', odometer: 15300, status: 'Maintenance', fuelType: 'Electric', fuelEfficiency: '29 kWh/100km', lastService: '2026-02-15', nextService: '2026-07-20' },
  { id: 'Truck-04', name: 'Scania R500 Diesel', category: 'Heavy Duty Diesel', capacity: '24,000 kg', odometer: 142100, status: 'Active', fuelType: 'Diesel', fuelEfficiency: '31.2 L/100km', lastService: '2026-04-18', nextService: '2026-08-18' },
  { id: 'Van-05', name: 'Mercedes eSprinter', category: 'Electric Van', capacity: '1,400 kg', odometer: 8200, status: 'Active', fuelType: 'Electric', fuelEfficiency: '27 kWh/100km', lastService: '2026-06-10', nextService: '2026-12-10' },
  { id: 'Truck-06', name: 'Hino 195 Hybrid', category: 'Hybrid Cargo', capacity: '4,500 kg', odometer: 67300, status: 'Active', fuelType: 'Hybrid', fuelEfficiency: '14.5 L/100km', lastService: '2026-03-22', nextService: '2026-09-22' },
  { id: 'Truck-07', name: 'Peterbilt 579', category: 'Heavy Duty Diesel', capacity: '26,000 kg', odometer: 210600, status: 'Out of Service', fuelType: 'Diesel', fuelEfficiency: '34.8 L/100km', lastService: '2026-01-05', nextService: '2026-07-05' },
  { id: 'Van-08', name: 'BrightDrop Zevo 600', category: 'Electric Van', capacity: '1,500 kg', odometer: 11400, status: 'Active', fuelType: 'Electric', fuelEfficiency: '24 kWh/100km', lastService: '2026-06-25', nextService: '2026-12-25' }
];

export const mockDrivers: Driver[] = [
  { id: 'D-01', name: 'Alex Mercer', avatar: 'AM', safetyScore: 98, licenseStatus: 'Valid', licenseExpiry: '2029-04-12', contact: '+1 (555) 019-2834', availability: 'Available', tripsCompleted: 342, password: 'driver123', needsPasswordChange: true },
  { id: 'D-02', name: 'Sarah Connor', avatar: 'SC', safetyScore: 94, licenseStatus: 'Valid', licenseExpiry: '2028-11-09', contact: '+1 (555) 014-9821', availability: 'On Trip', tripsCompleted: 512, password: 'driver123', needsPasswordChange: true },
  { id: 'D-03', name: 'Marcus Aurelius', avatar: 'MA', safetyScore: 89, licenseStatus: 'Expiring Soon', licenseExpiry: '2026-07-28', contact: '+1 (555) 018-7253', availability: 'Available', tripsCompleted: 189, password: 'driver123', needsPasswordChange: true },
  { id: 'D-04', name: 'Elena Rostova', avatar: 'ER', safetyScore: 96, licenseStatus: 'Valid', licenseExpiry: '2030-01-15', contact: '+1 (555) 012-3498', availability: 'On Trip', tripsCompleted: 275, password: 'driver123', needsPasswordChange: true },
  { id: 'D-05', name: 'James Carter', avatar: 'JC', safetyScore: 78, licenseStatus: 'Valid', licenseExpiry: '2027-05-20', contact: '+1 (555) 017-4321', availability: 'Off Duty', tripsCompleted: 88, password: 'driver123', needsPasswordChange: true },
  { id: 'D-06', name: 'Li Wei', avatar: 'LW', safetyScore: 91, licenseStatus: 'Expired', licenseExpiry: '2026-06-30', contact: '+1 (555) 015-8822', availability: 'Off Duty', tripsCompleted: 420, password: 'driver123', needsPasswordChange: true }
];

export const mockTrips: Trip[] = [
  {
    id: 'TR-1001',
    vehicleId: 'Van-01',
    driverId: 'D-01',
    startLocation: 'Mumbai Hub A',
    endLocation: 'Delhi Depot',
    status: 'In Progress',
    progress: 65,
    distance: 1420,
    departureTime: '2026-07-12T07:30:00Z',
    arrivalTime: '2026-07-12T11:45:00Z',
    eta: '4.5 hours remaining',
    route: {
      name: 'NH-48 Golden Quadrilateral',
      coordinates: [[19.0760, 72.8777], [22.3072, 73.1812], [26.9124, 75.7873], [28.6139, 77.2090]]
    },
    timeline: [
      { time: '07:30 AM', status: 'Departed Mumbai', location: 'Mumbai Hub A', description: 'Vehicle loaded and security checks passed.' },
      { time: '08:45 AM', status: 'Passed Thane', location: 'NH-48 Odometer', description: 'Driving smoothly in low-traffic conditions.' },
      { time: '09:50 AM', status: 'Charging Stop', location: 'Surat Fast Charger', description: 'Fast charged battery from 25% to 80% (20 mins).' },
      { time: '10:15 AM', status: 'Resumed Trip', location: 'Surat Depot', description: 'Departed charger, driving towards Delhi.' }
    ]
  },
  {
    id: 'TR-1002',
    vehicleId: 'Truck-02',
    driverId: 'D-04',
    startLocation: 'Bengaluru Distribution',
    endLocation: 'Chennai Terminal',
    status: 'In Progress',
    progress: 30,
    distance: 350,
    departureTime: '2026-07-12T05:00:00Z',
    arrivalTime: '2026-07-12T13:30:00Z',
    eta: '2.5 hours remaining',
    route: {
      name: 'NH-75 Expressway',
      coordinates: [[12.9716, 77.5946], [12.8617, 78.4729], [12.9796, 79.1344], [13.0827, 80.2707]]
    },
    timeline: [
      { time: '05:00 AM', status: 'Departed Terminal', location: 'Bengaluru', description: 'Interstate transport initialized. Fully loaded payload.' },
      { time: '08:12 AM', status: 'Check-point Passed', location: 'Vellore Bypass', description: 'Odometer tracking normal. Temperature range stable.' }
    ]
  },
  {
    id: 'TR-1003',
    vehicleId: 'Van-05',
    driverId: 'D-02',
    startLocation: 'Hyderabad Hub',
    endLocation: 'Bengaluru Distribution',
    status: 'Completed',
    progress: 100,
    distance: 575,
    departureTime: '2026-07-12T06:00:00Z',
    arrivalTime: '2026-07-12T08:15:00Z',
    eta: 'Delivered',
    route: {
      name: 'NH-44 Corridor',
      coordinates: [[17.3850, 78.4867], [15.8281, 78.0373], [14.6819, 77.6006], [12.9716, 77.5946]]
    },
    timeline: [
      { time: '06:00 AM', status: 'Departed Depot', location: 'Hyderabad Hub', description: 'Local courier run started.' },
      { time: '07:05 AM', status: 'Deliveries Made', location: 'Kurnool Center', description: 'Dropped off packages at first 3 locations.' },
      { time: '08:15 AM', status: 'Completed Run', location: 'Bengaluru Terminal', description: 'All items successfully signed off.' }
    ]
  },
  {
    id: 'TR-1004',
    vehicleId: 'Truck-04',
    driverId: 'D-03',
    startLocation: 'Delhi Depot',
    endLocation: 'Kolkata Cargo',
    status: 'Scheduled',
    progress: 0,
    distance: 1490,
    departureTime: '2026-07-12T13:00:00Z',
    arrivalTime: '2026-07-12T18:30:00Z',
    eta: 'Scheduled 1:00 PM',
    route: {
      name: 'AH1 East-West Corridor',
      coordinates: [[28.6139, 77.2090], [25.3176, 82.9739], [22.5726, 88.3639]]
    },
    timeline: [
      { time: 'Pending', status: 'Pre-Trip Inspection', location: 'Delhi Depot', description: 'Awaiting driver check-in.' }
    ]
  }
];

export const mockMaintenance: MaintenanceRecord[] = [
  { id: 'M-101', vehicleId: 'Van-03', type: 'Battery Diagnostics', status: 'In Progress', cost: 450, date: '2026-07-10', workshop: 'EcoCharge Garage', urgency: 'High', notes: 'Thermal sensors reported irregular heating in Module B. Cell diagnostics running.' },
  { id: 'M-102', vehicleId: 'Truck-07', type: 'Transmission Overhaul', status: 'In Progress', cost: 4200, date: '2026-07-08', workshop: 'Western Fleet Service', urgency: 'High', notes: 'Gear slippage reported by driver. Complete rebuild of hydraulic gearbox required.' },
  { id: 'M-103', vehicleId: 'Truck-04', type: 'Brake Pad Replacement', status: 'Scheduled', cost: 650, date: '2026-07-15', workshop: 'SafeStop Brake Co.', urgency: 'Medium', notes: 'Scheduled replacement for front pad assemblies based on wear-level metrics.' },
  { id: 'M-104', vehicleId: 'Van-01', type: 'Routine Safety Inspection', status: 'Completed', cost: 180, date: '2026-05-10', workshop: 'City Fleet Care', urgency: 'Low', notes: 'Standard 20k checkup. Alignment corrected, fluids topped off.' }
];

export const mockExpenses: ExpenseRecord[] = [
  { id: 'E-501', vehicleId: 'Truck-04', date: '2026-07-11', category: 'Fuel', amount: 380, description: 'Diesel refueling 110 Gallons - Fresno Station' },
  { id: 'E-502', vehicleId: 'Van-01', date: '2026-07-11', category: 'Fuel', amount: 45, description: 'DC Fast Charge 90kWh - Olympia Station' },
  { id: 'E-503', vehicleId: 'Truck-02', date: '2026-07-10', category: 'Tolls', amount: 85, description: 'Interstate Toll Fees - Golden Gate & I-80' },
  { id: 'E-504', vehicleId: 'Truck-07', date: '2026-07-09', category: 'Maintenance', amount: 1200, description: 'Deposit for Transmission Overhaul' },
  { id: 'E-505', vehicleId: 'Van-05', date: '2026-07-08', category: 'Driver Payout', amount: 320, description: 'Vancouver-Richmond delivery payout' },
  { id: 'E-506', vehicleId: 'Truck-04', date: '2026-07-07', category: 'Insurance', amount: 450, description: 'Monthly commercial vehicle policy premium' }
];

export const mockCopilotInsights: CopilotInsight[] = [
  {
    id: 'insight-1',
    type: 'warning',
    category: 'Maintenance',
    message: '3 vehicles require maintenance soon.',
    recommendation: 'Van-03 and Truck-07 are currently in workshop. Truck-04 brakes are scheduled in 3 days. Recommend updating dispatch queue.'
  },
  {
    id: 'insight-2',
    type: 'alert',
    category: 'Fuel',
    message: 'Fuel consumption increased by 8% this week.',
    recommendation: 'Mainly driven by Scania Diesel Truck-04 climbing high altitudes. Shift routes to I-5 bypass to improve fleet efficiency by 3.2%.'
  },
  {
    id: 'insight-3',
    type: 'success',
    category: 'Driver',
    message: 'Driver Alex Mercer has the highest safety score (98).',
    recommendation: 'Excellent eco-driving stats. Recommend assign Alex to the critical Seattle-Portland delivery to maximize fuel efficiency.'
  },
  {
    id: 'insight-4',
    type: 'info',
    category: 'Utilization',
    message: 'Fleet utilization dropped by 4% this week.',
    recommendation: 'Due to off-service trucks. Re-allocate 2 scheduled local trips to Mercedes eSprinter Van-05 to capitalize on city lanes.'
  },
  {
    id: 'insight-5',
    type: 'success',
    category: 'Optimization',
    message: 'Recommend assigning Van-05 to the next trip.',
    recommendation: 'Van-05 (Rivian EDV) is at 100% SoC and has no schedules for the next 12 hours. Assigning to local courier runs will save $140 in diesel.'
  }
];

export const mockNotifications: SystemNotification[] = [
  { id: 'N-001', type: 'license', title: 'License Expiry Warning', message: 'Driver Marcus Aurelius license expires in 16 days (2026-07-28).', time: '10 mins ago', unread: true },
  { id: 'N-002', type: 'maintenance', title: 'Battery Overheating Alert', message: 'Van-03 thermal sensors flagged high battery module temperatures.', time: '1 hour ago', unread: true },
  { id: 'N-003', type: 'trip', title: 'Trip TR-1003 Completed', message: 'Driver Sarah Connor completed Richmond Local delivery run.', time: '2 hours ago', unread: false },
  { id: 'N-004', type: 'vehicle', title: 'Vehicle Flagged Off-service', message: 'Peterbilt Truck-07 moved to Out of Service due to gearbox fault.', time: '4 hours ago', unread: false }
];
