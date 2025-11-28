
import type { PrismaClient } from '../generated/prisma/client';

export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: number; // optional, contains the ID to fetch the next page
}

export interface CursorPaginationOptions<T extends { id: number }> {
  prisma: PrismaClient;
  model: keyof PrismaClient; // Prisma model name (e.g., 'user')
  select?: any; // fields to select
  limit?: number; // number of items per page
  cursor?: number | undefined; // last fetched ID, optional
  orderBy?: any; // sorting order (e.g., { createdAt: 'asc' } or { id: 'desc' })
  where?: any; // filtering conditions
}

/**
 ** Cursor-based pagination** function
 * 
 * Sorting:
 * - The `orderBy` field determines the sorting order of the results.
 * - Default is `{ createdAt: 'asc' }`, but you can pass any field like `id` or `name`.
 * - Important for large datasets to maintain consistent order across pages.
 */
export async function paginate<T extends { id: number }>({
  prisma,
  model,
  select,
  limit = 10,
  cursor,
  orderBy = { createdAt: 'asc' }, // default sorting by creation date ascending
  where,
}: CursorPaginationOptions<T>): Promise<PaginatedResult<T>> {
  const query: any = {
    take: limit + 1, // fetch one extra to check if next page exists
    orderBy,         // sorting applied here
    where,
    select,
    
  };

  // Apply cursor if provided, skip the cursor itself
  if (cursor !== undefined && cursor !== null) {
    query.cursor = { id: cursor };
    query.skip = 1;
  }

  // Dynamic Prisma model access
  const data: T[] = await (prisma[model] as any).findMany(query);

  // Determine nextCursor if more data exists
  let nextCursor: number | undefined;
  if (data.length > limit) {
    const nextItem = data.pop(); // remove extra item
    if (nextItem) nextCursor = nextItem.id;
  }

  // Return paginated result with optional nextCursor
  return nextCursor !== undefined ? { data, nextCursor } : { data };
}
