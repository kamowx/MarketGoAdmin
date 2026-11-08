import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import AdminLayout from "../components/AdminLayout";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";

function Adminusers() {
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem("id");

    if (!id) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);

  // Редактировать пользователя
  const updateUser = async (e) => {
    e.preventDefault();

    try {
      const response = await axios({
        method: "PUT",
        url: `${USERS_URL}/${editing.id}`,
        data: editing,
      });

      if (response.status === 200) {
        setUsers(
          users.map((item) =>
            String(item.id) === String(editing.id) ? response.data : item,
          ),
        );

        setEditing(null);
        alert("Данные пользователя обновлены!");
      }
    } catch (error) {
      console.error("ОШИБКА ОБНОВЛЕНИЯ:", error);
      alert("Не удалось обновить пользователя");
    }
  };

  // Проверка администратора
  useEffect(() => {
    (["admin"], navigate);
  }, [navigate]);

  // Получить всех обычных пользователей
  const getAllUser = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: USERS_URL,
      });

      console.log("ВСЕ ПОЛЬЗОВАТЕЛИ:", response.data);

      if (response.status === 200) {
        const allUsers = response.data.filter((item) => item.role === "user");

        setUsers(allUsers);
      }
    } catch (error) {
      console.error("ОШИБКА ПОЛУЧЕНИЯ ПОЛЬЗОВАТЕЛЕЙ:", error);
    }
  };

  useEffect(() => {
    getAllUser();
  }, []);

  // Удалить пользователя
  const deleteBooking = async (item) => {
    const confirmDelete = window.confirm(
      "Вы действительно хотите удалить этого пользователя?",
    );

    if (!confirmDelete) return;

    try {
      await axios({
        method: "DELETE",
        url: `${USERS_URL}/${item.id}`,
      });

      setUsers((prev) =>
        prev.filter((user) => String(user.id) !== String(item.id)),
      );

      alert("Пользователь удалён!");
    } catch (error) {
      console.error("ОШИБКА УДАЛЕНИЯ:", error);
      alert("Не удалось удалить пользователя");
    }
  };

  return (
    <AdminLayout title="Пользователи">
      <div className="admin-page-heading">
        <div>
          <h3>Обычные пользователи</h3>
          <p>Список пользователей, зарегистрированных на MarketGo.</p>
        </div>

        <span className="admin-total">{users.length} пользователей</span>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Пользователь</th>
              <th>Телефон</th>
              <th>Email</th>
              <th>Адрес</th>
              <th>Баланс</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>
            {users.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>
                    {item.firstname} {item.lastname || "Нет"}
                  </strong>
                </td>

                <td>{item.numberphone || 9960000000}</td>

                <td>{item.email}</td>

                <td>{item.adres}</td>

                <td>
                  <b>{item.balance}</b>
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
            ))}
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

            <h3>Редактировать пользователя</h3>

            <label>Имя</label>
            <input
              value={editing.firstname || ""}
              onChange={(e) =>
                setEditing({ ...editing, firstname: e.target.value })
              }
            />

            <label>Фамилия</label>
            <input
              value={editing.lastname || ""}
              onChange={(e) =>
                setEditing({ ...editing, lastname: e.target.value })
              }
            />

            <label>Телефон</label>
            <input
              value={editing.numberphone || ""}
              onChange={(e) =>
                setEditing({ ...editing, numberphone: e.target.value })
              }
            />

            <label>Email</label>
            <input
              value={editing.email || ""}
              onChange={(e) =>
                setEditing({ ...editing, email: e.target.value })
              }
            />

            <label>Баланс</label>
            <input
              value={editing.balance || ""}
              onChange={(e) =>
                setEditing({ ...editing, balance: e.target.value })
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

export default Adminusers;
