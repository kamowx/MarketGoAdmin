import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

function Admin() {
  const navigate = useNavigate();

  const [page, setPage] = useState("Главная");
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);

  /////////////

  const getApplications = async () => {
    try {
      const response = await axios.get(
        "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users",
      );

      const newApplications = response.data.filter(
        (item) =>
          (item.role === "seller" ||
            item.role === "courier" ||
            item.role === "pickuppoint") &&
          item.status === "Ожидание",
      );

      setApplications(newApplications);
    } catch (error) {
      console.error("Ошибка загрузки заявок:", error);
    }
  };
  //////////////

  // Получение всех пользователей
  const getUsers = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users",
      });

      console.log("GET USERS:", response);

      if (response.status === 200) {
        setUsers(response.data);
        getApplications();

        const savedId = localStorage.getItem("id");
        const id = String(savedId).replaceAll('"', "");

        const admin = response.data.find((item) => String(item.id) === id);

        console.log("ADMIN:", admin);
      }
    } catch (error) {
      console.error("GET USERS ERROR:", error);
    }
  };

  // Проверка пользователя
  const checkUser = async () => {
    const savedId = localStorage.getItem("id");

    if (!savedId) {
      navigate("/", { replace: true });
      return;
    }

    const id = String(savedId).replaceAll('"', "");

    try {
      const response = await axios({
        method: "GET",
        url: `https://6aedd445a677fe0fc14f8ae2.mockapi.io/users/${id}`,
      });

      if (response.status === 200) {
        const currentUser = response.data;

        console.log("CURRENT USER:", currentUser);
        console.log("ROLE:", currentUser.role);

        if (currentUser.role === "user") {
          navigate("/home", { replace: true });
          return;
        }

        if (currentUser.role === "admin") {
          getUsers();
          return;
        }

        localStorage.removeItem("id");
        navigate("/signin", { replace: true });
      }
    } catch (error) {
      console.error("CHECK USER ERROR:", error);
      localStorage.removeItem("id");
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <AdminLayout title="Главная">
      <div className="admin-welcome">
        <div>
          <h2>Добро пожаловать! {page}</h2>
          <p>Здесь вы можете управлять платформой MarketGo.</p>
        </div>

        <i className="fa-solid fa-chart-line"></i>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon black">
            <i className="fa-solid fa-users"></i>
          </div>

          <div>
            <p>Всего пользователей</p>
            <h2>{users.length}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <i className="fa-solid fa-users"></i>
          </div>

          <div>
            <p>Обычные пользователи</p>
            <h2>{users.filter((item) => item.role === "user").length}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <i className="fa-solid fa-store"></i>
          </div>

          <div>
            <p>Продавцы</p>
            <h2>{users.filter((item) => item.role === "seller").length}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon orange">
            <i className="fa-solid fa-truck"></i>
          </div>

          <div>
            <p>Курьеры</p>
            <h2>{users.filter((item) => item.role === "courier").length}</h2>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon orange">
            <i className="fa-solid fa-box"></i>
          </div>

          <div>
            <p>Пункты передачи</p>
            <h2>
              {users.filter((item) => item.role === "pickuppoint").length}
            </h2>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-heading">
          <div>
            <h3>Новые заявки</h3>
            <p>Последние заявки от продавцов, курьеров и пунктов передачи</p>
          </div>

          <button
            className="admin-text-button"
            onClick={() => navigate("/admin/seller-requests")}
          >
            Все заявки <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Заявитель</th>
                <th>Тип заявки</th>
                <th>Дата</th>
                <th>Действие</th>
              </tr>
            </thead>

            <tbody>
              {applications.length > 0 ? (
                applications.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>
                        {item.role === "seller"
                          ? item.businessName ||
                            item.firstname + " " + item.lastname
                          : item.firstname + " " + item.lastname}
                      </strong>
                    </td>

                    <td>
                      <span className="admin-type">
                        {item.role === "seller"
                          ? "Продавец"
                          : item.role === "courier"
                            ? "Курьер"
                            : "Пункт передачи"}
                      </span>
                    </td>

                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("ru-RU")
                        : "—"}
                    </td>

                    <td>
                      <button
                        className="admin-small-button"
                        onClick={() =>
                          navigate(
                            item.role === "seller"
                              ? "/adminsellerrequests"
                              : item.role === "courier"
                                ? "/admincourierrequests"
                                : "/adminpickuppointrequests",
                          )
                        }
                      >
                        Смотреть
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    Новых заявок нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Admin;
