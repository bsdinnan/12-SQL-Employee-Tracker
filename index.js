const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
let db;

async function main() {
  try {
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'employees_db',
    });

    console.log('Connected to the employees_db database.');
    mainMenu();
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
}

main();

function mainMenu() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
        ],
      },
    ])
    .then((answer) => {
      switch (answer.action) {
        case 'View all departments':
          viewDepartments();
          break;
        case 'View all roles':
          viewRoles();
          break;
        case 'View all employees':
          viewEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
      }
    });
}

async function viewDepartments() {
  const query = 'SELECT id, name FROM department';
  const [rows] = await db.query(query);
  console.table(rows);
  mainMenu();
}

async function viewRoles() {
  const query = `
    SELECT role.id, role.title, role.salary, department.name AS department
    FROM role
    INNER JOIN department ON role.department_id = department.id
  `;
  const [rows] = await db.query(query);
  console.table(rows);
  mainMenu();
}

async function viewEmployees() {
  const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, 
    department.name AS department, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    INNER JOIN role ON employee.role_id = role.id
    INNER JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id
  `;
  const [rows] = await db.query(query);
  console.table(rows);
  mainMenu();
}

async function addDepartment() {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the name of the department:',
    },
  ]);
  const query = 'INSERT INTO department (name) VALUES (?)';
  await db.query(query, [answer.name]);
  console.log('Department added successfully!');
  mainMenu();
}

async function addRole() {
  const departmentListQuery = 'SELECT id, name FROM department';
  const [departmentRows] = await db.query(departmentListQuery);
  const departments = departmentRows;

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter the title of the role:',
    },
    {
      type: 'input',
      name: 'salary',
      message: 'Enter the salary for the role:',
    },
    {
      type: 'list',
      name: 'department_id',
      message: 'Select the department for the role:',
      choices: departments.map((department) => ({
        name: department.name,
        value: department.id,
      })),
    },
  ]);

  const query = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
  await db.query(query, [answers.title, answers.salary, answers.department_id]);
  console.log('Role added successfully!');
  mainMenu();
}

async function addEmployee() {
  const roleListQuery = 'SELECT id, title FROM role';
  const employeeListQuery = 'SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employee';

  const [roleRows, employeeRows] = await Promise.all([
    db.query(roleListQuery),
    db.query(employeeListQuery),
  ]);

  const roles = roleRows[0];
  const employees = employeeRows[0];

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: 'Enter the first name of the employee:',
    },
    {
      type: 'input',
      name: 'last_name',
      message: 'Enter the last name of the employee:',
    },
    {
      type: 'list',
      name: 'role_id',
      message: 'Select the role for the employee:',
      choices: roles.map((role) => ({
        name: role.title,
        value: role.id,
      })),
    },
    {
      type: 'list',
      name: 'manager_id',
      message: 'Select the manager for the employee (or leave empty for no manager):',
      choices: [{ name: 'None', value: null }].concat(
        employees.map((employee) => ({
          name: employee.full_name,
          value: employee.id,
        }))
      ),
    },
  ]);

  const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
  await db.query(query, [answers.first_name, answers.last_name, answers.role_id, answers.manager_id]);
  console.log('Employee added successfully!');
  mainMenu();
}

async function updateEmployeeRole() {
  const employeeListQuery = 'SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employee';
  const roleListQuery = 'SELECT id, title FROM role';

  const [employeeRows, roleRows] = await Promise.all([
    db.query(employeeListQuery),
    db.query(roleListQuery),
  ]);

  const employees = employeeRows[0];
  const roles = roleRows[0];

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'employee_id',
      message: 'Select the employee you want to update:',
      choices: employees.map((employee) => ({
        name: employee.full_name,
        value: employee.id,
      })),
    },
    {
      type: 'list',
      name: 'new_role_id',
      message: 'Select the new role for the employee:',
      choices: roles.map((role) => ({
        name: role.title,
        value: role.id,
      })),
    },
  ]);

  const employeeId = answers.employee_id;
  const newRoleId = answers.new_role_id;
  const query = 'UPDATE employee SET role_id = ? WHERE id = ?';
  await db.query(query, [newRoleId, employeeId]);
  console.log('Employee role updated successfully!');
  mainMenu();
}