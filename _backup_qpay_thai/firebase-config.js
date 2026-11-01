/**
 * FIREBASE-CONFIG.JS
 * ระบบจัดการผู้ใช้งานและสิทธิ์การเข้าถึงด้วยรหัส PIN (4-8 หลัก)
 * - ADMIN PIN: 20523 (ผู้ดูแลระบบ สามารถแก้ไขข้อมูลของตนเองและผู้ใช้อื่นได้ทั้งหมด)
 * - รองรับ Multi-User, PIN Login, On-Screen Keypad, User Switcher, และ Firestore Cloud Sync
 */

const STORAGE_KEY_FIREBASE_CFG = 'custom_firebase_config_v1';
const STORAGE_KEY_AUTH_USER = 'salary_auth_current_user_v1';
const STORAGE_KEY_USERS_LIST = 'salary_app_users_v1';
const STORAGE_KEY_ACTIVE_EDITING_USER = 'salary_active_editing_user_id_v1';

// ค่าเริ่มต้นคอนฟิก Firebase (เชื่อมต่อเซิร์ฟเวอร์ caculation-salary อัตโนมัติทุกอุปกรณ์ทั้งคอมและมือถือ)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDCGsmrG1SWZYAK1sLmP1nqFD0t3LMSPbw",
  authDomain: "caculation-salary.firebaseapp.com",
  projectId: "caculation-salary",
  storageBucket: "caculation-salary.firebasestorage.app",
  messagingSenderId: "709685534305",
  appId: "1:709685534305:web:d03e6749ee643a38071420"
};

