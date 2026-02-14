from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    MyTokenObtainPairView,
    HallListView, HallDetailView, 
    BookingCreateView, UserBookingHistoryView,
    RegisterView, UserProfileView,
    HallAdminBookingListView, UpdateBookingStatusView,
    ContactCreateView, SystemStatsView,
    ForgotPasswordView, VerifyResetCodeView,
    UserListCreateView, UserDetailUpdateDeleteView,
    AdminHallListView, HallCreateView, HallUpdateView, HallDeleteView,
    HallFacilitiesUpdateView, HallFacilitiesListView,
    GlobalBookingListView,
    BookingCountView, ActiveUserCountView,
    HallUsageStatsView,
)


urlpatterns = [

    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'), 
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),


    path('halls/', HallListView.as_view(), name='hall-list'),
    path('halls/<int:id>/', HallDetailView.as_view(), name='hall-detail'),

    path('admin-halls/bookings/', HallAdminBookingListView.as_view(), name='admin-bookings-list'),
    path('admin-halls/bookings/<int:pk>/status/', UpdateBookingStatusView.as_view(), name='update-booking-status'),

    path('admin/halls/', AdminHallListView.as_view(), name='admin-hall-list'), 
    path('halls/create/', HallCreateView.as_view(), name='hall-create'), 
    path('halls/update/<int:id>/', HallUpdateView.as_view(), name='hall-update'), 
    path('halls/delete/<int:id>/', HallDeleteView.as_view(), name='hall-delete'), 
    path('halls/update-facilities/<int:id>/', HallFacilitiesUpdateView.as_view(), name='hall-update-facilities'), 
    path('halls/facilities/', HallFacilitiesListView.as_view(), name='hall-facilities-list'), 

    path('bookings/create/', BookingCreateView.as_view(), name='booking-create'),
    path('bookings/my-history/', UserBookingHistoryView.as_view(), name='my-history'),

    path('bookings/', GlobalBookingListView.as_view(), name='global-booking-list'),

    path('contact/', ContactCreateView.as_view(), name='contact-create'),

    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('verify-code/', VerifyResetCodeView.as_view(), name='verify_code'),

    path('system/stats/', SystemStatsView.as_view(), name='system-stats'),

    path('users/', UserListCreateView.as_view(), name='user-list'),
    path('users/<int:id>/', UserDetailUpdateDeleteView.as_view(), name='user-detail-update-delete'),


    path('halls/reserves-count/', BookingCountView.as_view(), name='reserves-count'),
    path('admin/users/active-count/', ActiveUserCountView.as_view(), name='active-users-count'),


    path('admin/halls/usage-stats/', HallUsageStatsView.as_view(), name='halls-usage-stats'),
]