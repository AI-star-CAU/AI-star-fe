interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface SettingsSelectProps<T extends string> {
  id: string;
  /** 라벨 텍스트는 페이지의 set-row 셀에서 직접 렌더링한다. */
  label?: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
}

const selectStyle: React.CSSProperties = {
  height: 38,
  padding: '0 36px 0 12px',
  border: '1.5px solid var(--ink)',
  background: 'var(--paper-card)',
  fontFamily: 'var(--type)',
  fontSize: 11,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--ink)',
  borderRadius: 0,
  appearance: 'none',
  WebkitAppearance: 'none',
  minWidth: 220,
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23181410' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  cursor: 'pointer',
};

function SettingsSelect<T extends string>({
  id,
  value,
  options,
  onChange,
}: SettingsSelectProps<T>) {
  return (
    <select
      id={id}
      value={value}
      onChange={event => onChange(event.target.value as T)}
      style={selectStyle}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.description
            ? `${option.label} — ${option.description}`
            : option.label}
        </option>
      ))}
    </select>
  );
}

export default SettingsSelect;
