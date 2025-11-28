export interface UserFilterOptions {
  name?: string;        // partial match
  email?: string;       // exact match
  role?: string;        // exact match
  createdFrom?: string; // ISO date
  createdTo?: string;   // ISO date
}


export function buildUserFilters(filters: UserFilterOptions) {
  const where: any = {};

  if (filters.name) {
    where.name = { contains: filters.name, mode: "insensitive" };
  }

  if (filters.email) {
    where.email = filters.email;
  }

  if (filters.role) {
    where.role = filters.role.toUpperCase();
  }

  if (filters.createdFrom || filters.createdTo) {
    where.createdAt = {};
    if (filters.createdFrom) where.createdAt.gte = new Date(filters.createdFrom);
    if (filters.createdTo) where.createdAt.lte = new Date(filters.createdTo);
  }

  return where;
}