// ข้อมูลผู้ใช้เริ่มต้นในระบบ (มีเพียง ADMIN หลักคนเดียว)
const DEFAULT_SYSTEM_USERS = [
  {
    id: 'user_admin',
    name: 'JITTRAKAN K.',
    companyName: 'CACULATION SALARY',
    empCode: '20523',
    department: 'PRODUCTION TECHNOLOGY',
    pin: '20523',
    role: 'admin',
    avatar: '👑',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

var firebaseApp = null;
var firebaseAuth = null;
var firebaseDb = null;
var currentUser = null;
var isFirebaseOnline = false;
var activeEditingUserId = 'user_admin';

function getCurrentUser() {
  return currentUser;
}

// Callback แจ้งเตือนเมื่อสถานะผู้ใช้เปลี่ยน
let onAuthStateListeners = [];

function addAuthStateListener(callback) {
  if (typeof callback === 'function') {
    onAuthStateListeners.push(callback);
    callback(currentUser, isFirebaseOnline);
  }
}

function notifyAuthState(user) {
  currentUser = user;
  if (typeof window !== 'undefined') {
    window.currentUser = user;
  }
  if (user) {
    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    // กฎเหล็ก: ถ้าผู้ใช้ไม่ใช่ ADMIN (JITTRAKAN K.) จะต้องบังคับดูเฉพาะข้อมูลตัวเองเท่านั้น
    if (user.role === 'admin' && user.id === 'user_admin') {
      if (!localStorage.getItem(STORAGE_KEY_ACTIVE_EDITING_USER)) {
        setActiveEditingUserId('user_admin');
      }
    } else {
      setActiveEditingUserId(user.id);
    }
  } else {
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    setActiveEditingUserId('user_admin');
  }

  onAuthStateListeners.forEach(cb => {
    try { cb(currentUser, isFirebaseOnline); } catch (err) { console.error('Auth state cb error:', err); }
  });
}

/**
 * ดึงรายชื่อผู้ใช้ทั้งหมดในระบบ (พร้อมระบบล้างบัญชีตกค้าง/ซ้ำซ้อนอัตโนมัติ)
 * กฎความเป็นส่วนตัว: ถ้าผู้ใช้เป็นพนักงานทั่วไป จะสามารถเห็นได้เฉพาะข้อมูลของตนเองเท่านั้น
 */
function getAllSystemUsers(internalBypass = false) {
  if (!internalBypass && currentUser && (currentUser.role !== 'admin' || currentUser.id !== 'user_admin')) {
    return [ currentUser ];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS_LIST);
    if (raw) {
      let parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let modified = false;

        // 1. ลบบัญชีตกค้าง/ซ้ำซ้อน และบัญชีในรูปที่ผู้ใช้แจ้งให้ลบ:
        //    - PIN 09718455 ทั้งหมด
        //    - ชื่อที่มีเครื่องหมายคำพูด ' หรือ " (เช่น 'JITTRAKAN K.)
        //    - บัญชีที่ชื่อ JITTRAKAN K. หรือ PIN 20523 หรือ รหัส 20523 แต่ไม่ใช่ user_admin
        const originalCount = parsed.length;
        parsed = parsed.filter(u => {
          if (!u) return false;
          const uPin = String(u.pin || '').trim();
          const uName = String(u.name || '').trim();
          const uCode = String(u.empCode || '').trim();

          // ลบทุกบัญชีที่มี PIN 09718455
          if (uPin === '09718455') return false;

          // ลบทุกบัญชีที่มีเครื่องหมายคำพูดในชื่อ เช่น 'JITTRAKAN K.
          if (uName.startsWith("'") || uName.startsWith('"') || uName.includes("'JITTRAKAN")) return false;

          // ลบทุกบัญชีซ้ำซ้อนของ JITTRAKAN K. หรือ PIN 20523 หรือรหัส 20523 ที่ไม่ใช่ user_admin
          if (u.id !== 'user_admin' && (uName.toUpperCase() === 'JITTRAKAN K.' || uPin === '20523' || uCode === '20523')) {
            return false;
          }

          return true;
        });

        if (parsed.length !== originalCount) {
          modified = true;
        }

        // 2. ตรวจสอบและสร้าง/อัปเดต Master Admin เพียงหนึ่งเดียว
        let adminUser = parsed.find(u => u.id === 'user_admin');
        if (!adminUser) {
          adminUser = { ...DEFAULT_SYSTEM_USERS[0] };
          parsed.unshift(adminUser);
          modified = true;
        }

        // บังคับสิทธิ์ Admin สูงสุด และรักษาค่าที่ผู้ใช้แก้ไขล่าสุดไว้ (ไม่เขียนทับค่าที่บันทึกไว้)
        adminUser.id = 'user_admin';
        adminUser.role = 'admin';
        adminUser.avatar = '👑';
        if (!adminUser.name || !String(adminUser.name).trim()) {
          adminUser.name = 'JITTRAKAN K.';
          modified = true;
        }
        if (!adminUser.companyName || !String(adminUser.companyName).trim()) {
          adminUser.companyName = 'CACULATION SALARY';
          modified = true;
        }
        if (!adminUser.empCode || !String(adminUser.empCode).trim()) {
          adminUser.empCode = '20523';
          modified = true;
        }
        if (!adminUser.department || !String(adminUser.department).trim()) {
          adminUser.department = 'PRODUCTION TECHNOLOGY';
          modified = true;
        }
        if (!adminUser.pin || !String(adminUser.pin).trim()) {
          adminUser.pin = '20523';
          modified = true;
        }

        // 3. กรองบัญชีที่มี ID หรือ PIN ซ้ำกันออก
        const seenIds = new Set();
        const seenPins = new Set();
        const adminPin = String(adminUser.pin || '').trim();
        if (adminPin) seenPins.add(adminPin); // จอง PIN ของ Admin ไว้
        const cleanList = [adminUser];
        seenIds.add('user_admin');

        for (const u of parsed) {
          if (u.id === 'user_admin') continue;
          const pinKey = String(u.pin || '').trim();
          if (!seenIds.has(u.id) && !seenPins.has(pinKey)) {
            seenIds.add(u.id);
            seenPins.add(pinKey);
            cleanList.push(u);
          } else {
            modified = true;
          }
        }
        parsed = cleanList;

        // 4. บัญชีที่เหลือทั้งหมด (ถ้ามี) บังคับเป็น role = 'user'
        parsed.forEach(u => {
          if (u.id !== 'user_admin') {
            if (u.role !== 'user') {
              u.role = 'user';
              u.avatar = '👤';
              modified = true;
            }
          }
          if (!u.companyName) {
            u.companyName = 'CACULATION SALARY';
            modified = true;
          } else {
            u.companyName = u.companyName.toUpperCase();
          }
          if (!u.empCode) {
            u.empCode = (u.id === 'user_admin' ? (adminUser.empCode || '20523') : ('EMP-' + (u.pin || '001'))).toUpperCase();
            modified = true;
          } else {
            u.empCode = u.empCode.toUpperCase();
          }
          if (u.bankAccount) {
            delete u.bankAccount;
            modified = true;
          }
        });

        if (modified) {
          saveSystemUsers(parsed);
        }

        // ตรวจสอบและแก้ไข auth user ใน LocalStorage ถ้าค้างข้อมูลผิดอยู่
        const currentAuthRaw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
        if (currentAuthRaw) {
          try {
            const authObj = JSON.parse(currentAuthRaw);
            if (authObj) {
              if (String(authObj.pin).trim() === '09718455' || authObj.name?.includes("'")) {
                localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(adminUser));
                currentUser = adminUser;
              } else if (authObj.id === 'user_admin') {
                // ซิงก์ข้อมูลอัปเดตล่าสุดของ adminUser
                localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(adminUser));
                if (currentUser && currentUser.id === 'user_admin') {
                  currentUser = adminUser;
                }
              }
            }
          } catch(e) {}
        }

        return parsed;
      }
    }
  } catch (e) {
    console.warn('Cannot parse system users, seeding defaults', e);
  }

  // ถ้ายังไม่มี ให้บันทึกชุดเริ่มต้น
  saveSystemUsers(DEFAULT_SYSTEM_USERS);
  return DEFAULT_SYSTEM_USERS;
}

/**
 * ล้างรายชื่อพนักงานทั้งหมด เหลือไว้เฉพาะ ADMIN หลัก
 */
function clearAllStaffUsers() {
  const allCurrent = getAllSystemUsers(true);
  const currentAdmin = allCurrent.find(u => u.id === 'user_admin') || DEFAULT_SYSTEM_USERS[0];
  const adminUser = {
    id: 'user_admin',
    name: currentAdmin.name || 'JITTRAKAN K.',
    companyName: currentAdmin.companyName || 'CACULATION SALARY',
    empCode: currentAdmin.empCode || '20523',
    department: currentAdmin.department || 'PRODUCTION TECHNOLOGY',
    pin: currentAdmin.pin || '20523',
    role: 'admin',
    avatar: '👑',
    createdAt: currentAdmin.createdAt || '2026-01-01T00:00:00.000Z'
  };
  const list = [adminUser];
  saveSystemUsers(list);
  setActiveEditingUserId('user_admin');
  return { success: true, count: 1, users: list };
}

