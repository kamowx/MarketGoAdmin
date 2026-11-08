import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const BUSINESS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/buisness";

function Adminstores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const id = localStorage.getItem("id");

    if (!id) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    const getStores = async () => {
      try {
        const [businessResponse, usersResponse] = await Promise.all([
          axios.get(BUSINESS_URL),
          axios.get(USERS_URL),
        ]);

        const allStores = businessResponse.data.map((store) => {
          const owner = usersResponse.data.find(
            (user) => String(user.id) === String(store.userId),
          );

          return {
            ...store,
            owner: owner
              ? `${owner.firstname || ""} ${owner.lastname || ""}`.trim()
              : "Продавец не найден",
          };
        });

        if (!cancelled) {
          setStores(allStores);
        }
      } catch (error) {
        console.error("Ошибка загрузки магазинов:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    getStores();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminLayout title="Магазины">
      <div className="admin-page-heading">
        <div>
          <h3>Все магазины</h3>
          <p>Магазины, которые работают на платформе MarketGo.</p>
        </div>

        <span className="admin-total">{stores.length} магазина</span>
      </div>

      <div className="admin-stores-grid">
        {loading ? (
          <p>Загрузка магазинов...</p>
        ) : stores.length === 0 ? (
          <p>Пока нет зарегистрированных магазинов.</p>
        ) : (
          stores.map((item) => (
            <div className="admin-store-card" key={item.id}>
              <img
                src={item.avatar || "https://placehold.co/600x400?text=Store"}
                alt={item.name}
              />

              <div className="admin-store-info">
                <span className="admin-store-category">
                  {item.category || "Без категории"}
                </span>

                <h3>{item.name}</h3>

                <p>
                  <i className="fa-solid fa-user"></i> {item.owner}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}

export default Adminstores;
