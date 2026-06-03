import { Deal } from "../api/deals";
import { externalHref, formatDate, formatPnl, formatSession, pairInitials, resultView } from "../utils/format";

type DealRowProps = {
  deal: Deal;
  onDelete: (deal: Deal) => void;
  onEdit: (deal: Deal) => void;
};

export function DealRow({ deal, onDelete, onEdit }: DealRowProps) {
  const view = resultView(deal.result);
  const primaryLink = deal.links?.find((link) => link.url);

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
        <span className="badge blue">{formatSession(deal.session)}</span>
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
        {primaryLink ? (
          <a
            className="icon-button link-action"
            href={externalHref(primaryLink.url)}
            rel="noreferrer"
            target="_blank"
            title={primaryLink.title || primaryLink.url}
          >
            ↗
          </a>
        ) : (
          "-"
        )}
      </td>
      <td>
        <div className="row-actions">
          <button className="icon-button" onClick={() => onEdit(deal)} type="button" aria-label="Edit deal" title="Edit deal">
            ✎
          </button>
          <button className="icon-button danger" onClick={() => onDelete(deal)} type="button" aria-label="Delete deal" title="Delete deal">
            ⌫
          </button>
        </div>
      </td>
    </tr>
  );
}
