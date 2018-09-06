// Node Package Requirements
var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');

// Primes Connection to the databse
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "Bamazon_DB"
});

// connects to the database
connection.connect(function(err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId);
    // Once connection is succesful, begins the shopping experience.
    console.log("What would you like to do?\n")
    manage();
})


function manage() {
    inquirer.prompt([
        {
            message: "What would you like to do? \n",
            name: "task",
            type: "list",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        }
    ]).then(function(response) {
        switch(response.task) {
            case "View Products for Sale":
                return displayShop();
            case "View Low Inventory":
                return displayLow();
            case "Add to Inventory":
                return addInventory();
            case "Add New Product":
                return addProduct();
        }
    });
}

function displayShop() {
    var table = new Table({
        // product_name, department_name, price, stock_quantity
        head: ["ID", "Product", "Department", "Price", "Stock"]
    })
    var query = connection.query('SELECT * FROM products', function (err, res) {
        // console.log(res[0].item_id)
        for (let i = 0; i < res.length; i++) {
            var item = res[i];
            table.push(
                [item.item_id, item.product_name, item.department_name, item.price+ " G", item.stock_quantity]
            )  
        }
        console.log(table.toString())
        continueQuery();
    })
}

function displayLow() {
    var table = new Table({
        // product_name, department_name, price, stock_quantity
        head: ["ID", "Product", "Department", "Price", "Stock"]
    })
    var query = connection.query('SELECT * FROM products', function (err, res) {
        for (let i = 0; i < res.length; i++) {
            var item = res[i];
            if (item.stock_quantity < 5) {
                table.push(
                    [item.item_id, item.product_name, item.department_name, item.price+ " G", item.stock_quantity]
                )  
            }
        }
        console.log(table.toString())
        continueQuery();
    })
}

function addInventory() {
    inquirer.prompt([
        {
            message: "What is the ID of the item you would like to restock? \n",
            name: "item"
        },
        {
            message: "Great, and how many would you like to add? \n",
            name: "quantity"
        }
    ]).then(function(response) {

        var quant = parseInt(response.quantity);
        var itemNum = parseInt(response.item) - 1;

        var query = connection.query('SELECT * FROM products', function (err, res) {
            var item = res[itemNum];
            var stock = parseInt(item.stock_quantity);
    
            if (!item) {
                console.log("I'm sorry, but no item with that ID exists. \n");
            } else {
                increaseStock(item, stock, quant);
            }

        })

    });
}

function increaseStock(item, stock, quant) {
    var newQuant = stock + quant;
    var id = item.item_id;
    var query = connection.query('UPDATE products SET ? WHERE ?',
    [
        {
            stock_quantity: newQuant
        },
        {
            item_id: id
        }
    ],
    function(err, res) {
        console.log("Stock succesfully increased")
        continueQuery();
    }
    );
}

function addProduct() {
    console.log("Function Start")
    inquirer.prompt([
        {
            message: "What product would you like to add? \n",
            name: "product"
        },
        {
            message: "What Department does it belong in? \n",
            name: "department"
        },
        {
            message: "How much does it cost? \n",
            name: "price"
        },
        {
            message: "And how many shall we stock? \n",
            name: "stock"
        }
    ]).then(function(res) {
        var product = res.product;
        var department = res.department;
        var price = parseInt(res.price);
        var stock = parseInt(res.stock);

        if (!price || !stock) {
            console.log("Make sure you only type a number for the price and stock");
            continueQuery();
        } else {
            var query= connection.query(
                "INSERT INTO products SET ?",
                {
                    product_name: product,
                    department_name: department,
                    price: price,
                    stock_quantity: stock
                },
                function(err, res) {
                    console.log("Succesfully added the new Item")
                    continueQuery();
                }
            )
        }
    });
}

function continueQuery() {
    inquirer.prompt([
        {
            type: "confirm",
            message: "Would you like to continue management operations? \n",
            name: "continue"
        }
    ]).then(function(res) {
        if (res.continue) {
            manage();
        } else {
            console.log("Thank you for your service, \n Have a nice day!")
            connection.end();
        }
    })
};