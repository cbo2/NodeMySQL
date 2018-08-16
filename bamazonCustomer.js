var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "trilogy",
    // database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    runApp();
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
    connection.query("SELECT item_id, product_name, price, stock_quantity from products", function (err, res) {
        if (err) { throw err; }
        console.log("-checking things and res.item_id is: " + res[0].item_id);
        // res.map(function (row) { console.log("==> item id is: " + row.item_id); });
        inquirer
            .prompt({
                name: "item",
                type: "list",
                message: "Which item would you like to purchase?",
                choices: res.map(function (item) { return item.product_name; })
            })
            .then(function (itemAnswer) {
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
                            console.log("Insufficient Quantity!!  Order cancelled!");
                        } else {
                            console.log("you requested " + quantityAnswer.quantity);
                            var newQuantity = selectedItem[0].stock_quantity - parseInt(quantityAnswer.quantity);
                            console.log("new quantity will be: " + newQuantity);
                            connection.query("UPDATE products set stock_quantity = ? where item_id = ?",
                                [parseInt(selectedItem[0].stock_quantity) - parseInt(quantityAnswer.quantity), selectedItem[0].item_id], function (err, res) {
                                    if (err) { throw err; }
                                    console.log("item updated!");
                                });
                        }
                    });
            });
    });
}

// Started off with the SQL commands in MySQLWorkbench, then moved them here to make execution cleaner.
// This function will drop the database (clearing contents of course), then recreate the database, the table
// and populate it with some initial data
function setupDB() {
    connection.query("DROP DATABASE IF EXISTS bamazon", function (err, res) {
        if (err) {
            console.log("There was an error dropping database bamazon with error: " + err);
            throw err;
        }
    });
    connection.query("CREATE DATABASE bamazon", function (err, res) {
        if (err) {
            console.log("There was an error dropping database bamazon with error: " + err);
            throw err;
        }
    });
    connection.query("USE bamazon", function (err, res) {
        if (err) {
            console.log("There was an error on the USE database bamazon with error: " + err);
            throw err;
        }
    });
    var create = "CREATE TABLE products ("
        + "item_id INTEGER(10) AUTO_INCREMENT NOT NULL,"
        + "product_name VARCHAR(100) NOT NULL,"
        + "department_name VARCHAR(40) NULL,"
        + "price DECIMAL(10,2) NULL,"
        + "stock_quantity INTEGER(10) NULL,"
        + "PRIMARY KEY (item_id))";
    connection.query(create, function (err, res) {
        if (err) {
            console.log("There was an error creating table products with error: " + err);
            throw err;
        }
        seedDB();
    });
}

function seedDB() {
    var items = [
        { product_name: "Van Shoes", department_name: "Shoes", price: 50.25, stock_quantity: 333 },
        { product_name: "Seagate Ultra Thin USB 2TB Backup Drive", department_name: "Electronics", price: 99.99, stock_quantity: 5 },
        { product_name: "Seagate Ultra Thin USB 3TB Backup Drive", department_name: "Electronics", price: 149.99, stock_quantity: 100 },
        { product_name: "Seagate Ultra Thin USB 4TB Backup Drive", department_name: "Electronics", price: 199.99, stock_quantity: 200 },
        { product_name: "Cuisinart 14 Cup Coffee Maker", department_name: "Housewares", price: 89.99, stock_quantity: 500 },
        { product_name: "Gothom Steel 12\" Fry Pan", department_name: "Housewares", price: 49.99, stock_quantity: 900 },
        { product_name: "Apple Macbook Pro 15\"", department_name: "Electronics", price: 2499.99, stock_quantity: 50 },
        { product_name: "Gillette Fusion Shaving Cream", department_name: "Bath and Body", price: 5.99, stock_quantity: 5000 },
        { product_name: "Gillette Fusion 5 Shaver", department_name: "Bath and Body", price: 11.99, stock_quantity: 1000 },
        { product_name: "Camelbak 25oz Sports Bottle", department_name: "Sports", price: 12.99, stock_quantity: 1000 }
    ]
    var query = "INSERT INTO products set ?";

    items.map(function (item) {
        connection.query(query, item, function (err, res) {
            if (err) {
                console.log("There was an error on insert of item: " + items[i] + " and error: " + err);
                throw err;
            }
            // console.log("Item inserted: " + item.product_name);
        });
    });
    queryUser();
}