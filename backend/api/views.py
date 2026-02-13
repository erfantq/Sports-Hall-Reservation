import random
from django.core.mail import send_mail
from rest_framework import generics, filters, permissions, status
from rest_framework.views import APIView
from django.db.models import Count
from .models import Hall, Booking, User, ContactMessage, PasswordResetCode
from rest_framework.response import Response
from .serializers import HallSerializer, HallDetailSerializer, BookingReadSerializer, BookingCreateSerializer, RegisterSerializer, UserSerializer, ContactMessageSerializer, ForgotPasswordSerializer, VerifyResetCodeSerializer
from .permissions import IsHallAdmin
from .utils import api_response
from django.utils import timezone
from .pagination import StandardPagination

class HallListView(generics.ListAPIView):
    serializer_class = HallSerializer    
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'location', 'amenities', 'city', 'sport']


    def get_queryset(self):

        queryset = Hall.objects.all().order_by('id') 

        sport_param = self.request.query_params.get('sport', None)
        
        if sport_param:
            queryset = queryset.filter(sport__iexact=sport_param)
            
        return queryset

class HallDetailView(generics.RetrieveAPIView):
    queryset = Hall.objects.all()
    serializer_class = HallDetailSerializer
    lookup_field = 'id'
    permission_classes = [permissions.IsAuthenticated] 



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
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        response.data['message'] = "پروفایل شما با موفقیت بروزرسانی شد."
        return response
    

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
    
class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            if User.objects.filter(email=email).exists():
                code = str(random.randint(100000, 999999))
                
                PasswordResetCode.objects.update_or_create(
                    email=email, defaults={'code': code, 'created_at': timezone.now()}
                )

                send_mail(
                    'کد تایید فراموشی رمز عبور',
                    f'کد تایید شما: {code}',
                    'noreply@yourdomain.com',
                    [email],
                    fail_silently=False,
                )
                return api_response(message="کد تایید به ایمیل شما ارسال شد.")
            
            return api_response(message="کاربری با این ایمیل یافت نشد.", status_code=404)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyResetCodeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyResetCodeSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            new_password = serializer.validated_data['new_password']

            reset_entry = PasswordResetCode.objects.filter(email=email, code=code).first()
            
            if reset_entry and reset_entry.is_valid():
                user = User.objects.get(email=email)
                user.set_password(new_password)
                user.save()
                
                reset_entry.delete()
                
                return api_response(message="رمز عبور شما با موفقیت تغییر کرد.")
            
            return api_response(message="کد نامعتبر است یا منقضی شده است.", status_code=400)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)