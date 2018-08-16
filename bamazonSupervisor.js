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
    .then(function (dbanswer) {
        sqlpassword = dbanswer.dbpassword;
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

        // My query for the challenge #3 has the inner join and works around the non-aggregated columns with 2 selects
        // select  d1.department_id, d1.department_name, d1.over_head_costs, prod_sales, prod_sales - over_head_costs as total_profits
        //    FROM departments as d1
        //    inner join (select department_name, sum(product_sales) as prod_sales from products group by department_name ) as p1
        //    on d1.department_name = p1.department_name;


        function queryUser() {

            var table = new Table({
                head: ['TH 1 label', 'TH 2 label'],
                colWidths: [20, 30]
            });
             
            // table is an Array, so you can `push`, `unshift`, `splice` and friends
            table.push(
                ['First value', 'Second value'],
                ['First value', 'Second value']
            );
             
            console.log(table.toString());
            process.exit();



            connection.query("SELECT item_id, product_name, price, stock_quantity, product_sales from products", function (err, res) {
                if (err) { throw err; }
                // res.map(function (row) { console.log("==> item id is: " + row.item_id); });
                inquirer
                    .prompt({
                        name: "item",
                        type: "list",
                        message: "Which item would you like to purchase?",
                        choices: res.map(function (item) { return item.product_name; })
                    })
                    .then(function (itemAnswer) {
                        // use the filter function on array to get to the item selected via inquirer
                        var selectedItem = res.filter(function (curritem) {
                            return curritem.product_name === itemAnswer.item;
                        });
                        inquirer
                            .prompt({
                                name: "quantity",
                                type: "input",
                                message: "How many would you like ($" + selectedItem[0].price + " each)?",
                                choices: res.map(function (item) { return item.product_name; })
                            })
                            .then(function (quantityAnswer) {
                                if (selectedItem[0].stock_quantity < quantityAnswer.quantity) {
                                    console.log("\x1b[31m%s\x1b[0m", "Insufficient Quantity!!  Order cancelled!");
                                } else {
                                    console.log("you requested " + quantityAnswer.quantity);
                                    var newQuantity = selectedItem[0].stock_quantity - parseInt(quantityAnswer.quantity);
                                    console.log("\x1b[32m%s\x1b[0m", "new quantity will be: " + newQuantity);
                                    connection.query("UPDATE products set stock_quantity = ?, product_sales = ? where item_id = ?",
                                        [parseInt(selectedItem[0].stock_quantity) - parseInt(quantityAnswer.quantity),
                                        selectedItem[0].product_sales += (selectedItem[0].price * parseInt(quantityAnswer.quantity)),
                                        selectedItem[0].item_id
                                        ], function (err, res) {
                                            if (err) { throw err; }
                                            console.log("\x1b[32m%s\x1b[0m", "item updated!");
                                        });
                                }
                                queryUser();
                            });
                    });
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