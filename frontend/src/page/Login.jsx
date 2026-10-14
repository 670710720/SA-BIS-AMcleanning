import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();  
  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#ffffff",
      fontFamily: "Arial, sans-serif",
      color: "#40566d",
    },
    header: {
      background: "#8bcaf9",
      color: "#ffffff",
      padding: "20px 4%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "12px",
    },
    brand: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    logo: {
      width: "58px",
      height: "58px",
      border: "2px solid white",
      borderRadius: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "34px",
    },
    brandTitle: {
      margin: 0,
      fontSize: "28px",
    },
    brandSubtitle: {
      margin: "5px 0 0",
      fontSize: "14px",
    },
    main: {
      flex: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "45px 20px",
    },
    card: {
      width: "100%",
      maxWidth: "460px",
    },
    avatar: {
      width: "90px",
      height: "90px",
      borderRadius: "50%",
      background: "#8bcaf9",
      color: "#ffffff",
      fontSize: "58px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      margin: "0 auto 20px",
    },
    title: {
      color: "#4da6ed",
      textAlign: "center",
      fontSize: "30px",
      margin: 0,
    },
    subtitle: {
      textAlign: "center",
      color: "#8192a5",
      margin: "10px 0 32px",
      fontSize: "15px",
    },
    label: {
      display: "block",
      marginBottom: "10px",
      color: "#4da6ed",
      fontSize: "15px",
      fontWeight: "bold",
    },
    input: {
      width: "100%",
      height: "50px",
      padding: "0 15px",
      border: "1px solid #c4e3ff",
      borderRadius: "10px",
      fontSize: "15px",
      boxSizing: "border-box",
      outlineColor: "#8bcaf9",
      background: "#ffffff",
    },
    group: {
      marginBottom: "24px",
    },
    forgot: {
      display: "block",
      textAlign: "left",
      color: "#4da6ed",
      fontSize: "14px",
      marginTop: "-10px",
      marginBottom: "25px",
      cursor: "pointer",
    },
    button: {
      width: "100%",
      height: "54px",
      background: "#8bcaf9",
      color: "#ffffff",
      border: "none",
      borderRadius: "12px",
      fontSize: "17px",
      fontWeight: "bold",
      cursor: "pointer",
    },
    footer: {
      textAlign: "center",
      padding: "16px",
      color: "#8192a5",
      fontSize: "12px",
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!employeeId.trim() || !password) {
        alert("กรุณากรอกรหัสพนักงานและรหัสผ่าน");
        return;
    }

    // สำหรับทดสอบหน้าจอเท่านั้น
    localStorage.setItem("isLoggedIn", "true");
    navigate("/");
    };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.logo}>✦</div>

          <div>
            <h1 style={styles.brandTitle}>CleanCare</h1>
            <p style={styles.brandSubtitle}>
              Cleaning Service Solutions
            </p>
          </div>
        </div>

        <div>สะอาด ปลอดภัย ใส่ใจทุกพื้นที่ ✨</div>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
          <div style={styles.avatar}>●</div>

          <h2 style={styles.title}>เข้าสู่ระบบ</h2>

          <p style={styles.subtitle}>
            สำหรับพนักงานและผู้ดูแลระบบ
          </p>

          <form onSubmit={handleSubmit}>
            <div style={styles.group}>
              <label htmlFor="employeeId" style={styles.label}>
                รหัสพนักงาน
              </label>

              <input
                id="employeeId"
                type="text"
                placeholder="กรอกรหัสพนักงาน"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                autoComplete="username"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.group}>
              <label htmlFor="password" style={styles.label}>
                รหัสผ่าน
              </label>

              <input
                id="password"
                type="password"
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={styles.input}
              />
            </div>

            <button
              type="button"
              style={styles.forgot}
              onClick={() =>
                alert("กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน")
              }
            >
              ลืมรหัสผ่าน?
            </button>

            <button type="submit" style={styles.button}>
              เข้าสู่ระบบ
            </button>
          </form>
        </section>
      </main>

      <footer style={styles.footer}>
        © 2026 CleanCare | Cleaning Service Management System
      </footer>
    </div>
  );
}

export default Login;
