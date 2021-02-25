const inquire = require('inquirer');
const mysql = require('mysql');
const cTable = require('console.table');

// establish connection to database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employee_db"
});
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    start();
});

//start CLI when connection is established
function start() {
    inquire
        .prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: ["add data", "view data", "update data", "exit"]
            }
        ])
        .then(answers => {
            //determin what to do based on user input in CLI

            if (answers.action == "add data") {
                console.log("adding data to db")
                addData();
            } else if (answers.action == "view data") {
                console.log("viewing data in db")
                viewData();
            } else if (answers.action == "update data") {
                console.log("updating db")
                updateData();
            } else {
                console.log("goodbye")
                connection.end();
            }
        })
        .catch(error => {
            if (error.isTtyError) {
                // Prompt couldn't be rendered in the current environment
            } else {
                // Something else when wrong
            }
        });
}

//function to add data to the DB
function addData() {
    inquire
        .prompt([
            {
                type: 'list',
                name: 'table',
                message: 'Which table would you like to add to?',
                choices: ["department table", "role table", "employee table", "exit"]
            }
        ])
        .then(answers => {
            if (answers.table == "department table") {
                connection.query("SELECT department FROM department_table;", function (err, res) {
                    if (err) throw err;
                    let departments = []

                    res.forEach(e => {
                        departments.push(e.department)
                    });
                    // var departments = res;
                    // console.log(departments.name)
                    inquire
                        .prompt([
                            {
                                type: 'input',
                                name: 'department',
                                message: 'currently the following departments exist(' + departments + '). what would you like to add?',
                                validate: function (value) {
                                    if (departments.indexOf(value) == -1) {
                                        return true;
                                    }
                                    console.log("....this already exists")
                                    return false;
                                }
                            }
                        ])
                        .then(answers => {
                            connection.query(
                                "INSERT INTO department_table SET ?",
                                {
                                    department: answers.department
                                },
                                function (err, res) {
                                    if (err) throw err;
                                    viewDepartments();
                                }
                            );
                        })
                        .catch(error => {
                            if (error.isTtyError) {
                                // Prompt couldn't be rendered in the current environment
                            } else {
                                // Something else when wrong
                            }
                        });
                })


            } else if (answers.table == "role table") {
                connection.query("SELECT title FROM role_table;", function (err, res) {

                    if (err) throw err;
                    let roles = []

                    res.forEach(e => {
                        roles.push(e.title)
                    });

                    connection.query("SELECT * FROM department_table;", function (err, res_departments) {
                        if (err) throw err;
                        let departments = []

                        res_departments.forEach(e => {
                            departments.push(e.department)
                        });

                        departments.push("none of the above")

                        inquire
                            .prompt([
                                {
                                    type: 'input',
                                    name: 'role',
                                    message: 'currently the following roles exist(' + roles + '). what would you like to add?',
                                    validate: function (value) {
                                        if (roles.indexOf(value) == -1) {
                                            return true;
                                        }
                                        console.log("....this already exists")
                                        return false;
                                    }
                                },
                                {
                                    type: 'input',
                                    name: 'salary',
                                    message: 'what is the salary of this position?',
                                    validate: function (value) {
                                        if (isNaN(value) === false && value != '') {
                                            return true;
                                        }
                                        console.log("....please enter a salary")
                                        return false;
                                    }
                                },
                                {
                                    type: 'list',
                                    name: 'department',
                                    message: 'what department is this in?',
                                    choices: departments

                                }
                            ])
                            .then(answers => {
                                if (answers.department != "none of the above") {
                                    connection.query(
                                        "INSERT INTO role_table SET ?",
                                        {
                                            title: answers.role,
                                            salary: answers.salary,
                                            department_id: res_departments[departments.indexOf(answers.department)].id
                                        },
                                        function (err, res) {
                                            if (err) throw err;
                                            viewRoles()
                                        }
                                    );
                                }
                                else {
                                    console.log("you must add the department")
                                    start();
                                }
                            })
                            .catch(error => {
                                if (error.isTtyError) {
                                    // Prompt couldn't be rendered in the current environment
                                } else {
                                    // Something else when wrong
                                }
                            });
                    })
                })
            } else if (answers.table == "employee table") {
                connection.query("SELECT * FROM employee_table;", function (err, res) {

                    if (err) throw err;

                    connection.query("SELECT * FROM role_table;", function (err, res_roles) {
                        if (err) throw err;
                        let roles = []

                        res_roles.forEach(e => {
                            roles.push(e.title)
                        });

                        roles.push("none of the above")

                        inquire
                            .prompt([
                                {
                                    type: 'input',
                                    name: 'first_name',
                                    message: 'what is the employees first name?',
                                    validate: function (value) {
                                        if (value != '') {
                                            return true;
                                        }
                                        console.log("....please enter a valid first name")
                                        return false;
                                    }
                                },
                                {
                                    type: 'input',
                                    name: 'last_name',
                                    message: 'what is the employees last name?',
                                    validate: function (value) {
                                        if (value != '') {
                                            return true;
                                        }
                                        console.log("....please enter a valid last name")
                                        return false;
                                    }
                                },
                                {
                                    type: 'list',
                                    name: 'role',
                                    message: 'what is the employees role',
                                    choices: roles

                                }
                            ])
                            .then(answers => {
                                if (answers.department != "none of the above") {
                                    connection.query(
                                        "INSERT INTO employee_table SET ?",
                                        {
                                            first_name: answers.first_name,
                                            last_name: answers.last_name,
                                            role_id: res_roles[roles.indexOf(answers.role)].id
                                        },
                                        function (err, res) {
                                            if (err) throw err;
                                            viewEmployees()
                                        }
                                    );
                                }
                                else {
                                    console.log("you must add the role")
                                    start();
                                }
                            })
                            .catch(error => {
                                if (error.isTtyError) {
                                    // Prompt couldn't be rendered in the current environment
                                } else {
                                    // Something else when wrong
                                }
                            });
                    })
                })
            } else {
                console.log("goodbye")
                connection.end();
            }
        })
        .catch(error => {
            if (error.isTtyError) {
                // Prompt couldn't be rendered in the current environment
            } else {
                // Something else when wrong
            }
        });
}

