// Minimal polyfills for React Native
// Only including what's absolutely necessary

// URL polyfill is handled by 'react-native-url-polyfill/auto' in App.tsx

// Simple empty mock for 'net' module that ws might try to use
global.net = {
  createConnection: () => {
    console.warn('net.createConnection is not implemented in React Native');
    return null;
  },
  Socket: function() {
    console.warn('net.Socket is not implemented in React Native');
    return {};
  }
};

// Simple empty mock for 'tls' module
global.tls = {
  connect: () => {
    console.warn('tls.connect is not implemented in React Native');
    return null;
  }
}; 