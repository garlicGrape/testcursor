import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { SQL_SPECS } from "@/data/sqlSpecs";
import { compareTables, resultFromExec } from "./sqlHarness";

/** Reference queries used only in tests — not shipped in the UI. */
const REFERENCE_SQL: Record<string, string> = {
  "sql-big-countries":
    "SELECT name, population, area FROM World WHERE area >= 3000000 OR population >= 25000000",
  "sql-recyclable": "SELECT product_id FROM Products WHERE low_fats = 'Y' AND recyclable = 'Y'",
  "sql-referee": "SELECT name FROM Customer WHERE referee_id != 2 OR referee_id IS NULL",
  "sql-invalid-tweets": "SELECT tweet_id FROM Tweets WHERE LENGTH(content) > 15",
  "sql-article-views":
    "SELECT DISTINCT author_id AS id FROM Views WHERE author_id = viewer_id ORDER BY id",
  "sql-not-boring":
    "SELECT * FROM Cinema WHERE id % 2 = 1 AND description != 'boring' ORDER BY rating DESC",
  "sql-combine-tables":
    "SELECT p.firstName, p.lastName, a.city, a.state FROM Person p LEFT JOIN Address a ON p.personId = a.personId",
  "sql-rising-temp":
    "SELECT w.id FROM Weather w JOIN Weather p ON date(w.recordDate, '-1 day') = p.recordDate WHERE w.temperature > p.temperature",
  "sql-duplicate-emails": "SELECT email FROM Person GROUP BY email HAVING COUNT(*) > 1",
  "sql-second-salary":
    "SELECT MAX(salary) AS SecondHighestSalary FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee)",
  "sql-game-play":
    "SELECT player_id, MIN(event_date) AS first_login FROM Activity GROUP BY player_id",
  "sql-managers-five":
    "SELECT e.name FROM Employee e JOIN (SELECT managerId FROM Employee WHERE managerId IS NOT NULL GROUP BY managerId HAVING COUNT(*) >= 5) m ON e.id = m.managerId",
  "sql-dept-highest":
    "SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary FROM Employee e JOIN Department d ON e.departmentId = d.id WHERE (e.departmentId, e.salary) IN (SELECT departmentId, MAX(salary) FROM Employee GROUP BY departmentId)",
  "sql-rank-scores":
    "SELECT score, DENSE_RANK() OVER (ORDER BY score DESC) AS `rank` FROM Scores ORDER BY score DESC",
  "sql-tree-node": `SELECT id,
    CASE
      WHEN p_id IS NULL THEN 'Root'
      WHEN id IN (SELECT p_id FROM Tree WHERE p_id IS NOT NULL) THEN 'Inner'
      ELSE 'Leaf'
    END AS type
    FROM Tree`,
  "sql-students-exams": `SELECT st.student_id, st.student_name, su.subject_name, COUNT(e.subject_name) AS attended_exams
    FROM Students st CROSS JOIN Subjects su
    LEFT JOIN Examinations e ON e.student_id = st.student_id AND e.subject_name = su.subject_name
    GROUP BY st.student_id, st.student_name, su.subject_name
    ORDER BY st.student_id, su.subject_name`,
  "sql-emp-vs-manager":
    "SELECT e.name FROM Employee e JOIN Employee m ON e.managerId = m.id WHERE e.salary > m.salary",
  "sql-never-order":
    "SELECT c.name AS Customers FROM Customers c LEFT JOIN Orders o ON c.id = o.customerId WHERE o.id IS NULL",
  "sql-classes-five": "SELECT class FROM Courses GROUP BY class HAVING COUNT(*) >= 5",
  "sql-employee-bonus":
    "SELECT e.name, b.bonus FROM Employee e LEFT JOIN Bonus b ON e.empId = b.empId WHERE b.bonus < 1000 OR b.bonus IS NULL",
  "sql-no-trans": `SELECT v.customer_id, COUNT(*) AS count_no_trans
    FROM Visits v LEFT JOIN Transactions t ON v.visit_id = t.visit_id
    WHERE t.transaction_id IS NULL
    GROUP BY v.customer_id`,
  "sql-unique-id":
    "SELECT u.unique_id, e.name FROM Employees e LEFT JOIN EmployeeUNI u ON e.id = u.id",
  "sql-followers":
    "SELECT user_id, COUNT(*) AS followers_count FROM Followers GROUP BY user_id ORDER BY user_id",
  "sql-triangle":
    "SELECT x, y, z, CASE WHEN x+y>z AND x+z>y AND y+z>x THEN 'Yes' ELSE 'No' END AS triangle FROM Triangle",
  "sql-fix-names":
    "SELECT user_id, UPPER(SUBSTR(name,1,1)) || LOWER(SUBSTR(name,2)) AS name FROM Users ORDER BY user_id",
  "sql-patients":
    "SELECT patient_id, patient_name, conditions FROM Patients WHERE conditions LIKE 'DIAB1%' OR conditions LIKE '% DIAB1%'",
  "sql-consecutive": `SELECT DISTINCT a.num AS ConsecutiveNums
    FROM Logs a JOIN Logs b ON a.id = b.id - 1 AND a.num = b.num
    JOIN Logs c ON a.id = c.id - 2 AND a.num = c.num`,
  "sql-exchange-seats": `SELECT
      CASE
        WHEN id % 2 = 1 AND id != (SELECT MAX(id) FROM Seat) THEN id + 1
        WHEN id % 2 = 0 THEN id - 1
        ELSE id
      END AS id,
      student
    FROM Seat
    ORDER BY 1`,
};

function runSqlite(setup: string, query: string): { columns: string[]; rows: unknown[][] } {
  const script = `
import json, sqlite3, sys
setup = sys.stdin.read()
con = sqlite3.connect(":memory:")
con.executescript(setup)
cur = con.execute(${JSON.stringify(query)})
cols = [d[0] for d in cur.description] if cur.description else []
rows = [list(r) for r in cur.fetchall()]
print(json.dumps({"columns": cols, "rows": rows}))
`;
  const stdout = execFileSync("python3", ["-c", script], {
    input: setup,
    encoding: "utf8",
    timeout: 10000,
  });
  return JSON.parse(stdout) as { columns: string[]; rows: unknown[][] };
}

describe("SQL catalog vs sqlite3", () => {
  it("has a reference query for every spec", () => {
    expect(Object.keys(SQL_SPECS).sort()).toEqual(Object.keys(REFERENCE_SQL).sort());
  });

  for (const [id, spec] of Object.entries(SQL_SPECS)) {
    it(`${id} expected tables match a correct query`, () => {
      const query = REFERENCE_SQL[id];
      expect(query, `missing reference for ${id}`).toBeTruthy();
      for (const c of spec.cases) {
        const raw = runSqlite(c.setup, query);
        const got = resultFromExec([{ columns: raw.columns, values: raw.rows }]);
        const cmp = compareTables(got, c.expected, Boolean(c.orderMatters));
        expect(cmp.ok, `${id} / ${c.name}\ngot ${cmp.got}\nwant ${cmp.want}`).toBe(true);
      }
    });
  }
});
