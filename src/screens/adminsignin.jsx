import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Adminsignin() {
  const [users, setUsers] = useState([]);
  const [emailsigin, setEmailsigin] = useState("");
  const [passwordsignin, setPasswordsignin] = useState("");

  const navigate = useNavigate();

  const allUser = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users",
      });

      console.log("GET", response);

      if (response.status === 200) {
        setUsers(response.data);

        const rawId = localStorage.getItem("id");
        if (rawId) {
          const id = String(rawId).replaceAll('"', "");
          const currentUser = response.data.find(
            (item) => String(item.id) === String(id),
          );

          if (currentUser) {
            if (currentUser.role === "admin") {
              navigate("/admin");
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    allUser();
  }, []);

  const signIn = async () => {
    if (!emailsigin.trim() || !passwordsignin.trim()) {
      alert("Заполните все поля");
      return;
    }

    try {
      const response = await axios({
        method: "GET",
        url: "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users",
      });

      if (response.status === 200) {
        const currentUser = response.data.find(
          (item) =>
            item.email === emailsigin.trim() &&
            item.password === passwordsignin,
        );

        if (!currentUser) {
          alert("Email или пароль неправильные");
          return;
        }

        console.log("НАЙДЕННЫЙ ПОЛЬЗОВАТЕЛЬ:", currentUser);
        console.log("ROLE:", currentUser.role);

        if (currentUser.role === "admin") {
          localStorage.setItem("id", JSON.stringify(currentUser.id));

          console.log("СОХРАНЁННЫЙ ID:", localStorage.getItem("id"));

          navigate("/admin");
          return;
        }

        alert("У пользователя нет прав администратора");
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка при входе");
    }
  };

  return (
    <div className="admin-signup-page">
      {/* 1 часть */}
      <div className="admin-signup-left">
        <div className="admin-signup-logo">
          MarketGo<span>.</span>
        </div>

        <div className="admin-signup-left-content">
          <p className="admin-signup-small">ПАНЕЛЬ УПРАВЛЕНИЯ</p>

          <h1>
            Вход в
            <br />
            администратора
          </h1>

          <p className="admin-signup-left-text">
            Входите в аккаунт администратора, чтобы управлять магазином,
            товарами и заказами в одном месте.
          </p>
        </div>

        <div className="admin-signup-left-bottom">MarketGo — ВАШ МАГАЗИН</div>
      </div>

      {/* 2 часть */}
      <div className="admin-signup-right">
        <div className="admin-signup-form-container">
          <p className="admin-signup-form-small">ДОБРО ПОЖАЛОВАТЬ</p>

          <h2>Вход в аккаунт</h2>

          <p className="admin-signup-form-description">
            Заполните данные для входа в администратора.
          </p>

          <div className="admin-signup-form">
            <div className="admin-signup-field">
              <label>Email</label>

              <input
                type="email"
                placeholder="Введите ваш email"
                onChange={(e) => setEmailsigin(e.target.value)}
                value={emailsigin}
              />
            </div>

            <div className="admin-signup-field">
              <label>Пароль</label>

              <input
                type="password"
                placeholder="Введите пароль"
                onChange={(e) => setPasswordsignin(e.target.value)}
                value={passwordsignin}
              />
            </div>

            <button className="admin-signup-button" onClick={signIn}>
              Вход
              <span>→</span>
            </button>
          </div>

          <p className="admin-signup-bottom-text">MarketGO</p>
        </div>
      </div>
    </div>
  );
}

export default Adminsignin;
