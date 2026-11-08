import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Adminsignup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("id");

    if (!id) {
      return;
    }

    const checkUser = async () => {
      try {
        const response = await axios({
          method: "GET",
          url: "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users",
        });

        if (response.status === 200) {
          const currentUser = response.data.find(
            (item) => String(item.id) === String(id).replaceAll('"', ""),
          );

          if (!currentUser) {
            return;
          }

          if (currentUser.role == "admin") {
            navigate("/admin");
            return;
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkUser();
  }, []);

  const signup = async () => {
    if (
      !email.trim() ||
      !phone.trim() ||
      !password.trim() ||
      !password2.trim()
    ) {
      alert("Заполните все поля");
      return;
    }

    if (password != password2) {
      alert("Пароли не совпадают");
      return;
    }

    try {
      const response = await axios({
        method: "GET",
        url: "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users",
      });

      if (response.status === 200) {
        const checkEmail = response.data.some((item) => item.email == email);

        if (checkEmail == true) {
          alert("Такой email уже зарегистрирован");
          return;
        }

        const checkPhone = response.data.some(
          (item) => item.numberphone == phone,
        );

        if (checkPhone == true) {
          alert("Пользователь с таким номером уже зарегистрирован");
          return;
        }

        const newUser = await axios({
          method: "POST",
          url: "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users",
          data: {
            firstname: "admin",
            lastname: "admin",
            email: email,
            numberphone: phone,
            password: password,
            role: "admin",
            status: "Подтвержденный",
            balance: "0",
            adres: "",
          },
        });

        console.log("ADMIN SIGNUP:", newUser);

        if (newUser.status === 201) {
          alert("Администратор зарегистрирован");
          navigate("/");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка при регистрации");
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
            Регистрация
            <br />
            администратора
          </h1>

          <p className="admin-signup-left-text">
            Создайте аккаунт администратора, чтобы управлять магазином, товарами
            и заказами в одном месте.
          </p>
        </div>

        <div className="admin-signup-left-bottom">MarketGo — ВАШ МАГАЗИН</div>
      </div>

      {/* 2 часть */}
      <div className="admin-signup-right">
        <div className="admin-signup-form-container">
          <p className="admin-signup-form-small">ДОБРО ПОЖАЛОВАТЬ</p>

          <h2>Создать аккаунт</h2>

          <p className="admin-signup-form-description">
            Заполните данные для регистрации администратора.
          </p>

          <div className="admin-signup-form">
            <div className="admin-signup-field">
              <label>Email</label>

              <input
                type="email"
                placeholder="Введите ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="admin-signup-field">
              <label>Номер телефона</label>

              <input
                type="number"
                placeholder="Введите ваш телефонный номер"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="admin-signup-field">
              <label>Пароль</label>

              <input
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="admin-signup-field">
              <label>Подвердите пароль</label>

              <input
                type="password"
                placeholder="Введите пароль"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
            </div>

            <button className="admin-signup-button" onClick={signup}>
              Зарегистрироваться
              <span>→</span>
            </button>
          </div>

          <p className="admin-signup-bottom-text">MarketGO</p>
        </div>
      </div>
    </div>
  );
}

export default Adminsignup;
