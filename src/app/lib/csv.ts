// Generic CSV export utility used across dashboard pages.

type Row = (string | number | null | undefined)[];

export function buildCsv(headers: string[], rows: Row[]): string {
  const escape = (v: string | number | null | undefined) =>
    `"${String(v ?? '').replace(/"/g, '""')}"`;

  return [headers, ...rows]
    .map(row => row.map(escape).join(','))
    .join('\n');
}

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
