

/* -------------------------------------------------------
   👤 User Type
   Represents a customer/user record in the POS.
------------------------------------------------------- */
import type { User } from "../../types/user";

/* -------------------------------------------------------
   🧱 userService
   Lightweight abstraction over user storage.

   Responsibilities:
   - find(): lookup by phone or email
   - create(): add a new user
   - all(): return all stored users

   NOTE:
   - Currently backed by localStorage for demo purposes.
   - Designed so it can be swapped for MongoDB later
     without changing any UI components.
------------------------------------------------------- */
export const userService = {
  /* -------------------------------------------------------
     🔍 find()
     Lookup a user by phone OR email.
     Returns null if not found.
  ------------------------------------------------------- */
  async find(value: string): Promise<User | null> {
    const stored = localStorage.getItem("users");
    const users: User[] = stored ? JSON.parse(stored) : [];

    return users.find(
      (u) => u.phone === value || u.email === value
    ) || null;
  },

  /* -------------------------------------------------------
     ➕ create()
     Create a new user record.
     - Generates UUID
     - Initializes loyalty points
     - Stores in localStorage
  ------------------------------------------------------- */
  async create(data: {
    name?: string;
    phone?: string;
    email?: string;
  }): Promise<User> {
    const stored = localStorage.getItem("users");
    const users: User[] = stored ? JSON.parse(stored) : [];

    const newUser: User = {
      id: crypto.randomUUID(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      password: null,
      loyaltyPoints: 0,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    return newUser;
  },

  /* -------------------------------------------------------
     📋 all()
     Return all stored users.
  ------------------------------------------------------- */
  async all(): Promise<User[]> {
    const stored = localStorage.getItem("users");
    return stored ? JSON.parse(stored) : [];
  },
};
