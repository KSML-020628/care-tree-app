/**
 * @supabase/supabase-js를 실제로 네트워크로 호출하지 않고도 테스트가 돌아가도록 만든 아주 얇은
 * 인메모리 대역이다. lib/mock/weekly-canvas.ts·lib/profile/profile-storage.ts가 실제로 쓰는
 * 체이닝 패턴만 지원한다:
 *   .from(table).select("*").eq(col, val).maybeSingle()
 *   .from(table).select("*").eq(col, val)                (그냥 await)
 *   .from(table).select("*").in(col, values)
 *   .from(table).select("*").order(col, { ascending })
 *   .from(table).upsert(row | row[], { ignoreDuplicates? }).select().single()
 *   .from(table).update(patch).eq(col, val).eq(col2, val2)
 * PostgREST의 일반적인 동작을 흉내내는 범용 mock이 아니라, 이 프로젝트가 실제로 쓰는 형태만 맞춘 것이다.
 */

type Row = Record<string, unknown>;

class FakeTable {
  rows = new Map<string, Row>();
}

class FakeQuery implements PromiseLike<{ data: unknown; error: null }> {
  private filters: Array<[string, unknown]> = [];
  private inFilters: Array<[string, unknown[]]> = [];
  private mode: "select" | "upsert" | "update" = "select";
  private payload: Row | Row[] | null = null;
  private ignoreDuplicates = false;
  private orderBy: { column: string; ascending: boolean } | null = null;

  constructor(private table: FakeTable) {}

  select(): this {
    return this;
  }

  eq(column: string, value: unknown): this {
    this.filters.push([column, value]);
    return this;
  }

  in(column: string, values: unknown[]): this {
    this.inFilters.push([column, values]);
    return this;
  }

  order(column: string, opts: { ascending: boolean }): this {
    this.orderBy = { column, ascending: opts.ascending };
    return this;
  }

  upsert(payload: Row | Row[], opts: { ignoreDuplicates?: boolean } = {}): this {
    this.mode = "upsert";
    this.payload = payload;
    this.ignoreDuplicates = opts.ignoreDuplicates ?? false;
    return this;
  }

  update(patch: Row): this {
    this.mode = "update";
    this.payload = patch;
    return this;
  }

  single(): Promise<{ data: unknown; error: null }> {
    return this.execute(true);
  }

  maybeSingle(): Promise<{ data: unknown; error: null }> {
    return this.execute(true);
  }

  then<TResult1 = { data: unknown; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: unknown; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute(false).then(onfulfilled, onrejected);
  }

  private matches(row: Row): boolean {
    return (
      this.filters.every(([column, value]) => row[column] === value) &&
      this.inFilters.every(([column, values]) => values.includes(row[column]))
    );
  }

  private async execute(wantsSingle: boolean): Promise<{ data: unknown; error: null }> {
    if (this.mode === "select") {
      let result = [...this.table.rows.values()].filter((row) => this.matches(row));
      if (this.orderBy) {
        const { column, ascending } = this.orderBy;
        result = [...result].sort((a, b) => {
          const diff = String(a[column]).localeCompare(String(b[column]));
          return ascending ? diff : -diff;
        });
      }
      return wantsSingle ? { data: result[0] ?? null, error: null } : { data: result, error: null };
    }

    if (this.mode === "upsert") {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      const saved: Row[] = items.map((item) => {
        const id = String(item.id);
        const exists = this.table.rows.has(id);
        if (exists && this.ignoreDuplicates) return this.table.rows.get(id) as Row;
        this.table.rows.set(id, item);
        return item;
      });
      return wantsSingle ? { data: saved[0] ?? null, error: null } : { data: saved, error: null };
    }

    // update
    const updated: Row[] = [];
    for (const row of this.table.rows.values()) {
      if (!this.matches(row)) continue;
      Object.assign(row, this.payload);
      updated.push(row);
    }
    return { data: updated, error: null };
  }
}

const tables = new Map<string, FakeTable>();

function getTable(name: string): FakeTable {
  const existing = tables.get(name);
  if (existing) return existing;
  const created = new FakeTable();
  tables.set(name, created);
  return created;
}

export const fakeSupabaseClient = {
  from(name: string): FakeQuery {
    return new FakeQuery(getTable(name));
  },
};

/** 테스트 사이에 상태가 섞이지 않도록, 각 테스트 beforeEach에서 호출한다. */
export function resetFakeSupabase(): void {
  tables.clear();
}
