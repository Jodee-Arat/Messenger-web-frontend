"use client";

import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 1500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    if (typeof value === "string" && value.length === 0) {
      setDebouncedValue(value);
      return;
    }

    const handler = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(handler);
  }, [delay, value]);

  return debouncedValue;
}