function viewData() {
    inquire
        .prompt([
            {
                type: 'list',
                name: 'table',
                message: 'Which table would you like to view?',
                choices: ["department table", "role table", "employee table", "exit"],
            }
        ])
        .then(answers => {
            if (answers.table == "department table") {
                viewDepartments();
            } else if (answers.table == "role table") {
                viewRoles();
            } else if (answers.table == "employee table") {
                viewEmployees()
            } else {
                console.log("goodbye")
                connection.end();
            }
        })
        .catch(error => {
            if (error.isTtyError) {
                // Prompt couldn't be rendered in the current environment
            } else {
                // Something else when wrong
            }
        });
}

function updateData() {
    connection.query("SELECT * FROM employee_table;", function (err, res) {
        if (err) throw err;
        const table = cTable.getTable(res);
        console.log(table)

        let employee_ids = []

        res.forEach(e => {
            employee_ids.push(e.id)
        });

        employee_ids.push("none of the above")


        connection.query("SELECT * FROM role_table;", function (err, res_roles) {
            if (err) throw err;
            let roles = []

            res_roles.forEach(e => {
                roles.push(e.title)
            });

            roles.push("none of the above")

            inquire
                .prompt([
                    {
                        type: 'list',
                        name: 'employee',
                        message: 'Select the id of the employee whos role you wish to change',
                        choices: employee_ids
                    },
                    {
                        type: 'list',
                        name: 'role',
                        message: 'What will the employees new role be',
                        choices: roles
                    }
                ])
                .then(answers => {

                    if (answers.employee == "none of the above") {
                        console.log("please add the employee")
                        start();
                    }
                    else if (answers.role == "none of the above") {
                        console.log("please add the role")
                        start();
                    }
                    else {

                        connection.query(
                            "UPDATE employee_table SET ? WHERE ?",
                            [
                                {
                                    role_id: res_roles[roles.indexOf(answers.role)].id
                                },
                                {
                                    id: answers.employee
                                }
                            ],
                            function (error) {
                                if (error) throw err;
                                viewEmployees()
                            }
                        );
                    }
                }).catch(error => {
                    if (error.isTtyError) {
                        // Prompt couldn't be rendered in the current environment
                    } else {
                        // Something else when wrong
                    }
                });

        })
            
        

    })

}

// ----------------------
function viewDepartments() {
    connection.query("SELECT department FROM department_table;", function (err, res) {
        if (err) throw err;
        const table = cTable.getTable(res);
        console.log(table)
        start();
    })
}

function viewRoles() {
    connection.query("SELECT role_table.title, role_table.salary, department_table.department FROM role_table INNER JOIN department_table ON role_table.department_id = department_table.id", function (err, res) {
        if (err) throw err;
        const table = cTable.getTable(res);
        console.log(table)
        start();
    })
}

function viewEmployees() {
    connection.query("SELECT employee_table.first_name, employee_table.last_name, role_table.title, role_table.salary, department_table.department FROM employee_table INNER JOIN role_table ON employee_table.role_id = role_table.id INNER JOIN department_table ON role_table.department_id = department_table.id", function (err, res) {
        if (err) throw err;
        const table = cTable.getTable(res);
        console.log(table)
        start();
    })
}