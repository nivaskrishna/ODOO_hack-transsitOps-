import { Sparkles, ArrowRight, ShieldAlert, Zap, AlertTriangle, TrendingUp, HelpCircle } from 'lucide-react';
import type { CopilotInsight } from '../data/mockData';
import { Card, CardContent } from './Card';
import { Button } from './Button';

interface AICopilotProps {
  insights: CopilotInsight[];
  onActionClick: (insight: CopilotInsight) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({
  insights,
  onActionClick,
  isOpen,
  onClose
}) => {
  const getCategoryIcon = (category: CopilotInsight['category']) => {
    switch (category) {
      case 'Maintenance':
        return <ShieldAlert className="h-5 w-5 text-brand-danger" />;
      case 'Fuel':
        return <TrendingUp className="h-5 w-5 text-brand-warning" />;
      case 'Driver':
        return <Zap className="h-5 w-5 text-brand-success" />;
      case 'Utilization':
        return <AlertTriangle className="h-5 w-5 text-brand-info" />;
      default:
        return <HelpCircle className="h-5 w-5 text-brand-green" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Drawer overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/35 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-bg-card border-l border-border-primary shadow-2xl p-6 flex flex-col justify-between glass-panel transition-transform duration-300 animate-in slide-in-from-right">
        <div className="flex-1 overflow-y-auto pr-1">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-primary/50 pb-4 mb-6">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-brand-green/10 rounded-xl">
                <Sparkles className="h-5 w-5 text-brand-green animate-pulse" />
              </div>
              <div>
                <h2 className="font-bold text-text-primary text-lg">AI Operations Copilot</h2>
                <p className="text-xs text-text-secondary">Smart Logistics & Optimization</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Quick status brief */}
          <div className="mb-6 p-4 rounded-2xl bg-brand-green/5 border border-brand-green/10 flex items-start space-x-3">
            <div className="mt-0.5 text-brand-green text-sm font-semibold">💡</div>
            <div>
              <h4 className="text-xs font-bold text-brand-green uppercase tracking-wider">Operational Summary</h4>
              <p className="text-xs text-text-primary mt-1 leading-relaxed">
                Platform analysis recommends moving local Seattle deliveries to Electric Vehicles (EVs) to reduce emissions by 14% and expenses by $220 today.
              </p>
            </div>
          </div>

          {/* Insights Grid */}
          <div className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="border-border-primary/80" hoverEffect>
                <CardContent className="p-0">
                  <div className="flex items-start space-x-3.5">
                    <div className="mt-0.5 p-2 bg-bg-secondary rounded-xl">
                      {getCategoryIcon(insight.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                          {insight.category}
                        </span>
                        <span className={`h-2 w-2 rounded-full ${
                          insight.type === 'alert' ? 'bg-brand-danger' :
                          insight.type === 'warning' ? 'bg-brand-warning' :
                          insight.type === 'success' ? 'bg-brand-success' : 'bg-brand-info'
                        }`} />
                      </div>
                      <h4 className="text-sm font-bold text-text-primary mt-1 leading-tight">
                        {insight.message}
                      </h4>
                      <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                        {insight.recommendation}
                      </p>
                      
                      <div className="mt-4 flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs h-8 text-brand-green border-brand-green/20 hover:bg-brand-green/5 hover:border-brand-green/40 font-semibold"
                          onClick={() => onActionClick(insight)}
                        >
                          Execute Plan
                          <ArrowRight className="ml-1.5 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-border-primary/50 mt-6 text-center">
          <p className="text-[10px] text-text-secondary">
            Insights updated real-time based on vehicle sensors & active GPS routes.
          </p>
        </div>
      </div>
    </>
  );
};