/**
 * บันทึกรายชื่อผู้ใช้ทั้งหมด
 */
function saveSystemUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(users));
    if (isFirebaseOnline && firebaseDb) {
      firebaseDb.collection('app_system').doc('users_directory').set({
        users: users,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true }).catch(err => console.warn('Firestore users sync warning:', err));
    }
    return true;
  } catch (e) {
    console.error('Failed to save system users', e);
    return false;
  }
}

/**
 * ตรวจสอบและดึง Active Editing User ID
 * กฎเหล็ก: ถ้าผู้ใช้ไม่ใช่ ADMIN (JITTRAKAN K.) บังคับคืนค่า ID ของตัวเองเท่านั้น ห้ามดูข้อมูลคนอื่น
 */
function getActiveEditingUserId() {
  if (currentUser) {
    if (currentUser.role !== 'admin' || currentUser.id !== 'user_admin') {
      return currentUser.id;
    }
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_EDITING_USER);
    return saved || 'user_admin';
  }
  return 'user_admin';
}

/**
 * เปลี่ยน User ID ที่กำลังดู/แก้ไขข้อมูล (เฉพาะ ADMIN เท่านั้นที่สามารถสลับดูคนอื่นได้)
 */
function setActiveEditingUserId(userId) {
  let nextId = userId || 'user_admin';
  if (currentUser && (currentUser.role !== 'admin' || currentUser.id !== 'user_admin')) {
    nextId = currentUser.id;
  }
  const changed = (activeEditingUserId !== nextId);
  activeEditingUserId = nextId;
  localStorage.setItem(STORAGE_KEY_ACTIVE_EDITING_USER, activeEditingUserId);
  if (changed && isFirebaseOnline && firebaseDb && typeof syncAllDataWithCloud === 'function') {
    syncAllDataWithCloud(activeEditingUserId, true);
  }
  return activeEditingUserId;
}

/**
 * ดึงข้อมูลผู้ใช้ที่กำลังถูกแก้ไขข้อมูลอยู่
 * กฎความเป็นส่วนตัว: พนักงานทั่วไปจะได้รับเฉพาะข้อมูลของตนเองเสมอ
 */
function getActiveEditingUser() {
  if (currentUser && (currentUser.role !== 'admin' || currentUser.id !== 'user_admin')) {
    return currentUser;
  }
  const targetId = getActiveEditingUserId();
  const users = getAllSystemUsers(true);
  return users.find(u => u.id === targetId) || users[0] || DEFAULT_SYSTEM_USERS[0];
}

/**
 * เข้าสู่ระบบด้วยรหัส PIN (4-8 หลัก)
 */
async function loginWithPin(pin) {
  if (!pin) {
    return { success: false, error: 'กรุณาระบุรหัส PIN' };
  }

  const cleanPin = String(pin).trim();
  if (cleanPin.length < 4 || cleanPin.length > 8) {
    return { success: false, error: 'รหัส PIN ต้องมีความยาว 4–8 หลัก' };
  }

  // หากเชื่อมต่อ Firebase ออนไลน์อยู่ ให้ดึงรายชื่อผู้ใช้ล่าสุดจาก Cloud ก่อนตรวจสอบ PIN
  if (isFirebaseOnline && firebaseDb) {
    try {
      const userDirDoc = await firebaseDb.collection('app_system').doc('users_directory').get();
      if (userDirDoc.exists && Array.isArray(userDirDoc.data().users) && userDirDoc.data().users.length > 0) {
        localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(userDirDoc.data().users));
      }
    } catch (e) {
      console.warn('Could not fetch cloud users before PIN check:', e.message);
    }
  }

  // ดึงรายชื่อทั้งหมด (internal bypass) เพื่อตรวจสอบรหัส PIN
  const users = getAllSystemUsers(true);
  const foundUser = users.find(u => u.pin === cleanPin);

  if (!foundUser) {
    return { 
      success: false, 
      error: 'รหัส PIN ไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง' 
    };
  }

  // ล็อกอินสำเร็จ
  notifyAuthState(foundUser);
  
  // กำหนด active editing user
  setActiveEditingUserId(foundUser.id);

  // ดึงข้อมูลเงินเดือน บริษัท ปฏิทิน และเวลาทำงานของบัญชีนี้จาก Cloud ทันที
  if (isFirebaseOnline && firebaseDb && typeof syncAllDataWithCloud === 'function') {
    await syncAllDataWithCloud(foundUser.id, true);
  }
  if (typeof window.broadcastStorageToSimulator === 'function') {
    window.broadcastStorageToSimulator();
  }

  return { success: true, user: foundUser };
}

/**
 * เพิ่มผู้ใช้งานใหม่ (เฉพาะ Admin)
 */
