type NavButtonProps = {
  active?: boolean;
  label: string;
  onClick?: () => void;
};

export function NavButton({ active = false, label, onClick }: NavButtonProps) {
  return (
    <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick} type="button">
      {label}
    </button>
  );
}
