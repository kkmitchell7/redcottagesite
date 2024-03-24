import django
from django.db import models
from datetime import timedelta

# Create your models here.

class Booking(models.Model):
    name = models.CharField(max_length=200)
    start_date = models.DateField(default=django.utils.timezone.now)
    end_date = models.DateField(default=django.utils.timezone.now)
    length = models.IntegerField() #number of nights staying

    def get_all_dates(self):
        # Generate a list of dates between start_date and end_date (inclusive)
        all_dates = [str(self.start_date + timedelta(days=i)) for i in range((self.end_date - self.start_date).days + 1)]
        return all_dates
   


#we need a database which represents a calendar
#each entry represents a booking and the calendar will display all these bookings
#a booking contains a name, dates for the booking,length of the booking
#10 days is the max
#completed = models.BooleanField(default=False)
    
#features: 
    #need it to display days that are booked automatically with colors
    #need to be able to click on a day for starting day
    #need to be able to click on the end date
    #need to be able to view the price
    #need to press book now
    #need to redirect to stripe
    #need to add the entry to the database once booked so calendar updates