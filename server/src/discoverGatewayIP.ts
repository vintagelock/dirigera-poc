import createMdnsServer from 'mdns-server';

const SERVICE_NAME = '_ihsp._tcp.local.';

// The dirigera library's own mDNS discovery resolves on whichever answer (A
// or AAAA) arrives first, which can non-deterministically return a
// link-local IPv6 address (fe80::...) instead of the hub's real IPv4
// address. A link-local address has no usable OS interface scope here, so
// every request to it just hangs for ~20s before timing out. Always prefer
// an IPv4 answer, and only fall back to IPv6 if none shows up in time.
export function discoverGatewayIP(timeoutMs = 10000): Promise<string> {
  console.info(`[mdns] discovering gateway (querying ${SERVICE_NAME}, timeout ${timeoutMs}ms)`);
  return new Promise((resolve, reject) => {
    const mdnsServer = createMdnsServer({ reuseAddr: true, loopback: false, noInit: true });
    let ipv6Fallback: string | undefined;

    const finish = (value: string, reason: string) => {
      console.info(`[mdns] using ${value} (${reason})`);
      clearTimeout(timeout);
      mdnsServer.destroy();
      resolve(value);
    };
    const fail = (error: Error) => {
      console.warn(`[mdns] discovery failed: ${error.message}`);
      clearTimeout(timeout);
      mdnsServer.destroy();
      reject(error);
    };

    const timeout = setTimeout(() => {
      if (ipv6Fallback) {
        finish(ipv6Fallback, 'IPv6 fallback, no IPv4 answer arrived in time');
        return;
      }
      fail(new Error('Gateway discovery timed out. Try setting DIRIGERA_HUB_IP explicitly.'));
    }, timeoutMs);

    mdnsServer.on('response', (response) => {
      for (const answer of response.answers ?? []) {
        console.debug(`[mdns] answer: ${answer.type} ${answer.data}`);
      }
      const ipv4 = response.answers?.find((a) => a.type === 'A')?.data;
      if (ipv4) {
        finish(ipv4, 'IPv4 answer');
        return;
      }
      if (!ipv6Fallback) {
        const ipv6 = response.answers?.find((a) => a.type === 'AAAA')?.data;
        if (ipv6) {
          ipv6Fallback = `[${ipv6}]`;
          console.debug(`[mdns] holding ${ipv6Fallback} as a fallback, still waiting for an IPv4 answer`);
        }
      }
    });
    mdnsServer.on('ready', () => {
      console.debug('[mdns] server ready, sending query');
      mdnsServer.query([
        { name: SERVICE_NAME, type: 'A' },
        { name: SERVICE_NAME, type: 'AAAA' },
        { name: SERVICE_NAME, type: 'PTR' },
      ]);
    });
    mdnsServer.on('error', fail);
    mdnsServer.initServer();
  });
}
