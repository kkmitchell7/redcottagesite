
//allbookeddays; //let is block scoped, var is function scoped

let bookedDays = JSON.parse(document.getElementById('bookedDays').textContent);

const daysTag = document.querySelector(".days"),
currentDate = document.querySelector(".current-date"),
prevNextIcon = document.querySelectorAll(".icons span");
// getting new date, current year and month
let date = new Date(),
currYear = date.getFullYear(),
currMonth = date.getMonth();

// storing full name of all months in array
const months = ["January", "February", "March", "April", "May", "June", "July",
              "August", "September", "October", "November", "December"];
const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(), // getting first day of month
    lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(), // getting last date of month
    lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(), // getting last day of month
    lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); // getting last date of previous month
    let dataid;
    let currDate;
    let liTag = "";
    for (let i = firstDayofMonth; i > 0; i--) { // creating li of previous month last days
        if (currMonth == 0){ //need currYear to be -1 if we are in Jan
            dataid = `${currYear-1}-12-${(lastDateofLastMonth-i+1).toString().padStart(2, '0')}`;
        } else{
            dataid = `${currYear}-${currMonth.toString().padStart(2, '0')}-${(lastDateofLastMonth-i+1).toString().padStart(2, '0')}`;
        }

        let isBooked = bookedDays.includes(dataid);
        let isBookedClass = isBooked ? "booked" : "";

        let isBeforeToday = is_date1_before_date2(dataid, new Date().toString()) ? "past": "";       
        
        liTag += `<li class="inactive ${isBeforeToday} ${isBookedClass}" data-id="${dataid}">${lastDateofLastMonth - i + 1}</li>`;
    }
    for (let i = 1; i <= lastDateofMonth; i++) { // creating li of all days of current month
        // adding active class to li if the current day, month, and year matched
        //might need to add this for every one so that booked days always display!
        dataid = `${currYear}-${(currMonth+1).toString().padStart(2, '0')}-${(i).toString().padStart(2, '0')}`;
        
        let isBooked = bookedDays.includes(dataid);
        let isBookedClass = isBooked ? "booked" : "";
        
        let isToday = i === date.getDate() && currMonth === new Date().getMonth() 
                     && currYear === new Date().getFullYear() ? "active" : "";
        
        let isBeforeToday = is_date1_before_date2(dataid, new Date().toString()) ? "past": ""; //the 31st isnt returning true?
        //console.log(dataid)
                 
        liTag += `<li class="${isToday} ${isBookedClass} ${isBeforeToday}" data-id="${dataid}">${i}</li>`;
        
    }
    for (let i = lastDayofMonth; i < 6; i++) { // creating li of next month first days
        if (currMonth == 11){ //need currYear to be +1 if we are in Dec
            dataid = `${currYear+1}-01-${(i - lastDayofMonth+1).toString().padStart(2, '0')}`;
        } else{
            dataid = `${currYear}-${(currMonth+2).toString().padStart(2, '0')}-${(i - lastDayofMonth+1).toString().padStart(2, '0')}`;
        }

        let isBooked = bookedDays.includes(dataid);
        let isBookedClass = isBooked ? "booked" : "";

        let isBeforeToday = is_date1_before_date2(dataid, new Date().toString()) ? "past": "";

        liTag += `<li class="inactive ${isBeforeToday} ${isBookedClass}" data-id="${dataid}">${i - lastDayofMonth + 1}</li>`
    }
    currentDate.innerText = `${months[currMonth]} ${currYear}`; // passing current mon and yr as currentDate text
    daysTag.innerHTML = liTag;
}
renderCalendar();
prevNextIcon.forEach(icon => { // getting prev and next icons
    icon.addEventListener("click", () => { // adding click event on both icons
        // if clicked icon is previous icon then decrement current month by 1 else increment it by 1
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;
        if(currMonth < 0 || currMonth > 11) { // if current month is less than 0 or greater than 11
            // creating a new date of current year & month and pass it as date value
            date = new Date(currYear, currMonth, new Date().getDate());
            currYear = date.getFullYear(); // updating current year with new date year
            currMonth = date.getMonth(); // updating current month with new date month
        } else {
            date = new Date(); // pass the current date as date value
        }
        renderCalendar(); // calling renderCalendar function
    });
});


