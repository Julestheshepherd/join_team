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
                    console.log(`Contact ID: ${contactId}`); // Debugging output
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
            const contact = snapshot.val();
            document.getElementById('contact-name').innerText = contact.name;
            document.getElementById('contact-email').innerText = contact.email;
            document.getElementById('contact-phone').innerText = contact.phone;
            document.getElementById('contact-detail-modal').classList.remove('d-none');
            document.getElementById('contact-detail-modal').style.display = 'block'; // Ensure modal is displayed
            console.log(`Opened modal for contact: ${contact.name}`); // Debugging output
        } else {
            alert("Contact not found.");
        }
    } catch (error) {
        alert("Error fetching contact details: " + error);
    }
}

function closeContactDetailModal() {
    document.getElementById('contact-detail-modal').classList.add('d-none');
    document.getElementById('contact-detail-modal').style.display = 'none'; // Ensure modal is hidden
}

function openContactForm() {
    document.getElementById('modal-add').classList.remove("d-none");
}

function closeContactForm() {
    document.getElementById('modal-add').classList.add("d-none");
}

function succecfullAnim() {
    document.getElementById('modal-succesfull"').classList.remove('d-none')
}

addNewContactBtn.addEventListener('click', writeContact);
addContactBtn.addEventListener('click', openContactForm);
closeContactFormBtn.addEventListener('click', closeContactForm);
closeDetailModalBtn.addEventListener('click', closeContactDetailModal);
window.addEventListener('load', getContacts);
