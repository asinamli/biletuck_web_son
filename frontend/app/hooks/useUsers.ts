import { create } from 'zustand';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface UsersStore {
  users: User[];
  setUsers: (users: User[]) => void;
}

const useUsers = create<UsersStore>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
}));

export default useUsers;

