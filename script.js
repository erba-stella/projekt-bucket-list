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
// Returns an object with form data on submit
const collectFormData = formElem => Object.fromEntries(new FormData(formElem));
/*
    local storage functions
*/
const getFromStorage = key => (localStorage.getItem(key)) ? JSON.parse(localStorage.getItem(key)) : false;
const saveToStorage = (key, item) => localStorage.setItem(key, JSON.stringify(item));
/*
    Data / Collections
*/
// DOM Elements for later use
const bucketFormElem = select('#bucketForm');
const bucketListsElem = select('#bucketLists');

// Categories (All available categories are listed here)
const activityCategories = new Set(['Resor', 'Äventyr', 'Lärande', 'Hobby']);

// Bucket List (The place to collect all saved activities)
const bucketList = getFromStorage('bucketList') || [];

// This is used to number the activities in the order they are created, to give them a short unique identifier
let numActivitiesCreated = getFromStorage('numActivitiesCreated') || 0;

/*
   init on page load
*/

renderBucketList(activityCategories, bucketList);


/*
    Form submit event (the user added a new activity) 
    - Collect the form data in a new activity object: { activityName: value, activityCategory: value }
    - Add a new activity with the activity object as an argument
*/
bucketFormElem.addEventListener('submit', event => {
    event.preventDefault();
    addNewActivity(collectFormData(event.target));
});

/*
    Click events in Bucket Lists
    - Mark activity as completed (true/false)
    - Delete activity item
*/
bucketListsElem.addEventListener("click", event => {
    if (event.target.type === 'checkbox') {
        const isChecked = event.target.checked;
        updateItemInBucketList(event, (item) => {
            item.completed = isChecked;
        })
    }
    if (event.target.closest('button')) {
        removeTargetActivity(event);
        updateItemInBucketList(event, (item, index) => {
            bucketList.splice(index, 1);
        })
    }
});


function updateItemInBucketList(event, callback) {
    const elem = event.target.closest('[data-activity-number]');
    const num = Number(elem.getAttribute('data-activity-number'));
    bucketList.forEach((obj, index) => {
        if (num === obj.activityNumber) {
            callback(obj, index);
        }
    });
}

function removeTargetActivity(event) {
    event.target.closest('[data-activity-number]').remove();
}



/*
   Function: add new activity
   - takes an new activity object { activityName: value, activityCategory: value }
   - render the activity to the document
   - add the activity to the Bucket List array
*/

function addNewActivity(obj) {
    // The new activity object needs a unique identifier
    ++numActivitiesCreated;
    obj.activityNumber = numActivitiesCreated;

    // create activity element and add to the category list in the document
    const newActivityElem = getActivityHTML(obj);
    select(`[data-category=${obj.activityCategory}]`).prepend(newActivityElem);
    // bucketListsElem.prepend(newActivityElem);

    // add activity to the bucket list
    bucketList.push(obj);
}

function renderBucketList(setOfCategories, arrayOfActivities) {
    setOfCategories.forEach(category => {
        const activitiesForThisCategory = arrayOfActivities.filter(obj => {
            obj.activityCategory === category;
        });
        const categoryElem = getCategoryHTML(category, activitiesForThisCategory);
        bucketListsElem.appendChild(categoryElem);
    });
}

// Generates and returns the html for one category section
function getCategoryHTML(category, activitiesArray) {
    const activities = getActivitiesHTML(activitiesArray),
        elements = createHTMLcollection();

    return elements
        .addParent('section', { classList: `${category.toLowerCase()}` })
        .addChild('h2', { textContent: category })
        .addChild('ul',{ dataAttr: [ 'category', category ]})
        .setParent('ul')
        .addChildrenFromHTML(activities)
        .returnHTML();
}

// Generates and returns the html for all activity objects in the array (in a document fragment)
function getActivitiesHTML(activitiesArray) {
    const elements = createHTMLcollection();
    for (let activityObj in activitiesArray) {
        elements.addChildrenFromHTML(getActivityHTML(activityObj));
    }
    return elements.returnHTML();
}

// Generates and returns the HTMl for one single activity (in a document fragment)
function getActivityHTML(activityObj) {
    const number = activityObj.activityNumber,
        name = activityObj.activityName,
        elements = createHTMLcollection();
    // console.log(activityObj.activityName, activityObj)

    return elements
        .addParent('li', {
            dataAttr: ['activity-number', number]
        })
        .addChild('p', {
            textContent: name
        })
        .addChild('input', {
            type: 'checkbox',
            id: `completed-${number}`
        })
        .addChild('label', {
            classList: 'visually-hidden',
            textContent: 'har gjort aktiviteten',
            htmlFor: `completed-${number}`
        })
        .addChild('button', {
            classList: 'visually-hidden',
        })
        .setParent('button')
        .addChild('span', {
            classList: 'visually-hidden',
            textContent: 'radera aktiviteten',
        })
        .returnHTML();
}

// A function that makes it less painful to generate html with `document.createElement` 
function createHTMLcollection() {
    const HTMLcollection_proto = {

        createElem(tagStr, attrObj) {
            let elem = Object.assign(document.createElement(tagStr), (attrObj || {}));
            if (attrObj && attrObj.hasOwnProperty('dataAttr')) {
                const data = attrObj.dataAttr;
                elem.setAttribute(`data-${data[0]}`, data[1]);
            }
            return elem;
        },
        selectElem(selector, parent = this.fragment || false) {
            if (!parent) console.error('missing parent', this);
            return parent.querySelector(selector);
        },
        addParent(tagStr, attrObj) {
            this.currentParent = this.createElem(tagStr, attrObj);
            this.fragment.appendChild(this.currentParent);
            return this;
        },
        addChild(tagStr, attrObj) {
            if (!this.currentParent) this.currentParent = this.fragment;
            this.currentParent.appendChild(this.createElem(tagStr, attrObj));
            return this;
        },
        addChildrenFromHTML(html) {
            if (!this.currentParent) this.currentParent = this.fragment;
            this.currentParent.appendChild(html);
            return this;
        },
        setParent(selector) {
            const newParent = this.selectElem(selector);
            this.currentParent = newParent;
            return this;
        },
        renderHTMLTo(elem) {
            elem.appendChild(this.fragment);
            return this;
        },
        returnHTML() {
            return this.fragment;
        }
    }
    // Create a new obj with "HTMLcollection" as its prototype and with its own document fragment
    let HTMLcollectionChild = Object.create(HTMLcollection_proto);
    HTMLcollectionChild.fragment = document.createDocumentFragment();
    return HTMLcollectionChild;
}


// ///////////// Some more stuff to implement
/*
    Sort activities alphabetically within each category.
*/

// Sorting and filtering functions
function sortAlphabetically(arrOfObjects, key, lang = 'sv') {
    return arrOfObjects.sort((obj1, obj2) => obj2[key].localeCompare(obj1[key], lang));
}
/*
    Save data: Use localStorage to save and load the list automatically.
*/

function test(num) {

    const arr = Array.from(activityCategories);
    const cat = () => arr[Math.floor(Math.random() * arr.length)]; 

    while (num > 0) {
        addNewActivity({ activityName: 'Aktivitet', activityCategory: cat() });
        num--;
    }
    numActivitiesCreated;
}

test(6)
