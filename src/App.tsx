import { useState, useEffect } from 'react';
import {
  mockCopilotInsights,
  mockNotifications,
  mockVehicles,
  mockDrivers,
  mockTrips,
  mockMaintenance,
  mockExpenses
} from './data/mockData';
import type {
  CopilotInsight,
  SystemNotification,
  Trip,
  Vehicle,
  Driver,
  MaintenanceRecord,
  ExpenseRecord
} from './data/mockData';
import { DashboardPage } from './pages/DashboardPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { DriversPage } from './pages/DriversPage';
import { TripsPage } from './pages/TripsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { FuelExpensesPage } from './pages/FuelExpensesPage';
import { LoginPage } from './pages/LoginPage';
import { DriverPortal } from './pages/DriverPortal';
import { NotificationCenter } from './components/NotificationCenter';
import { AICopilot } from './components/AICopilot';
import { Button } from './components/Button';
import {
  Sparkles, LayoutDashboard, Truck, Users, Map,
  Wrench, Wallet, Sun, Moon, Menu, CheckCircle2,
  Leaf, Info, X, ShieldAlert, LogOut
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface UserSession {
  email: string;
  role: 'manager' | 'driver';
  driverId?: string;
  name: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('transitops_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // centralized database states loaded from localStorage if present
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('transitops_vehicles');
    return saved ? JSON.parse(saved) : mockVehicles;
  });
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('transitops_drivers');
    return saved ? JSON.parse(saved) : mockDrivers;
  });
  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('transitops_trips');
    return saved ? JSON.parse(saved) : mockTrips;
  });
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(() => {
    const saved = localStorage.getItem('transitops_maintenance');
    return saved ? JSON.parse(saved) : mockMaintenance;
  });
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('transitops_expenses');
    return saved ? JSON.parse(saved) : mockExpenses;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('transitops_notifications');
    return saved ? JSON.parse(saved) : mockNotifications;
  });
  const [insights] = useState<CopilotInsight[]>(mockCopilotInsights);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Password state & verification handlers
  const [managerPassword, setManagerPassword] = useState<string>('manager123');

  const handleChangePassword = (email: string, newPass: string): boolean => {
    const emailLower = email.toLowerCase().trim();
    if (emailLower === 'manager@transitops.com') {
      setManagerPassword(newPass);
      showToast('Manager password updated!', 'success');
      return true;
    }

    const driverIndex = drivers.findIndex(d => {
      const isPersonalMatch = d.personalEmail && d.personalEmail.toLowerCase().trim() === emailLower;
      const idMatch = emailLower.includes(d.id.toLowerCase());
      const nameEmail = d.name.toLowerCase().replace(/\s+/g, '.');
      const nameMatch = emailLower.includes(nameEmail);
      const nameNoSpaces = d.name.toLowerCase().replace(/\s+/g, '');
      const nameNoSpacesMatch = emailLower.includes(nameNoSpaces);
      return isPersonalMatch || idMatch || nameMatch || nameNoSpacesMatch;
    });

    if (driverIndex === -1) {
      return false;
    }

    setDrivers(prev => prev.map((d, idx) => {
      if (idx === driverIndex) {
        return { ...d, password: newPass, needsPasswordChange: false };
      }
      return d;
    }));

    showToast('Driver password updated!', 'success');
    return true;
  };

  // LocalStorage Sync Effects
  useEffect(() => {
    localStorage.setItem('transitops_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);
  useEffect(() => {
    localStorage.setItem('transitops_drivers', JSON.stringify(drivers));
  }, [drivers]);
  useEffect(() => {
    localStorage.setItem('transitops_trips', JSON.stringify(trips));
  }, [trips]);
  useEffect(() => {
    localStorage.setItem('transitops_maintenance', JSON.stringify(maintenance));
  }, [maintenance]);
  useEffect(() => {
    localStorage.setItem('transitops_expenses', JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem('transitops_notifications', JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem('transitops_manager_password', JSON.stringify(managerPassword));
  }, [managerPassword]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('transitops_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('transitops_current_user');
    }
  }, [currentUser]);

  // Driver and Vehicle Admin Mutations
  const handleBlockDriver = (driverId: string, reason?: string) => {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, isBlocked: true, blockedReason: reason || 'Suspended by admin' } : d));
    showToast(`Driver profile ${driverId} suspended.`, 'warning');
    handlePushNotification({
      title: 'Driver Account Blocked',
      message: `Driver profile ${driverId} was blocked. Reason: ${reason || 'Not specified'}`,
      type: 'license'
    });
  };

  const handleUnblockDriver = (driverId: string) => {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, isBlocked: false, blockedReason: undefined } : d));
    showToast(`Driver profile ${driverId} reactivated.`, 'success');
  };

  const handleDeleteDriver = (driverId: string) => {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, isDeleted: true } : d));
    showToast(`Driver profile ${driverId} moved to recovery bin.`, 'info');
  };

  const handleRestoreDriver = (driverId: string) => {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, isDeleted: false } : d));
    showToast(`Driver profile ${driverId} restored to active registry.`, 'success');
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, isDeleted: true } : v));
    showToast(`Vehicle ${vehicleId} moved to recovery bin.`, 'info');
  };

  const handleRestoreVehicle = (vehicleId: string) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, isDeleted: false } : v));
    showToast(`Vehicle ${vehicleId} restored to active fleet.`, 'success');
  };

  // Theme Sync
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Toast dispatch
  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Notification Operations
  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    showToast('Notification cleared', 'info');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    showToast('All notifications marked as read', 'success');
  };

  const handlePushNotification = (notif: { title: string; message: string; type: 'license' | 'maintenance' | 'trip' | 'vehicle' }) => {
    const newNotif: SystemNotification = {
      id: `N-driver-${Date.now()}`,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      time: 'Just now',
      unread: true
    };
    setNotifications(prev => [newNotif, ...prev]);
    showToast(notif.title, 'info');
  };

  // Dispatch details helper
  const handleSelectTrip = (trip: Trip | null) => {
    if (trip) {
      setSelectedTripId(trip.id);
      setActiveTab('Trips');
      setIsSidebarOpen(false);
    } else {
      setSelectedTripId(null);
    }
  };

  // Centralized Database Mutations
  const handleDispatchTrip = (tripData: {
    vehicleId: string;
    driverId: string;
    startLocation: string;
    endLocation: string;
    routeName: string;
    distance: number;
  }) => {
    const newTrip: Trip = {
      id: `TR-${Math.floor(1005 + Math.random() * 1000)}`,
      vehicleId: tripData.vehicleId,
      driverId: tripData.driverId,
      startLocation: tripData.startLocation,
      endLocation: tripData.endLocation,
      status: 'Scheduled',
      progress: 0,
      distance: tripData.distance,
      departureTime: new Date().toISOString(),
      arrivalTime: '',
      eta: 'Calculating...',
      route: {
        name: tripData.routeName,
        coordinates: [
          [47.6062, -122.3321],
          [45.5152, -122.6784]
        ]
      },
      timeline: [
        {
          time: 'Just now',
          status: 'Dispatched',
          location: tripData.startLocation,
          description: 'Route configuration complete. Waiting for driver pickup.'
        }
      ]
    };

    setTrips(prev => [newTrip, ...prev]);
    setVehicles(prev => prev.map(v => v.id === tripData.vehicleId ? { ...v, status: 'Active' } : v));
    setDrivers(prev => prev.map(d => d.id === tripData.driverId ? { ...d, availability: 'Available' } : d));

    showToast(`Trip ${newTrip.id} dispatched successfully!`, 'success');
  };

  const handleDriverCompleteTrip = (tripId: string) => {
    setTrips(prev => prev.map(t =>
      t.id === tripId ? {
        ...t,
        status: 'Pending Completion',
        progress: 100,
        timeline: [
          ...t.timeline,
          {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'Delivered',
            location: t.endLocation,
            description: 'Driver marked shipment as completed. Pending manager approval.'
          }
        ]
      } : t
    ));

    const targetTrip = trips.find(t => t.id === tripId);
    const driverName = targetTrip ? (drivers.find(d => d.id === targetTrip.driverId)?.name || 'Driver') : 'Driver';

    handlePushNotification({
      title: 'Sign-off Required',
      message: `${driverName} marked Trip ${tripId} as completed. Pending verification.`,
      type: 'trip'
    });
    showToast(`Trip ${tripId} submitted for manager verification.`, 'info');
  };

  const handleManagerCompleteTrip = (tripId: string) => {
    let targetTrip: Trip | undefined;

    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        targetTrip = {
          ...t,
          status: 'Completed',
          arrivalTime: new Date().toISOString(),
          timeline: [
            ...t.timeline,
            {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'Completed',
              location: t.endLocation,
              description: 'Manager signed off. Trip closed and resources released.'
            }
          ]
        };
        return targetTrip;
      }
      return t;
    }));

    const trip = targetTrip || trips.find(t => t.id === tripId);
    if (trip) {
      setVehicles(prev => prev.map(v => v.id === trip.vehicleId ? { ...v, status: 'Active' } : v));
      setDrivers(prev => prev.map(d => d.id === trip.driverId ? { ...d, availability: 'Available' } : d));
      showToast(`Trip ${tripId} confirmed! Driver and vehicle are now available.`, 'success');
      handlePushNotification({
        title: 'Trip Completed',
        message: `Trip ${tripId} is fully closed. Vehicle and Driver released.`,
        type: 'trip'
      });
    }
  };

  const handleAddDriver = (newDriver: Driver) => {
    setDrivers(prev => [newDriver, ...prev]);
    showToast(`Driver ${newDriver.name} added successfully!`, 'success');
  };

  // AI Copilot operations executor
  const handleExecuteInsightAction = (insight: CopilotInsight) => {
    setIsCopilotOpen(false);

    switch (insight.category) {
      case 'Optimization':
        showToast('AI dispatch suggestion executed: Van-05 assigned to Richmond Courier run.', 'success');
        break;
      case 'Maintenance':
        setActiveTab('Maintenance');
        showToast('Navigated to Maintenance Log to prioritize brake inspections.', 'info');
        break;
      case 'Fuel':
        setActiveTab('Fuel & Expenses');
        showToast('Bypass routing loaded. Diesel fuel models updated.', 'success');
        break;
      case 'Driver':
        setActiveTab('Drivers');
        showToast('Alex Mercer safety reports opened.', 'info');
        break;
      default:
        showToast('Operations plan dispatched.', 'success');
    }
  };

  // Tabs layout
  const navigationItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { name: 'Vehicles', icon: <Truck className="h-4.5 w-4.5" /> },
    { name: 'Drivers', icon: <Users className="h-4.5 w-4.5" /> },
    { name: 'Trips', icon: <Map className="h-4.5 w-4.5" /> },
    { name: 'Maintenance', icon: <Wrench className="h-4.5 w-4.5" /> },
    { name: 'Fuel & Expenses', icon: <Wallet className="h-4.5 w-4.5" /> },
  ];

  if (!currentUser) {
    return (
      <LoginPage
        onLogin={setCurrentUser}
        drivers={drivers}
        onChangePassword={handleChangePassword}
        managerPasswordVal={managerPassword}
      />
    );
  }

  if (currentUser.role === 'driver') {
    return (
      <DriverPortal
        currentUser={currentUser}
        trips={trips}
        setTrips={setTrips}
        drivers={drivers}
        setDrivers={setDrivers}
        onLogout={() => setCurrentUser(null)}
        onAddNotification={handlePushNotification}
        onDriverCompleteTrip={handleDriverCompleteTrip}
      />
    );
  }

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">

      {/* 1. LEFT SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-bg-card border-r border-border-primary flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {/* Brand header */}
          <div className="flex items-center justify-between px-6 pb-6 border-b border-border-primary/50">
            <div className="flex items-center space-x-2.5">
              <div className="h-8.5 w-8.5 rounded-xl bg-brand-green flex items-center justify-center text-white shadow-md shadow-brand-green/20">
                <Truck className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold text-text-primary tracking-tight leading-none">TransitOps</span>
                <span className="text-[10px] text-brand-green font-bold uppercase tracking-wider mt-1">Digital Logistics</span>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              className="lg:hidden p-1 rounded-lg hover:bg-bg-secondary text-text-secondary cursor-pointer"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 flex-1 px-4 space-y-1.5">
            {navigationItems.map((item) => {
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${isActive
                    ? 'bg-brand-green text-white shadow-md shadow-brand-green/10'
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                    }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Sustainability Label */}
        <div className="p-4 border-t border-border-primary/50 m-4 bg-brand-green/5 rounded-2xl border border-brand-green/10 text-center">
          <div className="flex items-center justify-center space-x-1.5 text-brand-green">
            <Leaf className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Eco-Performance</span>
          </div>
          <p className="text-[10px] text-text-secondary mt-1">Carbon offset logging is online</p>
        </div>
      </aside>

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* 2. TOP NAVBAR */}
        <header className="h-16 border-b border-border-primary bg-bg-card flex items-center justify-between px-6 z-10">
          <div className="flex items-center space-x-4">
            {/* Mobile Sidebar Hamburger toggler */}
            <button
              className="lg:hidden p-1.5 rounded-xl hover:bg-bg-secondary text-text-secondary cursor-pointer"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5.5 w-5.5" />
            </button>
            <div className="hidden md:flex items-center space-x-2 text-xs text-text-secondary font-semibold">
              <span>Workspace</span>
              <span className="text-border-primary">/</span>
              <span className="text-text-primary">Seattle Depot A</span>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            {/* AI Assistant Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCopilotOpen(true)}
              className="bg-brand-green/10 text-brand-green hover:bg-brand-green/20 border-brand-green/20 flex items-center space-x-1.5"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Copilot</span>
            </Button>

            {/* Notification popover */}
            <NotificationCenter
              notifications={notifications}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
            />

            {/* Dark mode toggler */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Divider */}
            <span className="h-6 w-px bg-border-primary" />

            {/* User Profile Avatar */}
            <div className="flex items-center space-x-2.5">
              <div className="flex items-center space-x-2">
                <div className="h-8.5 w-8.5 rounded-full bg-brand-green text-white font-extrabold flex items-center justify-center text-xs">
                  OP
                </div>
                <span className="hidden md:inline text-xs font-bold text-text-primary">Ops Manager</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentUser(null)}
                className="p-2 border-border-primary text-text-secondary hover:text-brand-danger flex items-center justify-center"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* 3. MAIN PAGE CONTAINER */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'Dashboard' && (
              <DashboardPage
                onNavigate={setActiveTab}
                onSelectTrip={handleSelectTrip}
                vehicles={vehicles}
                drivers={drivers}
                trips={trips}
                expenses={expenses}
                onDispatchTrip={handleDispatchTrip}
              />
            )}
            {activeTab === 'Vehicles' && (
              <VehiclesPage
                vehicles={vehicles}
                setVehicles={setVehicles}
                maintenance={maintenance}
                onDeleteVehicle={handleDeleteVehicle}
                onRestoreVehicle={handleRestoreVehicle}
              />
            )}
            {activeTab === 'Drivers' && (
              <DriversPage
                drivers={drivers}
                onAddDriver={handleAddDriver}
                trips={trips}
                onBlockDriver={handleBlockDriver}
                onUnblockDriver={handleUnblockDriver}
                onDeleteDriver={handleDeleteDriver}
                onRestoreDriver={handleRestoreDriver}
              />
            )}
            {activeTab === 'Trips' && (
              <TripsPage
                trips={trips}
                selectedTripId={selectedTripId}
                onSelectTrip={(t) => setSelectedTripId(t ? t.id : null)}
                vehicles={vehicles}
                drivers={drivers}
                onManagerCompleteTrip={handleManagerCompleteTrip}
              />
            )}
            {activeTab === 'Maintenance' && (
              <MaintenancePage
                maintenance={maintenance}
                setMaintenance={setMaintenance}
                vehicles={vehicles}
              />
            )}
            {activeTab === 'Fuel & Expenses' && (
              <FuelExpensesPage
                expenses={expenses}
                setExpenses={setExpenses}
                vehicles={vehicles}
              />
            )}
          </div>
        </main>
      </div>

      {/* 4. AI COPILOT DRAWER */}
      <AICopilot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        insights={insights}
        onActionClick={handleExecuteInsightAction}
      />

      {/* 5. TOAST NOTIFICATIONS POPUPS */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2.5 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto p-4 rounded-xl border border-border-primary bg-bg-card shadow-2xl flex items-start space-x-3 glass-panel animate-in fade-in slide-in-from-bottom-5 duration-300"
          >
            {toast.type === 'success' && <CheckCircle2 className="h-4.5 w-4.5 text-brand-green mt-0.5" />}
            {toast.type === 'info' && <Info className="h-4.5 w-4.5 text-brand-info mt-0.5" />}
            {toast.type === 'warning' && <ShieldAlert className="h-4.5 w-4.5 text-brand-warning mt-0.5" />}
            <p className="text-xs font-semibold text-text-primary flex-1">{toast.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