function registerNewUser(name, pin, role = 'user', department = '', companyName = 'CACULATION SALARY', empCode = '') {
  if (currentUser && currentUser.role !== 'admin') {
    return { success: false, error: 'เฉพาะผู้ดูแลระบบ (ADMIN: JITTRAKAN K.) เท่านั้นที่สามารถเพิ่มผู้ใช้ได้' };
  }
  if (!name || !name.trim()) {
    return { success: false, error: 'กรุณาระบุชื่อพนักงาน' };
  }

  const cleanPin = String(pin).trim();
  if (!/^\d{4,8}$/.test(cleanPin)) {
    return { success: false, error: 'รหัส PIN ต้องเป็นตัวเลข 4–8 หลักเท่านั้น' };
  }

  const users = getAllSystemUsers(true);
  if (users.some(u => u.pin === cleanPin)) {
    return { success: false, error: 'รหัส PIN นี้ถูกใช้งานแล้ว กรุณาเลือกรหัสอื่น' };
  }

  // สิทธิ์ของพนักงานใหม่ต้องเป็น 'user' เสมอ (Admin มีแค่ JITTRAKAN K. เท่านั้น)
  const newUser = {
    id: 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
    name: name.trim(),
    pin: cleanPin,
    role: 'user',
    avatar: '👤',
    companyName: (companyName || 'CACULATION SALARY').trim().toUpperCase(),
    empCode: (empCode || ('EMP-' + cleanPin)).trim().toUpperCase(),
    department: department.trim() || 'แผนกทั่วไป',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveSystemUsers(users);

  return { success: true, user: newUser };
}

/**
 * อัปเดตข้อมูลผู้ใช้งาน (แก้ไขชื่อ, PIN, แผนก, บริษัท, รหัสพนักงาน)
 */
function updateSystemUser(userId, updateData) {
  // สิทธิ์: ถ้าไม่ใช่ Admin และกำลังจะแก้ไข id คนอื่น ให้ปฏิเสธทันที
  if (currentUser && currentUser.role !== 'admin' && currentUser.id !== userId) {
    return { success: false, error: 'คุณไม่มีสิทธิ์แก้ไขข้อมูลบัญชีของผู้อื่น' };
  }

  const users = getAllSystemUsers(true);
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) {
    return { success: false, error: 'ไม่พบผู้ใช้นี้ในระบบ' };
  }

  // ตรวจสอบ PIN ซ้ำ (ถ้ามีการเปลี่ยน PIN)
  if (updateData.pin !== undefined && updateData.pin !== null && updateData.pin !== '') {
    const cleanPin = String(updateData.pin).trim();
    if (!/^\d{4,8}$/.test(cleanPin)) {
      return { success: false, error: 'รหัส PIN ต้องเป็นตัวเลข 4–8 หลัก' };
    }
    const pinOwner = users.find(u => u.pin === cleanPin && u.id !== userId);
    if (pinOwner) {
      return { success: false, error: 'รหัส PIN นี้ถูกใช้โดยพนักงานคนอื่นแล้ว' };
    }
    users[idx].pin = cleanPin;
  }

  if (updateData.name !== undefined) users[idx].name = updateData.name.trim();
  if (updateData.department !== undefined) users[idx].department = updateData.department.trim();
  if (updateData.companyName !== undefined) users[idx].companyName = updateData.companyName.trim().toUpperCase();
  if (updateData.empCode !== undefined) users[idx].empCode = updateData.empCode.trim().toUpperCase();

  // บังคับบทบาท: เฉพาะ user_admin เท่านั้นที่เป็น admin ที่เหลือทุกคนเป็น user
  if (users[idx].id === 'user_admin') {
    users[idx].role = 'admin';
    users[idx].avatar = '👑';
  } else {
    users[idx].role = 'user';
    users[idx].avatar = '👤';
  }

  saveSystemUsers(users);

  // ถ้าอัปเดต user ที่กำลังล็อกอินอยู่ ให้ sync ทันที
  if (currentUser && currentUser.id === userId) {
    notifyAuthState(users[idx]);
  }

  return { success: true, user: users[idx] };
}

/**
 * อัปเดตข้อมูลโปรไฟล์บัญชีของผู้ใช้ปัจจุบัน
 */
function updateCurrentAccountProfile(profileData) {
  const targetId = (currentUser) ? currentUser.id : getActiveEditingUserId();
  return updateSystemUser(targetId, profileData);
}

/**
 * ลบผู้ใช้งาน (ยกเว้น ADMIN JITTRAKAN K.)
 */
function deleteSystemUser(userId) {
  if (currentUser && currentUser.role !== 'admin') {
    return { success: false, error: 'เฉพาะผู้ดูแลระบบ (ADMIN: JITTRAKAN K.) เท่านั้นที่สามารถลบผู้ใช้ได้' };
  }
  if (userId === 'user_admin') {
    return { success: false, error: 'ไม่สามารถลบบัญชี ADMIN หลัก (JITTRAKAN K.) ได้' };
  }

  let users = getAllSystemUsers(true);
  users = users.filter(u => u.id !== userId);
  saveSystemUsers(users);

  // ถ้าลบ user ที่กำลังถูก active อยู่ ให้รีเซ็ตกลับมาเป็น ADMIN
  if (getActiveEditingUserId() === userId) {
    setActiveEditingUserId('user_admin');
  }

  return { success: true };
}

/**
 * ออกจากระบบ
 */
async function logoutCurrentUser() {
  notifyAuthState(null);
  setActiveEditingUserId('user_admin');
  return { success: true };
}

