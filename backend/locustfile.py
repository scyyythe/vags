from locust import HttpUser, task, between
import random

class UploadArtUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        login_data = {
            "email": "janahubas@gmail.com",
            "password": "janah12345"
        }

        response = self.client.post("/api/token/", json=login_data)

        if response.status_code == 200:
            self.token = response.json()["access_token"]
            print("✅ Logged in and got token")
        else:
            print(f"❌ Login failed: {response.status_code}, {response.text}")
            self.token = None

    @task
    def upload_artwork(self):
        if not self.token:
            return

        title = f"LoadTest Art #{random.randint(1000, 9999)}"

        try:
            with open("texture-art-painting-31.jpg", "rb") as f:
                files = {
                    "image": ("texture-art-painting-31.jpg", f, "image/jpeg"),
                }
                data = {
                    "title": title,
                    "category": "digital",
                    "medium": "oil",
                    "art_status": "Active",
                    "price": str(random.randint(10, 100)),
                    "size": "10 x 10",
                    "description": "Load test artwork",
                    "visibility": "Public",
                }
                headers = {
                    "Authorization": f"Bearer {self.token}",
                }

                response = self.client.post(
                    "/api/art/create/",
                    files=files,
                    data=data,
                    headers=headers,
                )

                if response.status_code != 201:
                    print(f"❌ Upload failed: {response.status_code}, {response.text}")
                else:
                    print(f"✅ Uploaded artwork: {title}")

        except FileNotFoundError:
            print("❗️ File not found: texture-art-painting-31.jpg")

