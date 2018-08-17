var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table-redemption');
var sqlpassword = "";
var connection = {};

inquirer
    .prompt({
        name: "dbpassword",
        type: "password",
        message: "Please enter your mysql password?"
    })
    .then(function (dbAnswer) {
        sqlpassword = dbAnswer.dbpassword;
        connection = mysql.createConnection({
            host: "localhost",

            // Your port; if not 3306
            port: 3306,

            // Your username
            user: "root",

            // Your password
            password: sqlpassword,
            // database: "bamazon"
        });
        connection.connect(function (err) {
            if (err) throw err;
            runApp();
        });
    });


function runApp() {
    setupDB();
}

function queryUser() {

    var table = new Table({
        head: ["Dep ID",
            "Department Name",
            "Overhead Costs",
            "Product Sales",
            "Total Profits"],
        colWidths: [10, 40, 20, 20, 20]
    });

    inquirer
        .prompt({
            name: "selection",
            type: "list",
            message: "Select your action below",
            choices: ["View Product Sales by Department", "Create New Department", "Quit"]
        })
        .then(function (action) {
            switch (action.selection) {
                case "View Product Sales by Department":
                    connection.query("SELECT d1.department_id, d1.department_name, d1.over_head_costs, prod_sales, "
                        + "prod_sales - over_head_costs as total_profits "
                        + "FROM departments as d1 "
                        + "inner join (select department_name, sum(product_sales) as prod_sales "
                        + "from products group by department_name ) as p1 "
                        + "on d1.department_name = p1.department_name"
                        , function (err, res) {
                            if (err) { throw err; }
                            res.map(function (row) {
                                // console.log("result is: " + row.department_id);
                                var entry = [];
                                entry.push(row.department_id);
                                entry.push(row.department_name);
                                entry.push(row.over_head_costs);
                                entry.push(row.prod_sales);
                                entry.push(row.total_profits);
                                table.push(entry);
                            });
                            console.log(table.toString());
                            console.log("\n");
                            queryUser();
                        });
                    break;
                case "Create New Department":
                    inquirer.prompt([
                        {
                            type: "input",
                            name: "depName",
                            message: "New department name?"
                        },
                        {
                            type: "input",
                            name: "overHeadCost",
                            message: "What is the overhead costs for this department?",
                        },
                    ]).then(function (newDept) {
                        var newDepartment = {
                             department_name: newDept.depName, 
                             over_head_costs: newDept.overHeadCost 
                        }
                        connection.query("INSERT INTO departments set ?", newDepartment, function (err, res) {
                            if (err) {
                                console.log("There was an error on insert of item: " + newDepartment + " and error: " + err);
                                throw err;
                            }
                            queryUser();
                        });
                    });
                    break;
                case "Quit":
                    process.exit();
            }

        });
}

// Started off with the SQL commands in MySQLWorkbench, then moved them here to make execution cleaner.
// This function will drop the database (clearing contents of course), then recreate the database, the table
// and populate it with some initial data
function setupDB() {

    connection.query("USE bamazon", function (err, res) {
        if (err) {
            console.log("There was an error on the USE database bamazon with error: " + err);
            throw err;
        }
    });
    connection.query("DROP TABLE IF EXISTS departments", function (err, res) {
        if (err) {
            console.log("There was an error dropping database table departments with error: " + err);
            throw err;
        }
    });
    var create = "CREATE TABLE departments ("
        + "department_id INTEGER(10) AUTO_INCREMENT NOT NULL,"
        + "department_name VARCHAR(40) NOT NULL,"
        + "over_head_costs DECIMAL(20,2),"
        + "PRIMARY KEY (department_id))"
    connection.query(create, function (err, res) {
        if (err) {
            console.log("There was an error creating table departments with error: " + err);
            throw err;
        }
        seedDB();
    });
}

function seedDB() {
    var items = [
        { department_name: "Shoes", over_head_costs: 20.00 },
        { department_name: "Electronics", over_head_costs: 3333.33 },
        { department_name: "Housewares", over_head_costs: 500.00 },
        { department_name: "Bath and Body", over_head_costs: 988.12 },
        { department_name: "Sports", over_head_costs: 129.90 }
    ]
    var query = "INSERT INTO departments set ?";

    items.map(function (item) {
        connection.query(query, item, function (err, res) {
            if (err) {
                console.log("There was an error on insert of item: " + item + " and error: " + err);
                throw err;
            }
            // console.log("Item inserted: " + item.product_name);
        });
    });
    queryUser();
}