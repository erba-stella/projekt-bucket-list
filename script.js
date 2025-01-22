/*
    Course Assignment: "Bucket List"
*/

// Make sure the DOM content is loaded first
if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', initBucketList);
} else {
    initBucketList();
}

function initBucketList() {
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
    // DOM Elements and attributes for later use
    const bucketFormElem = select('#bucketForm');
    const bucketListsElem = select('#bucketLists');
    const activityFormElem = select('#activityCategory');
    const activityNumDataAttr = 'activity-number';

    // Categories (All available categories are listed here). 
    const activityCategories = new Set(['Resor', 'Äventyr', 'Lärande', 'Hobby']);

    // Bucket List (The place to collect all saved activities)
    const bucketList = getFromStorage('bucketList') || [];
    
    // This is used to number the activities in the order they are created, to give them a short unique identifier
    let numActivitiesCreated = getFromStorage('numActivitiesCreated') || 0;
    /*
        on page load
    */
    // Render all bucket list content to the document
    renderBucketList(activityCategories, bucketList);
    // Render category options in the form  
    renderActivityCategoryOptions(activityCategories);
    /*
        add eventListeners
    */
    /*
        Form submit event (the user added a new activity) 
        - Collect the form data in a new activity object: { activityName: value, activityCategory: value }
        - Use the new activity object to add a new activity
    */
    bucketFormElem.addEventListener('submit', event => {
        event.preventDefault();
        addNewActivity(collectFormData(event.target));
        event.target.reset();
    });
    /*
        Click events in Bucket Lists
        - Checkbox: Mark activity as completed (true/false)
        - Button: Delete activity item
    */
    bucketListsElem.addEventListener("click", event => {
        if (event.target.type === 'checkbox') {
            // change the activity object in the bucket list array (set completed to true if checked)
            findActivityInBucketList(event, (item) => {
                item.completed = event.target.checked;
            })
            // save changes to local storage
            saveToStorage('bucketList', bucketList);
        }
        if (event.target.closest('button')) {
            // remove the activity from the document and the bucket list
            removeTargetActivity(event);
            // save changes to local storage
            saveToStorage('bucketList', bucketList);
        }
    });

    // Find and change the object in the bucket list array that coresponds with the event target... 
    function findActivityInBucketList(event, callback) {
        const elem = event.target.closest(`[data-${activityNumDataAttr}]`);
        const num = Number(elem.getAttribute(`data-${activityNumDataAttr}`));
        bucketList.forEach((obj, index) => {
            if (num === obj.activityNumber) {
                callback(obj, index);
            }
        });
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

        // Add the activity to the document, 
        // first check if the category list already exists there
        const categoryElemInUI = select(`[data-category=${obj.activityCategory}]`) || false;

        if (categoryElemInUI) {
            // If true: create activity element and add to the category list
            categoryElemInUI.prepend(getActivityHTML(obj));
        } else {
            // If false: create all HTML for the category and add it to the bucket lists
            const newCategoryElem = getCategoryHTML(obj.activityCategory, [obj]);
            bucketListsElem.prepend(newCategoryElem);
        }

        // add activity to the bucket list
        bucketList.push(obj);
        // save changes to local storage
        saveToStorage('bucketList', bucketList);
        saveToStorage('numActivitiesCreated', numActivitiesCreated);
    }
    /*
        Function: remove activity
        - Remove the activity element that corresponds to the event target
    */
    function removeTargetActivity(event) {
        // If the category element has only one activity, remove the category element
        if (event.target.closest('ul').children.length === 1) {
            event.target.closest('.category-section').remove();
        } else {
            // If else: Remove the activity element
            event.target.closest(`[data-${activityNumDataAttr}]`).remove();
        }
        // Remove activity from bucket list
        findActivityInBucketList(event, (item, index) => {
            bucketList.splice(index, 1);
        })
    }

    /*
        Render functions
    */

    // Render all form category options and append them to the form in the document
    function renderActivityCategoryOptions(setOfCategories) {
        const elements = createHTMLcollection();
        setOfCategories.forEach(category => {
            elements.addChild('option', {
                textContent: category,
                value: category
            });
        });
        activityFormElem.appendChild(elements.returnHTML());
    }

    // Render all Bucket List content and append it to the document
    function renderBucketList(setOfCategories, arrayOfActivities) {
        setOfCategories.forEach(category => {
            // Filter out all activities that belong to the current category
            const activitiesForThisCategory = arrayOfActivities.filter(obj => {
                return obj.activityCategory === category;
            }); 
            // Render the category if there are activities for it
            if (activitiesForThisCategory.length > 0) {
                // Create the category element and append it to the bucket list
                const categoryElem = getCategoryHTML(category, activitiesForThisCategory);
                bucketListsElem.appendChild(categoryElem);
            };  
        });
    }

    // Generates and returns the html for one category section
    function getCategoryHTML(category, activitiesArray) {
        const activities = getActivitiesHTML(activitiesArray),
            elements = createHTMLcollection();
        
        return elements
            .addParent('section', { classList: `category-section ${category.toLowerCase()}` })
            .addChild('h2', { textContent: category })
            .addChild('ul', { dataAttr: ['category', category] })
            .setParent('ul')
            .addChildrenFromHTML(activities)
            .returnHTML();
    }

    // Generates and returns the html for all activity objects in the array (in a document fragment)
    function getActivitiesHTML(activitiesArray) {
        const elements = createHTMLcollection();

        activitiesArray.forEach(activityObj => {
            const activityHTML = getActivityHTML(activityObj);
            elements.addChildrenFromHTML(activityHTML);
         });
        return elements.returnHTML();
    }

    // Generates and returns the HTMl for one single activity (in a document fragment)
    function getActivityHTML(activityObj) {
        const
            number = activityObj.activityNumber,
            name = activityObj.activityName,
            isCompleted = activityObj.completed,
            elements = createHTMLcollection();

        return elements
            .addParent('li', {
                dataAttr: [activityNumDataAttr, number]
            })
            .addChild('p', {
                textContent: name
            })
            .addChild('input', {
                type: 'checkbox',
                id: `completed-${number}`,
                checked: isCompleted
            })
            .addChild('label', {
                classList: 'visually-hidden',
                textContent: `har gjort aktiviteten ${name}`,
                htmlFor: `completed-${number}`
            })
            .addChild('button', {
                textContent: 'radera',
            })
            .setParent('button')
            .addChild('span', {
                classList: 'visually-hidden',
                textContent: `radera aktiviteten ${name}`,
                title: 'Radera'
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
}