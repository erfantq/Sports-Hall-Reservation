from datetime import timedelta
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    ROLE_CHOICES = (
        ("user", "Regular User"),
        ("venue-manager", "Venue Manager"),
        ("sys-admin", "System Admin"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user", verbose_name="User Role")
    phone_number = models.CharField(max_length=15, blank=True, null=True, verbose_name="Phone Number")

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Hall(models.Model):
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="halls",
        verbose_name="Venue Manager",
    )

    name = models.CharField(max_length=100, verbose_name="Venue Name")
    city = models.CharField(max_length=100, default="Mashhad", verbose_name="City")
    sport = models.CharField(max_length=100, default="Football", verbose_name="Sport")
    location = models.CharField(max_length=255, verbose_name="Exact Address", default="Address not provided")
    capacity = models.PositiveIntegerField(verbose_name="Capacity", default=10)
    price_per_hour = models.PositiveIntegerField(default=100000, verbose_name="Price per Hour (Toman)")
    description = models.TextField(
        verbose_name="Description",
        default="A fully equipped sports venue with complete facilities.",
        blank=True,
    )
    rating = models.FloatField(default=5.0, verbose_name="Rating")
    amenities = models.TextField(
        verbose_name="Amenities",
        help_text="Separate amenities with commas (,). Example: Shower, Cafe, Parking",
    )
    image = models.ImageField(upload_to="halls/", blank=True, null=True, verbose_name="Venue Image")

    def __str__(self):
        return self.name


class Booking(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending Approval"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
        verbose_name="Booking User",
    )
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, related_name="bookings", verbose_name="Sports Venue")
    date = models.DateField(verbose_name="Booking Date")
    start_time = models.TimeField(verbose_name="Start Time")
    end_time = models.TimeField(verbose_name="End Time")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending", verbose_name="Status")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Request Created At")

    def __str__(self):
        return f"{self.user.username} - {self.hall.name} ({self.date})"


class ContactMessage(models.Model):
    TYPE_CHOICES = (
        ("bug", "Bug Report"),
        ("payment", "Payment"),
        ("venue", "Venue"),
        ("account", "Account"),
        ("other", "Other"),
    )
    PRIORITY_CHOICES = (
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Sender")
    subject = models.CharField(max_length=200, verbose_name="Subject")
    message = models.TextField(verbose_name="Message")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="bug", verbose_name="Message Type")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="medium", verbose_name="Priority")
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False, verbose_name="Read?")

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
