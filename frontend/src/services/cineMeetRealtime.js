import { Client } from "@stomp/stompjs";

const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const defaultUrl = `${protocol}://${window.location.hostname}:8080/ws-cinemeet`;

class CineMeetRealtime {
  constructor() {
    this.handlers = new Map();
    this.subscriptions = new Map();
    this.connectionListeners = new Set();
    this.connected = false;
    this.client = new Client({
      brokerURL: import.meta.env.VITE_CINEMEET_WS_URL || defaultUrl,
      reconnectDelay: 1000,
      connectionTimeout: 8000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
      beforeConnect: async () => {
        const token = localStorage.getItem("token");
        this.client.connectHeaders = token
          ? { Authorization: `Bearer ${token}` }
          : {};
      },
      onConnect: () => {
        this.connected = true;
        this.notifyConnection();
        this.resubscribeAll();
      },
      onWebSocketClose: () => {
        this.connected = false;
        this.subscriptions.clear();
        this.notifyConnection();
      },
      onStompError: () => {
        this.connected = false;
        this.notifyConnection();
      },
    });
  }

  connect() {
    if (!this.client.active) this.client.activate();
  }

  subscribe(destination, handler) {
    if (!this.handlers.has(destination)) this.handlers.set(destination, new Set());
    this.handlers.get(destination).add(handler);
    this.connect();
    this.ensureSubscription(destination);

    return () => {
      const destinationHandlers = this.handlers.get(destination);
      destinationHandlers?.delete(handler);
      if (destinationHandlers?.size === 0) {
        this.handlers.delete(destination);
        this.subscriptions.get(destination)?.unsubscribe();
        this.subscriptions.delete(destination);
      }
    };
  }

  onConnectionChange(listener) {
    this.connectionListeners.add(listener);
    listener(this.connected);
    this.connect();
    return () => this.connectionListeners.delete(listener);
  }

  ensureSubscription(destination) {
    if (!this.connected || this.subscriptions.has(destination)) return;
    const subscription = this.client.subscribe(destination, (frame) => {
      try {
        const event = JSON.parse(frame.body);
        this.handlers.get(destination)?.forEach((handler) => handler(event));
      } catch {
        // Bỏ qua frame không đúng định dạng để kết nối tiếp tục hoạt động.
      }
    });
    this.subscriptions.set(destination, subscription);
  }

  resubscribeAll() {
    this.subscriptions.clear();
    this.handlers.forEach((_, destination) => this.ensureSubscription(destination));
  }

  notifyConnection() {
    this.connectionListeners.forEach((listener) => listener(this.connected));
  }
}

export const cineMeetRealtime = new CineMeetRealtime();
