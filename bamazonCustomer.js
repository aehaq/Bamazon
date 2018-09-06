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
    console.log("Greetings Traveller, welcome to Bamazon: The one-stop-shop for adventurers!\n")
    displayShop();
})


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
        // We run the shopping function with reference to the data we just pulled.
        beginShopping(res);
    })
}


function beginShopping(data) {
    inquirer.prompt([
        {
            message: "Please tell me the ID of the item you are interested in. \n",
            name: "item"
        },
        {
            message: "Great, and how many would you like to buy? \n",
            name: "quantity"
        }
    ]).then(function(response) {
        var itemNum = parseInt(response.item);
        var quant = parseInt(response.quantity);
        var item = data[itemNum - 1];
        var stock = parseInt(item.stock_quantity);

        if (!item) {
            console.log("I'm sorry, but it turns out that no Item with that ID exists. \n");
        } else {
            if (stock === 0) {
                console.log("Oh my, I guess we ran out of those... So, sorry. \n");
                continueQuery();
            } else if (stock < quant) {
                console.log("Oh, sorry, it looks like we don't have enough in stock to fulfill your order. \n");
                continueQuery();
            } else {
                makePurchase(item, stock, quant);
            }
        }

    });
}

function makePurchase(item, stock, quant) {
    var newQuant = stock - quant;
    var cost = quant * item.price;
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
        console.log("Great, That'll be "+cost+" G... \nThanks for the Purchase!")
        continueQuery();
    }
    );
};

function continueQuery() {
    inquirer.prompt([
        {
            type: "confirm",
            message: "Would you like to continue shopping? \n",
            name: "continue"
        }
    ]).then(function(res) {
        if (res.continue) {
            displayShop();
        } else {
            console.log("Thank you for shopping with us, \n Have a nice day!")
            connection.end();
        }
    })
};