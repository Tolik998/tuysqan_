export function deliveryOrderNumber(sequence: number, date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `TQ-${y}${m}${d}-${String(sequence).padStart(3, "0")}`;
}

export function dineInOrderNumber(sequence: number) {
  return `D-${String(sequence).padStart(3, "0")}`;
}
