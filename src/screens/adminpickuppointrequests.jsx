import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

const USER_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";

function Adminpickuppointrequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);

  // Проверка администратора
  useEffect(() => {
    const id = localStorage.getItem("id");

    if (!id) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Получить заявки пунктов передачи
  const getRequests = async () => {
    try {
      const response = await axios.get(USER_URL);

      const pickupPoints = response.data.filter(
        (item) => item.role === "pickuppoint" && item.status === "Ожидание",
      );

      const result = pickupPoints.map((item) => ({
        ...item,
        date: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("ru-RU")
          : "—",
      }));

      setRequests(result);
    } catch (error) {
      console.error("Ошибка загрузки заявок:", error);
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  // Удалить заявку
  const removeRequest = async (id) => {
    const confirmDelete = window.confirm(
      "Вы действительно хотите удалить заявку пункта передачи?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${USER_URL}/${id}`);

      setRequests((prev) =>
        prev.filter((item) => String(item.id) !== String(id)),
      );

      setSelected(null);

      alert("Заявка пункта передачи удалена!");
    } catch (error) {
      console.error("Ошибка удаления заявки:", error);
      alert("Не удалось удалить заявку");
    }
  };

  // Подтвердить пункт передачи
  const approveRequest = async (id) => {
    try {
      await axios.put(`${USER_URL}/${id}`, {
        status: "Подтвержденный",
      });

      setRequests((prev) =>
        prev.filter((item) => String(item.id) !== String(id)),
      );

      setSelected(null);

      alert("Пункт передачи успешно подтверждён!");
    } catch (error) {
      console.error("Ошибка подтверждения:", error);
      alert("Не удалось подтвердить заявку");
    }
  };

  return (
    <AdminLayout title="Заявки пунктов передачи">
      <div className="admin-page-heading">
        <div>
          <h3>Заявки пунктов передачи</h3>
          <p>Проверяйте информацию и подтверждайте новые пункты передачи.</p>
        </div>

        <span className="admin-total">{requests.length} заявок</span>
      </div>

      <div className="admin-request-list">
        {requests.map((item) => (
          <div className="admin-request-card" key={item.id}>
            <div className="admin-request-icon">
              <i className="fa-solid fa-box"></i>
            </div>

            <div className="admin-request-info">
              <h4>
                {item.firstname} {item.lastname}
              </h4>

              <p>{item.adres || "Адрес не указан"}</p>

              <span>{item.date}</span>
            </div>

            <div className="admin-request-actions">
              <button
                className="admin-small-button"
                onClick={() => setSelected(item)}
              >
                Смотреть
              </button>

              <button
                className="admin-approve-button"
                onClick={() => approveRequest(item.id)}
              >
                <i className="fa-solid fa-check"></i> Подтвердить
              </button>

              <button
                className="admin-delete-button"
                onClick={() => removeRequest(item.id)}
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="admin-empty">
            Новых заявок пунктов передачи пока нет
          </div>
        )}
      </div>

      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="admin-modal-close"
              onClick={() => setSelected(null)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <h3>Информация о пункте передачи</h3>

            <div className="admin-detail-list">
              <p>
                <span>Имя:</span> {selected.firstname || "Не указано"}
              </p>

              <p>
                <span>Фамилия:</span> {selected.lastname || "Не указана"}
              </p>

              <p>
                <span>Телефон:</span> {selected.numberphone || "Не указан"}
              </p>

              <p>
                <span>Email:</span> {selected.email || "Не указан"}
              </p>

              <p>
                <span>Адрес пункта передачи:</span>{" "}
                {selected.adres || "Не указан"}
              </p>

              <p>
                <span>Дата регистрации:</span> {selected.date}
              </p>

              <p>
                <span>Статус:</span> {selected.status}
              </p>
            </div>

            <div className="admin-modal-actions">
              <button
                className="admin-approve-button"
                onClick={() => approveRequest(selected.id)}
              >
                Подтвердить
              </button>

              <button
                className="admin-delete-button"
                onClick={() => removeRequest(selected.id)}
              >
                Удалить заявку
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Adminpickuppointrequests;
