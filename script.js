/*
    Course Assignment: "Bucket List"

    Task:
    - Start with an empty array to store all activities.
    - Create a function that dynamically renders the list in the DOM.
    - Add an event listener to the form to add new activities.
    
    Level ups:
    - Sort Activities: Add a feature that sorts activities alphabetically within each category.
    - Save data: Use localStorage to save and load the list automatically.
    - Edit Activities: Add the ability to edit activities.

    Result:
    A functional Bucket List app where the user can:
    - Add activities with a category.
    - Mark activities as complete.
    - Delete activities.
    - See activities grouped by category.
*/


/*
    Tiny utility functions
*/

// querySelector
const select = (selector, parent = document) => parent.querySelector(selector);

// querySelectorAll, but returns selected elements in an array
const selectAll = (selector, parent = document) => [...parent.querySelectorAll(selector)];

// Save- and get stuff from local storage
const getFromStorage = string => JSON.parse(localStorage.getItem(string));
const saveToStorage = (string, item) => localStorage.setItem(string, JSON.stringify(item));

// Returns an object with form data on submit
const collectFormData = formElem => Object.fromEntries(new FormData(formElem));

// Creates and returns an element. Takes the html-tag as a string ('div') and an object with attributes { attr-name: attr-value }
const createElem = (tagString, attributesObj) => Object.assign(document.createElement(tagString), attributesObj);
// reference: https://oozou.com/til/how-to-create-an-html-element-with-attributes-in-one-line-in-javascript-69



/*
    Data / Collections
*/

// DOM Elements for later use
const bucketFormElem = select('#bucketForm');
const bucketListsElem = select('#bucketLists');


// Categories (All available categories are listed here)
let activityCategories = ['Resor', 'Äventyr', 'Lärande', 'Hobby'];
// (change this to a set maybe?)

// Bucket List (The place to collect all saved activities)
let bucketList = [
    // Sample bucket list items (to be removed)
    { activityName: 'Activity 1', activityCategory: 'Resor' },
    { activityName: 'Activity 2', activityCategory: 'Äventyr' },
    { activityName: 'Activity 3', activityCategory: 'Resor' },
    { activityName: 'Activity 4', activityCategory: 'Hobby' }
];


/*
   init on page load
*/

// (Just something simple to start with, I will create this later)
renderBucketList(activityCategories, bucketList);


/*
    Form submit event, when the user added a new activity: 
    - Collect the form data in a new object: { activityName: value, activityCategory: value }
    - Add a new activity from the form data...
*/
bucketFormElem.addEventListener('submit', event => {
    event.preventDefault();
    const activityObj = collectFormData(event.target);
    addNewActivity(activityObj);
});


/*
   Function: add new activity
   - takes an new activity object { activityName: value, activityCategory: value }
   - render the activity to the document
   - add the activity to the Bucket List array
*/
function addNewActivity(activityObj) {
    // create activity element and add to the category list in the document
    const newActivityElem = createActivityElem(activityObj.activityName);
    bucketListsElem.prepend(newActivityElem);
    // add activity to the bucket list
    bucketList.push(activityObj);
    console.log('new activity', activityObj);

}


/*
    FUNCTIONS - Creating and adding Elements to the DOM
    (use DocumentFragments? templates or template literals instead?)
*/

/*
    Function: Create activity element
    - Takes the activityName (string),
    -  Creates and returns one activity element (with child elements)
*/
function createActivityElem(activityName) {

    // Create a unique ID for the checkbox. Not really a 100% unique ID, but close enough for this assignment, I guess... 
    const uniqueCheckboxID = `id-${Math.round(Date.now() * Math.random())}`;

    // Elements and attributes
    const elem = {
        activityContainer: {
            tag: 'li',
            attr: {
                classList: 'activity',
            }
        },
        activityName: {
            tag: 'p',
            attr: {
                textContent: activityName
            }
        },
        checkbox: {
            tag: 'input',
            attr: {
                type: 'checkbox',
                id: uniqueCheckboxID
            }
        },
        label: {
            tag: 'label',
            attr: {
                innerText: 'Har gjort',
                for: uniqueCheckboxID
            }
        },
        // Create and return the element
        create(elem) {
            return createElem(this[elem].tag, this[elem].attr);
        }
    }

    const parent = elem.create('activityContainer');
    parent.appendChild(elem.create('activityName'));
    parent.appendChild(elem.create('checkbox'));
    parent.appendChild(elem.create('label'));

    return parent;
}

/*
    Function: Create a category element
    - Takes the category name (string) and an array of activity objects to include in the category list
    - Creates and returns one category element (with child elements/activites)
*/

function createCategoryElem(category, activities) {
    
    // Elements and attributes 
    const elem = {
        categoryContainer: {
            tag: 'section',
            attr: {
                id: category,
                classList: category
            }
        },
        heading: {
            tag: 'h2',
            attr: {
                textContent: category
            }
        },
        list: {
            tag: 'ul',
            attr: {}
        },
        create(elem) { 
            // Create and return the element
            return createElem(this[elem].tag, this[elem].attr);
        }
    }

    // Create the Activity Container Parent and add the heading
    const parent = elem.create('categoryContainer');
    parent.appendChild(elem.create('heading'));

    // Create the activity list
    const activityList = elem.create('list');

    // Create all activities and add them to the list
    if (activities.length > 0) {
        activities.forEach(activity => {
            activityList.appendChild(createActivityElem(activity.activityName));
        });
    }
    parent.appendChild(activityList); 

    // Return the category container element with the list of activities
    return parent; 
}



// Just some basic functionality to start with..
function renderBucketList(categories, activityList) {
    /*
    - One section element for each category
        - A heading with the category-name
        - A list with all the activity-items belonging to that category
    */
    
    const categoryLists = [];

    
    // Create a container for each category with activities
    categories.forEach(category => {

        // const categoryList = activityList.filter()
        const categoryElem = createCategoryElem(category, activityList)
        bucketListsElem.appendChild(categoryElem);
    });
    
}

// ///////////// Some more stuff to implement

/*
    Sort activities alphabetically within each category.
*/


/*
    Save data: Use localStorage to save and load the list automatically.
*/