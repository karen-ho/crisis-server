# node-js-sample

A barebones Node.js app using [Express 4](http://expressjs.com/).

## Running Locally

Prerequisite:
1. have MySQL (5.6 >=)
2. Create your SQL database
```
settings are currently hard-coded in index.js = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crisis'
};
```
3. run migrations.sql
4. heroku local web