import React, { useState, useEffect, useRef } from 'react';
import { Search, Shield, Wallet, Rocket, ArrowRight, Activity } from 'lucide-react';

interface CartilageFlowProps {
  children?: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  context?: 'scanner' | 'wallet' | 'safety' | 'launch';
  adaptive?: boolean;
  connected?: boolean;
}

interface FlowStageProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  active?: boolean;
  completed?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  context?: string;
}

export const CartilageFlow: React.FC<CartilageFlowProps> = ({
  children,
  direction = 'vertical',
  context = 'scanner',
  adaptive = true,
  connected = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const flowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (flowRef.current) {
      observer.observe(flowRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const flowClasses = [
    'cartilage-flow',
    direction === 'horizontal' ? 'horizontal' : '',
    `cartilage-context-${context}`,
    adaptive ? 'cartilage-surface-adaptive' : '',
    connected ? 'connected' : '',
    isVisible ? 'cartilage-animate-flow' : ''
  ].filter(Boolean).join(' ');

  return (
    <div ref={flowRef} className={flowClasses}>
      {children}
    </div>
  );
};

export const CartilageStage: React.FC<FlowStageProps> = ({
  icon,
  title,
  description,
  active = false,
  completed = false,
  onClick,
  children,
  context = 'scanner'
}) => {
  const [isExpanded, setIsExpanded] = useState(active);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsExpanded(active);
  }, [active]);

  const stageClasses = [
    'cartilage-card',
    active ? 'active' : '',
    completed ? 'completed' : '',
    isHovered ? 'hovered' : '',
    `cartilage-context-${context}`,
    isExpanded ? 'extended' : 'compressed'
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={stageClasses}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`
          flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
          ${active ? 'bg-red-500 text-white scale-110' : 'bg-gray-100 text-gray-600'}
          ${completed ? 'bg-green-500 text-white' : ''}
        `}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold transition-colors duration-300 ${
            active ? 'text-red-600' : 'text-gray-800'
          }`}>
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {onClick && (
          <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${
            isExpanded ? 'rotate-90' : ''
          }`} />
        )}
      </div>
      
      {isExpanded && children && (
        <div className="cartilage-animate-in mt-4 pt-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

// Pre-built flow configurations
export const ScannerToLaunchFlow: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);

  const stages = [
    {
      id: 'scanner',
      icon: <Search className="w-5 h-5" />,
      title: 'Token Scanner',
      description: 'Analyze any Sei token for safety and authenticity',
      context: 'scanner'
    },
    {
      id: 'wallet',
      icon: <Wallet className="w-5 h-5" />,
      title: 'Wallet Connection',
      description: 'Connect your Sei wallet for seamless interaction',
      context: 'wallet'
    },
    {
      id: 'safety',
      icon: <Shield className="w-5 h-5" />,
      title: 'Safety Analysis',
      description: 'Comprehensive security audit and risk assessment',
      context: 'safety'
    },
    {
      id: 'launch',
      icon: <Rocket className="w-5 h-5" />,
      title: 'seifun.launch',
      description: 'Explore verified tokens and launch opportunities',
      context: 'launch'
    }
  ];

  const handleStageClick = (index: number) => {
    setCurrentStage(index);
    
    // Mark previous stages as completed
    const newCompleted = Array.from({ length: index }, (_, i) => i);
    setCompletedStages(newCompleted);
  };

  return (
    <div className="cartilage-container">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Your Seifu Journey
        </h2>
        <p className="text-gray-600">
          Experience the seamless flow from token discovery to launch
        </p>
      </div>

      <CartilageFlow direction="vertical" context="scanner" connected>
        {stages.map((stage, index) => (
          <CartilageStage
            key={stage.id}
            icon={stage.icon}
            title={stage.title}
            description={stage.description}
            active={currentStage === index}
            completed={completedStages.includes(index)}
            onClick={() => handleStageClick(index)}
            context={stage.context}
          >
            <StageContent stageId={stage.id} />
          </CartilageStage>
        ))}
      </CartilageFlow>
    </div>
  );
};

// Dynamic content for each stage
const StageContent: React.FC<{ stageId: string }> = ({ stageId }) => {
  switch (stageId) {
    case 'scanner':
      return (
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="Enter Sei token address..." 
            className="cartilage-input"
          />
          <button className="cartilage-button w-full">
            <Search className="w-4 h-4" />
            Scan Token
          </button>
        </div>
      );
    
    case 'wallet':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button className="cartilage-button secondary">
              <Wallet className="w-4 h-4" />
              Sei Wallet
            </button>
            <button className="cartilage-button secondary">
              <Wallet className="w-4 h-4" />
              Keplr
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Connect to interact with tokens securely
          </p>
        </div>
      );
    
    case 'safety':
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Risk Score</span>
            <span className="font-semibold text-green-600">94/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-[94%]"></div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-green-600">✓</div>
              <div>Verified</div>
            </div>
            <div className="text-center">
              <div className="text-green-600">✓</div>
              <div>Safe</div>
            </div>
            <div className="text-center">
              <div className="text-green-600">✓</div>
              <div>Liquid</div>
            </div>
          </div>
        </div>
      );
    
    case 'launch':
      return (
        <div className="space-y-3">
          <button className="cartilage-button w-full">
            <Rocket className="w-4 h-4" />
            Explore seifun.launch
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="cartilage-button ghost">
              View Token
            </button>
            <button className="cartilage-button ghost">
              Trade Now
            </button>
          </div>
        </div>
      );
    
    default:
      return null;
  }
};

// Adaptive context hook for cartilage theming
export const useCartilageContext = (context: string) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-cartilage-context', context);
    
    return () => {
      document.documentElement.removeAttribute('data-cartilage-context');
    };
  }, [context]);
};

// Connection indicator component
export const CartilageConnection: React.FC<{
  from: string;
  to: string;
  active?: boolean;
}> = ({ from, to, active = false }) => {
  return (
    <div className={`
      cartilage-connection
      ${active ? 'active' : ''}
      cartilage-animate-connect
    `}>
      <div className="connection-line"></div>
      <div className="connection-pulse"></div>
    </div>
  );
};

export default CartilageFlow;