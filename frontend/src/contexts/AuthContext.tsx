import {
  Dispatch,
  SetStateAction,
  createContext,
  useState,
  useContext
} from "react";
import validator from "validator";

export type User = { id: string; username: string | null } | null;

type IAuthContext = {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  logInLocal: (identifier: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  signUpLocal: (
    email: string,
    username: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  getUser: () => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  logInGoogle: () => void;
};

type Props = {
  children: React.ReactNode;
};

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export function AuthContextProvider({ children }: Props) {
  const [user, setUser] = useState<User>(null);

  async function logInLocal(
    identifier: string,
    password: string
  ): Promise<void> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/local/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ identifier, password })
        }
      );

      if (!response.ok) {
        let errorMessage;
        try {
          const data = await response.json();
          errorMessage = data.message ?? "Login failed";
        } catch (error) {
          errorMessage = "Login failed";
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(data);
      const user: User = {
        id: data.id,
        username: data.username
      };

      setUser(user);
    } catch (error) {
      throw error;
    }
  }

  // async function logInLocal(
  //   identifier: string,
  //   password: string
  // ): Promise<void> {
  //   await new Promise<void>((resolve) => {
  //     setTimeout(() => {
  //       resolve();
  //     }, 3000);
  //   });
  //   console.log(user);
  //   setUser({ id: identifier, username: password });
  // }

  async function logOut(): Promise<void> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/logout`,
      {
        credentials: "include",
        headers: {
          Accept: "application/json"
        }
      }
    );

    if (!response.ok) {
      console.log(response);
      throw new Error("An error occurred while logging out");
    } else {
      setUser(null);
    }
  }

  // async function logOut(): Promise<void> {
  //   await new Promise<void>((resolve) => {
  //     setTimeout(() => {
  //       resolve();
  //     }, 500);
  //     setUser(null);
  //   });
  // }

  async function signUpLocal(
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<void> {
    if (!username || !email || !password || !confirmPassword)
      throw new Error("All fields must be completed");
    const usernameRegex = /^[A-Za-z0-9_]*$/;
    if (username.length < 3)
      throw new Error("Username must be at least 3 charcters long");
    if (username.length > 20)
      throw new Error("Username cannot be longer than 20 characters");
    if (!usernameRegex.test(username))
      throw new Error(
        "Username may only contain letters, numbers, and underscores"
      );
    if (!validator.isEmail(email)) throw new Error("Invalid email address");
    if (password !== confirmPassword) throw new Error("Passwords do not match");
    if (password.length < 6)
      throw new Error("Password must be at least 6 characters long");
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/;
    if (!passwordRegex.test(password))
      throw new Error(
        "Password must contain a lowercase letter, an uppercase letter, a digit, and a special character"
      );

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/local/signup`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password, confirmPassword })
      }
    );

    if (!response.ok) {
      let errorMessage;
      try {
        const data = await response.json();
        errorMessage = data.message ?? "Sign-up failed";
      } catch (error) {
        errorMessage = "Sign-up failed";
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    const user: User = {
      id: data.id,
      username: data.username
    };
    setUser(user);
  }

  async function getUser(): Promise<void> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/user`,
      {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      }
    );
    if (!response.ok) throw new Error("Invalid authentication");
    const data = await response.json();
    setUser({ id: data.id, username: data.username });
  }

  async function updateUsername(username: string) {
    const usernameRegex = /^[A-Za-z0-9_]*$/;
    if (username.length < 3)
      throw new Error("Username must be at least 3 charcters long");
    if (username.length > 20)
      throw new Error("Username cannot be longer than 20 characters");
    if (!usernameRegex.test(username))
      throw new Error(
        "Username may only contain letters, numbers, and underscores"
      );

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/username`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username })
      }
    );

    if (!response.ok) {
      let errorMessage;
      try {
        const data = await response.json();
        errorMessage = data.message ?? "Request failed";
      } catch (error) {
        errorMessage = "Request failed";
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    const user: User = {
      id: data.id,
      username: data.username
    };
    setUser(user);
  }

  function logInGoogle() {
    window.open(
      `${import.meta.env.VITE_BACKEND_URL}/auth/google/login`,
      "_self"
    );
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logInLocal,
        logOut,
        signUpLocal,
        getUser,
        updateUsername,
        logInGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
