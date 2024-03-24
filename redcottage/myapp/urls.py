from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("", views.home, name="Home"),
    path("learnmore/", views.learnmore, name="Learn More"),
    path("booknow/", views.booknow.as_view(), name="Book Now"),
    path('bookingcomplete/',views.bookingcomplete,name='Booking Complete')
] + static(settings.STATIC_URL, document_root = settings.STATIC_ROOT)