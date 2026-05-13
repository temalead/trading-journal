type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
};

export function Field({ label, value, onChange, type = "text", required = false }: FieldProps) {
  return (
    <label>
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        step={type === "number" ? "0.00001" : undefined}
        required={required}
      />
    </label>
  );
}
