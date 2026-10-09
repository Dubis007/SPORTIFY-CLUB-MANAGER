export enum UserRole {
  ADMIN = 'ADMIN',
  CONTADOR = 'CONTADOR',
  ENTRENADOR = 'ENTRENADOR',
  MIEMBRO = 'MIEMBRO',
}

export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  [UserRole.ADMIN]: '/admin/dashboard',
  [UserRole.CONTADOR]: '/accountant/dashboard',
  [UserRole.ENTRENADOR]: '/coach/dashboard',
  [UserRole.MIEMBRO]: '/member/dashboard',
};
