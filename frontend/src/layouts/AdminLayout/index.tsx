import {
  LayoutDashboard,
  Users,
  CreditCard,
  Trophy,
  Timer,
  ClipboardCheck,
  Star,
  Building2,
  Tags,
  DollarSign,
} from 'lucide-react';
import EnterpriseErpLayout, { type ErpNavItem } from '../EnterpriseErpLayout';

const ADMIN_NAV_ITEMS: ErpNavItem[] = [
  {
    label: 'Dashboard Ejecutivo',
    to: '/admin/dashboard',
    icon: LayoutDashboard,
    section: 'INTELIGENCIA Y CONTROL',
  },
  {
    label: 'Pagos Financieros',
    to: '/admin/payments',
    icon: DollarSign,
    section: 'INTELIGENCIA Y CONTROL',
  },
  {
    label: 'Gestión Usuarios',
    to: '/admin/users',
    icon: Users,
    section: 'ADMINISTRACIÓN DE CLUB',
  },
  {
    label: 'Membresías',
    to: '/admin/memberships',
    icon: CreditCard,
    section: 'ADMINISTRACIÓN DE CLUB',
  },
  {
    label: 'Planes Membresía',
    to: '/admin/plans',
    icon: Tags,
    section: 'ADMINISTRACIÓN DE CLUB',
  },
  {
    label: 'Sedes e Instalaciones',
    to: '/admin/locations',
    icon: Building2,
    section: 'ADMINISTRACIÓN DE CLUB',
  },
  {
    label: 'Entrenamientos',
    to: '/admin/trainings',
    icon: Timer,
    section: 'OPERACIÓN DEPORTIVA',
  },
  {
    label: 'Competencias',
    to: '/admin/competitions',
    icon: Trophy,
    section: 'OPERACIÓN DEPORTIVA',
  },
  {
    label: 'Inscripciones',
    to: '/admin/registrations',
    icon: ClipboardCheck,
    section: 'OPERACIÓN DEPORTIVA',
  },
  {
    label: 'Observaciones Técnicas',
    to: '/admin/evaluations',
    icon: Star,
    section: 'OPERACIÓN DEPORTIVA',
  },
];

export default function AdminLayout() {
  return (
    <EnterpriseErpLayout
      roleTitle="Panel de Administración"
      roleSubtitle="Dirección General y Control Operativo del Club"
      roleAccentLabel="ADMIN"
      navItems={ADMIN_NAV_ITEMS}
    />
  );
}
