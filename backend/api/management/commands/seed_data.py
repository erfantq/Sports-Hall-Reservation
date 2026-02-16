import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Hall, Booking
from faker import Faker
from datetime import date, timedelta, time

User = get_user_model()
fake = Faker()

class Command(BaseCommand):
    help = 'Seeds the database with sample halls, users, and bookings'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding data...")

        self.stdout.write("Creating users...")
        
        if not User.objects.filter(role='sys-admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin123', role='sys-admin')

        managers = []
        for i in range(5):
            manager, _ = User.objects.get_or_create(
                username=f'manager_{i}',
                defaults={'role': 'venue-manager', 'email': f'manager{i}@test.com'}
            )
            manager.set_password('password123')
            manager.save()
            managers.append(manager)

        customers = []
        for i in range(15):
            customer, _ = User.objects.get_or_create(
                username=f'user_{i}',
                defaults={'role': 'user', 'email': f'user{i}@test.com'}
            )
            customer.set_password('password123')
            customer.save()
            customers.append(customer)

        self.stdout.write("Creating halls...")
        cities = ["Mashhad", "Tehran", "Isfahan", "Shiraz", "Rasht"]
        sports = ["Football", "Basketball", "Volleyball", "Futsal"]
        all_amenities = ["Parking", "WiFi", "Cafe", "AC", "Showers", "Locker", "Indoor", "Water"]

        halls = []
        for i in range(20):
            hall = Hall.objects.create(
                name=f"{fake.company()} Arena",
                city=random.choice(cities),
                sport=random.choice(sports),
                price_per_hour=random.choice([100000, 150000, 200000, 250000]),
                rating=round(random.uniform(3.5, 5.0), 1),
                location=fake.address(),
                capacity=random.randint(10, 30),
                manager=random.choice(managers),
                amenities=", ".join(random.sample(all_amenities, k=random.randint(2, 5)))
            )
            halls.append(hall)

        self.stdout.write("Creating bookings...")
        statuses = ['pending', 'confirmed', 'cancelled']
        
        start_date = date.today() - timedelta(days=10)
        
        for _ in range(100):
            booking_date = start_date + timedelta(days=random.randint(0, 20))
            hour = random.randint(8, 22) 
            
            Booking.objects.create(
                user=random.choice(customers),
                hall=random.choice(halls),
                date=booking_date,
                start_time=time(hour, 0),
                end_time=time(hour + 1, 0),
                status=random.choice(statuses)
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with 20 halls and 100 bookings!'))