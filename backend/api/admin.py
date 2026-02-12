from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Hall, Booking

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'role', 'is_staff'] 
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'phone_number')}),
    )

admin.site.register(User, CustomUserAdmin)

@admin.register(Hall)
class HallAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'price_per_hour', 'rating', 'manager']
    search_fields = ['name', 'city']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['user', 'hall', 'date', 'start_time', 'status'] 
    list_filter = ['status', 'date'] 