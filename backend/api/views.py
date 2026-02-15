import random
from django.db.models import Q, Count
from django.core.mail import send_mail
from datetime import date, timedelta
from rest_framework import generics, filters, permissions, status
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from django.db.models import Count
from .models import Hall, Booking, User, ContactMessage, PasswordResetCode
from .serializers import MyTokenObtainPairSerializer, UserManagementSerializer, HallSerializer, HallFacilitiesSerializer, HallManagementSerializer, HallDetailSerializer, BookingReadSerializer, BookingCreateSerializer, BookingStatusUpdateSerializer, RegisterSerializer, UserSerializer, ContactMessageSerializer, ForgotPasswordSerializer, VerifyResetCodeSerializer
from .permissions import IsHallAdmin, IsSystemAdmin, IsAdminOrManager
from .utils import api_response
from django.utils import timezone
from .pagination import StandardPagination

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

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



class GlobalBookingListView(generics.ListAPIView):
    serializer_class = BookingReadSerializer
    permission_classes = [IsAdminOrManager]
    pagination_class = StandardPagination

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'sys-admin':
            queryset = Booking.objects.all().order_by('-created_at')
        else:
            queryset = Booking.objects.filter(hall__manager=user).order_by('-created_at')

        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        from_date = self.request.query_params.get('from')
        to_date = self.request.query_params.get('to')
        
        if from_date:
            queryset = queryset.filter(date__gte=from_date) 
        if to_date:
            queryset = queryset.filter(date__lte=to_date)   

        search_param = self.request.query_params.get('search')
        if search_param:
            queryset = queryset.filter(
                Q(hall__name__icontains=search_param) | 
                Q(user__username__icontains=search_param)
            )

        return queryset

class UpdateBookingStatusView(generics.UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingStatusUpdateSerializer
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
    

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserManagementSerializer
    pagination_class = StandardPagination
    permission_classes = [IsSystemAdmin]

    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        role_param = self.request.query_params.get('role')
        if role_param:
            queryset = queryset.filter(role=role_param)

        active_param = self.request.query_params.get('is_active')
        if active_param is not None:
            is_active = active_param.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)

        return queryset
    
    def perform_create(self, serializer):
        serializer.save()

class UserDetailUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserManagementSerializer
    lookup_field = 'id'
    permission_classes = [IsSystemAdmin]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user_id = instance.id
        self.perform_destroy(instance)
        return Response({
            "status": True,
            "message": "کاربر با موفقیت حذف شد.",
            "data": {"id": user_id}
        }, status=status.HTTP_200_OK)
    
class AdminHallListView(generics.ListAPIView):
    serializer_class = HallSerializer 
    permission_classes = [IsAdminOrManager]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'location', 'amenities', 'city', 'sport']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'sys-admin':
            queryset = Hall.objects.all().order_by('-id')
        else:
            queryset = Hall.objects.filter(manager=user).order_by('-id')

        city_param = self.request.query_params.get('city')
        sport_param = self.request.query_params.get('sport')

        if city_param:
            queryset = queryset.filter(city=city_param)
        if sport_param:
            queryset = queryset.filter(sport=sport_param)
            
        return queryset
    
class HallCreateView(generics.CreateAPIView):
    serializer_class = HallManagementSerializer
    permission_classes = [IsAdminOrManager]

    def perform_create(self, serializer):
        serializer.save(manager=self.request.user)

class HallUpdateView(generics.UpdateAPIView):
    serializer_class = HallManagementSerializer
    permission_classes = [IsAdminOrManager]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.role == 'sys-admin':
            return Hall.objects.all()
        return Hall.objects.filter(manager=user)
    

class HallDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAdminOrManager]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.role == 'sys-admin':
            return Hall.objects.all()
        return Hall.objects.filter(manager=user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        hall_id = instance.id
        self.perform_destroy(instance)
        return Response({
            "status": True,
            "message": "سالن با موفقیت حذف شد.",
            "data": {"id": hall_id}
        }, status=status.HTTP_200_OK)
    

class HallFacilitiesUpdateView(generics.UpdateAPIView):
    serializer_class = HallFacilitiesSerializer
    permission_classes = [IsAdminOrManager]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.role == 'sys-admin':
            return Hall.objects.all()
        return Hall.objects.filter(manager=user)
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        instance = self.get_object()
        full_data = HallSerializer(instance).data
        response.data = full_data
        response.data['message'] = "امکانات با موفقیت بروزرسانی شد."
        return response
    

class HallFacilitiesListView(APIView):
    permission_classes = [IsAdminOrManager]

    def get(self, request):
        facilities_list = ["Indoor", "Parking", "Showers", "Locker", "Cafe", "WC", "AC", "Outdoor"]
        return Response({"facilities": facilities_list})
    

class BookingCountView(APIView):
    permission_classes = [IsAdminOrManager]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        queryset = Booking.objects.all()

        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        if request.user.role == 'venue-manager':
            queryset = queryset.filter(hall__manager=request.user)

        count = queryset.count()
        return Response({"count": count})
    

class ActiveUserCountView(APIView):
    permission_classes = [IsSystemAdmin] 

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        queryset = User.objects.filter(is_active=True)

        if start_date:
            queryset = queryset.filter(date_joined__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date_joined__date__lte=end_date)

        count = queryset.count()
        return Response({"count": count})
    

class HallUsageStatsView(APIView):
    permission_classes = [IsAdminOrManager]

    def get(self, request):
        today = date.today()
        one_week_ago = today - timedelta(days=7)
        
        TOTAL_SLOTS_PER_WEEK = 112

        if request.user.role == 'sys-admin':
            halls = Hall.objects.all()
        else:
            halls = Hall.objects.filter(manager=request.user)

        stats = halls.annotate(
            confirmed_count=Count(
                'bookings', 
                filter=Q(bookings__date__range=[one_week_ago, today], bookings__status='confirmed')
            ),
            pending_count=Count(
                'bookings', 
                filter=Q(bookings__date__range=[one_week_ago, today], bookings__status='pending')
            ),
            cancelled_count=Count(
                'bookings', 
                filter=Q(bookings__date__range=[one_week_ago, today], bookings__status='cancelled')
            )
        )

        results = []
        for hall in stats:
            reserved = hall.confirmed_count
            pending = hall.pending_count
            cancelled = hall.cancelled_count
            available = TOTAL_SLOTS_PER_WEEK - (reserved + pending)
            
            results.append({
                "name": hall.name,
                "city": hall.city,
                "sport": hall.sport,
                "total_slots": TOTAL_SLOTS_PER_WEEK,
                "reserved_slots": reserved,
                "pending_slots": pending,
                "cancelled_slots": cancelled,
                "available_slots": max(0, available) 
            })

        return Response(results)