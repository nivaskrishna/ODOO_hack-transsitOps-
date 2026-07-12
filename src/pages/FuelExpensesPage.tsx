import { useState } from 'react';
import type { ExpenseRecord, Vehicle } from '../data/mockData';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/Table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Search, Filter, DollarSign, Wallet, Leaf, Plus } from 'lucide-react';

interface FuelExpensesPageProps {
  expenses: ExpenseRecord[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseRecord[]>>;
  vehicles: Vehicle[];
}

export const FuelExpensesPage: React.FC<FuelExpensesPageProps> = ({
  expenses,
  setExpenses,
  vehicles
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Dialog state for adding expense
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<ExpenseRecord>>({
    vehicleId: 'Van-01',
    category: 'Fuel',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Calculations for Expense distributions
  const categoryTotals = expenses.reduce((acc: { [key: string]: number }, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  const COLORS = {
    Fuel: '#F59E0B',        // Orange/Warning
    Tolls: '#3B82F6',       // Info Blue
    Maintenance: '#EF4444', // Danger Red
    Insurance: '#64748B',   // Slate
    'Driver Payout': '#00B67A' // Electric Green
  };

  const expensePieData = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    value: categoryTotals[cat],
    color: COLORS[cat as keyof typeof COLORS] || '#00B67A'
  }));

  // Fuel efficiency of active vehicles (derived from vehicles)
  const fuelEfficiencyData = vehicles.map(v => {
    // Parse efficiency value
    const numericVal = parseFloat(v.fuelEfficiency);
    const unit = v.fuelEfficiency.includes('kWh') ? 'kWh/100km' : 'L/100km';
    return {
      id: v.id,
      name: v.name,
      efficiency: numericVal,
      unit: unit,
      fuelType: v.fuelType
    };
  });

  // Filter Efficiency for Diesel (L/100km) and Electric (kWh/100km)
  const electricEfficiency = fuelEfficiencyData.filter(item => item.fuelType === 'Electric');
  const dieselEfficiency = fuelEfficiencyData.filter(item => item.fuelType === 'Diesel' || item.fuelType === 'Hybrid');

  // Search & Filter expenses list
  const filteredExpenses = expenses.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.vehicleId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;
    const item: ExpenseRecord = {
      id: `E-${Math.floor(500 + Math.random() * 500)}`,
      vehicleId: newExpense.vehicleId || 'Van-01',
      category: newExpense.category as ExpenseRecord['category'] || 'Fuel',
      amount: newExpense.amount || 0,
      description: newExpense.description || '',
      date: newExpense.date || new Date().toISOString().split('T')[0]
    };
    setExpenses([item, ...expenses]);
    setIsAddOpen(false);
    // Reset Form
    setNewExpense({
      vehicleId: 'Van-01',
      category: 'Fuel',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const getCategoryBadge = (category: ExpenseRecord['category']) => {
    switch (category) {
      case 'Fuel':
        return <Badge variant="warning">Fuel / Power</Badge>;
      case 'Tolls':
        return <Badge variant="info">Tolls</Badge>;
      case 'Maintenance':
        return <Badge variant="danger">Maintenance</Badge>;
      case 'Insurance':
        return <Badge variant="neutral">Insurance</Badge>;
      case 'Driver Payout':
        return <Badge variant="success">Payout</Badge>;
    }
  };

  const totalFuelPowerCosts = expenses
    .filter(e => e.category === 'Fuel')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalSavingsCarbon = vehicles.filter(v => v.fuelType === 'Electric').length * 240; // mock saving ROI index

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Fuel & Expenses</h1>
          <p className="text-text-secondary text-sm">Analyze fleet operational costs, power efficiency, and logistics ROI.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="flex items-center space-x-1.5 self-start">
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </Button>
      </div>

      {/* Analytics KPI Rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Fuel & Charging Costs</span>
              <h3 className="text-2xl font-black text-text-primary mt-1">${totalFuelPowerCosts.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-brand-warning/10 rounded-xl text-brand-warning">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Charging Cost Avoided</span>
              <h3 className="text-2xl font-black text-brand-green mt-1">${totalSavingsCarbon.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-brand-green/10 rounded-xl text-brand-green">
              <Leaf className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Total Fleet Expenses</span>
              <h3 className="text-2xl font-black text-text-primary mt-1">
                ${expenses.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 bg-brand-info/10 rounded-xl text-brand-info">
              <Wallet className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Distribution Pie Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>Logistics categorization of fleet expenses</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex flex-col justify-between">
            <div className="h-52 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-[10px] border-t border-border-primary/50 pt-2.5 mt-2">
              {expensePieData.map((entry) => (
                <div key={entry.name} className="flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="font-semibold text-text-primary">{entry.name}</span>
                  <span className="text-text-secondary">(${entry.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fleet Fuel & Power Efficiency Comparison */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fleet Power & Fuel Efficiency</CardTitle>
            <CardDescription>Electric (kWh/100km) vs Diesel/Hybrid (L/100km)</CardDescription>
          </CardHeader>
          <CardContent className="h-72 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Electric EV efficiency */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-green block mb-2">Electric EVs (Lower is better)</span>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={electricEfficiency} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                  <XAxis dataKey="id" stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value} kWh/100km`]} />
                  <Bar dataKey="efficiency" fill="#00B67A" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Diesel/Hybrid efficiency */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-warning block mb-2">Diesel / Hybrid (Lower is better)</span>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={dieselEfficiency} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                  <XAxis dataKey="id" stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value} L/100km`]} />
                  <Bar dataKey="efficiency" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Expenses Log Table */}
      <div className="space-y-4">
        {/* Table Search & Filter bar */}
        <Card variant="glass">
          <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search expenses by description, vehicle ID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary focus:outline-none focus:border-brand-green transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Filter className="h-4 w-4 text-text-secondary hidden sm:inline" />
              <select
                className="rounded-xl border border-border-primary bg-bg-card text-sm text-text-primary px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-green"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Fuel">Fuel / Power</option>
                <option value="Tolls">Tolls</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Insurance">Insurance</option>
                <option value="Driver Payout">Driver Payout</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Expenses List Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount (USD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-text-secondary">
                  No expense records matched the filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium text-text-primary">{expense.date}</TableCell>
                  <TableCell className="font-bold text-text-primary">{expense.vehicleId}</TableCell>
                  <TableCell>{getCategoryBadge(expense.category)}</TableCell>
                  <TableCell className="text-text-secondary">{expense.description}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-text-primary">${expense.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Expense Form Dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Log Fleet Expense"
        description="Record a fuel fill-up, power charging, toll payment, or diagnostic invoice."
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Assign Vehicle *</label>
              <select
                className="rounded-xl border border-border-primary bg-bg-card text-sm text-text-primary px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-green"
                value={newExpense.vehicleId}
                onChange={(e) => setNewExpense({ ...newExpense, vehicleId: e.target.value })}
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.id} - {v.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Expense Category</label>
              <select
                className="rounded-xl border border-border-primary bg-bg-card text-sm text-text-primary px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-green"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
              >
                <option value="Fuel">Fuel / Power Charge</option>
                <option value="Tolls">Tolls</option>
                <option value="Maintenance">Maintenance Repair</option>
                <option value="Insurance">Insurance Policy</option>
                <option value="Driver Payout">Driver Payout</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Transaction Amount ($USD) *</label>
              <input
                type="number"
                placeholder="0.00"
                required
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newExpense.amount || ''}
                onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase">Transaction Date</label>
              <input
                type="date"
                className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-xs text-text-secondary font-bold uppercase">Transaction Details / Description *</label>
            <input
              type="text"
              placeholder="e.g. Refueled 45 Gallons diesel at Exit 9"
              required
              className="rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary px-3 py-2 focus:outline-none focus:border-brand-green"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Submit Expense</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
