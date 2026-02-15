from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'کاربر عادی'),
        ('venue-manager', 'مدیر سالن'),
        ('sys-admin', 'مدیر سیستم'),
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
    city = models.CharField(max_length=100, default="مشهد", verbose_name="شهر")
    sport = models.CharField(max_length=100, default="فوتبال", verbose_name="ورزش")
    location = models.CharField(max_length=255, verbose_name="آدرس دقیق", default="آدرس ثبت نشده")
    capacity = models.PositiveIntegerField(verbose_name="ظرفیت نفرات", default=10)
    price_per_hour = models.PositiveIntegerField(default=100000, verbose_name="قیمت هر ساعت (تومان)")
    description = models.TextField(
        verbose_name="توضیحات", 
        default="یک سالن ورزشی مجهز با امکانات کامل.",
        blank=True
    )

    rating = models.FloatField(default=5.0, verbose_name="امتیاز")

    amenities = models.TextField(verbose_name="امکانات", help_text="امکانات را با کاما (,) جدا کنید. مثال: دوش, بوفه, پارکینگ")
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
    
class ContactMessage(models.Model):

    TYPE_CHOICES = (
        ('bug', 'خطا'),
        ('payment', 'پرداخت'),
        ('venue', 'سالن ها'),
        ('account', 'حساب کاربری'),
        ('other', 'سایر'),
    )
    
    PRIORITY_CHOICES = (
        ('low', 'کم'),
        ('medium', 'متوسط'),
        ('high', 'فوری'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="فرستنده")
    subject = models.CharField(max_length=200, verbose_name="موضوع")
    message = models.TextField(verbose_name="متن پیام")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Bug', verbose_name="نوع پیام")

    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium', verbose_name="اولویت")

    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False, verbose_name="خوانده شده؟")

    def __str__(self):
        return f"{self.user.username}: {self.subject}"
    
class PasswordResetCode(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return self.created_at >= timezone.now() - timedelta(minutes=10)

    def __str__(self):
        return f"{self.email} - {self.code}"