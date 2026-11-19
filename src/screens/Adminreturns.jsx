import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const ORDERS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/orders";

function Adminreturns() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessAllowed, setAccessAllowed] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Все");
  const [processing, setProcessing] = useState(false);

  // Проверка администратора и загрузка заказов
  const getData = async () => {
    try {
      const savedId = localStorage.getItem("id");

      if (!savedId) {
        navigate("/", { replace: true });
        return;
      }

      const id = String(savedId).replaceAll('"', "");

      // Сначала проверяем администратора
      const adminResponse = await axios.get(`${USERS_URL}/${id}`);
      const admin = adminResponse.data;

      if (admin.role !== "admin") {
        alert("Доступ разрешён только администрации");

        if (admin.role === "user") {
          navigate("/home", { replace: true });
        } else {
          localStorage.removeItem("id");
          navigate("/signin", { replace: true });
        }

        return;
      }

      // Только после проверки загружаем данные
      setAccessAllowed(true);

      const [usersResponse, ordersResponse] = await Promise.all([
        axios.get(USERS_URL),
        axios.get(ORDERS_URL),
      ]);

      const allUsers = usersResponse.data;

      setUsers(allUsers);

      // Показываем все заказы, по которым оформлен возврат
      const returnOrders = ordersResponse.data.filter(
        (item) =>
          item.returnPaymentStatus === "paid" ||
          [
            "Ожидание от администратора",
            "Ожидание возврата",
            "Получение",
            "Ожидание пункта передачи",
            "Отклонено",
            "Отклонено от администрации",
            "Возврат завершён",
            "Возврат завершен",
          ].includes(item.orderstatus),
      );

      setOrders(returnOrders);
    } catch (error) {
      console.log("Ошибка загрузки возвратов:", error);

      if (error.response?.status === 404) {
        localStorage.removeItem("id");
        navigate("/", { replace: true });
      } else {
        alert("Не удалось загрузить возвраты");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // Получаем покупателя
  const getBuyer = (order) => {
    const buyerId = order.buyerid || order.buyerId || order.userId;

    return users.find((item) => String(item.id) === String(buyerId));
  };

  // Получаем продавцов
  const getSellers = (order) => {
    const sellerIds =
      Array.isArray(order.storeOrders) && order.storeOrders.length > 0
        ? order.storeOrders.map((item) => item.sellerId)
        : [order.sellerId];

    return sellerIds
      .map((sellerId) =>
        users.find(
          (item) =>
            String(item.id) === String(sellerId) && item.role === "seller",
        ),
      )
      .filter(Boolean);
  };

  // Получаем товары заказа
  const getOrderProducts = (order) => {
    if (Array.isArray(order.products) && order.products.length > 0) {
      return order.products;
    }

    if (Array.isArray(order.storeOrders)) {
      return order.storeOrders.flatMap((store) => store.products || []);
    }

    if (order.name) {
      return [
        {
          id: order.productId,
          name: order.name,
          avatar: order.avatar,
          price: order.price,
          quantity: order.quantity || 1,
          size: order.size,
          color: order.color,
          weight: order.weight,
        },
      ];
    }

    return [];
  };

  const formatPrice = (price) => Number(price || 0).toLocaleString("ru-RU");

  // Цвет статуса
  const getStatusColor = (status) => {
    if (status === "Ожидание от администратора") {
      return "admin-return-pending";
    }

    if (
      status === "Ожидание возврата" ||
      status === "Получение" ||
      status === "Ожидание пункта передачи"
    ) {
      return "admin-return-approved";
    }

    if (status === "Отклонено от администрации") {
      return "admin-return-rejected";
    }

    if (status === "Возврат завершён" || status === "Возврат завершен") {
      return "admin-return-completed";
    }

    if (status === "Отклонено") {
      return "admin-return-rejected";
    }

    return "admin-return-default";
  };

  // Иконка статуса
  const getStatusIcon = (status) => {
    if (status === "Ожидание от администратора") {
      return "fa-solid fa-clock";
    }

    if (
      status === "Ожидание возврата" ||
      status === "Ожидание пункта передачи"
    ) {
      return "fa-solid fa-box-open";
    }

    if (status === "Получение") {
      return "fa-solid fa-box";
    }

    if (status === "Отклонено" || status === "Отклонено от администрации") {
      return "fa-solid fa-circle-xmark";
    }

    if (status === "Возврат завершён" || status === "Возврат завершен") {
      return "fa-solid fa-circle-check";
    }

    return "fa-solid fa-rotate-left";
  };

  // Изменить статус возврата
  const handleReturnDecision = async (decision) => {
    if (!selectedOrder || processing) return;

    try {
      setProcessing(true);

      const response = await axios.get(`${ORDERS_URL}/${selectedOrder.id}`);

      const freshOrder = response.data;

      if (freshOrder.orderstatus !== "Ожидание от администратора") {
        alert("Эта заявка уже обработана");

        setOrders((prev) =>
          prev.map((item) =>
            String(item.id) === String(freshOrder.id) ? freshOrder : item,
          ),
        );

        setSelectedOrder(freshOrder);
        return;
      }

      // Администратор только принимает решение.
      // Повторного перевода денег здесь нет.
      const newStatus =
        decision === "accept"
          ? "Ожидание возврата"
          : "Отклонено от администрации";

      const updatedStoreOrders = Array.isArray(freshOrder.storeOrders)
        ? freshOrder.storeOrders.map((item) => ({
            ...item,
            orderstatus: newStatus,
          }))
        : freshOrder.storeOrders;

      const updatedOrder = {
        ...freshOrder,
        orderstatus: newStatus,
        storeOrders: updatedStoreOrders,
        adminReturnDecision: decision,
        adminReturnDecisionAt: new Date().toISOString(),
      };

      const updateResponse = await axios.put(
        `${ORDERS_URL}/${freshOrder.id}`,
        updatedOrder,
      );

      const savedOrder = updateResponse.data;

      setOrders((prev) =>
        prev.map((item) =>
          String(item.id) === String(savedOrder.id) ? savedOrder : item,
        ),
      );

      setSelectedOrder(savedOrder);

      if (decision === "accept") {
        alert("Возврат одобрен! Товар ожидается в пункте передачи.");
      } else {
        alert("Возврат отклонён администрацией.");
      }

      setSelectedOrder(null);
    } catch (error) {
      console.log("Ошибка обработки возврата:", error);
      alert("Не удалось обработать возврат");
    } finally {
      setProcessing(false);
    }
  };

  // Поиск и фильтр
  const filteredOrders = orders.filter((order) => {
    const buyer = getBuyer(order);

    const buyerName = buyer
      ? `${buyer.firstname || ""} ${buyer.lastname || ""}`
      : "";

    const matchesSearch =
      String(order.id).toLowerCase().includes(search.toLowerCase()) ||
      buyerName.toLowerCase().includes(search.toLowerCase());

    let matchesFilter = true;

    if (filter === "Ожидают проверки") {
      matchesFilter = order.orderstatus === "Ожидание от администратора";
    }

    if (filter === "Одобрены") {
      matchesFilter = [
        "Ожидание возврата",
        "Получение",
        "Ожидание пункта передачи",
      ].includes(order.orderstatus);
    }

    if (filter === "Отклонены") {
      matchesFilter =
        order.orderstatus === "Отклонено от администрации" ||
        order.orderstatus === "Отклонено";
    }

    if (filter === "Завершены") {
      matchesFilter =
        order.orderstatus === "Возврат завершён" ||
        order.orderstatus === "Возврат завершен";
    }

    return matchesSearch && matchesFilter;
  });

  // Статистика
  const pendingCount = orders.filter(
    (item) => item.orderstatus === "Ожидание от администратора",
  ).length;

  const approvedCount = orders.filter((item) =>
    ["Ожидание возврата", "Получение", "Ожидание пункта передачи"].includes(
      item.orderstatus,
    ),
  ).length;

  const rejectedCount = orders.filter(
    (item) =>
      item.orderstatus === "Отклонено от администрации" ||
      item.orderstatus === "Отклонено",
  ).length;

  const completedCount = orders.filter(
    (item) =>
      item.orderstatus === "Возврат завершён" ||
      item.orderstatus === "Возврат завершен",
  ).length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-returns-page">
          <p>Загрузка возвратов...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!accessAllowed) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="admin-returns-page">
        <div className="admin-returns-header">
          <div>
            <span>УПРАВЛЕНИЕ МАГАЗИНОМ</span>
            <h1>Возвраты товаров</h1>
            <p>Проверка заявок и управление возвратами покупателей</p>
          </div>

          <button className="admin-returns-refresh" onClick={getData}>
            <i className="fa-solid fa-rotate"></i>
            Обновить
          </button>
        </div>

        {/* СТАТИСТИКА */}
        <div className="admin-returns-stats">
          <div className="admin-returns-stat">
            <div className="admin-returns-stat-icon orange">
              <i className="fa-solid fa-clock"></i>
            </div>
            <div>
              <span>Ожидают проверки</span>
              <h2>{pendingCount}</h2>
            </div>
          </div>

          <div className="admin-returns-stat">
            <div className="admin-returns-stat-icon green">
              <i className="fa-solid fa-check"></i>
            </div>
            <div>
              <span>Одобрены</span>
              <h2>{approvedCount}</h2>
            </div>
          </div>

          <div className="admin-returns-stat">
            <div className="admin-returns-stat-icon red">
              <i className="fa-solid fa-xmark"></i>
            </div>
            <div>
              <span>Отклонены</span>
              <h2>{rejectedCount}</h2>
            </div>
          </div>

          <div className="admin-returns-stat">
            <div className="admin-returns-stat-icon blue">
              <i className="fa-solid fa-box"></i>
            </div>
            <div>
              <span>Завершены</span>
              <h2>{completedCount}</h2>
            </div>
          </div>
        </div>

        {/* СПИСОК ВОЗВРАТОВ */}
        <div className="admin-returns-content">
          <div className="admin-returns-list-header">
            <div>
              <h2>Все заявки на возврат</h2>
              <p>Список возвратов товаров</p>
            </div>

            <div className="admin-returns-search">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Поиск по номеру или покупателю..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-returns-filters">
            {[
              "Все",
              "Ожидают проверки",
              "Одобрены",
              "Отклонены",
              "Завершены",
            ].map((item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="admin-returns-empty">
              <i className="fa-solid fa-box-open"></i>
              <h3>Возвраты не найдены</h3>
              <p>Здесь будут отображаться заявки на возврат товаров.</p>
            </div>
          ) : (
            <div className="admin-returns-table-wrapper">
              <table className="admin-returns-table">
                <thead>
                  <tr>
                    <th>Заказ</th>
                    <th>Покупатель</th>
                    <th>Сумма возврата</th>
                    <th>Дата возврата</th>
                    <th>Статус</th>
                    <th>Подробнее</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => {
                    const buyer = getBuyer(order);

                    return (
                      <tr key={order.id}>
                        <td>
                          <strong>MG-{order.id}</strong>
                        </td>

                        <td>
                          {buyer
                            ? `${buyer.firstname || ""} ${buyer.lastname || ""}`
                            : "Покупатель"}
                        </td>

                        <td>
                          <strong>{formatPrice(order.returnAmount)} сом</strong>
                        </td>

                        <td>
                          {order.returnPaidAt
                            ? new Date(order.returnPaidAt).toLocaleDateString(
                                "ru-RU",
                              )
                            : "—"}
                        </td>

                        <td>
                          <span
                            className={`admin-returns-status ${getStatusColor(
                              order.orderstatus,
                            )}`}
                          >
                            <i className={getStatusIcon(order.orderstatus)}></i>
                            {order.orderstatus}
                          </span>
                        </td>

                        <td>
                          <button
                            className="admin-returns-details-button"
                            onClick={() => setSelectedOrder(order)}
                          >
                            Подробнее
                            <i className="fa-solid fa-arrow-right"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* МОДАЛЬНОЕ ОКНО ПОДРОБНОСТЕЙ */}
        {selectedOrder && (
          <div
            className="admin-returns-modal-backdrop"
            onClick={() => !processing && setSelectedOrder(null)}
          >
            <div
              className="admin-returns-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-returns-modal-header">
                <div>
                  <span>ПРОВЕРКА ЗАЯВКИ</span>
                  <h2>Заказ № MG-{selectedOrder.id}</h2>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  disabled={processing}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="admin-returns-modal-body">
                <div className="admin-returns-detail-status">
                  <span>Текущий статус</span>
                  <strong
                    className={`admin-returns-status ${getStatusColor(
                      selectedOrder.orderstatus,
                    )}`}
                  >
                    <i className={getStatusIcon(selectedOrder.orderstatus)}></i>
                    {selectedOrder.orderstatus}
                  </strong>
                </div>

                {/* ПОКУПАТЕЛЬ */}
                <div className="admin-returns-detail-section">
                  <h3>
                    <i className="fa-solid fa-user"></i>
                    Покупатель
                  </h3>

                  <p>
                    <span>Имя:</span>
                    <strong>
                      {getBuyer(selectedOrder)
                        ? `${getBuyer(selectedOrder).firstname || ""} ${getBuyer(selectedOrder).lastname || ""}`
                        : "—"}
                    </strong>
                  </p>

                  <p>
                    <span>Телефон:</span>
                    <strong>
                      {getBuyer(selectedOrder)?.numberphone ||
                        selectedOrder.numberphone ||
                        "—"}
                    </strong>
                  </p>

                  <p>
                    <span>Адрес:</span>
                    <strong>
                      {selectedOrder.adres ||
                        getBuyer(selectedOrder)?.adres ||
                        "—"}
                    </strong>
                  </p>
                </div>

                {/* ПРОДАВЕЦ */}
                <div className="admin-returns-detail-section">
                  <h3>
                    <i className="fa-solid fa-store"></i>
                    Магазин / продавец
                  </h3>

                  {getSellers(selectedOrder).length > 0 ? (
                    getSellers(selectedOrder).map((seller) => (
                      <div key={seller.id}>
                        <p>
                          <span>Магазин:</span>
                          <strong>
                            {seller.namecompany || seller.firstname || "—"}
                          </strong>
                        </p>

                        <p>
                          <span>Телефон:</span>
                          <strong>{seller.numberphone || "—"}</strong>
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>Информация о продавце отсутствует</p>
                  )}
                </div>

                {/* ТОВАРЫ */}
                <div className="admin-returns-detail-section">
                  <h3>
                    <i className="fa-solid fa-box"></i>
                    Товары в заказе
                  </h3>

                  {getOrderProducts(selectedOrder).map((product, index) => (
                    <div
                      className="admin-returns-product"
                      key={product.id || index}
                    >
                      {product.avatar ? (
                        <img
                          src={product.avatar}
                          alt={product.name || "Товар"}
                        />
                      ) : (
                        <div className="admin-returns-product-placeholder">
                          <i className="fa-solid fa-image"></i>
                        </div>
                      )}

                      <div>
                        <strong>{product.name || "Товар"}</strong>

                        <span>
                          Размер: {product.size || "—"} · Цвет:{" "}
                          {product.color || "—"}
                        </span>

                        <span>Количество: {product.quantity || 1} шт.</span>

                        <strong>
                          {formatPrice(
                            Number(product.price || 0) *
                              Number(product.quantity || 1),
                          )}{" "}
                          сом
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ПУНКТ ПЕРЕДАЧИ */}
                <div className="admin-returns-detail-section">
                  <h3>
                    <i className="fa-solid fa-location-dot"></i>
                    Пункт передачи
                  </h3>

                  <p>
                    <span>Название:</span>
                    <strong>{selectedOrder.returnPickupName || "—"}</strong>
                  </p>

                  <p>
                    <span>Адрес:</span>
                    <strong>{selectedOrder.returnPickupAddress || "—"}</strong>
                  </p>
                </div>

                {/* СУММА */}
                <div className="admin-returns-total">
                  <span>Сумма, возвращённая покупателю</span>
                  <strong>{formatPrice(selectedOrder.returnAmount)} сом</strong>
                </div>

                <div className="admin-returns-paid-info">
                  <i className="fa-solid fa-circle-check"></i>
                  Деньги уже возвращены покупателю. Повторная выплата не
                  требуется.
                </div>
              </div>

              {/* КНОПКИ АДМИНИСТРАТОРА */}
              <div className="admin-returns-modal-footer">
                {selectedOrder.orderstatus === "Ожидание от администратора" ? (
                  <>
                    <button
                      className="admin-returns-reject-button"
                      onClick={() => handleReturnDecision("reject")}
                      disabled={processing}
                    >
                      <i className="fa-solid fa-xmark"></i>
                      {processing ? "Обработка..." : "Отклонить"}
                    </button>

                    <button
                      className="admin-returns-approve-button"
                      onClick={() => handleReturnDecision("accept")}
                      disabled={processing}
                    >
                      <i className="fa-solid fa-check"></i>
                      {processing ? "Обработка..." : "Принять возврат"}
                    </button>
                  </>
                ) : (
                  <button
                    className="admin-returns-close-button"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Закрыть
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default Adminreturns;
