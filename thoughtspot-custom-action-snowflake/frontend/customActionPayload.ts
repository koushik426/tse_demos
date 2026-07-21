// Turns a ThoughtSpot CustomAction payload into a flat, generic row record.
//
// Context-menu payload shape (from the SDK):
//   payload.data.contextMenuPoints.clickedPoint = {
//     selectedAttributes: [{ column: { name }, value }],
//     selectedMeasures:   [{ column: { name }, value }],
//   }
// Shapes vary by action position/release — the extractor is defensive.

export interface ColumnValue {
  name: string;
  value: string;
}

export interface RowPayload {
  actionId: string;
  columns: ColumnValue[]; // ordered name/value pairs
  record: Record<string, string>; // same data keyed by column name
  raw: unknown; // full original payload (for debugging / lineage)
}

function fmt(v: unknown): string {
  if (v == null || v === '') return '';
  if (Array.isArray(v)) return v.map(fmt).join(', ');
  if (typeof v === 'object') {
    const o = v as any;
    if (o.v?.s != null) return String(o.v.s); // date-range { v: { s, e } }
    return '';
  }
  return String(v);
}

// Primary path: the clicked point's attributes + measures.
function fromPoint(point: any): ColumnValue[] {
  if (!point) return [];
  const out: ColumnValue[] = [];
  const collect = (arr: any[] | undefined) =>
    (arr ?? []).forEach((it) => {
      const name = it?.column?.name ?? it?.columnName ?? it?.column?.column_name;
      if (name != null) out.push({ name: String(name), value: fmt(it?.value) });
    });
  collect(point.selectedAttributes);
  collect(point.selectedMeasures);
  return out;
}

// Fallback: row-0 from the answer's columns + columnDataLite.
function fromAnswerData(data: any): ColumnValue[] {
  const ead = data?.embedAnswerData;
  const cols: any[] | undefined = ead?.columns;
  const cdl: any[] | undefined =
    data?.data?.columnDataLite ?? ead?.data?.[0]?.columnDataLite ?? ead?.columnDataLite;
  if (!Array.isArray(cols) || !Array.isArray(cdl)) return [];
  return cols
    .map((c, i) => {
      const name = c?.column?.name ?? c?.name ?? c?.referencedColumns?.[0]?.displayName;
      const value = cdl[i]?.dataValue?.[0];
      return name != null ? { name: String(name), value: fmt(value) } : null;
    })
    .filter((x): x is ColumnValue => x != null);
}

export function extractRowPayload(payload: any): RowPayload {
  const data = payload?.data ?? payload;
  const cmp = data?.contextMenuPoints;
  const point =
    cmp?.clickedPoint ??
    data?.clickedPoint ??
    cmp?.selectedPoints?.[0] ??
    data?.selectedPoints?.[0];

  let columns = fromPoint(point);
  if (!columns.length) columns = fromAnswerData(data);

  const record: Record<string, string> = {};
  for (const c of columns) record[c.name] = c.value;

  return { actionId: data?.id ?? '', columns, record, raw: payload };
}
