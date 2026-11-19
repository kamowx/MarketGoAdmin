import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import AdminLayout from "../components/AdminLayout";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const BUSINESS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/buisness";

function Adminsellers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("id");

    if (!id) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Получить всех продавцов
  const getAllUser = async () => {
    try {
      const response = await axios.get(USERS_URL);

      if (response.status === 200) {
        const allUsers = response.data.filter((item) => item.role === "seller");

        setUsers(allUsers);
      }
    } catch (error) {
      console.error("ОШИБКА ПОЛУЧЕНИЯ ПРОДАВЦОВ:", error);
    }
  };

  // Получить все магазины
  const getBUSINES = async () => {
    try {
      const response = await axios.get(BUSINESS_URL);

      if (response.status === 200) {
        setBusinesses(response.data);
      }
    } catch (error) {
      console.error("ОШИБКА ПОЛУЧЕНИЯ МАГАЗИНОВ:", error);
    }
  };

  // Проверка администратора
  const checkUser = async () => {
    const savedId = localStorage.getItem("id");

    if (!savedId) {
      navigate("/", { replace: true });
      return;
    }

    const id = String(savedId).replaceAll('"', "");

    try {
      const response = await axios.get(`${USERS_URL}/${id}`);
      const currentUser = response.data;

      if (currentUser.role !== "admin") {
        navigate("/home", { replace: true });
        return;
      }

      await Promise.all([getAllUser(), getBUSINES()]);
    } catch (error) {
      console.error("CHECK USER ERROR:", error);

      if (error.response?.status === 404) {
        localStorage.removeItem("id");
        navigate("/", { replace: true });
      } else {
        alert("Ошибка подключения к серверу. Попробуйте ещё раз.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  // Редактировать продавца
  const updateUser = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(`${USERS_URL}/${editing.id}`, editing);

      if (response.status === 200) {
        setUsers((prev) =>
          prev.map((item) =>
            String(item.id) === String(editing.id) ? response.data : item,
          ),
        );

        setEditing(null);
        alert("Данные продавца обновлены!");
      }
    } catch (error) {
      console.error("ОШИБКА ОБНОВЛЕНИЯ:", error);
      alert("Не удалось обновить продавца");
    }
  };

  // Удалить продавца
  const deleteBooking = async (item) => {
    const confirmDelete = window.confirm(
      "Вы действительно хотите удалить этого продавца?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${USERS_URL}/${item.id}`);

      setUsers((prev) =>
        prev.filter((user) => String(user.id) !== String(item.id)),
      );

      alert("Продавец удалён!");
    } catch (error) {
      console.error("ОШИБКА УДАЛЕНИЯ:", error);
      alert("Не удалось удалить продавца");
    }
  };

  return (
    <AdminLayout title="Продавцы">
      <div className="admin-page-heading">
        <div>
          <h3>Продавцы</h3>
          <p>Список продавцов, зарегистрированных на MarketGo.</p>
        </div>

        <span className="admin-total">{users.length} Продавцов</span>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Продавец</th>
              <th>Телефон</th>
              <th>Email</th>
              <th>Адрес продавца</th>
              <th>Магазин</th>
              <th>Адрес магазина</th>
              <th>Баланс</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8">Загрузка продавцов...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="8">Продавцы пока не зарегистрированы</td>
              </tr>
            ) : (
              users.map((item) => {
                // Находим магазин этого продавца
                const business = businesses.find(
                  (shop) =>
                    String(shop.userId) === String(item.id) ||
                    String(shop.sellerId) === String(item.id),
                );

                return (
                  <tr key={item.id}>
                    <td>
                      <strong>
                        {item.firstname} {item.lastname || "Нет"}
                      </strong>
                    </td>

                    <td>{item.numberphone || "Нет телефона"}</td>

                    <td>{item.email || "Нет email"}</td>

                    <td>{item.adres || "Не указан"}</td>

                    <td>
                      {business?.name ||
                        business?.namecompany ||
                        item.buisness ||
                        "Не указан"}
                    </td>

                    <td>
                      {business?.adrescompany ||
                        business?.adres ||
                        business?.address ||
                        "Не указан"}
                    </td>

                    <td>
                      <b>{item.balance || 0}</b>
                    </td>

                    <td>
                      <div className="admin-row-actions">
                        <button
                          className="admin-edit-button"
                          onClick={() => setEditing({ ...item })}
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>

                        <button
                          className="admin-delete-button"
                          onClick={() => deleteBooking(item)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="admin-modal-overlay" onClick={() => setEditing(null)}>
          <form
            className="admin-modal"
            onSubmit={updateUser}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="admin-modal-close"
              onClick={() => setEditing(null)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <h3>Редактировать продавца</h3>

            <label>Имя</label>
            <input
              value={editing.firstname || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  firstname: e.target.value,
                })
              }
            />

            <label>Фамилия</label>
            <input
              value={editing.lastname || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  lastname: e.target.value,
                })
              }
            />

            <label>Телефон</label>
            <input
              value={editing.numberphone || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  numberphone: e.target.value,
                })
              }
            />

            <label>Email</label>
            <input
              value={editing.email || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  email: e.target.value,
                })
              }
            />

            <label>Магазин</label>
            <input
              value={editing.buisness || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  buisness: e.target.value,
                })
              }
            />

            <label>Баланс</label>
            <input
              value={editing.balance || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  balance: e.target.value,
                })
              }
            />

            <button type="submit" className="admin-save-button">
              Сохранить изменения
            </button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}

export default Adminsellers;
