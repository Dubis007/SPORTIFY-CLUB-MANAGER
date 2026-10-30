import { UserRole } from './enums';

export * from './enums';

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  activo: boolean;
  rol: UserRole;
  sedeId?: number | null;
  sedeNombre?: string | null;
  solicitaCambioClave?: boolean;
  creadoEn?: string;
}

export interface Payment {
  id: number;
  usuarioId: number;
  nombreUsuario: string;
  montoCOP: number;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fechaPago: string;
  fechaAprobacion?: string;
  nombreAprobador?: string;
  comentarioRechazo?: string;
  tieneComprobante: boolean;
  comprobanteUrl?: string;
}

export interface Membership {
  id: number;
  usuarioId: number;
  planId: number;
  fechaInicio: string;
  fechaFin: string;
  estado: 'ACTIVA' | 'VENCIDA' | 'SUSPENDIDA' | 'PENDIENTE';
}

export interface LoginResponse {
  token: string;
  usuario: User;
}

export interface Receipt {
  id: number;
  pagoId: number;
  nombreOriginal: string;
  estado: string;
}

export interface Competition {
  id: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
  creadoEn: string;
}

export interface Training {
  id: number;
  entrenadorId: number;
  sedeId: number;
  titulo: string;
  descripcion: string;
  fechaHora: string;
  fechaFin: string;
  capacidadMaxima: number;
  estado: string;
}

export interface AttendanceMember {
  id: number;
  nombre: string;
  apellido: string;
  asistio: boolean;
  observaciones?: string;
}

export interface Registration {
  id: number;
  usuarioId: number;
  competenciaId: number;
  fechaInscripcion: string;
  estado: string; // PENDIENTE | CONFIRMADA | PAGO | CANCELADA
  usuarioNombre?: string;
  competenciaNombre?: string;
}

export interface Evaluation {
  id: number;
  inscripcionId: number;
  puntaje?: number;
  posicion?: number;
  desempeno?: string;
  comentarios?: string;
  evaluadoEn: string;
  evaluadoPorId: number;
  usuarioNombre?: string;
  competenciaNombre?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PaymentSummary {
  pendientes: number;
  totalAprobadoCOP: number;
}

export interface IngresoMensual {
  anio: number;
  mes: number; // 1-12
  totalCOP: number;
}

export interface UsuariosMensual {
  anio: number;
  mes: number; // 1-12
  cantidad: number;
}

export interface MembresiasPorEstado {
  estado: string;
  cantidad: number;
}

export interface DashboardAlerts {
  miembrosSinAsistencia21Dias: number;
  membresiasPorVencer7Dias: number;
  membresiasVencidas: number;
  pagosPendientesRevision: number;
  totalAlertas?: number;
}

export interface DashboardStats {
  usuariosActivos: number;
  membresiasActivas: number;
  totalMiembrosDeportivos?: number;
  tasaMembresiasAlDiaPct?: number;
  ingresosMesCOP: number;
  ingresosAnualesCOP?: number;
  pagosPendientes: number;
  ingresosPorMes: IngresoMensual[];
  ingresosUltimos12Meses?: IngresoMensual[];
  membresiasPorEstado: MembresiasPorEstado[];
  nuevosUsuariosPorMes: UsuariosMensual[];
  alertasAccionables?: DashboardAlerts;
  generadoEn: string;
}
