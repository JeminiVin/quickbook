
type Stat = {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  note: string;
};

type StatsCardsProps = {
  stats: Stat[];
};

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div className="stat-card" key={stat.title}>
          <div className="stat-top">
            <span>{stat.title}</span>

            <span className={`stat-icon ${stat.color}`}>
              <i className={`bi ${stat.icon}`}></i>
            </span>
          </div>

          <h2>{stat.value}</h2>

          <div className="stat-footer">
            <span>{stat.note}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
