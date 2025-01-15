/*
    Task:
    - Start with an empty array to store all activities.
    - Create a function that dynamically renders the list in the DOM.
    - Add an event listener to the form to add new activities.
    - Create a function that clears the list when the page reloads.   
*/

// Elements
const bucketFormElem = document.getElementById('bucketForm');
const bucketListsElem = document.getElementById('bucketLists');


// This function will render the list
function renderBucketList() {
       
}

// Submit a new activity
bucketFormElem.addEventListener('submit', event => {
    event.preventDefault();
    console.log('event:', event);
    createNewActivity(event);
});


// Function to create new activity from user input
function createNewActivity(e) {
    console.log(e);  
    alert('You created a new activity but we still have to write the code for this to work');
} 

// function that clears the list when the page reloads 
function clearListOnReload() {
    /* but what is the purpose of this function? */
}