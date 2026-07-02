import { useEffect, useRef, useState } from "react";
import { AuthSession } from "../api/auth";
import { profileInitials } from "../utils/format";

type TopbarProps = {
  session: AuthSession;
  onSignOut: () => void;
};

export function Topbar({ session, onSignOut }: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeProfileMenu(event: MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", closeProfileMenu);
    return () => document.removeEventListener("mousedown", closeProfileMenu);
  }, []);

  function signOut() {
    setProfileOpen(false);
    onSignOut();
  }

  return (
    <header className="topbar">
      <button className="icon-button" aria-label="Notifications">
        ⌁
      </button>
      <div className="profile-menu" ref={profileRef}>
        <button
          className="profile"
          aria-expanded={profileOpen}
          aria-haspopup="menu"
          onClick={() => setProfileOpen((current) => !current)}
          type="button"
        >
          <span className="avatar">{profileInitials(session.username)}</span>
          <strong>{session.username}</strong>
          <span className="status-dot" />
        </button>

        {profileOpen && (
          <div className="profile-dropdown" role="menu">
            <div className="profile-dropdown-head">
              <strong>{session.username}</strong>
              <span>{session.email}</span>
            </div>
            <button className="profile-logout" onClick={signOut} role="menuitem" type="button">
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
