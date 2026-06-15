import { useState, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import VAGINAuth from "@/components/VAGINAuth";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  user_type: "girl" | "sponsor";
  country?: string;
  school?: string;
  age?: number;
}

interface DashboardStats {
  modulesCompleted: number;
  padsReceived: number;
  savingsBalance: number;
  attendanceImprovement: number;
}

// ─── Dashboard Header ─────────────────────────────────────────────────────────
const DashboardHeader = ({ user }: { user: UserProfile }) => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div
      ref={ref}
      className="relative w-full py-20"
      style={{
        background: "linear-gradient(135deg, #1A0025 0%, #0F172A 100%)",
        borderBottom: "1px solid rgba(217, 119, 6, 0.1)",
      }}
    >
      <div className="mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 11,
              color: "#D97706",
              letterSpacing: "4px",
              textTransform: "uppercase",
              margin: 0,
              marginBottom: 8,
            }}
          >
            Welcome Back
          </p>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              color: "#FAFAFA",
              margin: 0,
              marginBottom: 8,
            }}
          >
            Hello, {user.name}
          </h1>
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 14,
              color: "rgba(250,250,250,0.6)",
              margin: 0,
            }}
          >
            {user.user_type === "girl"
              ? "Continue your learning journey and track your progress"
              : "Monitor your impact and the girls you're supporting"}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// ─── Stats Grid ───────────────────────────────────────────────────────────────
const StatsGrid = ({
  stats,
  userType,
}: {
  stats: DashboardStats;
  userType: "girl" | "sponsor";
}) => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const statItems =
    userType === "girl"
      ? [
          { icon: "📚", label: "Modules Completed", value: stats.modulesCompleted },
          { icon: "🛡️", label: "Health Packs Received", value: stats.padsReceived },
          { icon: "💰", label: "Savings Balance", value: `$${stats.savingsBalance}` },
          { icon: "📈", label: "Attendance +", value: `${stats.attendanceImprovement}%` },
        ]
      : [
          { icon: "👧", label: "Girls Supported", value: "24" },
          { icon: "📦", label: "Pads Donated", value: "1,200" },
          { icon: "💵", label: "Total Contributed", value: "$2,400" },
          { icon: "⭐", label: "Impact Score", value: "4.8/5" },
        ];

  return (
    <div
      ref={ref}
      className="w-full py-16"
      style={{
        backgroundColor: "#0A0A0A",
      }}
    >
      <div className="mx-auto px-6 max-w-6xl">
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          {statItems.map((item, i) => (
            <motion.div
              key={item.label}
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={reduced ? {} : { y: -4 }}
              style={{
                background: "rgba(26, 26, 26, 0.6)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(217, 119, 6, 0.15)",
                borderRadius: 12,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
              <div
                className="font-display"
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#D97706",
                  margin: 0,
                  marginBottom: 4,
                }}
              >
                {item.value}
              </div>
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 12,
                  color: "rgba(250,250,250,0.5)",
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Learning Resources ───────────────────────────────────────────────────────
const LearningResources = () => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const resources = [
    {
      icon: "🌸",
      title: "Understanding Puberty",
      progress: 75,
      modules: 5,
    },
    {
      icon: "🛡️",
      title: "Personal Safety",
      progress: 40,
      modules: 4,
    },
    {
      icon: "✨",
      title: "Hygiene & Health",
      progress: 100,
      modules: 3,
    },
    {
      icon: "💪",
      title: "Mental Wellness",
      progress: 60,
      modules: 6,
    },
  ];

  return (
    <div
      ref={ref}
      className="w-full py-20"
      style={{
        backgroundColor: "#050505",
        borderTop: "1px solid rgba(217, 119, 6, 0.1)",
      }}
    >
      <div className="mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 11,
              color: "#D97706",
              letterSpacing: "4px",
              textTransform: "uppercase",
              margin: 0,
              marginBottom: 8,
            }}
          >
            Your Learning
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700,
              color: "#FAFAFA",
              margin: 0,
            }}
          >
            VaginART Curriculum
          </h2>
        </motion.div>

        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {resources.map((resource, i) => (
            <motion.div
              key={resource.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={reduced ? {} : { scale: 1.02 }}
              style={{
                background: "rgba(26, 26, 26, 0.6)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(217, 119, 6, 0.15)",
                borderRadius: 12,
                padding: 24,
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>{resource.icon}</div>
              <h3
                className="font-display"
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#FAFAFA",
                  margin: 0,
                  marginBottom: 12,
                }}
              >
                {resource.title}
              </h3>

              {/* Progress bar */}
              <div
                style={{
                  width: "100%",
                  height: 4,
                  background: "rgba(217, 119, 6, 0.2)",
                  borderRadius: 2,
                  overflow: "hidden",
                  marginBottom: 8,
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${resource.progress}%` } : { width: 0 }}
                  transition={{ delay: i * 0.1 + 0.2, duration: 0.8 }}
                  style={{
                    height: "100%",
                    background: "#D97706",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 12,
                    color: "#D97706",
                    fontWeight: 600,
                  }}
                >
                  {resource.progress}%
                </span>
                <span
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 11,
                    color: "rgba(250,250,250,0.5)",
                  }}
                >
                  {resource.modules} modules
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Impact Stories (for sponsors) ────────────────────────────────────────────
const ImpactStories = () => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const stories = [
    {
      name: "Amara",
      country: "Ghana",
      change: "Started a micro-savings account",
    },
    {
      name: "Zainab",
      country: "Kenya",
      change: "Improved attendance by 40%",
    },
    {
      name: "Precious",
      country: "Nigeria",
      change: "Became a peer mentor",
    },
  ];

  return (
    <div
      ref={ref}
      className="w-full py-20"
      style={{
        backgroundColor: "#0A0A0A",
        borderTop: "1px solid rgba(217, 119, 6, 0.1)",
      }}
    >
      <div className="mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 11,
              color: "#D97706",
              letterSpacing: "4px",
              textTransform: "uppercase",
              margin: 0,
              marginBottom: 8,
            }}
          >
            Impact
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700,
              color: "#FAFAFA",
              margin: 0,
            }}
          >
            Stories of Change
          </h2>
        </motion.div>

        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {stories.map((story, i) => (
            <motion.div
              key={story.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              style={{
                background: "rgba(26, 26, 26, 0.6)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(217, 119, 6, 0.15)",
                borderRadius: 12,
                padding: 24,
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <h3
                  className="font-display"
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#FAFAFA",
                    margin: 0,
                  }}
                >
                  {story.name}
                </h3>
                <p
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 12,
                    color: "#D97706",
                    margin: 0,
                  }}
                >
                  {story.country}
                </p>
              </div>
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 14,
                  color: "rgba(250,250,250,0.6)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                "{story.change}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const VAGINUserDashboard = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const mockStats: DashboardStats = {
    modulesCompleted: 3,
    padsReceived: 24,
    savingsBalance: 45,
    attendanceImprovement: 35,
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setAuthenticated(true);
        // Fetch user profile
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.session.user.id)
          .single();

        if (userData) {
          setUser(userData as UserProfile);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0A0A",
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: "rgba(250,250,250,0.6)",
            fontFamily: "DM Sans, system-ui, sans-serif",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  if (!authenticated || !user) {
    return <VAGINAuth onSuccess={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      <NavBar />

      <main>
        <DashboardHeader user={user} />
        <StatsGrid stats={mockStats} userType={user.user_type} />
        {user.user_type === "girl" ? (
          <LearningResources />
        ) : (
          <ImpactStories />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default VAGINUserDashboard;
