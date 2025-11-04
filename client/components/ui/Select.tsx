// components/ui/Select.tsx
import * as React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: { label: string; value: string }[]; // note le "?"
}

export function Select({ options = [], ...props }: SelectProps) {
  return (
    <select
      {...props}
      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.length === 0 ? (
        <option disabled>Aucune option</option>
      ) : (
        options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))
      )}
    </select>
  );
}
