import { describe, expect, it } from "vitest";
import { SQL_SPECS } from "@/data/sqlSpecs";
import { makeSqlStarter, parseSqlSetup } from "./sqlPreview";

describe("parseSqlSetup", () => {
  it("reads World columns and four sample rows", () => {
    const tables = parseSqlSetup(SQL_SPECS["sql-big-countries"].cases[0].setup);
    expect(tables).toHaveLength(1);
    expect(tables[0].name).toBe("World");
    expect(tables[0].columns.map((c) => c.name)).toEqual(["name", "continent", "area", "population", "gdp"]);
    expect(tables[0].rows).toHaveLength(4);
    expect(tables[0].rows[0][0]).toBe("Afghanistan");
    expect(tables[0].rows[0][2]).toBe(652230);
  });

  it("keeps NULL manager ids", () => {
    const tables = parseSqlSetup(SQL_SPECS["sql-emp-vs-manager"].cases[0].setup);
    expect(tables[0].rows[2][3]).toBeNull();
  });

  it("parses two tables for combine", () => {
    const tables = parseSqlSetup(SQL_SPECS["sql-combine-tables"].cases[0].setup);
    expect(tables.map((t) => t.name)).toEqual(["Person", "Address"]);
    expect(tables[0].rows).toHaveLength(2);
    expect(tables[1].rows).toHaveLength(2);
  });
});

describe("makeSqlStarter", () => {
  it("names the tables and return columns", () => {
    const spec = SQL_SPECS["sql-big-countries"];
    const text = makeSqlStarter(parseSqlSetup(spec.cases[0].setup), spec.cases[0].expected.columns);
    expect(text).toContain("FROM World");
    expect(text).toContain("name");
    expect(text).toContain("population");
    expect(text).toContain("area");
    expect(text.split("\n").length).toBeGreaterThan(6);
  });
});
