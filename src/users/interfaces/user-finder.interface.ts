import { UserEntity } from '../entities/user.entity';

/**
 * Contract for finding a user by email. One implementation in this module;
 * Auth (and later admin/client login routes) use it without duplicating the query.
 */
export interface IUserFinder {
  getUserByEmail(email: string): Promise<UserEntity | null>;
}
