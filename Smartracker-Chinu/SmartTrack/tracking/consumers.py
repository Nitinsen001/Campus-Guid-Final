import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.utils import timezone
from .models import Faculty, TimeTable
from .ml_engine.predictor import predict_next_location

class FacultyStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        # Start a background task to push updates every 60 seconds
        self.keep_running = True
        self.update_task = asyncio.create_task(self.push_updates())

    async def disconnect(self, close_code):
        self.keep_running = False
        if hasattr(self, 'update_task'):
            self.update_task.cancel()

    async def push_updates(self):
        while self.keep_running:
            data = await self.get_faculty_data()
            await self.send(text_data=json.dumps(data))
            await asyncio.sleep(60)

    @sync_to_async
    def get_faculty_data(self):
        now = timezone.localtime()
        current_day = now.weekday()
        current_time = now.time()

        faculties = Faculty.objects.all()
        result = []

        for faculty in faculties:
            # 1. Override Check
            if faculty.manual_override_active:
                location = faculty.manual_location
                is_in_class = False # Assuming override means not in a formal scheduled class
                is_predicted = False
                
            else:
                # 2. Schedule Check
                active_class = TimeTable.objects.filter(
                    faculty=faculty,
                    day_of_week=current_day,
                    start_time__lte=current_time,
                    end_time__gte=current_time
                ).first()

                if active_class:
                    location = active_class.room_number
                    is_in_class = True
                    is_predicted = False
                else:
                    # 3. ML Prediction Fallback
                    location = predict_next_location(faculty.id, now)
                    is_in_class = False
                    is_predicted = "Predicted" in location

            result.append({
                'id': faculty.id,
                'name': faculty.name,
                'department': faculty.department,
                'designation': faculty.designation,
                'current_location': location,
                'is_in_class': is_in_class,
                'is_overridden': faculty.manual_override_active,
                'is_predicted': is_predicted
            })
            
        return result
