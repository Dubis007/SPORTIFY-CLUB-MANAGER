// Demo de monitoreo: genera tráfico artificial ligero contra la API y mide su rendimiento.
// Uso: node scripts/demo-trafico.mjs [url] [usuarios] [segundos]
// Ejemplo: node scripts/demo-trafico.mjs https://sportify-api-ps0y.onrender.com/api/health 10 60

const url = process.argv[2] ?? 'https://sportify-api-ps0y.onrender.com/api/health';
const usuarios = Number(process.argv[3] ?? 10);
const segundos = Number(process.argv[4] ?? 60);
const TIMEOUT_MS = 30000;
const PAUSA_MS = 250; // pausa entre peticiones de cada usuario: mantiene la carga ligera

const tiempos = [];
const codigos = {};
let enCurso = true;
const fin = new AbortController(); // corta las peticiones pendientes al acabar el tiempo

function registrar(codigo, ms) {
  codigos[codigo] = (codigos[codigo] ?? 0) + 1;
  if (ms !== null) tiempos.push(ms);
}

// Cada usuario virtual hace una petición tras otra hasta que se acaba el tiempo
async function usuarioVirtual() {
  while (enCurso) {
    const inicio = performance.now();
    try {
      const res = await fetch(url, { signal: AbortSignal.any([AbortSignal.timeout(TIMEOUT_MS), fin.signal]), cache: 'no-store' });
      await res.arrayBuffer();
      registrar(res.status, performance.now() - inicio);
    } catch (err) {
      if (!enCurso) {
        registrar('sin respuesta al terminar', null);
        break;
      }
      registrar(err.name === 'TimeoutError' ? 'timeout' : 'error de red', null);
    }
    await new Promise((r) => setTimeout(r, PAUSA_MS));
  }
}

function percentil(ordenados, p) {
  if (ordenados.length === 0) return 0;
  return ordenados[Math.min(ordenados.length - 1, Math.ceil((p / 100) * ordenados.length) - 1)];
}

const ms = (v) => `${Math.round(v)} ms`;
const total = () => Object.values(codigos).reduce((a, b) => a + b, 0);

console.log(`\nDemo de tráfico artificial — Sportify`);
console.log(`URL: ${url}`);
console.log(`Usuarios simultáneos: ${usuarios} · Duración: ${segundos} s\n`);

const t0 = performance.now();
const progreso = setInterval(() => {
  const transcurrido = (performance.now() - t0) / 1000;
  const promedio = tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : 0;
  console.log(
    `[${transcurrido.toFixed(0).padStart(3)} s] peticiones: ${total()} · ` +
      `${(total() / transcurrido).toFixed(1)} req/s · promedio: ${ms(promedio)}`,
  );
}, 5000);

const trabajadores = Array.from({ length: usuarios }, usuarioVirtual);
await new Promise((r) => setTimeout(r, segundos * 1000));
enCurso = false;
fin.abort();
await Promise.all(trabajadores);
clearInterval(progreso);

const duracion = (performance.now() - t0) / 1000;
const ordenados = [...tiempos].sort((a, b) => a - b);
const exitos = Object.entries(codigos)
  .filter(([c]) => Number(c) >= 200 && Number(c) < 300)
  .reduce((a, [, n]) => a + n, 0);

console.log(`\n===== Resumen =====`);
console.log(`Peticiones totales : ${total()} en ${duracion.toFixed(1)} s (${(total() / duracion).toFixed(1)} req/s)`);
console.log(`Exitosas (2xx)     : ${exitos} (${total() ? ((exitos / total()) * 100).toFixed(1) : 0} %)`);
console.log(`Respuestas         : ${Object.entries(codigos).map(([c, n]) => `${c} × ${n}`).join(' · ')}`);
if (ordenados.length) {
  const promedio = ordenados.reduce((a, b) => a + b, 0) / ordenados.length;
  console.log(`Tiempo de respuesta: mín ${ms(ordenados[0])} · promedio ${ms(promedio)} · ` +
    `p50 ${ms(percentil(ordenados, 50))} · p95 ${ms(percentil(ordenados, 95))} · máx ${ms(ordenados.at(-1))}`);
}
console.log(`\nAhora revisa en UptimeRobot el estado del monitor y su gráfica de tiempo de respuesta.\n`);
