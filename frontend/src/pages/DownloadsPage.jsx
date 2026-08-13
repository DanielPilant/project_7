import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyOrders, fetchDownloadUrl } from "../api/orders.js";
import styles from "./DownloadsPage.module.css";

export default function DownloadsPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    let active = true;
    fetchMyOrders()
      .then((data) => {
        if (!active) return;
        setOrders(data);
        setStatus("success");
      })
      .catch(() => active && setStatus("error"));

    return () => {
      active = false;
    };
  }, []);

  // Build a flat list of all purchased items across all orders.
  const purchased = orders.flatMap((order) =>
    order.items.map((item) => ({
      ...item,
      orderId: order.id,
      orderDate: order.created_at,
    })),
  );

  function handleDownload(productId) {
    // The server verifies the purchase and replies with a temporary signed link;
    // pointing the browser at it starts the download straight from S3.
    fetchDownloadUrl(productId)
      .then((url) => {
        window.location.href = url;
      })
      .catch(() => {
        alert("Download failed. Did you purchase this pack?");
      });
  }

  return (
    <section className={styles.wrap}>
      <h1>My Downloads</h1>

      {status === "loading" && <p>Loading purchases…</p>}
      {status === "error" && (
        <p className="msg--error">Failed to load your purchases.</p>
      )}

      {status === "success" && purchased.length === 0 && (
        <div className={styles.empty}>
          <p>You haven't purchased any packs yet.</p>
          <Link to="/" className="btn">
            Browse Packs
          </Link>
        </div>
      )}

      {status === "success" && purchased.length > 0 && (
        <ul className={styles.list}>
          {purchased.map((item, idx) => (
            <li key={`${item.orderId}-${item.product_id}-${idx}`} className={styles.item}>
              <div className={styles.cover}>
                {item.cover_image_url ? (
                  <img src={item.cover_image_url} alt={item.title} />
                ) : (
                  <span className={styles.placeholder}>🎵</span>
                )}
              </div>

              <div className={styles.info}>
                <Link
                  to={`/products/${item.product_id}`}
                  className={styles.title}
                >
                  {item.title}
                </Link>
                {item.creator_name && (
                  <p className={styles.creator}>by {item.creator_name}</p>
                )}
                <p className={styles.meta}>
                  Paid ${Number(item.price_at_purchase).toFixed(2)} ·{" "}
                  {new Date(item.orderDate).toLocaleDateString()}
                </p>
              </div>

              <button
                className="btn"
                onClick={() => handleDownload(item.product_id)}
              >
                ⬇ Download
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
