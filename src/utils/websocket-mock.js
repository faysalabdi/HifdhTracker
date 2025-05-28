// Mock WebSocket implementation that uses the native WebSocket
export default class WebSocket {
  constructor(url, protocols) {
    // Use the native WebSocket
    this.socket = new global.WebSocket(url, protocols);
    
    // Proxy events
    this.socket.onopen = event => {
      if (this.onopen) this.onopen(event);
    };
    
    this.socket.onmessage = event => {
      if (this.onmessage) this.onmessage(event);
    };
    
    this.socket.onerror = event => {
      if (this.onerror) this.onerror(event);
    };
    
    this.socket.onclose = event => {
      if (this.onclose) this.onclose(event);
    };
  }
  
  // Add required methods
  send(data) {
    return this.socket.send(data);
  }
  
  close(code, reason) {
    return this.socket.close(code, reason);
  }
  
  // Add other required properties
  get readyState() {
    return this.socket.readyState;
  }
  
  get url() {
    return this.socket.url;
  }
  
  get protocol() {
    return this.socket.protocol;
  }
  
  // Define the readyState constants
  static get CONNECTING() { return 0; }
  static get OPEN() { return 1; }
  static get CLOSING() { return 2; }
  static get CLOSED() { return 3; }
} 