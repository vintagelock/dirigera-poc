declare module 'mdns-server' {
  interface MdnsAnswer {
    type: string;
    data: string;
  }
  interface MdnsResponse {
    answers?: MdnsAnswer[];
    additionals?: MdnsAnswer[];
  }
  interface MdnsQuestion {
    name: string;
    type: string;
  }
  interface MdnsServerInstance {
    on(event: 'response', listener: (response: MdnsResponse) => void): void;
    on(event: 'ready', listener: () => void): void;
    on(event: 'error', listener: (error: Error) => void): void;
    on(event: 'destroyed', listener: () => void): void;
    query(questions: MdnsQuestion[]): void;
    initServer(): void;
    destroy(): void;
  }
  interface MdnsOptions {
    reuseAddr?: boolean;
    loopback?: boolean;
    noInit?: boolean;
  }
  export default function createMdnsServer(options?: MdnsOptions): MdnsServerInstance;
}
