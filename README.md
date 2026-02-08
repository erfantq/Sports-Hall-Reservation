## Setup Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

## Setup Frontend
cd frontend
npm install
npm run dev
