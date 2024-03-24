import json
from django.shortcuts import render, HttpResponse
from .models import Booking
from json import dumps
from django.http import JsonResponse
from datetime import timedelta

from django.conf import settings
from django.views.generic.base import TemplateView

import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

# Create your views here.
def home(request):
    return render(request, "home.html")

class booknow(TemplateView):
    template_name = 'booknow.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['key'] = settings.STRIPE_PUBLISHABLE_KEY

        some_dates = Booking.objects.all()
        booked_days = []
        for instance in some_dates:
            booked_days += instance.get_all_dates()
        context['booked_days'] = booked_days

        return context

def learnmore(request):
    return render(request, "learnmore.html")

def bookingcomplete(request):
    #need to find a way to pass a value here from the booknow page javascript file!
    if request.method == 'POST':
        bookingcomplete = stripe.Charge.create(
            amount = 500,
            currency = 'usd',
            description='Red Cottage Booking',
            source=request.POST['stripeToken']
        )
    return render(request,"bookingcomplete.html")

