DROP DATABASE IF EXISTS Bamazon_DB;

CREATE DATABASE Bamazon_DB;

USE Bamazon_DB;

CREATE TABLE products (
item_id INT(11) AUTO_INCREMENT NOT NULL,
product_name VARCHAR(100) NOT NULL,
department_name VARCHAR(100) NOT NULL,
price DECIMAL(20,2) NOT NULL,
stock_quantity INT(11) NOT NULL,
PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES 
("Wand", "Magic Items", 222.22, 7), 
("Wizard Robe", "Magic Items", 200, 30), 
("Bag of Holding", "Magic Items", 9999.99, 3), 
("Shield", "Armory", 31.41, 15), 
("Small Sword", "Armory", 30.30, 20), 
("Mega Big Huge Sword", "Armory", 500, 1), 
("Medium Armor", "Armory", 225, 10), 
("Healing Potion", "Alchemy", 50, 25), 
("Stamina Potion", "Alchemy", 42, 12), 
("Mana Potion", "Alchemy", 88.88, 25)