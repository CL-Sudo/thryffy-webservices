# Pay N Earn (webservices)
## About
Repository for Pay n Earn (webservices) project

### Prerequisites
Software to install before running this project:

* Node.JS (LTS)
* MySQL (5.7)
* Sequelize CLI
* Copy contents on `.env.sample` -> `.env` and amend necessary lines


### Getting Started
```
## To install dependencies
$ yarn 

## To run DB migration script
$ sequelize db:migrate

## To run DB seeder
$ sequelize db:seed:all

## Start Node Server
$ yarn start
```

### Test Accounts from seeder
#### Admin
* email: admin@test.com
* password: 1234

#### Customer
* email: customer@test.com
* password: 1234