/**
 * ตรวจสอบและนำเข้าคอนฟิก Firebase จาก URL (?fb_cfg=...) หรือจากหน้าต่างหลัก (กรณี Phone Simulator)
 */
function importFirebaseConfigFromUrlOrParent() {
  try {
    // 1. ตรวจสอบจาก URL Parameter (?fb_cfg=...) สำหรับการสแกนหรือคลิกลิงก์ซิงก์ข้ามเครื่องเข้ามือถือ
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const fbCfgB64 = params.get('fb_cfg');
      if (fbCfgB64) {
        try {
          const jsonStr = decodeURIComponent(escape(atob(fbCfgB64)));
          const parsed = JSON.parse(jsonStr);
          if (parsed && parsed.projectId && parsed.apiKey) {
            localStorage.setItem(STORAGE_KEY_FIREBASE_CFG, JSON.stringify(parsed));
            window._justImportedFbConfigFromUrl = parsed.projectId;
            // ลบพารามิเตอร์ fb_cfg ออกจาก URL เพื่อความสะอาดและปลอดภัย
            params.delete('fb_cfg');
            const newQuery = params.toString();
            const cleanUrl = window.location.pathname + (newQuery ? '?' + newQuery : '') + (window.location.hash || '');
            window.history.replaceState({}, document.title, cleanUrl);
          }
        } catch (decodeErr) {
          console.warn('Invalid fb_cfg URL parameter:', decodeErr);
        }
      }
    }

    // 2. หากเปิดอยู่ใน Phone Simulator (iframe) ให้ซิงก์คอนฟิกและข้อมูลจากหน้าต่างหลักอัตโนมัติ
    if (typeof window !== 'undefined' && window.self !== window.top) {
      try {
        if (window.parent && window.parent.localStorage) {
          const parentLen = window.parent.localStorage.length;
          for (let i = 0; i < parentLen; i++) {
            const k = window.parent.localStorage.key(i);
            if (k && (k.startsWith('orbray_') || k.startsWith('salary_') || k.startsWith('period_salary_') || k.startsWith('multi_company_') || k.startsWith('custom_firebase_') || k.startsWith('gemini_'))) {
              const v = window.parent.localStorage.getItem(k);
              if (v !== null) {
                localStorage.setItem(k, v);
              }
            }
          }
        }
      } catch (crossOriginErr) {
        // กรณีเบราว์เซอร์บล็อกการเข้าถึง parent.localStorage โดยตรง จะใช้ postMessage แทน
      }
    }
  } catch (e) {
    console.warn('importFirebaseConfigFromUrlOrParent error:', e);
  }
}

/**
 * ตรวจสอบว่ากำลังใช้เซิร์ฟเวอร์ Firebase ที่กำหนดเองหรือไม่
 */
function isUsingCustomFirebaseServer() {
  try {
    const custom = localStorage.getItem(STORAGE_KEY_FIREBASE_CFG);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed && parsed.projectId && parsed.projectId !== 'caculation-salary-app') {
        return true;
      }
    }
    // รองรับกรณีผู้ใช้แก้ไข DEFAULT_FIREBASE_CONFIG ในไฟล์ firebase-config.js โดยตรง
    if (DEFAULT_FIREBASE_CONFIG && DEFAULT_FIREBASE_CONFIG.projectId && DEFAULT_FIREBASE_CONFIG.projectId !== 'caculation-salary-app') {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * ดึงการตั้งค่า Firebase
 */
function getActiveFirebaseConfig() {
  try {
    const custom = localStorage.getItem(STORAGE_KEY_FIREBASE_CFG);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed && parsed.projectId) return parsed;
    }
  } catch (e) {
    console.warn('Cannot parse stored firebase config', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

/**
 * บันทึกการตั้งค่า Firebase
 */
function saveFirebaseConfig(cfg) {
  try {
    localStorage.setItem(STORAGE_KEY_FIREBASE_CFG, JSON.stringify(cfg));
    return true;
  } catch (e) {
    console.error('Failed to save firebase config', e);
    return false;
  }
}

/**
 * สร้างลิงก์สำหรับแชร์การตั้งค่า Firebase ไปยังมือถือหรืออุปกรณ์อื่นในคลิกเดียว
 */
function generateFirebaseSyncUrl(cfg = null) {
  try {
    const activeCfg = cfg || getActiveFirebaseConfig();
    if (!activeCfg || !activeCfg.projectId || activeCfg.projectId === 'caculation-salary-app') {
      return '';
    }
    const payload = {
      apiKey: activeCfg.apiKey || '',
      authDomain: activeCfg.authDomain || '',
      projectId: activeCfg.projectId || '',
      storageBucket: activeCfg.storageBucket || '',
      messagingSenderId: activeCfg.messagingSenderId || '',
      appId: activeCfg.appId || ''
    };
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const baseUrl = window.location.origin && window.location.origin !== 'null'
      ? (window.location.origin + window.location.pathname)
      : window.location.href.split('?')[0];
    return `${baseUrl}?fb_cfg=${encodeURIComponent(b64)}`;
  } catch (e) {
    console.warn('generateFirebaseSyncUrl failed:', e);
    return '';
  }
}

/**
 * ทดสอบการเชื่อมต่อกับเซิร์ฟเวอร์ Firebase
 */
async function testFirebaseConnection(cfg) {
  if (!cfg || !cfg.projectId || !cfg.apiKey) {
    return { success: false, error: 'กรุณาระบุ Project ID และ API Key ให้ครบถ้วนก่อนทดสอบ' };
  }
  if (typeof firebase === 'undefined' || !firebase.initializeApp) {
    return { success: false, error: 'ไม่พบไลบรารี Firebase SDK บนเบราว์เซอร์' };
  }

  const testAppName = 'test_conn_' + Date.now();
  let testApp = null;
  try {
    testApp = firebase.initializeApp(cfg, testAppName);
    const testDb = testApp.firestore();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('การเชื่อมต่อหมดเวลา (Timeout) กรุณาตรวจสอบอินเทอร์เน็ตหรือ Project ID')), 8000)
    );

    const testPromise = testDb.collection('app_system').doc('ping').set({
      lastTestedAt: firebase.firestore.FieldValue.serverTimestamp(),
      testClient: 'web_payroll'
    }, { merge: true });

    await Promise.race([testPromise, timeoutPromise]);

    try { await testApp.delete(); } catch(e) {}
    return { 
      success: true, 
      message: `เชื่อมต่อเซิร์ฟเวอร์ Firebase "${cfg.projectId}" สำเร็จ! สามารถเขียนและอ่านฐานข้อมูล Firestore ได้ตามปกติ` 
    };
  } catch (err) {
    if (testApp) {
      try { await testApp.delete(); } catch(e) {}
    }
    // หากติดสิทธิ์ Security Rules (permission-denied) แสดงว่าติดต่อเซิร์ฟเวอร์และพบ Project ID แล้ว
    if (err.code === 'permission-denied' || String(err.message).toLowerCase().includes('permission')) {
      return { 
        success: true, 
        message: `เชื่อมต่อเซิร์ฟเวอร์ Firebase "${cfg.projectId}" สำเร็จ! (พบเซิร์ฟเวอร์เรียบร้อย แต่อาจมีข้อจำกัดด้าน Firestore Security Rules)` 
      };
    }
    return { success: false, error: `เชื่อมต่อไม่สำเร็จ: ${err.message || err}` };
  }
}

