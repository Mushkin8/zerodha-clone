import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(
      "http://localhost:3002/auth/check",
      { withCredentials: true }
    )
    .then(res => {
      setUser(res.data.user);
    })
    .catch(() => setUser(null))
    .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;