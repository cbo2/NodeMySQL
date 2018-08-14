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
    clearAndCreateDB();
    seedDB();

    var query = "SELECT * FROM products";
    connection.query(query, function (err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log("Item: " + res[i].item_id + " || product_name: " + res[i].product_name + " || price: " + res[i].price);
        }
        process.exit();
    });
}

function clearAndCreateDB() {
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

    for (var i = 0; i < items.length; i++) {
        connection.query(query, items[i], function (err, res) {
            if (err) {
                console.log("There was an error on insert of item: " + items[i] + " and error: " + err);
                throw err;
            }
            // console.log("Item inserted: " + items[i]);
        });
    }
}