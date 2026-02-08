from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'کاربر عادی'),
        ('hall_admin', 'مدیر سالن'),
        ('sys_admin', 'مدیر سیستم'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user', verbose_name="نقش کاربر")
    phone_number = models.CharField(max_length=15, blank=True, null=True, verbose_name="شماره تماس")

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    

class Hall(models.Model):
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='halls',
        verbose_name="مدیر سالن"
    )
    
    name = models.CharField(max_length=100, verbose_name="نام سالن")
    location = models.CharField(max_length=255, verbose_name="موقعیت مکانی")
    capacity = models.PositiveIntegerField(verbose_name="ظرفیت نفرات")
    amenities = models.TextField(verbose_name="امکانات", help_text="امکانات را با ویرگول جدا کنید")
    image = models.ImageField(upload_to='halls/', blank=True, null=True, verbose_name="تصویر سالن")
    
    def __str__(self):
        return self.name
    
class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'در انتظار تایید'),
        ('confirmed', 'تایید شده'),
        ('cancelled', 'لغو شده'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='bookings',
        verbose_name="کاربر رزرو کننده"
    )
    hall = models.ForeignKey(
        Hall, 
        on_delete=models.CASCADE, 
        related_name='bookings',
        verbose_name="سالن ورزشی"
    )
    
    date = models.DateField(verbose_name="تاریخ رزرو")
    start_time = models.TimeField(verbose_name="ساعت شروع")
    end_time = models.TimeField(verbose_name="ساعت پایان")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="وضعیت")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت درخواست")

    def __str__(self):
        return f"{self.user.username} - {self.hall.name} ({self.date})"