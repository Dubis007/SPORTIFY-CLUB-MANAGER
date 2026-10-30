import {
  LayoutDashboard,
  Timer,
  ClipboardCheck,
  Star,
  User,
  CalendarDays,
} from 'lucide-react';
import EnterpriseErpLayout, { type ErpNavItem } from '../EnterpriseErpLayout';

const COACH_NAV_ITEMS: ErpNavItem[] = [
  {
    label: 'Panel Principal',
    to: '/coach/dashboard',
    icon: LayoutDashboard,
    section: 'DIRECCIÓN TÉCNICA',
  },
  {
    label: 'Calendario Deportivo',
    to: '/coach/calendar',
    icon: CalendarDays,
    section: 'OPERACIÓN DEPORTIVA',
  },
  {
    label: 'Entrenamientos y Asistencia',
    to: '/coach/trainings',
    icon: Timer,
    section: 'OPERACIÓN DEPORTIVA',
  },
  {
    label: 'Inscripciones a Torneos',
    to: '/coach/registrations',
    icon: ClipboardCheck,
    section: 'OPERACIÓN DEPORTIVA',
  },
  {
    label: 'Observaciones y Puntajes',
    to: '/coach/evaluations',
    icon: Star,
    section: 'OPERACIÓN DEPORTIVA',
  },
  {
    label: 'Mi Perfil Técnico',
    to: '/coach/profile',
    icon: User,
    section: 'CUENTA',
  },
];

export default function CoachLayout() {
  return (
    <EnterpriseErpLayout
      roleTitle="Panel de Entrenador"
      roleSubtitle="Planificación Deportiva, Control de Asistencia y Evaluación"
      roleAccentLabel="ENTRENADOR"
      navItems={COACH_NAV_ITEMS}
    />
  );
}
