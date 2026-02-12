from rest_framework import generics, filters, permissions, status
from rest_framework.views import APIView
from django.db.models import Count
from .models import Hall, Booking, User, ContactMessage
from rest_framework.response import Response
from .serializers import HallSerializer, BookingReadSerializer, BookingCreateSerializer, RegisterSerializer, UserSerializer, ContactMessageSerializer
from .permissions import IsHallAdmin

class HallListView(generics.ListAPIView):
    queryset = Hall.objects.all()
    serializer_class = HallSerializer
    
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'location', 'amenities', 'city', 'sport']

class HallDetailView(generics.RetrieveAPIView):
    queryset = Hall.objects.all()
    serializer_class = HallSerializer
    lookup_field = 'id'


class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserBookingHistoryView(generics.ListAPIView):
    serializer_class = BookingReadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-date')
    

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny] 

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data['message'] = "ثبت‌نام با موفقیت انجام شد. خوش آمدید!"
        return response

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user 
    

class HallAdminBookingListView(generics.ListAPIView):
    serializer_class = BookingReadSerializer
    permission_classes = [IsHallAdmin]

    def get_queryset(self):
        return Booking.objects.filter(hall__manager=self.request.user).order_by('-created_at')

class UpdateBookingStatusView(generics.UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingCreateSerializer
    permission_classes = [IsHallAdmin]

    def get_queryset(self):
        return Booking.objects.filter(hall__manager=self.request.user)

    def perform_update(self, serializer):
        serializer.save()


class ContactCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SystemStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'sys_admin':
            return Response({"error": "عدم دسترسی"}, status=status.HTTP_403_FORBIDDEN)

        stats = {
            "total_users": User.objects.count(),
            "total_halls": Hall.objects.count(),
            "total_bookings": Booking.objects.count(),
            "confirmed_bookings": Booking.objects.filter(status='confirmed').count(),
            "pending_bookings": Booking.objects.filter(status='pending').count(),
            "bookings_per_hall": Hall.objects.annotate(num_bookings=Count('bookings')).values('name', 'num_bookings')
        }
        return Response(stats)