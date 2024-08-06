// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, ref, push, get } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDZgheu3b61xo6km1f3RDr_Fx04BwHxIS0",
    authDomain: "join-7694d.firebaseapp.com",
    databaseURL: "https://join-7694d-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "join-7694d",
    storageBucket: "join-7694d.appspot.com",
    messagingSenderId: "209652435521",
    appId: "1:209652435521:web:b5d73edc8d0972a76d94c0"
};

let addNewContactBtn = document.getElementById('add-new-contact-btn');
let addContactBtn = document.getElementById('add-contact-btn');
let closeContactFormBtn = document.getElementById('content-head-header-close');
let closeDetailModalBtn = document.getElementById('close-detail-modal');
let closeEditModalBtn = document.getElementById('contact-edit-close');
let contactDetailsOptionsBtn = document.getElementById('mobil-contact-menu');
let contactOptionEditBtn = document.getElementById('option-edit-contact');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

// List of predefined colors
const colorList = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#33FFA5", "#A533FF", "#FFA533", "#57FF33"];

// Function to get a random color from the predefined list
function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * colorList.length);
    return colorList[randomIndex];
}

function writeContact() {
    let addName = document.getElementById('new_name');
    let addEmail = document.getElementById('new_email');
    let addPhone = document.getElementById('new_phone');

    push(ref(db, 'contacts/'), {
        name: addName.value,
        email: addEmail.value,
        phone: addPhone.value
    });

    addName.value = '';
    addEmail.value = '';
    addPhone.value = '';

    closeContactForm();
    succecfullAnim()
    getContacts();
}

async function getContacts() {
    const dbRef = ref(db, "contacts");
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const contacts = snapshot.val();
            const contactDiv = document.getElementById("contact-list");
            contactDiv.innerHTML = "";

            // Convert Contacts object to an array
            const contactArray = Object.keys(contacts).map(id => {
                return { id, ...contacts[id] };
            });

            // Sort the array alphabetically by name
            contactArray.sort((a, b) => a.name.localeCompare(b.name));

            let currentLetter = '';
            // Render sorted contacts with headings
            contactArray.forEach(contact => {
                const firstLetter = contact.name.charAt(0).toUpperCase();
                if (firstLetter !== currentLetter) {
                    currentLetter = firstLetter;
                    const letterHeader = /* HTML */ `
                        <div class="contact-list-letter-item">
                            <p class="contact-list-letter">${currentLetter}</p>
                        </div>
                    `;
                    contactDiv.innerHTML += letterHeader;
                }

                const initialsColor = getRandomColor();
                const contactHTML = /* HTML */ `
                    <div class="contact-list-item" data-contact-id="${contact.id}">
                        <div class="contact-list-initials" style="background-color: ${initialsColor};">
                            ${contact.name.charAt(0)}${contact.name.split(' ')[1]?.charAt(0) || ''}
                        </div>
                        <div class="contact-list-contact">
                            <p class="contact-list-contact-name">${contact.name}</p>
                            <p class="contact-list-contact-email">${contact.email}</p>
                        </div>
                    </div>
                `;
                contactDiv.innerHTML += contactHTML;
            });

            // Add event listeners to contact items
            document.querySelectorAll('.contact-list-item').forEach(item => {
                item.addEventListener('click', () => {
                    const contactId = item.getAttribute('data-contact-id');
                    openContactDetail(contactId);
                });
            });

        } else {
            alert("No contacts found.");
        }
    } catch (error) {
        alert("Error fetching contacts: " + error);
    }
}


// Function to open the contact detail modal and display contact info
async function openContactDetail(contactId) {
    const dbRef = ref(db, `contacts/${contactId}`);
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const contacts = snapshot.val();
            const contactDiv = document.getElementById("contact-list");
            contactDiv.innerHTML = "";

            // Convert Contacts object to an array
            const contactArray = Object.keys(contacts).map(id => {
                return { id, ...contacts[id] };
            });

                const initialsColor = getRandomColor();
                const contactHTML = /* HTML */ `
                    
                    <div id="contact-details" class="contact-details">
                    <div class="contact-details-header">
                        <div class="contact-details-close">
                            <img class="contact-details-close-icon" id="close-detail-modal" src="./assets/img/icons/arrow-left-line.png" alt="Close Button">
                        </div>
                        <h2 class="contact-details-header-title">Contacts</h2>
                        <p class="contact-details-header-subtitle">Better with a team</p>
                        <div class="devider"></div>    
                    </div>
                    
                    <div class="contact-details-content">
                        <div class="contact-details-name-container">
                            <div class="initials-container" id="initials-container">${contacts.name.charAt(0)}${contacts.name.split(' ')[1]?.charAt(0) || ''}</div>
                            <p class="contact-details-name" id="contact-name">${contacts.name}</p>    
                        </div>

                        <p class="contact-details-subtitle">Contact Information</p>
                        <p class="contact-category">Email</p>
                        <p class="contact-email" id="contact-email">${contacts.email}</p>
                        <p class="contact-category">Phone</p>
                        <p class="contact-phone" id="contact-phone">${contacts.phone}</p>
                        
                    </div>
                    <button class="contact-menu-btn" id="mobil-contact-menu"><img class="contact-menu-btn-icon" src="./assets/img/icons/menu_contact-options.png"></button>

                    <div class="contact-details-options d-none" id="contact-details-options">
                        <button class="option-btn" id="option-edit-contact"><img class="option-btn-icon" src="./assets/img/icons/edit.png">Edit</button>
                        <button class="option-btn" id="option-delete-contact"><img class="option-btn-icon" src="./assets/img/icons/delete.png">Delete</button>
                    </div>

                </div>
                              
                `;
                contactDiv.innerHTML += contactHTML;

                 // Add event listeners to contact items
                document.getElementById('close-detail-modal').addEventListener('click', () => {
                    getContacts(); 
                });
               

        } else {
            alert("No contacts found.");
        }
    } catch (error) {
        alert("Error fetching contacts: " + error);
        console.log("Error fetching contacts: " + error);
    }
}




function openContactForm() {
    document.getElementById('modal-add').classList.remove("d-none");
}


function closeContactForm() {
    document.getElementById('modal-add').classList.add("d-none");
}


function openContactEdit(){
    document.getElementById('modal-edit').classList.remove("d-none");
}


function closeContactEdit(){
    document.getElementById('modal-edit').classList.add("d-none");
}


function succecfullAnim() {
    document.getElementById('modal-succesfull').classList.remove('d-none');
    setTimeout(() => {
        document.getElementById('modal-succesfull').classList.add('d-none');
      }, "2000");
}


function openContactDetailsOptions(){
    document. getElementById('contact-details-options').classList.toggle('d-none');
}


addNewContactBtn.addEventListener('click', writeContact);
addContactBtn.addEventListener('click', openContactForm);
closeContactFormBtn.addEventListener('click', closeContactForm);
closeEditModalBtn.addEventListener('click', closeContactEdit)
// contactDetailsOptionsBtn.addEventListener('click', openContactDetailsOptions);
// contactOptionEditBtn.addEventListener('click', openContactEdit)
window.addEventListener('load', getContacts);
