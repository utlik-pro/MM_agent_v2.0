import React from 'react';
import ReactDOM from 'react-dom/client';
import { CallWidget } from './components/call-widget';
import './styles/index.css';

// Get the root element
const rootElement = document.getElementById('voice-widget-root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Create root and render
const root = ReactDOM.createRoot(rootElement);

// Widget configuration
const widgetConfig = {
  tokenEndpoint: '/api/token',
  // roomName оставляем пустым - будет генерироваться уникальный sessionId
};

// Error handling
const handleError = (error: Error) => {
  // Error handled silently
};

// State change handling
const handleStateChange = (state: any) => {
  // State changes handled silently
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