import React from 'react';
import ReactDOM from 'react-dom/client';
import CallWidget from './components/call-widget';
import './styles/index.css';

// Configuration for the widget
const widgetConfig = {
  tokenEndpoint: 'https://cors-anywhere.herokuapp.com/http://localhost:8765/get-token', // CORS proxy
  roomName: 'test-room',
};

const App: React.FC = () => {
  const handleStateChange = (state: any) => {
    console.log('Voice widget state changed:', state);
    
    // Send state to parent window if in iframe
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'VOICE_WIDGET_STATE_CHANGE',
        state
      }, '*');
    }
  };

  const handleError = (error: Error) => {
    console.error('Voice widget error:', error);
    
    // Send error to parent window if in iframe
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'VOICE_WIDGET_ERROR',
        error: error.message
      }, '*');
    }
  };

  return (
    <div className="w-full h-screen bg-transparent">
      <CallWidget 
        config={widgetConfig}
        onStateChange={handleStateChange}
        onError={handleError}
      />
    </div>
  );
};

// Initialize the widget
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'VOICE_WIDGET_ERROR',
      error: event.error?.message || 'Unknown error'
    }, '*');
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'VOICE_WIDGET_ERROR',
      error: event.reason?.message || 'Promise rejection'
    }, '*');
  }
});

// Send ready message to parent window
window.addEventListener('load', () => {
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'VOICE_WIDGET_READY'
    }, '*');
  }
});

export default App; 