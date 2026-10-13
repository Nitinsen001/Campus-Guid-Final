"""
SmartTrack — Demo Data Seeder
Run: python manage.py seed_demo_data
Seeds 8 realistic faculty members with full timetables for JIT Borawan.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from tracking.models import Faculty, TimeTable
import datetime


FACULTY_DATA = [
    {
        "name": "Dr. Rajesh Kumar Sharma",
        "designation": "Professor & HOD",
        "department": "Computer Science & Engineering",
        "qualification": "Ph.D. (Computer Science), M.Tech (CSE)",
        "specialization": "Machine Learning, Data Structures",
        "cabin_number": "HOD-CSE",
        "contact": "9876543210",
        "bio": "15+ years of teaching experience. Expert in AI/ML and algorithm design.",
    },
    {
        "name": "Dr. Priya Verma",
        "designation": "Associate Professor",
        "department": "Computer Science & Engineering",
        "qualification": "Ph.D. (AI), M.Tech (CSE)",
        "specialization": "Artificial Intelligence, Deep Learning",
        "cabin_number": "C-201",
        "contact": "9876543211",
        "bio": "Researcher in Deep Learning with 10+ publications in international journals.",
    },
    {
        "name": "Prof. Amit Singh",
        "designation": "Assistant Professor",
        "department": "Electronics & Communication",
        "qualification": "M.Tech (ECE), B.E. (Electronics)",
        "specialization": "VLSI Design, Embedded Systems",
        "cabin_number": "C-205",
        "contact": "9876543212",
        "bio": "Specialist in embedded system design and IoT applications.",
    },
    {
        "name": "Dr. Sunita Patel",
        "designation": "Associate Professor",
        "department": "Mechanical Engineering",
        "qualification": "Ph.D. (Thermal Engineering), M.E.",
        "specialization": "Thermodynamics, Fluid Mechanics",
        "cabin_number": "C-301",
        "contact": "9876543213",
        "bio": "Expert in thermal engineering with focus on renewable energy systems.",
    },
    {
        "name": "Prof. Vikram Joshi",
        "designation": "Assistant Professor",
        "department": "Computer Science & Engineering",
        "qualification": "M.Tech (Software Engineering)",
        "specialization": "Web Technologies, Database Systems",
        "cabin_number": "C-202",
        "contact": "9876543214",
        "bio": "Full-stack developer turned academician with industry experience at TCS.",
    },
    {
        "name": "Dr. Meena Gupta",
        "designation": "Professor",
        "department": "Mathematics",
        "qualification": "Ph.D. (Mathematics), M.Sc.",
        "specialization": "Discrete Mathematics, Statistics",
        "cabin_number": "C-401",
        "contact": "9876543215",
        "bio": "20+ years of teaching engineering mathematics at undergraduate level.",
    },
    {
        "name": "Prof. Rohit Malhotra",
        "designation": "Assistant Professor",
        "department": "Electronics & Communication",
        "qualification": "M.Tech (Signal Processing)",
        "specialization": "Digital Signal Processing, Communication Systems",
        "cabin_number": "C-206",
        "contact": "9876543216",
        "bio": "Passionate educator with focus on practical lab-based learning.",
    },
    {
        "name": "Dr. Anjali Dubey",
        "designation": "Associate Professor",
        "department": "Civil Engineering",
        "qualification": "Ph.D. (Structural Engineering), M.E.",
        "specialization": "Structural Analysis, Construction Management",
        "cabin_number": "C-501",
        "contact": "9876543217",
        "bio": "Consultant for multiple bridge and infrastructure projects in MP.",
    },
]

# Timetable: (day, start_h, start_m, end_h, end_m, room, subject, course, year, semester, branch)
TIMETABLE_DATA = {
    "Dr. Rajesh Kumar Sharma": [
        (0, 9, 0, 10, 0, "101", "Data Structures", "B.E.", "2nd", "3rd", "CSE"),
        (0, 11, 0, 12, 0, "Lab-CS1", "DS Lab", "B.E.", "2nd", "3rd", "CSE"),
        (1, 9, 0, 10, 0, "101", "Machine Learning", "B.E.", "4th", "7th", "CSE"),
        (1, 14, 0, 15, 0, "Seminar Hall", "Research Methodology", "M.Tech", "1st", "1st", "CSE"),
        (2, 10, 0, 11, 0, "101", "Data Structures", "B.E.", "2nd", "3rd", "CSE"),
        (2, 14, 0, 16, 0, "HOD-CSE", "HOD Meeting", "Staff", "", "", "CSE"),
        (3, 9, 0, 10, 0, "101", "Machine Learning", "B.E.", "4th", "7th", "CSE"),
        (3, 11, 0, 12, 0, "Lab-ML", "ML Lab", "B.E.", "4th", "7th", "CSE"),
        (4, 10, 0, 11, 0, "101", "Algorithm Design", "B.E.", "3rd", "5th", "CSE"),
        (4, 14, 0, 15, 0, "HOD-CSE", "Student Counseling", "Staff", "", "", "CSE"),
        # Saturday slots — added afternoon (13:30-15:30) for demo visibility
        # rooms match COLLEGE_TO_GLB keys exactly
        (5, 9, 0, 11, 0, "Seminar Hall", "Workshop / FDP", "Staff", "", "", "CSE"),
        (5, 13, 30, 15, 30, "101", "Data Structures — Extra Class", "B.E.", "2nd", "3rd", "CSE"),
    ],
    "Dr. Priya Verma": [
        (0, 10, 0, 11, 0, "102", "Artificial Intelligence", "B.E.", "4th", "7th", "CSE"),
        (0, 14, 0, 15, 0, "Lab-AI", "AI Lab", "B.E.", "4th", "7th", "CSE"),
        (1, 10, 0, 11, 0, "102", "Neural Networks", "M.Tech", "1st", "1st", "CSE"),
        (1, 11, 0, 12, 0, "C-201", "Research Guidance", "M.Tech", "2nd", "3rd", "CSE"),
        (2, 9, 0, 10, 0, "102", "Artificial Intelligence", "B.E.", "4th", "7th", "CSE"),
        (2, 11, 0, 12, 0, "102", "Deep Learning", "B.E.", "4th", "8th", "CSE"),
        (3, 10, 0, 11, 0, "Lab-AI", "Deep Learning Lab", "B.E.", "4th", "8th", "CSE"),
        (3, 14, 0, 15, 0, "C-201", "Project Guidance", "B.E.", "4th", "8th", "CSE"),
        (4, 9, 0, 10, 0, "102", "Neural Networks", "M.Tech", "1st", "1st", "CSE"),
        (4, 11, 0, 13, 0, "Lab-AI", "AI Lab", "B.E.", "4th", "7th", "CSE"),
        (5, 9, 0, 10, 0, "102", "Artificial Intelligence", "B.E.", "4th", "7th", "CSE"),
        (5, 14, 0, 15, 30, "Lab-AI", "AI Lab — Practical", "B.E.", "4th", "7th", "CSE"),
    ],
    "Prof. Amit Singh": [
        (0, 9, 0, 10, 0, "201", "VLSI Design", "B.E.", "4th", "7th", "ECE"),
        (0, 11, 0, 13, 0, "Lab-ECE1", "Electronics Lab", "B.E.", "2nd", "3rd", "ECE"),
        (1, 9, 0, 10, 0, "201", "Embedded Systems", "B.E.", "3rd", "5th", "ECE"),
        (1, 14, 0, 15, 0, "Lab-ECE2", "Embedded Lab", "B.E.", "3rd", "5th", "ECE"),
        (2, 10, 0, 11, 0, "201", "VLSI Design", "B.E.", "4th", "7th", "ECE"),
        (2, 14, 0, 15, 0, "201", "IoT Applications", "B.E.", "3rd", "5th", "ECE"),
        (3, 9, 0, 10, 0, "201", "Embedded Systems", "B.E.", "3rd", "5th", "ECE"),
        (3, 11, 0, 13, 0, "Lab-ECE1", "VLSI Lab", "B.E.", "4th", "7th", "ECE"),
        (4, 10, 0, 11, 0, "201", "IoT Applications", "B.E.", "3rd", "5th", "ECE"),
        (5, 9, 0, 11, 0, "Lab-ECE2", "General Lab", "B.E.", "2nd", "3rd", "ECE"),
        (5, 13, 30, 15, 0, "C-205", "Student Mentoring", "B.E.", "3rd", "5th", "ECE"),
    ],
    "Dr. Sunita Patel": [
        (0, 9, 0, 10, 0, "301", "Thermodynamics", "B.E.", "2nd", "3rd", "ME"),
        (0, 11, 0, 12, 0, "301", "Fluid Mechanics", "B.E.", "3rd", "5th", "ME"),
        (1, 10, 0, 11, 0, "Lab-ME1", "Thermal Lab", "B.E.", "2nd", "3rd", "ME"),
        (1, 14, 0, 15, 0, "301", "Heat Transfer", "B.E.", "3rd", "6th", "ME"),
        (2, 9, 0, 10, 0, "301", "Thermodynamics", "B.E.", "2nd", "3rd", "ME"),
        (2, 11, 0, 12, 0, "301", "Renewable Energy", "B.E.", "4th", "7th", "ME"),
        (3, 10, 0, 12, 0, "Lab-ME2", "Fluid Lab", "B.E.", "3rd", "5th", "ME"),
        (4, 9, 0, 10, 0, "301", "Heat Transfer", "B.E.", "3rd", "6th", "ME"),
        (4, 11, 0, 12, 0, "301", "Renewable Energy", "B.E.", "4th", "7th", "ME"),
        (5, 10, 0, 12, 0, "Lab-ME1", "Thermal Lab", "B.E.", "2nd", "3rd", "ME"),
        (5, 13, 30, 15, 30, "301", "Thermodynamics — Revision", "B.E.", "2nd", "3rd", "ME"),
    ],
    "Prof. Vikram Joshi": [
        (0, 10, 0, 11, 0, "103", "Web Technologies", "B.E.", "3rd", "5th", "CSE"),
        (0, 14, 0, 15, 0, "Lab-CS2", "Web Dev Lab", "B.E.", "3rd", "5th", "CSE"),
        (1, 9, 0, 10, 0, "103", "Database Management", "B.E.", "2nd", "4th", "CSE"),
        (1, 11, 0, 12, 0, "103", "Software Engineering", "B.E.", "3rd", "5th", "CSE"),
        (2, 10, 0, 11, 0, "Lab-CS2", "DBMS Lab", "B.E.", "2nd", "4th", "CSE"),
        (2, 14, 0, 15, 0, "103", "Web Technologies", "B.E.", "3rd", "5th", "CSE"),
        (3, 9, 0, 10, 0, "103", "Database Management", "B.E.", "2nd", "4th", "CSE"),
        (3, 11, 0, 13, 0, "Lab-CS2", "Web Dev Lab", "B.E.", "3rd", "5th", "CSE"),
        (4, 10, 0, 11, 0, "103", "Software Engineering", "B.E.", "3rd", "5th", "CSE"),
        (4, 14, 0, 15, 0, "C-202", "Project Mentoring", "B.E.", "4th", "8th", "CSE"),
        (5, 9, 0, 11, 0, "Lab-CS1", "Open Lab", "B.E.", "", "", "CSE"),
        (5, 14, 0, 15, 30, "103", "DBMS — Extra Class", "B.E.", "2nd", "4th", "CSE"),
    ],
    "Dr. Meena Gupta": [
        (0, 8, 0, 9, 0, "401", "Engineering Mathematics III", "B.E.", "2nd", "3rd", "CSE"),
        (0, 9, 0, 10, 0, "401", "Engineering Mathematics III", "B.E.", "2nd", "3rd", "ECE"),
        (0, 11, 0, 12, 0, "401", "Statistics & Probability", "B.E.", "3rd", "5th", "CSE"),
        (1, 8, 0, 9, 0, "401", "Discrete Mathematics", "B.E.", "2nd", "3rd", "CSE"),
        (1, 10, 0, 11, 0, "401", "Numerical Methods", "B.E.", "3rd", "5th", "ME"),
        (2, 8, 0, 9, 0, "401", "Engineering Mathematics III", "B.E.", "2nd", "3rd", "ME"),
        (2, 9, 0, 10, 0, "401", "Discrete Mathematics", "B.E.", "2nd", "3rd", "CSE"),
        (3, 8, 0, 9, 0, "401", "Statistics & Probability", "B.E.", "3rd", "5th", "ECE"),
        (3, 10, 0, 11, 0, "401", "Numerical Methods", "B.E.", "3rd", "5th", "ME"),
        (4, 8, 0, 9, 0, "401", "Engineering Mathematics III", "B.E.", "2nd", "3rd", "CSE"),
        (4, 9, 0, 10, 0, "401", "Discrete Mathematics", "B.E.", "2nd", "3rd", "ECE"),
        (5, 8, 0, 10, 0, "401", "Remedial Classes", "B.E.", "", "", "All"),
        (5, 14, 0, 15, 30, "401", "Maths — Doubt Session", "B.E.", "", "", "All"),
    ],
    "Prof. Rohit Malhotra": [
        (0, 10, 0, 11, 0, "202", "Digital Signal Processing", "B.E.", "4th", "7th", "ECE"),
        (0, 14, 0, 16, 0, "Lab-ECE3", "DSP Lab", "B.E.", "4th", "7th", "ECE"),
        (1, 10, 0, 11, 0, "202", "Communication Systems", "B.E.", "3rd", "6th", "ECE"),
        (1, 14, 0, 15, 0, "202", "Antenna & Wave Propagation", "B.E.", "4th", "7th", "ECE"),
        (2, 10, 0, 11, 0, "202", "Digital Signal Processing", "B.E.", "4th", "7th", "ECE"),
        (2, 11, 0, 13, 0, "Lab-ECE3", "Communication Lab", "B.E.", "3rd", "6th", "ECE"),
        (3, 10, 0, 11, 0, "202", "Communication Systems", "B.E.", "3rd", "6th", "ECE"),
        (3, 14, 0, 15, 0, "Lab-ECE4", "Microwave Lab", "B.E.", "4th", "7th", "ECE"),
        (4, 10, 0, 11, 0, "202", "Antenna & Wave Propagation", "B.E.", "4th", "7th", "ECE"),
        (4, 14, 0, 16, 0, "Lab-ECE3", "DSP Lab", "B.E.", "4th", "7th", "ECE"),
        (5, 9, 0, 11, 0, "Lab-ECE4", "General Lab", "B.E.", "3rd", "6th", "ECE"),
        (5, 14, 0, 15, 30, "202", "DSP — Revision", "B.E.", "4th", "7th", "ECE"),
    ],
    "Dr. Anjali Dubey": [
        (0, 9, 0, 10, 0, "501", "Structural Analysis", "B.E.", "3rd", "5th", "CE"),
        (0, 11, 0, 13, 0, "Lab-CE1", "Concrete Lab", "B.E.", "2nd", "4th", "CE"),
        (1, 9, 0, 10, 0, "501", "Construction Management", "B.E.", "4th", "7th", "CE"),
        (1, 11, 0, 12, 0, "501", "RCC Design", "B.E.", "4th", "8th", "CE"),
        (2, 9, 0, 10, 0, "501", "Structural Analysis", "B.E.", "3rd", "5th", "CE"),
        (2, 14, 0, 16, 0, "Lab-CE2", "Structural Lab", "B.E.", "3rd", "5th", "CE"),
        (3, 9, 0, 10, 0, "501", "RCC Design", "B.E.", "4th", "8th", "CE"),
        (3, 11, 0, 12, 0, "501", "Construction Management", "B.E.", "4th", "7th", "CE"),
        (4, 9, 0, 10, 0, "501", "Structural Analysis", "B.E.", "3rd", "5th", "CE"),
        (4, 11, 0, 13, 0, "Lab-CE1", "Concrete Lab", "B.E.", "2nd", "4th", "CE"),
        (5, 9, 0, 11, 0, "Lab-CE2", "Site Visit / Practical", "B.E.", "4th", "7th", "CE"),
        (5, 14, 0, 15, 30, "501", "Structural Analysis — Revision", "B.E.", "3rd", "5th", "CE"),
    ],
}


class Command(BaseCommand):
    help = "Seeds realistic demo faculty data for SmartTrack — JIT Borawan"

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing faculty and timetable data before seeding',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("=" * 60))
        self.stdout.write(self.style.WARNING("  SmartTrack — Demo Data Seeder"))
        self.stdout.write(self.style.WARNING("  JIT Borawan Faculty Database"))
        self.stdout.write(self.style.WARNING("=" * 60))

        if options['clear']:
            self.stdout.write("\n🗑️  Clearing existing data...")
            TimeTable.objects.all().delete()
            Faculty.objects.all().delete()
            self.stdout.write(self.style.WARNING("   All faculty and timetable data cleared.\n"))

        # Create superuser if not exists
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@jitborawan.ac.in', 'admin123')
            self.stdout.write(self.style.SUCCESS("✅ Superuser created: admin / admin123"))
        else:
            self.stdout.write("ℹ️  Superuser 'admin' already exists.")

        # Seed faculty
        self.stdout.write("\n📋 Seeding faculty members...")
        created_count = 0
        skipped_count = 0

        for fd in FACULTY_DATA:
            faculty, created = Faculty.objects.get_or_create(
                name=fd["name"],
                defaults={
                    "designation": fd["designation"],
                    "department": fd["department"],
                    "qualification": fd["qualification"],
                    "specialization": fd["specialization"],
                    "cabin_number": fd["cabin_number"],
                    "default_cabin": fd["cabin_number"],
                    "contact": fd["contact"],
                    "bio": fd["bio"],
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f"   ➕ {faculty.name} ({faculty.department})")
            else:
                skipped_count += 1
                self.stdout.write(f"   ⏭️  {faculty.name} already exists (skipped)")

        self.stdout.write(
            self.style.SUCCESS(f"\n✅ Faculty: {created_count} created, {skipped_count} skipped")
        )

        # Seed timetables
        self.stdout.write("\n📅 Seeding timetable data...")
        tt_created = 0
        tt_skipped = 0
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

        for faculty_name, slots in TIMETABLE_DATA.items():
            try:
                faculty = Faculty.objects.get(name=faculty_name)
            except Faculty.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"   ❌ Faculty not found: {faculty_name}"))
                continue

            for slot in slots:
                day, sh, sm, eh, em, room, subject, course, year, sem, branch = slot
                start = datetime.time(sh, sm)
                end = datetime.time(eh, em)

                # Check for overlap
                overlap = TimeTable.objects.filter(
                    faculty=faculty,
                    day_of_week=day,
                    start_time__lt=end,
                    end_time__gt=start,
                ).exists()

                if overlap:
                    tt_skipped += 1
                    continue

                TimeTable.objects.create(
                    faculty=faculty,
                    day_of_week=day,
                    start_time=start,
                    end_time=end,
                    room_number=room,
                    subject=subject,
                    course=course,
                    year=year,
                    semester=sem,
                    branch=branch,
                )
                tt_created += 1

        self.stdout.write(
            self.style.SUCCESS(f"✅ Timetable: {tt_created} entries created, {tt_skipped} skipped")
        )

        # Summary
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS("🎉 Demo data seeded successfully!"))
        self.stdout.write(f"   Total Faculty: {Faculty.objects.count()}")
        self.stdout.write(f"   Total Timetable Entries: {TimeTable.objects.count()}")
        self.stdout.write("\n📌 Login Credentials:")
        self.stdout.write("   Admin Panel: http://127.0.0.1:8000/admin-panel/")
        self.stdout.write("   Username: admin")
        self.stdout.write("   Password: admin123")
        self.stdout.write("=" * 60 + "\n")
