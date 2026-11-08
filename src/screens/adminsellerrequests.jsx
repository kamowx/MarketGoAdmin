import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

const USER_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const BUSINESS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/buisness";

function Adminsellerrequests() {
  const navigate = useNavigate();
  useEffect(() => {
    const id = localStorage.getItem("id");

    if (!id) {
      navigate("/", { replace: true });
    }
  }, [navigate]);
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);

  const getRequests = async () => {
    try {
      const userResponse = await axios.get(USER_URL);
      const businessResponse = await axios.get(BUSINESS_URL);

      const sellers = userResponse.data.filter(
        (item) => item.role === "seller" && item.status === "Ожидание",
      );

      const result = sellers.map((seller) => {
        const business = businessResponse.data.find(
          (item) => String(item.userId) === String(seller.id),
        );

        return {
          ...seller,
          business: business || null,
          businessName: business?.name || "Название не указано",
          date: seller.createdAt
            ? new Date(seller.createdAt).toLocaleDateString("ru-RU")
            : "—",
        };
      });

      setRequests(result);
    } catch (error) {
      console.error("Ошибка загрузки заявок:", error);
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  // Удаляем заявку и магазин
  const removeRequest = async (id) => {
    try {
      const businessResponse = await axios.get(BUSINESS_URL);

      const business = businessResponse.data.find(
        (item) => String(item.userId) === String(id),
      );

      // Удаляем магазин
      if (business) {
        await axios.delete(`${BUSINESS_URL}/${business.id}`);
      }

      // Удаляем пользователя
      await axios.delete(`${USER_URL}/${id}`);

      setRequests((prev) => prev.filter((item) => item.id !== id));
      setSelected(null);

      alert("Заявка удалена!");
    } catch (error) {
      console.error("Ошибка удаления заявки:", error);
      alert("Не удалось удалить заявку");
    }
  };

  // Подтверждаем продавца
  const approveRequest = async (id) => {
    try {
      await axios.put(`${USER_URL}/${id}`, {
        status: "Подтвержденный",
      });

      setRequests((prev) => prev.filter((item) => item.id !== id));
      setSelected(null);

      alert("Заявка продавца подтверждена!");
    } catch (error) {
      console.error("Ошибка подтверждения:", error);
      alert("Не удалось подтвердить заявку");
    }
  };

  return (
    <AdminLayout title="Заявки продавцов">
      <div className="admin-page-heading">
        <div>
          <h3>Заявки на регистрацию бизнеса</h3>
          <p>Проверяйте информацию и подтверждайте новых продавцов.</p>
        </div>
        <span className="admin-total">{requests.length} заявки</span>
      </div>

      <div className="admin-request-list">
        {requests.map((item) => (
          <div className="admin-request-card" key={item.id}>
            <div className="admin-request-icon">
              <i className="fa-solid fa-store"></i>
            </div>

            <div className="admin-request-info">
              <h4>{item.businessName}</h4>
              <p>
                {item.firstname} {item.lastname}
              </p>
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
          <div className="admin-empty">Новых заявок пока нет</div>
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

            <h3>Информация о заявке</h3>

            <div className="admin-detail-list">
              <p>
                <span>Название бизнеса:</span> {selected.businessName}
              </p>
              <p>
                <span>Владелец:</span> {selected.firstname} {selected.lastname}
              </p>
              <p>
                <span>Телефон:</span> {selected.numberphone || "Не указан"}
              </p>
              <p>
                <span>Email:</span> {selected.email || "Не указан"}
              </p>
              <p>
                <span>Адрес проживания:</span> {selected.adres || "Не указан"}
              </p>
              <p>
                <span>Адрес бизнеса:</span>{" "}
                {selected.business?.adrescompany || "Не указан"}
              </p>
              <p>
                <span>Категория:</span>{" "}
                {selected.business?.category || "Не указана"}
              </p>
              <p>
                <span>Дата заявки:</span> {selected.date}
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

export default Adminsellerrequests;
