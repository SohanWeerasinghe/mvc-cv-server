import { WebSocketServer, WebSocket } from 'ws';

type JsonRpcRequest = {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: any;
};

type JsonRpcResponse = {
  jsonrpc: '2.0';
  id?: string | number;
  result?: any;
  error?: { code: number; message: string; data?: any };
};

export type ToolSpec = {
  name: string;
  description: string;
  schema: any;
  handler: (args: any) => Promise<any>;
};

export class RpcServer {
  private wss: WebSocketServer;
  private tools: Map<string, ToolSpec> = new Map();

  constructor(server: any, path: string = '/ws') {
    this.wss = new WebSocketServer({ server, path });
    this.wss.on('connection', (ws) => this.onConnection(ws));
  }

  registerTool(tool: ToolSpec) {
    this.tools.set(tool.name, tool);
  }

  private onConnection(ws: WebSocket) {
    ws.on('message', async (raw) => {
      let res: JsonRpcResponse = { jsonrpc: '2.0' };
      try {
        const req = JSON.parse(raw.toString()) as JsonRpcRequest;
        res.id = req.id;
        if (req.method === 'tools/list') {
          res.result = Array.from(this.tools.values()).map(t => ({
            name: t.name,
            description: t.description,
            schema: t.schema
          }));
        } else if (req.method === 'tools/call') {
          const { name, args } = req.params || {};
          if (!this.tools.has(name)) throw new Error(`Unknown tool: ${name}`);
          const tool = this.tools.get(name)!;
          const out = await tool.handler(args || {});
          res.result = out;
        } else {
          res.error = { code: -32601, message: 'Method not found' };
        }
      } catch (e: any) {
        res.error = { code: -32000, message: e?.message || 'Server error' };
      }
      ws.send(JSON.stringify(res));
    });
  }
}
