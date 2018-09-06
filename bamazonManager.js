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
    // Once connection is succesful, begins the management experience.
    console.log("What would you like to do?\n")
    // Runs Management function
    manage();
})

// Provides the user with various management options
function manage() {
    inquirer.prompt([
        {
            message: "What would you like to do? \n",
            name: "task",
            type: "list",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        }
    ]).then(function(response) {
        // Depending on the user's choice, will run the correspondinf function.
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
        // Displays the table
        console.log(table.toString())
        // Check if User wants to continue.
        continueQuery();
    })
}

function displayLow() {
    var table = new Table({
        head: ["ID", "Product", "Department", "Price", "Stock"]
    })
    var query = connection.query('SELECT * FROM products', function (err, res) {
        // Pushes each set of values in a given row into the array.
        for (let i = 0; i < res.length; i++) {
            var item = res[i];
            // Only does so for items with a lower quantity
            if (item.stock_quantity < 5) {
                table.push(
                    [item.item_id, item.product_name, item.department_name, item.price+ " G", item.stock_quantity]
                )  
            }
        }
        // Displays the table
        console.log(table.toString())
        // Checks if User wants to continue.
        continueQuery();
    })
}

// This function asks the user what item and how much they are going to restock. 
// Then calls the function to restock.
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
        // Saves the quantity requested for later use.
        var quant = parseInt(response.quantity);
        // Creates a variable for the item's position in the array based off of it's number.
        var itemNum = parseInt(response.item) - 1;

        // Retrieves information regarding the relevant item. 
        var query = connection.query('SELECT * FROM products', function (err, res) {
            var item = res[itemNum];
            var stock = parseInt(item.stock_quantity);
    
            if (!item) {
                console.log("I'm sorry, but no item with that ID exists. \n");
            } else {
                // Runs the increase Stock function with necessary information.
                increaseStock(item, stock, quant);
            }
        })
    });
}

// This function takes in the following information:
// item, which is the item object containing the necessary information
// stock, which is the current stock of the relevant item.
// quant, which is the quantity we are adding to the stock.
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
        // Checks if User wants to continue.
        continueQuery();
    }
    );
}


// This function asks the user for all the pertinent information regarding the new product, and adds it to the database accordingly.
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
        // Takes all of the data input and turns them into correctly formatted variables.
        var product = res.product;
        var department = res.department;
        var price = parseInt(res.price);
        var stock = parseInt(res.stock);

        // Checks to see if there were any problems converting the intergers
        if (!price || !stock) {
            console.log("Make sure you only type a number for the price and stock");
            // Checks if User wants to continue.
            continueQuery();
        } else {
            // If no problems exist, inserts a new product into the table with the new data.
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
                    // Checks if User wants to continue.
                    continueQuery();
                }
            )
        }
    });
}

// This function is run to see if the user would like to continue managing.
function continueQuery() {
    inquirer.prompt([
        {
            type: "confirm",
            message: "Would you like to continue management operations? \n",
            name: "continue"
        }
    ]).then(function(res) {
        if (res.continue) {
            // Return to original menu if yes.
            manage();
        } else {
            // End connection if No.
            console.log("Thank you for your service, \n Have a nice day!")
            connection.end();
        }
    })
};