/**
 * นำคอนฟิกเซิร์ฟเวอร์ใหม่ไปใช้งานและรีเฟรชการเชื่อมต่อแบบเรียลไทม์
 */
async function reinitFirebaseWithNewConfig(newCfg) {
  stopRealtimeCloudSync();
  saveFirebaseConfig(newCfg);
  if (typeof firebase !== 'undefined' && firebase.apps) {
    for (let app of [...firebase.apps]) {
      try { await app.delete(); } catch (e) {}
    }
  }
  initFirebaseApp();
  onAuthStateListeners.forEach(cb => {
    try { cb(currentUser, isFirebaseOnline); } catch (e) {}
  });
  if (isFirebaseOnline) {
    await syncAllDataWithCloud(null, false);
  }
  if (typeof window.broadcastStorageToSimulator === 'function') {
    window.broadcastStorageToSimulator();
  }
  return true;
}

/**
 * คืนค่าเซิร์ฟเวอร์เป็นค่าเริ่มต้น (โหมด Local Storage ออฟไลน์)
 */
async function resetFirebaseConfigToDefault() {
  stopRealtimeCloudSync();
  localStorage.removeItem(STORAGE_KEY_FIREBASE_CFG);
  if (typeof firebase !== 'undefined' && firebase.apps) {
    for (let app of [...firebase.apps]) {
      try { await app.delete(); } catch (e) {}
    }
  }
  initFirebaseApp();
  onAuthStateListeners.forEach(cb => {
    try { cb(currentUser, isFirebaseOnline); } catch (e) {}
  });
  if (typeof window.broadcastStorageToSimulator === 'function') {
    window.broadcastStorageToSimulator();
  }
  return true;
}

/**
 * เริ่มต้นการทำงานของ Firebase
 */
function initFirebaseApp() {
  importFirebaseConfigFromUrlOrParent();
  const cfg = getActiveFirebaseConfig();
  const hasCustom = isUsingCustomFirebaseServer();

  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    try {
      if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(cfg);
      } else {
        firebaseApp = firebase.app();
      }
      if (firebase.auth) firebaseAuth = firebase.auth();
      if (firebase.firestore) firebaseDb = firebase.firestore();
      isFirebaseOnline = hasCustom;
      if (typeof window !== 'undefined') window.isFirebaseOnline = isFirebaseOnline;
      console.log('Firebase initialized successfully!', hasCustom ? `(Custom Cloud Server: ${cfg.projectId})` : '(Local Mode)');
    } catch (err) {
      console.warn('Firebase init note (Local PIN Mode active):', err.message);
      isFirebaseOnline = false;
      if (typeof window !== 'undefined') window.isFirebaseOnline = false;
    }
  } else {
    isFirebaseOnline = false;
    if (typeof window !== 'undefined') window.isFirebaseOnline = false;
  }

  // ตรวจสอบผู้ใช้ที่เคยล็อกอินค้างไว้
  checkStoredCurrentUser();

  // หากเชื่อมต่อ Firebase ออนไลน์อยู่ ให้ดึงข้อมูลล่าสุดจาก Cloud และเปิด Real-time Sync ทันที
  if (isFirebaseOnline && firebaseDb) {
    syncAllDataWithCloud(null, true);
    startRealtimeCloudSync();
  }
}

function checkStoredCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (raw) {
      const u = JSON.parse(raw);
      const all = getAllSystemUsers(true);
      const match = all.find(x => x.id === u.id);
      if (match) {
        notifyAuthState(match);
        return;
      }
    }
  } catch (e) {}

  notifyAuthState(null);
}

var _activeCloudUnsubscribe = null;
var _activeUsersUnsubscribe = null;
var _isApplyingCloudSnapshot = false;

/**
 * หยุดการซิงก์แบบเรียลไทม์ชั่วคราว
 */
function stopRealtimeCloudSync() {
  if (typeof _activeCloudUnsubscribe === 'function') {
    try { _activeCloudUnsubscribe(); } catch (e) {}
    _activeCloudUnsubscribe = null;
  }
  if (typeof _activeUsersUnsubscribe === 'function') {
    try { _activeUsersUnsubscribe(); } catch (e) {}
    _activeUsersUnsubscribe = null;
  }
}

/**
 * เริ่มฟังการเปลี่ยนแปลงข้อมูลจาก Firestore แบบเรียลไทม์ (Real-time Cross-Device Sync)
 */
function startRealtimeCloudSync(userId = null) {
  stopRealtimeCloudSync();
  if (!isFirebaseOnline || !firebaseDb) return;

  const targetId = userId || getActiveEditingUserId();

  // 1. ติดตามการเปลี่ยนแปลงข้อมูลเงินเดือน บริษัท ปฏิทิน และเวลาทำงานของ User
  try {
    _activeCloudUnsubscribe = firebaseDb.collection('user_salaries').doc(targetId).onSnapshot((doc) => {
      if (!doc.exists) return;
      if (doc.metadata && doc.metadata.hasPendingWrites) return; // ข้ามอีเวนต์ที่เกิดจากเครื่องตัวเองเพิ่งเขียน
      const cloudData = doc.data();
      if (cloudData && typeof window.applyCloudDataToLocal === 'function') {
        _isApplyingCloudSnapshot = true;
        try {
          window.applyCloudDataToLocal(cloudData, targetId);
        } finally {
          _isApplyingCloudSnapshot = false;
        }
      }
    }, (err) => {
      console.warn('Realtime user_salaries listener warning:', err.message);
    });
  } catch (e) {
    console.warn('Could not attach user_salaries onSnapshot:', e);
  }

  // 2. ติดตามการเปลี่ยนแปลงข้อมูลโปรไฟล์ผู้ใช้ในระบบ (ชื่อ, รหัสพนักงาน, แผนก, PIN)
  try {
    _activeUsersUnsubscribe = firebaseDb.collection('app_system').doc('users_directory').onSnapshot((doc) => {
      if (!doc.exists) return;
      if (doc.metadata && doc.metadata.hasPendingWrites) return;
      const data = doc.data();
      if (data && Array.isArray(data.users) && data.users.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(data.users));
          const cleanUsers = getAllSystemUsers(true);
          if (currentUser) {
            const updatedMe = cleanUsers.find(u => u.id === currentUser.id);
            if (updatedMe) {
              currentUser = updatedMe;
              window.currentUser = updatedMe;
              localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(updatedMe));
            }
          }
          if (typeof window.refreshAllViewsAfterCloudSync === 'function') {
            window.refreshAllViewsAfterCloudSync();
          }
        } catch (err) {}
      }
    }, (err) => {
      console.warn('Realtime users_directory listener warning:', err.message);
    });
  } catch (e) {}
}

/**
 * อัปโหลดข้อมูลทั้งหมดในเครื่อง (LocalStorage) ขึ้นไปสำรองและซิงก์บน Cloud Firestore
 */
