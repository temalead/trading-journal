import { Deal } from "../api/deals";
import { DealRow } from "./DealRow";

type DealsViewProps = {
  deals: Deal[];
  loading: boolean;
  onCreate: () => void;
  onRefresh: () => void;
  search: string;
  setSearch: (value: string) => void;
};

export function DealsView({ deals, loading, onCreate, onRefresh, search, setSearch }: DealsViewProps) {
  return (
    <>
      <section className="page-head">
        <div>
          <h1>Deals</h1>
          <p>Journal entries from the backend API.</p>
        </div>
        <button className="primary-button" onClick={onCreate}>
          + Add Deal
        </button>
      </section>

      <section className="filters filters-compact">
        <label className="search-field">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            type="search"
            placeholder="Search by pair, description, currency"
          />
        </label>
        <button className="secondary-button" disabled={loading} onClick={onRefresh}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </section>

      <section className="view-controls">
        <div className="tabs">
          <button>Gallery</button>
          <button className="selected">List</button>
          <button>Calendar</button>
        </div>
        <div className="sort-box">Date ↓</div>
        <div className="result-box">All Results</div>
        <div className="counter">{deals.length} deals</div>
      </section>

      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Side</th>
              <th>Pair</th>
              <th>Result</th>
              <th>RR</th>
              <th>PnL</th>
              <th>Images</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={8}>No deals yet.</td>
              </tr>
            ) : (
              deals.map((deal) => <DealRow deal={deal} key={deal.id ?? deal.ticker?.pairName} />)
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}
