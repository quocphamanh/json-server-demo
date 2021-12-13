const faker = require('faker')
const fs = require('fs')

// set locale
faker.locale = 'vi'

// ramdom data
// console.log(faker.commerce.department());
// console.log(faker.commerce.productName());
// console.log(faker.commerce.productDescription());

// console.log(faker.random.uuid());
// console.log(faker.image.imageUrl());

const randomFakeTodo = (n) => {
    if (n <= 0) return [];
    const todosList = [];

    for (i = 0; i < n; i++) {
        const todo = {
            id: faker.datatype.uuid(),
            title: faker.name.findName(),
            description: faker.name.jobDescriptor(),
            updateAt: Date.now(),
            createAt: Date.now()
        }

        todosList.push(todo);
    }

    return todosList;
}

(() => {
    // random data
    const todoList = randomFakeTodo(5);

    // prepare data
    const db = {
        todos: todoList,
    };

    // write db object to db.json
    fs.writeFile('db.json', JSON.stringify(db), () => {
        console.log('Generate data successfully!');
    })
})();