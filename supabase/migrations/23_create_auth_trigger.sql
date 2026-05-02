-- 23_create_auth_trigger.sql
-- สร้าง Trigger ที่ผูก handle_new_user() เข้ากับ auth.users
-- รันใน Supabase SQL Editor (ไม่ใช่ Migration เพราะต้องการสิทธิ์พิเศษ)

-- Step 1: ลบ Trigger เก่าถ้ามี (ป้องกัน Duplicate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: สร้าง Trigger ใหม่
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ตรวจสอบว่า Trigger ถูกสร้างแล้ว
SELECT trigger_name, event_manipulation, event_object_schema, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
