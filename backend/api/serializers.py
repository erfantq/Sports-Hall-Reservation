from rest_framework import serializers
from .models import User, Hall, Booking, User, ContactMessage
from django.db.models import Q
from datetime import datetime, date

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone_number']

class HallSerializer(serializers.ModelSerializer):
    pricePerHour = serializers.IntegerField(source='price_per_hour')

    tags = serializers.SerializerMethodField()

    class Meta:
        model = Hall
        fields = ['id', 'name', 'city', 'pricePerHour', 'rating', 'image', 'tags']

    def get_tags(self, obj):
        if obj.amenities:
            return [tag.strip() for tag in obj.amenities.replace('،', ',').split(',') if tag.strip()]
        return []

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
    time = serializers.TimeField(source='start_time')
    durationHours = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ['id', 'hallName', 'sport', 'date', 'time', 'durationHours', 'price', 'status']

    def get_durationHours(self, obj):
        dummy_date = date.min
        start = datetime.combine(dummy_date, obj.start_time)
        end = datetime.combine(dummy_date, obj.end_time)
        diff = end - start
        return round(diff.total_seconds() / 3600, 2)

    def get_price(self, obj):
        hours = self.get_durationHours(obj)
        return int(hours * obj.hall.price_per_hour)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'role', 'phone_number')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            role=validated_data.get('role', 'user'),
            phone_number=validated_data.get('phone_number', '')
        )
        return user
    

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'user', 'subject', 'message', 'created_at']
        read_only_fields = ['user']