import {
  User,
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { FirebaseContext } from "./firebase";

interface AuthContext {
  user: User | null;
  login: (credential: { username: string; password?: string }) => Promise<User>;
  logout: () => Promise<void>;
  isAuthed: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContext | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { app } = useContext(FirebaseContext);
  if (!app)
    throw new Error("AuthProvider must be used within a FirebaseProvider");

  const auth = getAuth(app);
  if (
    process.env.FIRESTORE_EMULATOR == "true" &&
    !!process.env.FIREBASE_AUTH_EMULATOR_HOST
  ) {
    // https://stackoverflow.com/questions/73605307/firebase-auth-emulator-fails-intermittently-with-auth-emulator-config-failed
    (auth as unknown as any)._canInitEmulator = true;
    connectAuthEmulator(auth, process.env.FIREBASE_AUTH_EMULATOR_HOST, {
      disableWarnings: true,
    });
  }

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(true);
      setUser(user);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [app, auth]);

  const login = useCallback(
    async (credential: { username: string; password?: string }) => {
      const email = `${credential.username}@example.com`;
      const password = credential.password || "123456";

      try {
        await setPersistence(auth, browserLocalPersistence);

        const userCrendential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        return userCrendential.user;
      } catch (error) {
        throw error;
      }
    },
    [app, auth]
  );

  const logout = useCallback(async () => {
    await signOut(auth);
  }, [auth, setUser]);

  const authContextReturn: AuthContext = {
    user: user,
    login: login,
    logout: logout,
    isAuthed: !!user,
    isLoading: isLoading,
  };

  return (
    <AuthContext.Provider value={authContextReturn}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
