interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface SettingsSelectProps<T extends string> {
  id: string;
  label: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
}

function SettingsSelect<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: SettingsSelectProps<T>) {
  return (
    <label htmlFor={id} className="block">
      <span className="block text-sm font-semibold text-slate-200 mb-2">
        {label}
      </span>
      <select
        id={id}
        value={value}
        onChange={event => onChange(event.target.value as T)}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.description
              ? `${option.label} - ${option.description}`
              : option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default SettingsSelect;
