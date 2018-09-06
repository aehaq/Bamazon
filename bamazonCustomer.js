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
    // creates the table using the cli-table node package.
    var table = new Table({
        head: ["ID", "Product", "Department", "Price", "Stock"]
    })
    var query = connection.query('SELECT * FROM products', function (err, res) {
        // Pushes each set of values in a given row into the array, does this for every row.
        for (let i = 0; i < res.length; i++) {
            var item = res[i];
            table.push(
                [item.item_id, item.product_name, item.department_name, item.price+ " G", item.stock_quantity]
            )  
        }
        // Finalize table Display and prints to terminal.
        console.log(table.toString())
        // We run the shopping function with reference to the data we just pulled.
        beginShopping(res);
    })
}

// This function stores all the table data gathered when the shop was displayed as an argument, and then asks the user about their purchase.
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
        // Gather and format data pertinent to the request.
        var itemNum = parseInt(response.item);
        var quant = parseInt(response.quantity);
        var item = data[itemNum - 1];
        var stock = parseInt(item.stock_quantity);

        if (!item) {
            // If the user referred to an item that isn't in the table.
            console.log("I'm sorry, but it turns out that no Item with that ID exists. \n");
            continueQuery();
        } else {
            if (stock === 0) {
                // If the item is out of stock
                console.log("Oh my, I guess we ran out of those... So, sorry. \n");
                continueQuery();
            } else if (stock < quant) {
                // if the user asks for more of the item than is available
                console.log("Oh, sorry, it looks like we don't have enough in stock to fulfill your order. \n");
                continueQuery();
            } else {
                // If no problems exist, calls the function that handles the purchase.
                makePurchase(item, stock, quant);
            }
        }

    });
}

// This function takes in the following information:
// item, which is the item object containing the necessary information
// stock, which is the current stock of the relevant item.
// quant, which is the quantity we are adding to the stock.
function makePurchase(item, stock, quant) {
    // Sets a new quantity for the stock after the quantity is reduced.
    var newQuant = stock - quant;
    var cost = quant * item.price;
    var id = item.item_id;

    // Update the quantity based off of the newly calculated quantity.
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
        // Check if user would like to continue
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