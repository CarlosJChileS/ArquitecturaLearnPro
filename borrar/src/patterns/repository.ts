export interface User {
  id: string;
  name: string;
}

export interface UserRepository {
  add(user: User): void;
  findById(id: string): User | undefined;
  findAll(): User[];
}

export class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();

  add(user: User): void {
    this.users.set(user.id, user);
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }
}
