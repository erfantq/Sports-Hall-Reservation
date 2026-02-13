from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    HallListView, HallDetailView, 
    BookingCreateView, UserBookingHistoryView,
    RegisterView, UserProfileView,
    HallAdminBookingListView, UpdateBookingStatusView,
    ContactCreateView, SystemStatsView,
    ForgotPasswordView, VerifyResetCodeView,
    UserListCreateView, UserDetailUpdateDeleteView
)


urlpatterns = [

    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'), 
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),


    path('halls/', HallListView.as_view(), name='hall-list'),
    path('halls/<int:id>/', HallDetailView.as_view(), name='hall-detail'),
    path('bookings/create/', BookingCreateView.as_view(), name='booking-create'),
    path('bookings/my-history/', UserBookingHistoryView.as_view(), name='my-history'),

    path('admin-halls/bookings/', HallAdminBookingListView.as_view(), name='admin-bookings-list'),
    path('admin-halls/bookings/<int:pk>/status/', UpdateBookingStatusView.as_view(), name='update-booking-status'),

    path('contact/', ContactCreateView.as_view(), name='contact-create'),

    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('verify-code/', VerifyResetCodeView.as_view(), name='verify_code'),

    path('system/stats/', SystemStatsView.as_view(), name='system-stats'),

    path('users/', UserListCreateView.as_view(), name='user-list'),
    path('users/<int:id>/', UserDetailUpdateDeleteView.as_view(), name='user-detail-update-delete'),

]