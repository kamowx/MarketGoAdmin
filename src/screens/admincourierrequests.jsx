import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

const USER_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";

function Admincourierrequests() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загружаем заявки курьеров
  const getRequests = async () => {
    try {
      const response = await axios.get(USER_URL);

      const courierRequests = response.data.filter(
        (item) => item.role === "courier" && item.status === "Ожидание",
      );

      setRequests(courierRequests);
    } catch (error) {
      console.error("Ошибка загрузки заявок:", error);
      alert("Не удалось загрузить заявки курьеров");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  // Получаем дату заявки
  const getDate = (date) => {
    if (!date) return "Дата не указана";

    return new Date(date).toLocaleDateString("ru-RU");
  };

  // Подтверждаем курьера
  const approveRequest = async (id) => {
    try {
      const courier = requests.find((item) => String(item.id) === String(id));

      if (!courier) return;

      await axios.put(`${USER_URL}/${id}`, {
        ...courier,
        status: "Подтвержденный",
      });

      alert("Заявка курьера подтверждена!");

      setRequests((prev) =>
        prev.filter((item) => String(item.id) !== String(id)),
      );

      setSelected(null);
    } catch (error) {
      console.error("Ошибка подтверждения курьера:", error);
      alert("Не удалось подтвердить заявку");
    }
  };

  const removeRequest = async (id) => {
    try {
      const courier = requests.find((item) => String(item.id) === String(id));

      if (!courier) return;

      await axios.put(`${USER_URL}/${id}`, {
        ...courier,
        status: "Новый",
      });

      alert("Заявка удалена");

      setRequests((prev) =>
        prev.filter((item) => String(item.id) !== String(id)),
      );

      setSelected(null);
    } catch (error) {
      console.error("Ошибка удаления заявки:", error);
      alert("Не удалось удалить заявку");
    }
  };

  return (
    <AdminLayout title="Заявки курьеров">
      <div className="admin-page-heading">
        <div>
          <h3>Заявки на работу курьером</h3>
          <p>Проверяйте данные и подтверждайте новых курьеров.</p>
        </div>

        <span className="admin-total">{requests.length} заявки</span>
      </div>

      <div className="admin-request-list">
        {loading ? (
          <div className="admin-empty">Загрузка заявок...</div>
        ) : (
          <>
            {requests.map((item) => (
              <div className="admin-request-card" key={item.id}>
                <div className="admin-request-icon courier">
                  <i className="fa-solid fa-truck"></i>
                </div>

                <div className="admin-request-info">
                  <h4>
                    {item.firstname} {item.lastname}
                  </h4>

                  <p>{item.transport || "Транспорт не указан"}</p>

                  <span>{getDate(item.createdAt)}</span>
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
              <div className="admin-empty">Новых заявок пока нет</div>
            )}
          </>
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

            <h3>Информация о курьере</h3>

            <div className="admin-detail-list">
              <p>
                <span>Имя:</span> {itemName(selected)}
              </p>

              <p>
                <span>Телефон:</span> {selected.numberphone || "Не указан"}
              </p>

              <p>
                <span>Email:</span> {selected.email || "Не указан"}
              </p>

              <p>
                <span>Транспорт:</span> {selected.transport || "Не указан"}
              </p>

              <p>
                <span>Адрес:</span> {selected.adres || "Не указан"}
              </p>

              <p>
                <span>Дата заявки:</span> {getDate(selected.createdAt)}
              </p>
            </div>

            <div className="admin-modal-actions">
              <button
                className="admin-approve-button"
                onClick={() => approveRequest(selected.id)}
              >
                <i className="fa-solid fa-check"></i> Подтвердить
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

const itemName = (user) =>
  `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Без имени";

export default Admincourierrequests;
