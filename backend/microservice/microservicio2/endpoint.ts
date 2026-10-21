import http from 'node:http';
import { ZodError } from 'zod';
import {
  processAnalyticalAggregation,
  computeExecutiveKpis,
  getReportingHealth,
} from './microservicio.js';

const PORT = Number(process.env.MS2_PORT || 5102);

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
      } catch {
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
  const authHeader = req.headers.authorization;

  try {
    // 1. Endpoint GET /health
    if (req.method === 'GET' && pathname === '/health') {
      sendJson(res, 200, getReportingHealth());
      return;
    }

    // 2. Endpoint POST/GET /reports/aggregate
    if (pathname === '/reports/aggregate') {
      if (req.method === 'POST') {
        const body = await readJsonBody(req);
        const report = await processAnalyticalAggregation(body, authHeader);
        sendJson(res, 200, report);
        return;
      }
      if (req.method === 'GET') {
        const queryPayload = {
          dateRange: {
            startDate: url.searchParams.get('startDate') || undefined,
            endDate: url.searchParams.get('endDate') || undefined,
            periodPreset: url.searchParams.get('periodPreset') || 'ALL_TIME',
          },
          financialRange: {
            minAmount: url.searchParams.get('minAmount')
              ? Number(url.searchParams.get('minAmount'))
              : 0,
            maxAmount: url.searchParams.get('maxAmount')
              ? Number(url.searchParams.get('maxAmount'))
              : undefined,
            paymentStatus: url.searchParams.get('paymentStatus') || 'ALL',
          },
        };
        const report = await processAnalyticalAggregation(queryPayload, authHeader);
        sendJson(res, 200, report);
        return;
      }
    }

    // 3. Endpoint GET/POST /reports/kpis
    if (pathname === '/reports/kpis') {
      if (req.method === 'GET') {
        const queryObj = {
          role: url.searchParams.get('role') || 'ADMIN',
          currency: url.searchParams.get('currency') || 'COP',
          includeTrends: url.searchParams.get('includeTrends') ?? 'true',
        };
        const kpis = await computeExecutiveKpis(queryObj, authTokenFromReq(req));
        sendJson(res, 200, kpis);
        return;
      }
      if (req.method === 'POST') {
        const body = await readJsonBody(req);
        const kpis = await computeExecutiveKpis(body, authHeader);
        sendJson(res, 200, kpis);
        return;
      }
    }

    sendJson(res, 404, {
      error: 'Ruta no encontrada en microservicio2 (Analytical Reporting Processor)',
      availableEndpoints: ['GET /health', 'POST /reports/aggregate', 'GET /reports/kpis'],
    });
  } catch (error) {
    if (error instanceof ZodError) {
      sendJson(res, 400, {
        error: 'Error de validación Zod en microservicio2',
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Error interno en microservicio2',
    });
  }
});

function authTokenFromReq(req: http.IncomingMessage): string | undefined {
  return req.headers.authorization;
}

server.listen(PORT, () => {
  console.log(`[MS2-REPORTS] Microservicio de Reportes Analíticos activo en http://localhost:${PORT}`);
});
