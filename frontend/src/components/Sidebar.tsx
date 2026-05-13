import { Page } from "../types/forms";
import { NavButton } from "./NavButton";

type SidebarProps = {
  page: Page;
  onCreateDeal: () => void;
  onSignOut: () => void;
  setPage: (page: Page) => void;
};

export function Sidebar({ page, onCreateDeal, onSignOut, setPage }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">TJ</div>
        <div>
          <div className="brand-name">Collectivo</div>
          <div className="brand-caption">Trading Journal</div>
        </div>
      </div>

      <button className="primary-wide" onClick={onCreateDeal}>
        + Add Deal
      </button>

      <nav className="nav-section">
        <span>Core</span>
        <NavButton label="Dashboard" />
        <NavButton label="Analytics" />
        <NavButton active={page === "deals"} label="Deals" onClick={() => setPage("deals")} />
      </nav>

      <nav className="nav-section">
        <span>Manage</span>
        <NavButton label="Accounts" />
        <NavButton label="Programs" />
        <NavButton label="Backtests" />
      </nav>

      <nav className="nav-section">
        <span>Library</span>
        <NavButton label="Documents" />
        <NavButton label="Ideas" />
        <NavButton label="Education" />
        <NavButton active={page === "pairs"} label="Pairs" onClick={() => setPage("pairs")} />
        <NavButton label="Sessions" />
      </nav>

      <div className="sidebar-bottom">
        <NavButton label="Updates" />
        <NavButton label="Settings" />
        <button className="nav-button" onClick={onSignOut}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
