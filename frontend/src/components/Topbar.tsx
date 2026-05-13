import { AuthSession } from "../api/auth";
import { profileInitials } from "../utils/format";

export function Topbar({ session }: { session: AuthSession }) {
  return (
    <header className="topbar">
      <button className="icon-button" aria-label="Notifications">
        ⌁
      </button>
      <div className="profile">
        <div className="avatar">{profileInitials(session.username)}</div>
        <strong>{session.username}</strong>
        <span className="status-dot" />
      </div>
    </header>
  );
}
