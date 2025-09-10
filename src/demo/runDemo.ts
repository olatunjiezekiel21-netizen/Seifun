import { aiDemo } from './AIDemo';

// Simple demo runner for Seifun AI capabilities
console.log('🚀 Starting Seifun AI Capabilities Demo...\n');

// Run all demonstrations
aiDemo.runAllDemos().then(() => {
  console.log('\n🎉 Demo completed! Check the console for results.');
}).catch((error) => {
  console.error('❌ Demo failed:', error);
});

// You can also run specific demos:
// aiDemo.runDemo('portfolio');     // Portfolio optimization only
// aiDemo.runDemo('prediction');    // Market prediction only
// aiDemo.runDemo('risk');          // Risk assessment only
// aiDemo.runDemo('chat');          // Enhanced ChatBrain only
// aiDemo.runDemo('context');       // Context management only
// aiDemo.runDemo('status');        // Service status only