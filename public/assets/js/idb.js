//create variable to hold db connection
let db;

//establish connection to indexedDB database called pizza_hunt and set it to version one
const request = indexedDB.open('pizza_hunt', 1)

//this event will emit if the database version changes (nonexistant to version 1, v1 to v2 etc)
request.onupgradeneeded = function(event){
    //save a reference to the database
    const db = event.target.result;
    //create an object store(table) called 'new_pizza' , set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_pizza',{autoIncrement: true})
}
//upon a successful request
request.onsuccess = function(event){
    //when db is created with its object store(from upgradeneeded event above ) or simply established a connection, save reference to db in global variable
    db= event.target.result;

    //check if app is online, if yes run uploadPizza() function to send all local db data to api
    if(navigator.onLine) {
    uploadPizza()
    }
}

request.onerror = function(event){
    //log error here
    console.log(event.target.errorCode)
}

//this function will execute if we attempt to submit pizza with no internet
function saveRecord(record){
    //open a new database transaction with read and write permission
    const transaction = db.transaction(['new_pizza'], 'readwrite')

    //access the object store for 'new_pizza'
    const pizzaObjectStore = transaction.pizzaObjectStore('new_pizza')
    //add record to your store with add method
    pizzaObjectStore.add(record)
}
function uploadPizza() {
    //open a transaction on your db
    const transaction = db.transaction(['new_pizza', 'readwrite'])

    //access your object store
    const pizzaObjectStore = transaction.objectStore('new_pizza')

    //get all records from store and set to a variable
    const getAll = pizzaObjectStore.getAll()

    //upon successful get all run this function
    getAll.onsuccess = function() {
        //if there was data in indexeddb store, send it to the api server
        if(getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message){
                    throw new Error(serverResponse)
                }
                //open one more transaction
                const transaction = db.transaction(['new_pizza'], 'readwrite')
                //access new_pizza object store
                const pizzaObjectStore = transaction.objectStore('new_pizza')
                //clear all items from store
                pizzaObjectStore.clear()

                alert('all saved pizza has been submitted')
            })
            .catch(err => {
                console.log(err)
            })
        }
    }
}

window.addEventListener('online', uploadPizza)