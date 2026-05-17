## Setup Backend
cd backend
python -m venv venv
venv/Scrips/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver

## Setup Frontend
cd frontend
npm install
npm run dev


test`