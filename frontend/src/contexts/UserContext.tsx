import { createContext, useContext, useState } from "react";

type Props = {
  children: React.ReactNode;
};

type TUserContext = {
  friends: string[];
  updateFriends: () => Promise<void>;
};

const UserContext = createContext<TUserContext>({} as TUserContext);
export function UserContextProvider({ children }: Props) {
  const [friends, setFriends] = useState<string[]>([]);

  const updateFriends = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/friends`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        }
      );
      const data = await response.json();
      setFriends(data.friends);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <UserContext.Provider value={{ friends, updateFriends }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
