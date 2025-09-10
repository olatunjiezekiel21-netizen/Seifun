import React from 'react';
import { Clock, Rocket, Zap } from 'lucide-react';

interface ComingSoonProps {
  feature: string;
  description?: string;
  estimatedLaunch?: string;
  className?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  feature, 
  description, 
  estimatedLaunch = "Q2 2024",
  className = ""
}) => {
  return (
    <div className={`coming-soon-container ${className}`}>
      <div className="coming-soon-card">
        <div className="coming-soon-icon">
          <Clock className="w-8 h-8" />
        </div>
        
        <div className="coming-soon-content">
          <h3 className="coming-soon-title">
            {feature} Coming Soon
          </h3>
          
          {description && (
            <p className="coming-soon-description">
              {description}
            </p>
          )}
          
          <div className="coming-soon-timeline">
            <div className="coming-soon-timeline-item">
              <div className="coming-soon-timeline-dot">
                <Rocket className="w-4 h-4" />
              </div>
              <div className="coming-soon-timeline-content">
                <div className="coming-soon-timeline-title">Development Phase</div>
                <div className="coming-soon-timeline-desc">Building core functionality</div>
              </div>
            </div>
            
            <div className="coming-soon-timeline-item">
              <div className="coming-soon-timeline-dot">
                <Zap className="w-4 h-4" />
              </div>
              <div className="coming-soon-timeline-content">
                <div className="coming-soon-timeline-title">Testing & Launch</div>
                <div className="coming-soon-timeline-desc">Estimated: {estimatedLaunch}</div>
              </div>
            </div>
          </div>
          
          <div className="coming-soon-notify">
            <p className="coming-soon-notify-text">
              Stay tuned for updates! This feature is being developed with care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;