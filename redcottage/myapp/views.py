import json
from django.shortcuts import render, HttpResponse, redirect
from .models import Booking
from json import dumps
from django.http import JsonResponse
from datetime import timedelta

from django.conf import settings
from django.views.generic.base import TemplateView
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

import stripe
import time

stripe.api_key = settings.STRIPE_SECRET_KEY


def home(request):
    return render(request, "home.html")

#handle javascript post to /booknow/add page
def post_add(request):
    num_days = None
    start_date = None
    end_date = None
    request_type = request.POST.get('request_type')

    if request_type == 'return_days': #something wrong here
        num_days = int(request.POST.get('num_days', 1))
        start_date = request.POST.get('start_date',1)
        end_date = request.POST.get('end_date',1)
    
    request.session['num_days'] = num_days
    request.session['start_date'] = start_date
    request.session['end_date'] = end_date
    

    return JsonResponse({'message': 'Return days processed successfully'})

#@method_decorator(login_required, name='dispatch')
#add back once implemented accounts but only to accounts page!
class booknow(TemplateView):
    template_name = 'booknow.html'
    stripe.api_key = settings.STRIPE_SECRET_KEY

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['key'] = settings.STRIPE_PUBLISHABLE_KEY

        some_dates = Booking.objects.all()
        booked_days = []
        for instance in some_dates:
            booked_days += instance.get_all_dates()
        context['booked_days'] = booked_days

        return context

    #handle post requests for stripe
    def post(self, request, *args, **kwargs):
        num_days = None
        start_date = None
        end_date = None
        request_type = request.POST.get('request_type')

        num_days = request.session.get('num_days')
        start_date = request.session.get('start_date')
        end_date = request.session.get('end_date')
        
        if request_type == 'booking':
            if num_days:
                checkout_session = stripe.checkout.Session.create(
                    payment_method_types = ['card'],
                    line_items = [
                        {
                            'price' : settings.PRODUCT_PRICE,
                            'quantity': int(num_days), #need to pass in quantity here from booknow.html
                        }
                    ],
                    metadata={
                        'start_date': start_date,
                        'end_date': end_date
                    },
                    mode = 'payment',
                    customer_creation = 'always',
                    success_url = settings.REDIRECT_DOMAIN + '/bookingcomplete/?session_id={CHECKOUT_SESSION_ID}', 
                    cancel_url = settings.REDIRECT_DOMAIN+ '/bookingfailed/' 

                )

                # Redirect or render a response after handling POST
                return redirect(checkout_session.url, code=303)
            else:
                return JsonResponse({'message': 'Checkout not processed. No days selected.'})


def learnmore(request):
    return render(request, "learnmore.html")

def bookingcomplete(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    checkout_session_id = request.GET.get('session_id', None)
    session = stripe.checkout.Session.retrieve(checkout_session_id)
    customer = stripe.Customer.retrieve(checkout_session_id)
    user_id = request.user.user_id
    user_payment = Booking.objects.get(app_user=user_id)
    user_payment.stripe_checkout_id = checkout_session_id
    user_payment.save()
    return render(request,"bookingcomplete.html", {'customer': customer})

def bookingfailed(request):
    return render(request,"bookingfailed.html")


#this is where we're updating the database after stripe payment has gone through
#this is where I need to add stuff to update each item in the database including info about number of days, start date, end date
@csrf_exempt
def stripe_webhook(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    time.sleep(10)
    payload = request.body
    signature_header = request.META['HTTP_STRIPE_SIGNATURE']
    event = None
    try:
        event = stripe.Webhook.construct_event(
            payload, signature_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        return HttpResponse(status=400)
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        session_id = session.get('id', None)
        
        metadata = session.get('metadata', {})
        start_date = metadata['start_date']
        end_date = metadata['end_date']
        
        line_items = session.get('line_items',[])
        length = line_items[0]['quantity']
        price = line_items[0]['price']
        
        time.sleep(15)
        user_payment = Booking.objects.get(stripe_checkout_id=session_id)
        user_payment.payment_bool = True
        user_payment.start_date = start_date
        user_payment.end_date = end_date
        user_payment.length = length
        user_payment.price_paid = price

        user_payment.save()
    return HttpResponse(status=200)




