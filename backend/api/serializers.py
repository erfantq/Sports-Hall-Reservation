from rest_framework import serializers
from .models import User, Hall, Booking, User, ContactMessage
from django.db.models import Q
from datetime import datetime, timedelta, time, date
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        data['role'] = self.user.role
        
        return data
class UserManagementSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(source='date_joined', format="%Y-%m-%d", read_only=True)
   
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_active', 'created_at']


    def create(self, validated_data):
        username = validated_data.get('username')
        password= validated_data.get('password', '1234')
        email = validated_data.get('email')
        role = validated_data.get('role', 'user')
        is_active = validated_data.get('is_active', True)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role,
            is_active=is_active
        )
        return user


    def update(self, instance, validated_data):
        if 'username' in validated_data:
            instance.username = validated_data.get('username', instance.username)
        return super().update(instance, validated_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone_number']
        read_only_fields = ['id']

    def validate_role(self, value):

        target_role = value

        
        user = self.context['request'].user


        if target_role != 'user' and target_role != user.role:
            raise serializers.ValidationError("شما فقط می‌توانید نقش خود را به 'user' تغییر دهید.")

        return target_role



class HallSerializer(serializers.ModelSerializer):
    pricePerHour = serializers.IntegerField(source='price_per_hour')
    address = serializers.CharField(source='location')
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Hall
        fields = ['id', 'name', 'city', 'pricePerHour', 'rating', 'image', 'sport', 'tags', 'capacity', 'address']

    def get_tags(self, obj):
        if obj.amenities:
            return [tag.strip() for tag in obj.amenities.replace('،', ',').split(',') if tag.strip()]
        return []
    


class HallDetailSerializer(serializers.ModelSerializer):
    pricePerHour = serializers.IntegerField(source='price_per_hour')
    address = serializers.CharField(source='location') 
    tags = serializers.SerializerMethodField()
    slots = serializers.SerializerMethodField() 

    class Meta:
        model = Hall
        fields = [
            'id', 'name', 'city', 'sport', 'rating', 'pricePerHour', 
            'image', 'tags', 'address', 'capacity', 'description', 'slots'
        ]

    def get_tags(self, obj):
        if obj.amenities:
            return [tag.strip() for tag in obj.amenities.replace('،', ',').split(',') if tag.strip()]
        return []

    def get_slots(self, obj):

        slots_data = {}
        today = date.today()
        
        for i in range(7):
            current_date = today + timedelta(days=i)
            date_str = current_date.strftime('%Y-%m-%d')
            available_times = []

            for hour in range(8, 24):
                start_time = time(hour, 0)
                end_time = time(hour + 1, 0) if hour < 23 else time.max

                is_booked = Booking.objects.filter(
                    hall=obj,
                    date=current_date,
                    status__in=['pending', 'confirmed'],
                    start_time__lt=end_time,  
                    end_time__gt=start_time   
                ).exists()

                if not is_booked:
                    available_times.append(start_time.strftime('%H:%M'))

            slots_data[date_str] = available_times

        return slots_data

class BookingCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Booking
        fields = ['id', 'hall', 'date', 'start_time', 'end_time', 'status']
        read_only_fields = ['user', 'status'] 

    def validate(self, attrs):
            request = self.context.get('request')
            user = request.user  

            if self.instance:
              if 'status' in attrs and user.role not in ['venue-manager', 'sys_admin']:
                  raise serializers.ValidationError("شما اجازه تغییر وضعیت رزرو را ندارید.")

            hall = attrs.get('hall', getattr(self.instance, 'hall', None))
            date_val = attrs.get('date', getattr(self.instance, 'date', None))
            start = attrs.get('start_time', getattr(self.instance, 'start_time', None))
            end = attrs.get('end_time', getattr(self.instance, 'end_time', None))

            if start and end and (not self.instance or any(k in attrs for k in ['date', 'start_time', 'end_time'])):
                if start >= end:
                    raise serializers.ValidationError("زمان پایان باید بعد از زمان شروع باشد.")

                conflicting_bookings = Booking.objects.filter(
                    hall=hall,
                    date=date_val,
                    status__in=['pending', 'confirmed']
                ).filter(
                    start_time__lt=end,
                    end_time__gt=start
                )

                if self.instance:
                    conflicting_bookings = conflicting_bookings.exclude(pk=self.instance.pk)
                
                if conflicting_bookings.exists():
                    raise serializers.ValidationError("این سالن در زمان انتخاب شده قبلاً رزرو شده است.")
            
            return attrs
        

class BookingReadSerializer(serializers.ModelSerializer):
    hallName = serializers.ReadOnlyField(source='hall.name')
    sport = serializers.ReadOnlyField(source='hall.sport')
    userName = serializers.ReadOnlyField(source='user.username')
    time = serializers.TimeField(source='start_time')
    durationHours = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ['id', 'hallName', 'userName', 'sport', 'date', 'time', 'durationHours', 'price', 'status', 'created_at']

    def get_durationHours(self, obj):
        dummy_date = date.min
        start = datetime.combine(dummy_date, obj.start_time)
        end = datetime.combine(dummy_date, obj.end_time)
        diff = end - start
        return round(diff.total_seconds() / 3600, 2)

    def get_price(self, obj):
        hours = self.get_durationHours(obj)
        return int(hours * obj.hall.price_per_hour)


class BookingStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'status', 'user', 'hall', 'date', 'start_time', 'end_time']
        read_only_fields = ['id', 'user', 'hall', 'date', 'start_time', 'end_time']

    def validate_status(self, value):
        if value not in ['confirmed', 'cancelled']:
            raise serializers.ValidationError("وضعیت ارسالی باید confirmed یا cancelled باشد.")
        return value

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'role', 'phone_number')



    def validate_role(self, value):
        if value == 'sys-admin':
            raise serializers.ValidationError("انتخاب نقش مدیر سیستم در ثبت‌نام غیرمجاز است.")
        return value
    
    def create(self, validated_data):

        role = validated_data.get('role', 'user')
        if role == 'sys-admin':
            role = 'user'

        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            role=role,
            phone_number=validated_data.get('phone_number', '')
        )
        return user
    

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'user', 'subject', 'message','type', 'priority', 'created_at']
        read_only_fields = ['user', 'created_at']

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerifyResetCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=8, write_only=True)



class HallManagementSerializer(serializers.ModelSerializer):
    pricePerHour = serializers.IntegerField(source='price_per_hour')
    address = serializers.CharField(source='location')
    
    class Meta:
        model = Hall
        fields = ['id', 'name', 'city', 'sport', 'pricePerHour', 'rating', 'image', 'capacity', 'address']


class HallFacilitiesSerializer(serializers.ModelSerializer):
    facilities = serializers.ListField(
        child=serializers.CharField(), 
        write_only=True
    )
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Hall
        fields = ['id', 'name', 'facilities', 'tags']
        read_only_fields = ['name', 'id']

    def get_tags(self, obj):
        if obj.amenities:
            return [tag.strip() for tag in obj.amenities.replace('،', ',').split(',') if tag.strip()]
        return []

    def update(self, instance, validated_data):
        facilities_list = validated_data.get('facilities', [])
        instance.amenities = ",".join(facilities_list)
        instance.save()
        return instance