import React from 'react';
import ReactDOM from 'react-dom/client';
import { CallWidget } from './components/call-widget';
import './styles/index.css';

// Get the root element
const rootElement = document.getElementById('voice-widget-root');
if (!rootElement) {
  console.error('Root element #voice-widget-root not found');
  throw new Error('Root element not found');
}

// Create root and render
const root = ReactDOM.createRoot(rootElement);

// Widget configuration
const widgetConfig = {
  tokenEndpoint: '/api/token',
  roomName: 'test-room',
};

// Error handling
const handleError = (error: Error) => {
  console.error('Voice widget error:', error);
};

// State change handling
const handleStateChange = (state: any) => {
  console.log('Widget state changed:', state);
};

// Render the CallWidget
root.render(
  <React.StrictMode>
    <div className="voice-widget-container">
      <CallWidget 
        config={widgetConfig}
        onError={handleError}
        onStateChange={handleStateChange}
        className="voice-widget"
      />
    </div>
  </React.StrictMode>
);

// Export for external use
export { CallWidget }; 