import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";        // axios instance
import AuthContext from "../../context/AuthContext";

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // 🔐 Handle Login
  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", form);

      if (res.data.success) {
        // store user in context
        setUser(res.data.user);

        alert("Login success ✅");

        // redirect to dashboard
       window.location.href = "http://localhost:3001";

      } else {
        alert(res.data.message || "Login failed");
      }

    } catch (err) {
      console.log(
        "LOGIN ERROR:",
        err.response?.data || err.message
      );
      alert("Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      {/* Email */}
      <input
        type="email"
        placeholder="Enter email"
        value={form.email}
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value,
          })
        }
      />

      {/* Password */}
      <input
        type="password"
        placeholder="Enter password"
        value={form.password}
        onChange={(e) =>
          setForm({
            ...form,
            password: e.target.value,
          })
        }
      />

      {/* Button */}
      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}