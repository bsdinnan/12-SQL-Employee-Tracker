INSERT INTO department (name) VALUES
    ('Human Resources'),
    ('Finance'),
    ('Engineering'),
    ('Marketing');

INSERT INTO role (title, salary, department_id) VALUES
    ('HR Manager', 65000.00, 1),
    ('Accountant', 55000.00, 2),
    ('Software Engineer', 80000.00, 3),
    ('Marketing Specialist', 60000.00, 4),
    ('Senior Engineer', 95000.00, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
    ('John', 'Doe', 1, NULL),
    ('Alice', 'Smith', 2, NULL),
    ('Bob', 'Johnson', 3, NULL),
    ('Eva', 'Adams', 4, NULL),
    ('Michael', 'Brown', 5, 3),
    ('Emily', 'Wilson', 5, 3),
    ('David', 'Lee', 3, 5),
    ('Sarah', 'Taylor', 4, 4);