async function pushAllLocalDataToCloud(userId = null, silent = true) {
  if (!isFirebaseOnline || !firebaseDb) return false;
  const targetId = userId || getActiveEditingUserId();
  try {
    // 1. ซิงก์ทะเบียนรายชื่อผู้ใช้ทั้งหมด
    const allUsers = getAllSystemUsers(true);
    await firebaseDb.collection('app_system').doc('users_directory').set({
      users: allUsers,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // 2. รวบรวมข้อมูลบริษัท ปฏิทิน โครงสร้างเงินเดือน และเวลาทำงานทั้งหมดของ User นี้
    if (typeof window.collectAllLocalDataForCloud === 'function') {
      const payload = window.collectAllLocalDataForCloud(targetId);
      if (payload && Object.keys(payload).length > 0) {
        payload.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
        await firebaseDb.collection('user_salaries').doc(targetId).set(payload, { merge: true });
      }
    }
    if (!silent && typeof showToastNotification === 'function') {
      showToastNotification('☁️ อัปโหลดข้อมูลทั้งหมดขึ้น Cloud สำเร็จ!');
    }
    return true;
  } catch (err) {
    console.warn('pushAllLocalDataToCloud error:', err.message);
    if (!silent && typeof showToastNotification === 'function') {
      showToastNotification('⚠️ อัปโหลดข้อมูลขึ้น Cloud ไม่สำเร็จ: ' + err.message);
    }
    return false;
  }
}

/**
 * ดึงข้อมูลทั้งหมดจาก Cloud Firestore ลงมาที่เครื่อง (และหากบน Cloud ยังว่างอยู่ จะอัปโหลดข้อมูลจากเครื่องขึ้นไปแทน)
 */
async function pullAllUserDataFromCloud(userId = null, silent = true) {
  if (!isFirebaseOnline || !firebaseDb) return false;
  const targetId = userId || getActiveEditingUserId();
  try {
    // 1. ดึงทะเบียนผู้ใช้จาก Cloud
    try {
      const userDirDoc = await firebaseDb.collection('app_system').doc('users_directory').get();
      if (userDirDoc.exists && Array.isArray(userDirDoc.data().users) && userDirDoc.data().users.length > 0) {
        localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(userDirDoc.data().users));
        const cleanUsers = getAllSystemUsers(true);
        if (currentUser) {
          const updatedMe = cleanUsers.find(u => u.id === currentUser.id);
          if (updatedMe) {
            currentUser = updatedMe;
            window.currentUser = updatedMe;
            localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(updatedMe));
          }
        }
      } else {
        // หากบน Cloud ยังไม่มีทะเบียนผู้ใช้ ให้อัปโหลดจากเครื่องขึ้นไป
        const localUsers = getAllSystemUsers(true);
        await firebaseDb.collection('app_system').doc('users_directory').set({
          users: localUsers,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    } catch (uErr) {
      console.warn('Users directory pull warning:', uErr.message);
    }

    // 2. ดึงข้อมูลเงินเดือน บริษัท ปฏิทิน และเวลาทำงานของ targetId
    const doc = await firebaseDb.collection('user_salaries').doc(targetId).get();
    if (doc.exists) {
      const cloudData = doc.data();
      const hasMeaningfulData = cloudData && (
        cloudData.salaryConfig ||
        cloudData.allCompanies ||
        cloudData.periodSalaryConfigs ||
        Object.keys(cloudData).some(k => k.startsWith('attendance_'))
      );

      if (hasMeaningfulData && typeof window.applyCloudDataToLocal === 'function') {
        _isApplyingCloudSnapshot = true;
        try {
          window.applyCloudDataToLocal(cloudData, targetId);
        } finally {
          _isApplyingCloudSnapshot = false;
        }
        // อัปโหลดส่วนที่อาจมีเฉพาะในเครื่อง (เช่น บริษัทหรือข้อมูลที่ยังไม่เคยขึ้น Cloud) กลับไปผสานด้วย
        await pushAllLocalDataToCloud(targetId, true);
        if (!silent && typeof showToastNotification === 'function') {
          showToastNotification('☁️ ซิงก์ข้อมูลล่าสุดจาก Cloud เรียบร้อยแล้ว!');
        }
        return true;
      }
    }

    // หากบน Cloud ยังไม่มีข้อมูลของ User นี้เลย ให้อัปโหลดข้อมูลในเครื่องขึ้นไปเป็นค่าเริ่มต้นบน Cloud
    await pushAllLocalDataToCloud(targetId, true);
    if (!silent && typeof showToastNotification === 'function') {
      showToastNotification('☁️ ซิงก์ข้อมูลเริ่มต้นขึ้น Cloud เรียบร้อยแล้ว!');
    }
    return true;
  } catch (err) {
    console.warn('pullAllUserDataFromCloud error:', err.message);
    if (!silent && typeof showToastNotification === 'function') {
      showToastNotification('⚠️ ดึงข้อมูลจาก Cloud ไม่สำเร็จ: ' + err.message);
    }
    return false;
  }
}

/**
 * ซิงก์ข้อมูลแบบสมบูรณ์ (ดึงจาก Cloud + ผสานข้อมูลในเครื่อง + เริ่มฟังการเปลี่ยนแปลงเรียลไทม์)
 */
async function syncAllDataWithCloud(userId = null, silent = true) {
  const ok = await pullAllUserDataFromCloud(userId, silent);
  startRealtimeCloudSync(userId);
  return ok;
}

/**
 * Cloud Sync สโคปตาม User ID
 */
async function syncDataToCloud(docKey, data, userId = null) {
  if (typeof window.broadcastStorageToSimulator === 'function') {
    window.broadcastStorageToSimulator();
  }
  if (_isApplyingCloudSnapshot) return false;
  if (!isFirebaseOnline || !firebaseDb) return false;
  const targetId = userId || getActiveEditingUserId();
  const docRef = firebaseDb.collection('user_salaries').doc(targetId);
  try {
    await docRef.update({
      [docKey]: data,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (updateErr) {
    try {
      await docRef.set({
        [docKey]: data,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn('Cloud sync error:', err.message);
      return false;
    }
  }
}

/**
 * Cloud Load สโคปตาม User ID
 */
async function loadDataFromCloud(docKey, userId = null) {
  if (!isFirebaseOnline || !firebaseDb) return null;
  const targetId = userId || getActiveEditingUserId();
  try {
    const doc = await firebaseDb.collection('user_salaries').doc(targetId).get();
    if (doc.exists && doc.data()[docKey]) {
      return doc.data()[docKey];
    }
  } catch (err) {
    console.warn('Cloud load error:', err.message);
  }
  return null;
}

// เริ่มต้นระบบเมื่อโหลดเสร็จ
window.addEventListener('DOMContentLoaded', () => {
  initFirebaseApp();
});

