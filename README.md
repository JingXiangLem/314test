# Landing Page

## Setup
   docker run -d \
  --name mockfyp_mysql \
  -e MYSQL_ROOT_PASSWORD=mockfyp \
  -e MYSQL_DATABASE=mockfyp_db \
  -e MYSQL_USER=mockfyp_user \
  -e MYSQL_PASSWORD=mockfyp \
  -p 3306:3306 \
  mysql:8.0
**Connection String Format:**
```
docker exec -it mockfyp_mysql mysql -u mockfyp_user -p mockfyp_db -e "SHOW DATABASES;"
```

✅ **Database setup complete!**

---
### Backend
```bash
cd 314/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
docker start mockfyp_mysql
python run.py
flask run
```

### Frontend
Using a split terminal
```bash
cd 314/frontend
npm install
npm run dev
```

### How to edit the code
For frontend design, most of the codes can be found in App.jsx
