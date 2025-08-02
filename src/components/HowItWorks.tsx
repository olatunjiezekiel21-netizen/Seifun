import React from 'react';
import { Upload, Shield, Rocket } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: 'Use our Launchpad',
      description: 'Fill in the token details',
      icon: Upload,
      color: 'from-blue-500 to-blue-600'
    },
    {
      number: 2,
              title: 'SeifunGuard',
      description: 'Get an audit score',
      icon: Shield,
      color: 'from-[#FF6B35] to-[#FF8E53]'
    },
    {
      number: 3,
      title: 'Launch & Trade',
      description: 'Safe meme tokens',
      icon: Rocket,
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#141414]">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Launch your meme token safely with our comprehensive verification system
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 -translate-x-4 z-0"></div>
              )}
              
              <div className="relative z-10 text-center space-y-6">
                {/* Icon Circle */}
                <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                  <step.icon className="text-white" size={32} />
                </div>
                
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                  <span className="text-[#FF3C3C] font-bold text-lg">{step.number}</span>
                </div>
                
                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#141414]">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;