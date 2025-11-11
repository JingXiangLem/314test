# Landing Page

## Setup
### Step 1: MySQL Database Setup

#### 1.1 Start MySQL Service

**Verify MySQL is Running:**
```bash
# Open Services Manager
# Press Windows + R
# Type: services.msc
# Press Enter

# Find: MySQL80
# Status should be: Running
# If not, right-click → Start
```

#### 1.2 Database Setup (MySQL Workbench - Recommended)

**1. Open MySQL Workbench**
- Launch from Start Menu
- Look for "MySQL Workbench 8.0"

**2. Connect to Local MySQL**
- Click on "Local instance MySQL80"
- Enter root password (set during MySQL installation)
- Click "OK"

**3. Open SQL Editor**
- You're now in the main interface
- Click "Create a new SQL tab" (icon looks like: 📄)
- Or press: `Ctrl+T`

**4. Execute Database Setup Script**

Copy and paste this entire script:

```sql
-- Create database with UTF-8 support
CREATE DATABASE mockfyp_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create dedicated user for MockFYP
CREATE USER 'mockfyp_user'@'localhost' IDENTIFIED BY 'mockfyp';

-- Grant all privileges on mockfyp_db
GRANT ALL PRIVILEGES ON mockfyp_db.* TO 'mockfyp_user'@'localhost';

-- Grant specific global privileges needed
GRANT PROCESS ON *.* TO 'mockfyp_user'@'localhost';

-- Apply privilege changes
FLUSH PRIVILEGES;

-- Verify database creation
SHOW DATABASES LIKE 'mockfyp%';

-- Verify user creation
SELECT user, host FROM mysql.user WHERE user = 'mockfyp_user';
```

**5. Run the Script**
- Click lightning bolt icon (⚡)
- Or press: `Ctrl+Shift+Enter`
- Or click: Query → Execute All Statements

**Expected Output in "Action Output" Panel:**
```
1. CREATE DATABASE mockfyp_db...
   Query OK, 1 row affected

2. CREATE USER 'mockfyp_user'...
   Query OK, 0 rows affected

3. GRANT ALL PRIVILEGES...
   Query OK, 0 rows affected

4. GRANT PROCESS...
   Query OK, 0 rows affected

5. FLUSH PRIVILEGES...
   Query OK, 0 rows affected

6. SHOW DATABASES...
   mockfyp_db

7. SELECT user, host...
   mockfyp_user | localhost
```

**6. Verify Database in Navigator**
- Look at left sidebar ("Navigator" panel)
- Click refresh icon (🔄)
- Expand "SCHEMAS"
- You should see `mockfyp_db`
- Expand it - it will be empty (tables created during seeding)

**7. Test User Connection**
- Click "Database" menu → "Connect to Database"
- Connection Method: Standard (TCP/IP)
- Hostname: localhost
- Port: 3306
- Username: `mockfyp_user`
- Password: `mockfyp`
- Default Schema: mockfyp_db
- Click "Test Connection"
- Should show: "Successfully made the MySQL connection"
- Click "OK" to save

#### 5.3 Alternative: MySQL Command Line

**1. Open MySQL Command Line Client**
- Start Menu → "MySQL 8.0 Command Line Client"
- Enter root password

**2. Execute Commands One by One**

```sql
-- Create database
CREATE DATABASE mockfyp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Press Enter, wait for: Query OK, 1 row affected

-- Create user
CREATE USER 'mockfyp_user'@'localhost' IDENTIFIED BY 'mockfyp';
-- Press Enter, wait for: Query OK, 0 rows affected

-- Grant privileges
GRANT ALL PRIVILEGES ON mockfyp_db.* TO 'mockfyp_user'@'localhost';
-- Press Enter, wait for: Query OK, 0 rows affected

-- Grant process privilege
GRANT PROCESS ON *.* TO 'mockfyp_user'@'localhost';
-- Press Enter, wait for: Query OK, 0 rows affected

-- Apply changes
FLUSH PRIVILEGES;
-- Press Enter, wait for: Query OK, 0 rows affected

-- Verify
SHOW DATABASES LIKE 'mockfyp%';
-- Should show: mockfyp_db

-- Exit
EXIT;
```

#### 1.4 Database Credentials Summary

**Save these credentials - you'll need them!**

| Parameter | Value |
|-----------|-------|
| Database Name | `mockfyp_db` |
| Username | `mockfyp_user` |
| Password | `mockfyp` |
| Host | `localhost` |
| Port | `3306` |
| Character Set | `utf8mb4` |
| Collation | `utf8mb4_unicode_ci` |

**Connection String Format:**
```
mysql+pymysql://mockfyp_user:mockfyp@localhost:3306/mockfyp_db
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
