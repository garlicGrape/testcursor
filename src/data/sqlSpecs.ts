import type { SqlSpec } from "@/lib/sqlHarness";

function spec(starter: string, cases: SqlSpec["cases"]): SqlSpec {
  return { starter, cases };
}

export const SQL_SPECS: Record<string, SqlSpec> = {
  "sql-big-countries": spec("SELECT -- name, population, area of big countries\n", [
    {
      name: "example",
      setup: `CREATE TABLE World (name TEXT, continent TEXT, area INT, population INT, gdp INT);
INSERT INTO World VALUES
  ('Afghanistan','Asia',652230,25500100,20343000000),
  ('Albania','Europe',28748,2831741,12960000000),
  ('Algeria','Africa',2381741,37100000,188681000000),
  ('Andorra','Europe',468,78115,3712000000);`,
      expected: {
        columns: ["name", "population", "area"],
        rows: [
          ["Afghanistan", 25500100, 652230],
          ["Algeria", 37100000, 2381741],
        ],
      },
    },
  ]),
  "sql-recyclable": spec("SELECT -- product_id\n", [
    {
      name: "example",
      setup: `CREATE TABLE Products (product_id INT, low_fats TEXT, recyclable TEXT);
INSERT INTO Products VALUES (0,'Y','N'),(1,'Y','Y'),(2,'N','Y'),(3,'Y','Y'),(4,'N','N');`,
      expected: { columns: ["product_id"], rows: [[1], [3]] },
    },
  ]),
  "sql-referee": spec("SELECT -- name\n", [
    {
      name: "null trap",
      setup: `CREATE TABLE Customer (id INT, name TEXT, referee_id INT);
INSERT INTO Customer VALUES (1,'Will',NULL),(2,'Jane',NULL),(3,'Alex',2),(4,'Bill',NULL),(5,'Zack',1),(6,'Mark',2);`,
      expected: { columns: ["name"], rows: [["Will"], ["Jane"], ["Bill"], ["Zack"]] },
    },
  ]),
  "sql-invalid-tweets": spec("SELECT -- tweet_id\n", [
    {
      name: "example",
      setup: `CREATE TABLE Tweets (tweet_id INT, content TEXT);
INSERT INTO Tweets VALUES (1,'Vote for BBB'),(2,'Let us go'),(3,'This tweet is definitely long');`,
      expected: { columns: ["tweet_id"], rows: [[3]] },
    },
  ]),
  "sql-article-views": spec("SELECT -- id\n", [
    {
      name: "example",
      setup: `CREATE TABLE Views (article_id INT, author_id INT, viewer_id INT, view_date TEXT);
INSERT INTO Views VALUES
  (1,3,5,'2019-08-01'),
  (1,3,3,'2019-08-01'),
  (2,7,7,'2019-08-01'),
  (2,7,6,'2019-08-02'),
  (3,4,4,'2019-07-21');`,
      expected: { columns: ["id"], rows: [[3], [4], [7]] },
    },
  ]),
  "sql-not-boring": spec("SELECT -- *\n", [
    {
      name: "example",
      setup: `CREATE TABLE Cinema (id INT, movie TEXT, description TEXT, rating REAL);
INSERT INTO Cinema VALUES
  (1,'War','great 3D',8.9),
  (2,'Science','fiction',8.5),
  (3,'irish','boring',6.2),
  (4,'Ice song','Fantacy',8.6),
  (5,'House card','Interesting',9.1);`,
      expected: {
        columns: ["id", "movie", "description", "rating"],
        rows: [
          [5, "House card", "Interesting", 9.1],
          [1, "War", "great 3D", 8.9],
        ],
      },
      orderMatters: true,
    },
  ]),
  "sql-combine-tables": spec("SELECT -- firstName, lastName, city, state\n", [
    {
      name: "left join",
      setup: `CREATE TABLE Person (personId INT, lastName TEXT, firstName TEXT);
CREATE TABLE Address (addressId INT, personId INT, city TEXT, state TEXT);
INSERT INTO Person VALUES (1,'Wang','Allen'),(2,'Alice','Bob');
INSERT INTO Address VALUES (1,2,'New York City','New York'),(2,3,'Leetcode','California');`,
      expected: {
        columns: ["firstName", "lastName", "city", "state"],
        rows: [
          ["Allen", "Wang", null, null],
          ["Bob", "Alice", "New York City", "New York"],
        ],
      },
    },
  ]),
  "sql-rising-temp": spec("SELECT -- id\n", [
    {
      name: "example",
      setup: `CREATE TABLE Weather (id INT, recordDate TEXT, temperature INT);
INSERT INTO Weather VALUES
  (1,'2015-01-01',10),
  (2,'2015-01-02',25),
  (3,'2015-01-03',20),
  (4,'2015-01-04',30);`,
      expected: { columns: ["id"], rows: [[2], [4]] },
    },
  ]),
  "sql-duplicate-emails": spec("SELECT -- email\n", [
    {
      name: "example",
      setup: `CREATE TABLE Person (id INT, email TEXT);
INSERT INTO Person VALUES (1,'a@b.com'),(2,'c@d.com'),(3,'a@b.com');`,
      expected: { columns: ["email"], rows: [["a@b.com"]] },
    },
  ]),
  "sql-second-salary": spec("SELECT -- SecondHighestSalary\n", [
    {
      name: "exists",
      setup: `CREATE TABLE Employee (id INT, salary INT);
INSERT INTO Employee VALUES (1,100),(2,200),(3,300);`,
      expected: { columns: ["SecondHighestSalary"], rows: [[200]] },
    },
    {
      name: "no second",
      setup: `CREATE TABLE Employee (id INT, salary INT);
INSERT INTO Employee VALUES (1,100),(2,100);`,
      expected: { columns: ["SecondHighestSalary"], rows: [[null]] },
    },
  ]),
  "sql-game-play": spec("SELECT -- player_id, first_login\n", [
    {
      name: "example",
      setup: `CREATE TABLE Activity (player_id INT, device_id INT, event_date TEXT, games_played INT);
INSERT INTO Activity VALUES
  (1,2,'2016-03-01',5),
  (1,2,'2016-05-02',6),
  (2,3,'2017-06-25',1),
  (3,1,'2016-03-02',0),
  (3,4,'2018-07-03',5);`,
      expected: {
        columns: ["player_id", "first_login"],
        rows: [
          [1, "2016-03-01"],
          [2, "2017-06-25"],
          [3, "2016-03-02"],
        ],
      },
    },
  ]),
  "sql-managers-five": spec("SELECT -- name\n", [
    {
      name: "example",
      setup: `CREATE TABLE Employee (id INT, name TEXT, department TEXT, managerId INT);
INSERT INTO Employee VALUES
  (101,'John','A',NULL),
  (102,'Dan','A',101),
  (103,'James','A',101),
  (104,'Amy','A',101),
  (105,'Anne','A',101),
  (106,'Ron','B',101),
  (107,'Solo','B',102);`,
      expected: { columns: ["name"], rows: [["John"]] },
    },
  ]),
  "sql-dept-highest": spec("SELECT -- Department, Employee, Salary\n", [
    {
      name: "ties",
      setup: `CREATE TABLE Employee (id INT, name TEXT, salary INT, departmentId INT);
CREATE TABLE Department (id INT, name TEXT);
INSERT INTO Department VALUES (1,'IT'),(2,'Sales');
INSERT INTO Employee VALUES
  (1,'Joe',85000,1),
  (2,'Henry',80000,2),
  (3,'Sam',60000,2),
  (4,'Max',90000,1),
  (5,'Janet',69000,1),
  (6,'Randy',85000,1),
  (7,'Will',70000,1);`,
      expected: {
        columns: ["Department", "Employee", "Salary"],
        rows: [
          ["IT", "Max", 90000],
          ["Sales", "Henry", 80000],
        ],
      },
    },
  ]),
  "sql-rank-scores": spec("SELECT -- score, rank\n", [
    {
      name: "dense",
      setup: `CREATE TABLE Scores (id INT, score REAL);
INSERT INTO Scores VALUES (1,3.5),(2,3.65),(3,4.0),(4,3.85),(5,4.0),(6,3.65);`,
      expected: {
        columns: ["score", "rank"],
        rows: [
          [4, 1],
          [4, 1],
          [3.85, 2],
          [3.65, 3],
          [3.65, 3],
          [3.5, 4],
        ],
      },
      orderMatters: true,
    },
  ]),
  "sql-tree-node": spec("SELECT -- id, type\n", [
    {
      name: "example",
      setup: `CREATE TABLE Tree (id INT, p_id INT);
INSERT INTO Tree VALUES (1,NULL),(2,1),(3,1),(4,2),(5,2);`,
      expected: {
        columns: ["id", "type"],
        rows: [
          [1, "Root"],
          [2, "Inner"],
          [3, "Leaf"],
          [4, "Leaf"],
          [5, "Leaf"],
        ],
      },
    },
  ]),
  "sql-students-exams": spec("SELECT -- student_id, student_name, subject_name, attended_exams\n", [
    {
      name: "grid",
      setup: `CREATE TABLE Students (student_id INT, student_name TEXT);
CREATE TABLE Subjects (subject_name TEXT);
CREATE TABLE Examinations (student_id INT, subject_name TEXT);
INSERT INTO Students VALUES (1,'Alice'),(2,'Bob'),(13,'John'),(6,'Alex');
INSERT INTO Subjects VALUES ('Math'),('Physics'),('Programming');
INSERT INTO Examinations VALUES
  (1,'Math'),(1,'Physics'),(1,'Programming'),
  (2,'Programming'),(1,'Physics'),(1,'Math'),
  (13,'Math'),(13,'Programming'),(13,'Physics'),
  (2,'Math'),(1,'Math');`,
      expected: {
        columns: ["student_id", "student_name", "subject_name", "attended_exams"],
        rows: [
          [1, "Alice", "Math", 3],
          [1, "Alice", "Physics", 2],
          [1, "Alice", "Programming", 1],
          [2, "Bob", "Math", 1],
          [2, "Bob", "Physics", 0],
          [2, "Bob", "Programming", 1],
          [6, "Alex", "Math", 0],
          [6, "Alex", "Physics", 0],
          [6, "Alex", "Programming", 0],
          [13, "John", "Math", 1],
          [13, "John", "Physics", 1],
          [13, "John", "Programming", 1],
        ],
      },
      orderMatters: true,
    },
  ]),
  "sql-emp-vs-manager": spec("SELECT -- name\n", [
    {
      name: "example",
      setup: `CREATE TABLE Employee (id INT, name TEXT, salary INT, managerId INT);
INSERT INTO Employee VALUES (1,'Joe',70000,3),(2,'Henry',80000,4),(3,'Sam',60000,NULL),(4,'Max',90000,NULL);`,
      expected: { columns: ["name"], rows: [["Joe"]] },
    },
  ]),
  "sql-never-order": spec("SELECT -- Customers\n", [
    {
      name: "example",
      setup: `CREATE TABLE Customers (id INT, name TEXT);
CREATE TABLE Orders (id INT, customerId INT);
INSERT INTO Customers VALUES (1,'Joe'),(2,'Henry'),(3,'Sam'),(4,'Max');
INSERT INTO Orders VALUES (1,3),(2,1);`,
      expected: { columns: ["Customers"], rows: [["Henry"], ["Max"]] },
    },
  ]),
  "sql-classes-five": spec("SELECT -- class\n", [
    {
      name: "example",
      setup: `CREATE TABLE Courses (student TEXT, class TEXT);
INSERT INTO Courses VALUES
  ('A','Math'),('B','English'),('C','Math'),('D','Biology'),('E','Math'),
  ('F','Computer'),('G','Math'),('H','Math'),('I','Math');`,
      expected: { columns: ["class"], rows: [["Math"]] },
    },
  ]),
  "sql-employee-bonus": spec("SELECT -- name, bonus\n", [
    {
      name: "example",
      setup: `CREATE TABLE Employee (empId INT, name TEXT, supervisor INT, salary INT);
CREATE TABLE Bonus (empId INT, bonus INT);
INSERT INTO Employee VALUES (1,'John',3,1000),(2,'Dan',3,2000),(3,'Brad',NULL,4000),(4,'Thomas',3,4000);
INSERT INTO Bonus VALUES (2,500),(4,2000);`,
      expected: {
        columns: ["name", "bonus"],
        rows: [
          ["John", null],
          ["Dan", 500],
          ["Brad", null],
        ],
      },
    },
  ]),
  "sql-no-trans": spec("SELECT -- customer_id, count_no_trans\n", [
    {
      name: "example",
      setup: `CREATE TABLE Visits (visit_id INT, customer_id INT);
CREATE TABLE Transactions (transaction_id INT, visit_id INT, amount INT);
INSERT INTO Visits VALUES (1,23),(2,9),(4,30),(5,54),(6,96),(7,54),(8,54);
INSERT INTO Transactions VALUES (2,5,310),(3,5,300),(9,5,200),(12,1,910),(13,2,970);`,
      expected: {
        columns: ["customer_id", "count_no_trans"],
        rows: [
          [30, 1],
          [96, 1],
          [54, 2],
        ],
      },
    },
  ]),
  "sql-unique-id": spec("SELECT -- unique_id, name\n", [
    {
      name: "example",
      setup: `CREATE TABLE Employees (id INT, name TEXT);
CREATE TABLE EmployeeUNI (id INT, unique_id INT);
INSERT INTO Employees VALUES (1,'Alice'),(7,'Bob'),(11,'Meir'),(2,'Winston'),(3,'Jonathan');
INSERT INTO EmployeeUNI VALUES (3,1),(11,2),(7,3);`,
      expected: {
        columns: ["unique_id", "name"],
        rows: [
          [null, "Alice"],
          [3, "Bob"],
          [2, "Meir"],
          [null, "Winston"],
          [1, "Jonathan"],
        ],
      },
    },
  ]),
  "sql-followers": spec("SELECT -- user_id, followers_count\n", [
    {
      name: "example",
      setup: `CREATE TABLE Followers (user_id INT, follower_id INT);
INSERT INTO Followers VALUES (0,1),(1,0),(2,0),(2,1);`,
      expected: {
        columns: ["user_id", "followers_count"],
        rows: [
          [0, 1],
          [1, 1],
          [2, 2],
        ],
      },
      orderMatters: true,
    },
  ]),
  "sql-triangle": spec("SELECT -- x, y, z, triangle\n", [
    {
      name: "example",
      setup: `CREATE TABLE Triangle (x INT, y INT, z INT);
INSERT INTO Triangle VALUES (13,15,30),(10,20,15);`,
      expected: {
        columns: ["x", "y", "z", "triangle"],
        rows: [
          [13, 15, 30, "No"],
          [10, 20, 15, "Yes"],
        ],
      },
    },
  ]),
  "sql-fix-names": spec("SELECT -- user_id, name\n", [
    {
      name: "example",
      setup: `CREATE TABLE Users (user_id INT, name TEXT);
INSERT INTO Users VALUES (1,'aLice'),(2,'bOB');`,
      expected: {
        columns: ["user_id", "name"],
        rows: [
          [1, "Alice"],
          [2, "Bob"],
        ],
      },
      orderMatters: true,
    },
  ]),
  "sql-patients": spec("SELECT -- patient_id, patient_name, conditions\n", [
    {
      name: "prefix not substring",
      setup: `CREATE TABLE Patients (patient_id INT, patient_name TEXT, conditions TEXT);
INSERT INTO Patients VALUES
  (1,'Daniel','YFEV COUGH'),
  (2,'Alice',''),
  (3,'Bob','DIAB100 MYOP'),
  (4,'George','ACNE DIAB100'),
  (5,'Alain','DIAB201'),
  (6,'Sam','SADIAB100');`,
      expected: {
        columns: ["patient_id", "patient_name", "conditions"],
        rows: [
          [3, "Bob", "DIAB100 MYOP"],
          [4, "George", "ACNE DIAB100"],
        ],
      },
    },
  ]),
  "sql-consecutive": spec("SELECT -- ConsecutiveNums\n", [
    {
      name: "example",
      setup: `CREATE TABLE Logs (id INT, num INT);
INSERT INTO Logs VALUES (1,1),(2,1),(3,1),(4,2),(5,1),(6,2),(7,2);`,
      expected: { columns: ["ConsecutiveNums"], rows: [[1]] },
    },
  ]),
  "sql-exchange-seats": spec("SELECT -- id, student\n", [
    {
      name: "odd leftover",
      setup: `CREATE TABLE Seat (id INT, student TEXT);
INSERT INTO Seat VALUES (1,'Abbot'),(2,'Doris'),(3,'Emerson'),(4,'Green'),(5,'Jeames');`,
      expected: {
        columns: ["id", "student"],
        rows: [
          [1, "Doris"],
          [2, "Abbot"],
          [3, "Green"],
          [4, "Emerson"],
          [5, "Jeames"],
        ],
      },
      orderMatters: true,
    },
  ]),
};

export function getSqlSpec(id: string): SqlSpec | undefined {
  return SQL_SPECS[id];
}
