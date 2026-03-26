---
sidebar_position: 35
---

# Live Status Gateway

## Introduction

The Live Status Gateway (LSG) provides a WebSocket-based API for external systems to subscribe to real-time updates about Sofie's state. It's designed as a stable API that external applications can rely on without needing deep knowledge of Sofie's internal workings.

## What It Provides

The LSG streams live updates about:

- **Active Playlists** - Current and next parts, segments, timing information, and T-Timers
- **Studio Configuration** - Studio settings and capabilities
- **Active Pieces** - Currently playing pieces
- **Segments** - Segment data and timing
- **AdLibs** - Available AdLib actions
- **Notifications** - System notifications and warnings
- **Buckets** - Bucket AdLibs
- **Packages** - Media package preparation status

## Installation

### Prerequisites

- Sofie Core installed and running
- Node.js version 22.20.0 or later

### Starting the Gateway

The Live Status Gateway is included in the Sofie Core repository under `packages/live-status-gateway`.

From the live-status-gateway directory:

```bash
cd packages/live-status-gateway

# Development mode (sets device ID to 'localDevLsg' automatically)
yarn dev

# Production mode (requires explicit device ID)
yarn start -id live_status_gateway0
```

### Configuration Options

You can customize the LSG via command-line arguments or environment variables:

**Command-line:**

```bash
yarn start -id <deviceId> -host <coreHost> -port <corePort> -logLevel <level>
```

**Environment variables:**

```bash
DEVICE_ID=myLsg CORE_HOST=localhost CORE_PORT=3000 yarn start -id myLsg
```

Available options:

- `-id` - Unique device identifier (required)
- `-host` - Sofie Core hostname (default: 127.0.0.1)
- `-port` - Sofie Core port (default: 3000)
- `-logLevel` - Logging level: error, warn, info, verbose, debug, silly
- `-disableWatchdog` - Disable health monitoring
- `-token` - Device authentication token (set up automatically on first connection)

## Assigning to a Studio

After starting the LSG for the first time (which will fail - this is expected):

1. Open Sofie with admin access: `http://localhost:3000/settings?admin=1`
2. Navigate to **Settings** → **Studios**
3. Select your Studio
4. Scroll to the **Peripheral Devices** section
5. Under **Parent Devices**, click the **+** button
6. Select your Live Status Gateway from the dropdown
7. Save the configuration

:::tip
The first connection attempt will fail because peripheral devices must be assigned to a Studio before they can connect. This initial connection allows Sofie to register the device and set up authorization. Simply restart the LSG after assigning it to a Studio.
:::

## Configuring the Gateway

After assigning the LSG to a Studio:

1. Go to **Settings** → **Devices**
2. Find and click on your Live Status Gateway
3. Configure available options:
   - **Debug Logging** - Enable for more verbose logging output

The LSG has minimal configuration since it primarily broadcasts data from Sofie without transformation.

## Verifying the Connection

1. Restart the LSG after Studio assignment
2. Navigate to the **Status** page in Sofie (top navigation)
3. Locate your Live Status Gateway device
4. Status should show **"Good"** with a green indicator
5. The WebSocket server is running on **port 8080** (default)

## Connecting External Clients

External applications can connect to the LSG via WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:8080')

ws.addEventListener('message', (message) => {
  const data = JSON.parse(message.data)
  // Handle different event types
  switch (data.event) {
    case 'activePlaylist':
      console.log('Playlist update:', data.name)
      console.log('T-Timers:', data.tTimers)
      break
    // ... handle other events
  }
})

ws.addEventListener('open', () => {
  // Subscribe to topics
  ws.send(JSON.stringify({
    event: "subscribe",
    subscription: { name: "activePlaylist" },
    reqid: 1
  }))
})
```

See the [Live Status Gateway README](https://github.com/Sofie-Automation/sofie-core/tree/master/packages/live-status-gateway) for complete client examples.

## Time Synchronization

The LSG provides timestamps relative to the Sofie server's system clock. For accurate countdowns and timing:

- Synchronize client systems with the same NTP server as Sofie
- Use system-level (OS) or application-level time sync
- Account for network latency in time-critical applications

## API Documentation

The WebSocket API is defined using the [AsyncAPI specification](https://www.asyncapi.com/). The complete schema can be found in:

- `packages/live-status-gateway-api/src/generated/asyncapi.yaml`
- TypeScript types: `@sofie-automation/live-status-gateway-api` npm package

## Troubleshooting

**"DeviceId is not set!" error**

- Solution: Always provide a device ID via `-id` parameter or use `yarn dev`

**Gateway shows "Bad" status**

- Solution: Restart the LSG service
- Check Sofie Core is running and accessible

**"Connection refused" errors**

- Solution: Verify Sofie Core host/port settings
- Default is `127.0.0.1:3000`

**Client cannot connect to WebSocket**

- Solution: LSG WebSocket is on port **8080**, not Sofie Core's port 3000
- Check firewall settings if connecting remotely

**Gateway not appearing in device list**

- Solution: Ensure first connection attempt completed (even if it failed)
- Check LSG logs for errors
- Verify LSG and Sofie Core versions are compatible