let endDate = null;
let startDate = null;
let clickCounter = 0;
let lastclickedstart = null;
let lastclickedend = null;

document.getElementById('day').addEventListener('click', function(event) {
    
    //what i need to do here is be able to know which date was clicked on and assign that as start date, end date

    var clickedObject = event.target;
    var clickedFullDate = clickedObject.getAttribute('data-id'); //String of the date
    console.log(clickedFullDate)
    var clickedDate = new Date(clickedFullDate + " 00:00:00");
    console.log(clickedDate) 

    

    //Every other click updates either the startDate or endDate
    if (clickedFullDate != null && is_date1_before_date2(new Date().toString(),clickedFullDate)) { //check to make sure we haven't clicked the same date or the contianer
        if (clickedObject.classList.contains("booked") == false){
            if (clickCounter === 0){
                if (startDate == null || (endDate != null && is_date1_before_date2(clickedFullDate,endDate.toString()) && clickedDate.toString() != startDate.toString())){
                    startDate = clickedDate;
                    clickedObject.classList.add("selected"); 
                    if (lastclickedstart !== null) {
                        // Remove the class from the previously clicked object
                        lastclickedstart.classList.remove("selected");
                    }
                    lastclickedstart = clickedObject;
                }
            } else if (clickCounter === 1){
                if (endDate == null || (startDate != null && is_date1_before_date2(startDate.toString(),clickedFullDate) && clickedDate.toString() != endDate.toString())){
                    endDate = clickedDate;
                    clickedObject.classList.add("selected");
                    if (lastclickedend !== null) {
                        // Remove the class from the previously clicked object
                        lastclickedend.classList.remove("selected");
                    }
                    lastclickedend = clickedObject;
                }  
            }
        }
    }
    
    
    //Change text based on date selected
    var displayStartDate = document.getElementById('displayStartDate');
    var displayEndDate = document.getElementById('displayEndDate');
    if (startDate != null){
        displayStartDate.textContent = 'Start date:' + startDate.toString() +"\n";
    }
    if (endDate != null){
        displayEndDate.textContent = 'End date:' + endDate.toString();
    }
    

    if (startDate != null && endDate != null){
        var daysCalc = calculateDays(startDate,endDate);
        displayPrice.textContent = ' Price:' + Math.ceil(daysCalc * 200);

        //send the info to views so stripe can use this quanity info
        var csrftoken = getCookie('csrftoken');
        
        var xhr = new XMLHttpRequest();
        xhr.open("POST", window.location.href, true); //"{% url 'Book Now' %}" issue is here!!
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("X-CSRFToken", csrftoken);
        /*xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // Redirect to checkout session URL
                window.location.href = JSON.parse(xhr.responseText).url;
            }
        };*/
        xhr.send("request_type=return_days&num_days=" + encodeURIComponent(daysCalc));
    }
    


    // Toggle the visibility of the start date text
    
    if (startDate != null) {
        displayStartDate.style.display = 'block';
    }

    if (endDate != null) {
        displayEndDate.style.display = 'block';
        displayPrice.style.display = 'block';
    }
    



    clickCounter = (clickCounter + 1) % 2; //Reset after second click
});


function calculateDays(sDate,eDate) { //Takes in Date objects

    // Calculate the difference in days
    const timeDifference = eDate.getTime() - sDate.getTime();
    const daysDifference = (timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference //Return days
}

function is_date1_before_date2(strd1,strd2) { //Takes in string of date

    // Calculate the difference in days
    let d1 = new Date(strd1)
    let d2 = new Date(strd2)
    const timeDifference = d1.getTime() - d2.getTime();
    const daysDifference = (timeDifference / (1000 * 60 * 60 * 24))*-1;

    if (daysDifference > 0){ 
        return true;
    } else if (daysDifference <= 0){
        return false;
    }
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}