-- # 21_bulletproof_handle_new_user.sql
-- ═══════════════════════════════════════════════════════════════════════
-- 🛡️ BULLETPROOF Trigger: handle_new_user
-- ═══════════════════════════════════════════════════════════════════════
-- 
-- ปัญหาที่เจอ (Production Error):
--   "Database error saving new user" เมื่อ Google OAuth login
--
-- สาเหตุ:
--   1. Admin สร้าง profile ไว้ก่อน (username = 'mongkol54211', email = 'mongkol54211@gmail.com')
--   2. พนักงานกด Google Login → auth.users สร้าง user ใหม่ (UUID-B)
--   3. Trigger พยายาม INSERT username เดิม → UNIQUE violation → ทั้ง auth.users ก็ fail!
--
-- แก้ 3 กรณี:
--   Case A: มี profile email ตรงกัน → Relink ID (ย้าย auth ID ไปใช้ profile เดิม)
--   Case B: ไม่มี email ตรง แต่ username ซ้ำ → Auto-suffix (_2, _3, ...)
--   Case C: ไม่ซ้ำอะไร → INSERT ปกติ
--
-- ⚠️ IMPORTANT: ต้องรันที่ Supabase SQL Editor!
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    _existing_profile_id UUID;
    _base_username TEXT;
    _final_username TEXT;
    _counter INT := 0;
BEGIN
    -- ═══════════════════════════════════════════════════════════════
    -- CASE A: เช็คว่ามี profile ที่ email ตรงกันอยู่แล้วไหม (Admin สร้างไว้)
    -- ═══════════════════════════════════════════════════════════════
    SELECT id INTO _existing_profile_id
    FROM public.profiles
    WHERE email = new.email
    LIMIT 1;

    IF _existing_profile_id IS NOT NULL THEN
        -- 🔗 Relink: เปลี่ยน ID ให้ตรงกับ auth user ใหม่
        -- ก่อน update ต้อง unlink FK references (monthly_submissions, daily_logs, etc.)
        
        -- Step 1: อัปเดต FK references ทั้งหมดที่ชี้ไปหา old profile ID
        UPDATE public.daily_logs SET staff_id = new.id WHERE staff_id = _existing_profile_id;
        UPDATE public.monthly_submissions SET staff_id = new.id WHERE staff_id = _existing_profile_id;
        UPDATE public.monthly_submissions SET reviewed_by = new.id WHERE reviewed_by = _existing_profile_id;
        UPDATE public.facebook_pages SET owner_id = new.id WHERE owner_id = _existing_profile_id;
        UPDATE public.facebook_accounts SET owner_id = new.id WHERE owner_id = _existing_profile_id;
        
        -- Step 2: อัปเดต profile ID + avatar
        UPDATE public.profiles 
        SET 
            id = new.id,
            avatar_url = COALESCE(
                new.raw_user_meta_data->>'avatar_url', 
                new.raw_user_meta_data->>'picture',
                avatar_url  -- เก็บรูปเดิมถ้า Google ไม่มี
            ),
            updated_at = NOW()
        WHERE id = _existing_profile_id;
        
        RAISE LOG '[handle_new_user] ✅ Relinked profile % → % for email %', 
            _existing_profile_id, new.id, new.email;
        RETURN new;
    END IF;

    -- ═══════════════════════════════════════════════════════════════
    -- CASE B & C: ไม่มี profile email ตรง → สร้างใหม่
    -- ═══════════════════════════════════════════════════════════════
    _base_username := COALESCE(
        new.raw_user_meta_data->>'username', 
        split_part(new.email, '@', 1)
    );
    _final_username := _base_username;

    -- 🛡️ CASE B: ถ้า username ซ้ำ → ต่อ suffix _2, _3, _4 ...
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = _final_username) LOOP
        _counter := _counter + 1;
        _final_username := _base_username || '_' || _counter;
        
        -- Safety: ป้องกัน infinite loop
        IF _counter > 100 THEN
            _final_username := _base_username || '_' || extract(epoch from now())::int;
            EXIT;
        END IF;
    END LOOP;

    -- CASE C: INSERT ปกติ (username unique แล้ว)
    INSERT INTO public.profiles (id, name, username, email, role, is_active, avatar_url)
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'New Staff'), 
        _final_username,
        new.email,
        COALESCE(new.raw_user_meta_data->>'role', 'Staff'),
        false,
        COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
    )
    ON CONFLICT (id) DO UPDATE SET
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        email = COALESCE(EXCLUDED.email, public.profiles.email),
        updated_at = NOW();

    RAISE LOG '[handle_new_user] ✅ Created new profile for % (username: %)', new.email, _final_username;
    RETURN new;

EXCEPTION WHEN OTHERS THEN
    -- 🛡️ SAFETY NET: ถ้า trigger ล้มเหลว ห้ามให้ auth.users INSERT ล้มเหลวด้วย!
    -- บันทึก error แล้ว return new เพื่อให้ user สร้างได้ (profile จะสร้างทีหลัง)
    RAISE LOG '[handle_new_user] ❌ Error: %, SQLSTATE: %. Allowing auth user creation anyway.', SQLERRM, SQLSTATE;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
