import json
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from tracking.models import Faculty, TimeTable
import datetime

class Command(BaseCommand):
    help = "Imports faculty timetable data from a JSON file"

    def add_arguments(self, parser):
        parser.add_argument(
            "json_file",
            nargs="?",
            type=Path,
            default=Path(settings.BASE_DIR.parent) / "Faculty data.json",
            help="JSON file to import (defaults to Faculty data.json beside SmartTrack)",
        )

    def handle(self, *args, json_file, **options):
        if not json_file.is_file():
            raise CommandError(f"JSON file not found: {json_file}")

        self.stdout.write("Clearing existing Faculty and TimeTable data...")
        TimeTable.objects.all().delete()
        Faculty.objects.all().delete()

        with json_file.open(encoding='utf-8') as f:
            data = json.load(f)

        day_map = {
            "Monday": 0,
            "Tuesday": 1,
            "Wednesday": 2,
            "Thursday": 3,
            "Friday": 4,
            "Saturday": 5,
            "Sunday": 6
        }

        created_faculty = {}
        timetable_count = 0

        for item in data:
            faculty_name = item.get("faculty", "").strip()
            if not faculty_name:
                continue
                
            # Create or get faculty
            if faculty_name not in created_faculty:
                fac = Faculty.objects.create(name=faculty_name)
                created_faculty[faculty_name] = fac
            
            fac = created_faculty[faculty_name]
            
            day_str = item.get("day", "").strip()
            day_num = day_map.get(day_str, 0)
            
            start_str = item.get("start_time", "").strip()
            end_str = item.get("end_time", "").strip()
            
            # Simple hours/minutes parser
            if start_str and end_str:
                try:
                    sh, sm = map(int, start_str.split(':'))
                    eh, em = map(int, end_str.split(':'))
                    start_time = datetime.time(sh, sm)
                    end_time = datetime.time(eh, em)
                    
                    TimeTable.objects.create(
                        faculty=fac,
                        day_of_week=day_num,
                        start_time=start_time,
                        end_time=end_time,
                        room_number=item.get("room", "").strip(),
                        subject=item.get("subject", "").strip()
                    )
                    timetable_count += 1
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Could not parse time for {faculty_name}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"Successfully imported {len(created_faculty)} faculty members and {timetable_count} timetable entries."))
