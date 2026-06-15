import { useState, useRef } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface AuthProps {
  onSuccess: (userId: string) => void;
}

const VAGINAuth = ({ onSuccess }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<"girl" | "sponsor">("girl");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    country: "",
    school: "",
    age: "",
  });

  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(17, 17, 17, 0.6)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(217, 119, 6, 0.15)",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#FAFAFA",
    fontFamily: "DM Sans, system-ui, sans-serif",
    fontSize: 13,
    outline: "none",
    transition: "all 0.2s",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(217, 119, 6, 0.4)";
    e.target.style.background = "rgba(17, 17, 17, 0.75)";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(217, 119, 6, 0.15)";
    e.target.style.background = "rgba(17, 17, 17, 0.6)";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      if (data.user) {
        onSuccess(data.user.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed");

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: formData.email,
        name: formData.name,
        user_type: userType,
        country: formData.country || null,
        school: formData.school || null,
        age: formData.age ? parseInt(formData.age) : null,
      });

      if (profileError) throw profileError;
      onSuccess(authData.user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={ref}
      className="min-h-screen flex items-center justify-center py-12"
      style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1A0025 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 700,
              color: "#FAFAFA",
              margin: 0,
              marginBottom: 8,
            }}
          >
            {isLogin ? "Welcome Back" : "Join VAGIN"}
          </h1>
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 14,
              color: "rgba(250,250,250,0.6)",
              margin: 0,
            }}
          >
            {isLogin ? "Sign in to access your resources" : "Create your account to get started"}
          </p>
        </div>

        {/* User Type Selection */}
        {!isLogin && (
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {(["girl", "sponsor"] as const).map((type) => (
              <motion.button
                key={type}
                onClick={() => setUserType(type)}
                whileHover={reduced ? {} : { scale: 1.02 }}
                whileTap={reduced ? {} : { scale: 0.98 }}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 12,
                  textTransform: "capitalize",
                  fontWeight: 500,
                  border: `1px solid ${
                    userType === type ? "#D97706" : "rgba(217, 119, 6, 0.2)"
                  }`,
                  background:
                    userType === type
                      ? "rgba(217, 119, 6, 0.15)"
                      : "transparent",
                  color: userType === type ? "#D97706" : "rgba(250,250,250,0.6)",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {type === "girl" ? "I'm a Girl" : "I'm a Sponsor"}
              </motion.button>
            ))}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={isLogin ? handleLogin : handleSignup}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {/* Email */}
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              style={inputStyle}
            />
          </div>

          {/* Name (signup only) */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  required
                  style={inputStyle}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Country (signup only) */}
          <AnimatePresence>
            {!isLogin && userType === "girl" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="country" className="sr-only">
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={inputStyle}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* School (signup only, girls) */}
          <AnimatePresence>
            {!isLogin && userType === "girl" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="school" className="sr-only">
                  School Name
                </label>
                <input
                  id="school"
                  type="text"
                  placeholder="School name (optional)"
                  value={formData.school}
                  onChange={(e) =>
                    setFormData({ ...formData, school: e.target.value })
                  }
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={inputStyle}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Age (signup only, girls) */}
          <AnimatePresence>
            {!isLogin && userType === "girl" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="age" className="sr-only">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  placeholder="Age"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  min="8"
                  max="25"
                  style={inputStyle}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 13,
                  color: "#EF4444",
                  fontFamily: "DM Sans, system-ui, sans-serif",
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={reduced || loading ? {} : { opacity: 0.9, scale: 1.02 }}
            whileTap={reduced || loading ? {} : { scale: 0.98 }}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 12,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontWeight: 500,
              background: loading ? "rgba(217, 119, 6, 0.5)" : "#D97706",
              color: "#0A0A0A",
              border: "none",
              borderRadius: 8,
              padding: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
          </motion.button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <span
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 13,
              color: "rgba(250,250,250,0.6)",
            }}
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setFormData({
                  email: "",
                  password: "",
                  name: "",
                  country: "",
                  school: "",
                  age: "",
                });
              }}
              style={{
                background: "none",
                border: "none",
                color: "#D97706",
                cursor: "pointer",
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default VAGINAuth;
