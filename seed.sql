
INSERT INTO department_table (department) 
VALUES 
('developer'),
('testing'),
('admin');

INSERT INTO role_table (title,salary,department_id) 
VALUES 
('developer',60000,1),
('senior developer',80000,1),
('qa-tester',50000,2),
('project manager',100000,3);

INSERT INTO employee_table (first_name,last_name,role_id) 
VALUES ('john','doe',1),
('john','doe',1),
('john','doe',1),
('john','doe',2),
('john','doe',3),
('john','doe',4);