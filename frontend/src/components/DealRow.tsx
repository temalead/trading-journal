import { Deal } from "../api/deals";
import { formatDate, formatPnl, pairInitials, resultView } from "../utils/format";

export function DealRow({ deal }: { deal: Deal }) {
  const view = resultView(deal.result);

  return (
    <tr>
      <td>{formatDate(deal.createdAt)}</td>
      <td>
        <span className={`badge ${view.sideClass}`}>{view.side}</span>
      </td>
      <td>
        <div className="pair-cell">
          <span className="pair-icon">{pairInitials(deal.ticker?.pairName)}</span>
          <span>{deal.ticker?.pairName ?? "-"}</span>
        </div>
      </td>
      <td>
        <span className={`badge ${view.className}`}>{view.label}</span>
      </td>
      <td>
        <span className="badge blue">{deal.riskReward || "-"}</span>
      </td>
      <td>
        <span className={`badge ${view.className}`}>{formatPnl(deal)}</span>
      </td>
      <td>
        {deal.imageUrls && deal.imageUrls.length > 0 ? (
          <div className="deal-image-strip">
            {deal.imageUrls.slice(0, 3).map((imageUrl) => (
              <a href={imageUrl} key={imageUrl} rel="noreferrer" target="_blank">
                <img alt="Deal" src={imageUrl} />
              </a>
            ))}
            {deal.imageUrls.length > 3 && <span className="badge blue">+{deal.imageUrls.length - 3}</span>}
          </div>
        ) : (
          "-"
        )}
      </td>
      <td>
        <button className="icon-button" title={deal.id}>
          ↗
        </button>
      </td>
    </tr>
  );
}
