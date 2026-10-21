import http from 'node:http';
import { ZodError } from 'zod';
import {
  verifyJwtToken,
  auditAndSanitizeSession,
  getAuthServiceTelemetry,
} from './microservicio.js';

const PORT = Number(process.env.MS1_PORT || 5101);

function setCorsHeaders(res: http.ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Role');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

function sendJson(res: http.ServerResponse, statusCode: number, payload: unknown) {
  setCorsHeaders(res);
  res.writeHead(statusCode);
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error('JSON malformado en el cuerpo de la petición'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const pathname = url.pathname;

  try {
    // 1. Endpoint GET /health
    if (req.method === 'GET' && pathname === '/health') {
      sendJson(res, 200, getAuthServiceTelemetry());
      return;
    }

    // 2. Endpoint POST /auth/verify
    if (req.method === 'POST' && pathname === '/auth/verify') {
      const body = (await readJsonBody(req)) as Record<string, unknown>;
      const authHeader = req.headers.authorization;
      if (!body.token && authHeader?.startsWith('Bearer ')) {
        body.token = authHeader.slice(7).trim();
      }
      const verification = verifyJwtToken(body);
      sendJson(res, verification.valid ? 200 : 401, verification);
      return;
    }

    // 3. Endpoint POST /auth/audit-session y GET /auth/audit-session
    if (pathname === '/auth/audit-session') {
      if (req.method === 'GET') {
        sendJson(res, 200, getAuthServiceTelemetry());
        return;
      }
      if (req.method === 'POST') {
        const body = (await readJsonBody(req)) as Record<string, unknown>;
        const authHeader = req.headers.authorization;
        if (!body.token && authHeader?.startsWith('Bearer ')) {
          body.token = authHeader.slice(7).trim();
        }
        const auditResult = await auditAndSanitizeSession(body);
        sendJson(res, 200, auditResult);
        return;
      }
    }

    sendJson(res, 404, {
      error: 'Ruta no encontrada en microservicio1 (Auth & Session Control)',
      availableEndpoints: ['GET /health', 'POST /auth/verify', 'POST /auth/audit-session'],
    });
  } catch (error) {
    if (error instanceof ZodError) {
      sendJson(res, 400, {
        error: 'Error de validación Zod en microservicio1',
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Error interno en microservicio1',
    });
  }
});

server.listen(PORT, () => {
  console.log(`[MS1-AUTH] Microservicio de Autenticación y Control de Sesiones activo en http://localhost:${PORT}`);
});
