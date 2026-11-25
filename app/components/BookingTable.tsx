
import Link from "next/link";

export type Booking = {
  id: number;
  name: string;
  email: string;
  service: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending" | "Cancelled";
};

type BookingTableProps = {
  bookings: Booking[];
};

const colors = ["purple", "pink", "blue", "orange", "green"];

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string) {
  if (!value) return "—";

  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function BookingTable({
  bookings,
}: BookingTableProps) {
  return (
    <div className="panel bookings-panel">
      <div className="panel-heading">
        <div>
          <h5>Recent Bookings</h5>
          <p>Manage and track your latest appointments</p>
        </div>

        <Link href="/bookings" className="view-all">
          View all <i className="bi bi-arrow-right"></i>
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table qb-table align-middle">
          <thead>
            <tr>
              <th>CUSTOMER</th>
              <th>SERVICE</th>
              <th>DATE</th>
              <th>TIME</th>
              <th>STATUS</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking, index) => (
                <tr key={booking.id}>
                  <td>
                    <div className="customer-cell">
                      <div
                        className={`customer-avatar ${
                          colors[index % colors.length]
                        }`}
                      >
                        {getInitials(booking.name)}
                      </div>

                      <strong>{booking.name}</strong>
                    </div>
                  </td>

                  <td>{booking.service}</td>
                  <td>{formatDate(booking.date)}</td>
                  <td>{formatTime(booking.time)}</td>

                  <td>
                    <span
                      className={`status-badge ${booking.status.toLowerCase()}`}
                    >
                      {booking.status}
                    </span>
                  </td>

                  <td>
                    <Link href="/bookings" className="more-btn">
                      <i className="bi bi-three-dots"></i>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No bookings available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
