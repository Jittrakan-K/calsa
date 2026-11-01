/**
 * APP.JS - ระบบคำนวณเงินเดือน & ปฏิทินวันทำงาน
 * CALSA
 */

// ==========================================================================
// 1. ฐานข้อมูลปฏิทินเริ่มต้นปี 2569 (2026)
// ==========================================================================
const DEFAULT_CALENDAR_2026 = {
  yearCE: 2026,
  yearBE: 2569,
  title: '2569 / 2026',
  nationalHolidays: [
    '2026-01-01', '2026-01-02', '2026-03-03', '2026-04-06', '2026-04-13',
    '2026-04-14', '2026-04-15', '2026-05-01', '2026-05-04', '2026-06-01',
    '2026-06-03', '2026-07-28', '2026-07-29', '2026-08-12', '2026-10-13',
    '2026-10-23', '2026-12-05', '2026-12-07', '2026-12-10', '2026-12-31'
  ],
  memorialHolidays: [
    '2026-09-19' // วันหยุดประเพณีจ่ายเงิน (Memorial day with pay)
  ],
  bridgeHolidays: [
    '2026-01-03' // วันหยุดพิเศษ
  ],
  orbrayWorkDays: [
    '2026-10-17' // วันทำงานพิเศษ
  ],
  workingSaturdays: [
    '2026-01-17', '2026-02-21', '2026-03-14', '2026-03-28',
    '2026-04-04', '2026-04-18', '2026-05-09', '2026-06-20',
    '2026-07-04', '2026-07-25', '2026-08-01', '2026-08-15', '2026-08-29',
    '2026-10-17', '2026-10-31', '2026-12-12'
  ],
  customDayOverrides: {}
};

// ==========================================================================
// 2. ข้อมูลตัวอย่างจากไฟล์ Excel (21/08/2026 - 20/09/2026)
// ==========================================================================
const EXCEL_SAMPLE_ATTENDANCE = [
  { date: '2026-08-21', inTime: '08:00', outTime: '17:00', ot: 0, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 0 },
  { date: '2026-08-22', inTime: '08:00', outTime: '19:20', ot: 0, hol: 8, otHol: 2, workDay: 1, come: 1, otDay: 1 },
  { date: '2026-08-23', inTime: '', outTime: '', ot: 0, hol: 0, otHol: 0, workDay: 0, come: 0, otDay: 0 },
  { date: '2026-08-24', inTime: '08:00', outTime: '18:20', ot: 1, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 1 },
  { date: '2026-08-25', inTime: '08:00', outTime: '17:00', ot: 0, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 0 },
  { date: '2026-08-26', inTime: '08:00', outTime: '18:20', ot: 1, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 1 },
  { date: '2026-08-27', inTime: '08:00', outTime: '19:20', ot: 2, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 1 },
  { date: '2026-08-28', inTime: '08:00', outTime: '17:00', ot: 0, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 0 },
  { date: '2026-08-29', inTime: '08:00', outTime: '17:50', ot: 0.5, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 0 },
  { date: '2026-08-30', inTime: '', outTime: '', ot: 0, hol: 0, otHol: 0, workDay: 0, come: 0, otDay: 0 },
  { date: '2026-08-31', inTime: '08:00', outTime: '19:20', ot: 2, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 1 },
  { date: '2026-09-01', inTime: '08:00', outTime: '17:00', ot: 0, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 0 },
  { date: '2026-09-02', inTime: '08:00', outTime: '19:20', ot: 2, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 1 },
  { date: '2026-09-03', inTime: '08:00', outTime: '18:20', ot: 1, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 1 },
  { date: '2026-09-04', inTime: '08:00', outTime: '17:00', ot: 0, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 0 },
  { date: '2026-09-05', inTime: '08:00', outTime: '19:20', ot: 0, hol: 8, otHol: 2, workDay: 1, come: 1, otDay: 1 },
  { date: '2026-09-06', inTime: '', outTime: '', ot: 0, hol: 0, otHol: 0, workDay: 0, come: 0, otDay: 0 },
  { date: '2026-09-07', inTime: '08:00', outTime: '19:20', ot: 2, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 1 },
  { date: '2026-09-08', inTime: '08:00', outTime: '17:00', ot: 0, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 0 },
  { date: '2026-09-09', inTime: '08:00', outTime: '19:20', ot: 2, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 1 },
  { date: '2026-09-10', inTime: '08:00', outTime: '18:20', ot: 1, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 1 },
  { date: '2026-09-11', inTime: '08:00', outTime: '17:00', ot: 0, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 0 },
  { date: '2026-09-12', inTime: '', outTime: '', ot: 0, hol: 0, otHol: 0, workDay: 0, come: 0, otDay: 0 },
  { date: '2026-09-13', inTime: '', outTime: '', ot: 0, hol: 0, otHol: 0, workDay: 0, come: 0, otDay: 0 },
  { date: '2026-09-14', inTime: '08:00', outTime: '19:20', ot: 2, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 1 },
  { date: '2026-09-15', inTime: '08:00', outTime: '17:00', ot: 0, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 0 },
  { date: '2026-09-16', inTime: '08:00', outTime: '19:20', ot: 2, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 1 },
  { date: '2026-09-17', inTime: '08:00', outTime: '18:20', ot: 1, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 1 },
  { date: '2026-09-18', inTime: '08:00', outTime: '17:00', ot: 0, hol: 0, otHol: 0, workDay: 1, come: 1, otDay: 0 },
  { date: '2026-09-19', inTime: '', outTime: '', ot: 0, hol: 0, otHol: 0, workDay: 0, come: 0, otDay: 0 },
  { date: '2026-09-20', inTime: '', outTime: '', ot: 0, hol: 0, otHol: 0, workDay: 0, come: 0, otDay: 0 }
];

// ==========================================================================
// 3. State Management (สถานะหลักของระบบ & ระบบหลายบริษัท)
// ==========================================================================
const STORAGE_KEY_COMPANIES = 'multi_company_registry_v1';
const STORAGE_KEY_ACTIVE_COMPANY = 'multi_company_active_id_v1';

const DEFAULT_ORBRAY_COMPANY = {
  id: 'orbray',
  name: 'ORBRAY',
  code: 'ORBRAY',
  description: 'Orbray (Thailand) Co., Ltd. (default)',
  isDefault: true,
  createdAt: '2026-01-01',
  calendars: {
    '2026': JSON.parse(JSON.stringify(DEFAULT_CALENDAR_2026))
  }
};

let allCompanies = {
  'orbray': JSON.parse(JSON.stringify(DEFAULT_ORBRAY_COMPANY))
};
let activeCompanyId = 'orbray';

let allCalendars = {};      // บันทึกปฏิทินทุกปีของบริษัทปัจจุบัน { '2026': {...}, '2027': {...} }
let activeYearCE = 2026;    // ปี ค.ศ. ปัจจุบันที่กำลังดู
let currentPeriod = null;   // งวดการจ่ายปัจจุบัน
let currentAttendance = []; // รายการลงเวลา 31 วันของงวดปัจจุบัน

// ข้อมูลพนักงานและข้อมูลคงที่
var salaryProfile = {
  companyName: 'CALSA',
  empCode: '20523',
  empName: 'JITTRAKAN K.',
  department: 'PRODUCTION TECHNOLOGY',
  empType: 'Monthly',
  periodMonth: 'September',
  periodRound: 'Payroll period',
  payDate: '30/09/2569',
  userName: 'JITTRAKAN K.',
  printDate: '13/09/2569'
};
if (typeof window !== 'undefined') {
  window.salaryProfile = salaryProfile;
}

// โครงสร้างอัตราค่าเงินเริ่มต้นตามรูปที่ 2 (สามารถแก้ไขได้ตลอดเวลา)
const DEFAULT_SALARY_CONFIG = {
  baseSalary: 20000,
  diligenceFullAmount: 650,
  transportationAllowance: 1230,
  foodPerDay: 20,
  otMealPerDay: 15,
  otDivisorHours: 240,
  ot15Multiplier: 1.5,
  ot1Multiplier: 1.0,
  ot3Multiplier: 3.0,
  ssoDeduction: 875,
  ssoMaxBase: 17500
};

let currentSalaryConfig = { ...DEFAULT_SALARY_CONFIG };
let userBaseSalaryConfig = { ...DEFAULT_SALARY_CONFIG };
let periodSalaryConfigs = {}; // จัดเก็บการตั้งค่าค่าเงินแยกตามงวด { '2026-09': {...}, '2026-08': {...} }

// ==========================================================================
// 4. ระบบจัดเก็บข้อมูล LocalStorage (Storage Manager Scoped by User)
// ==========================================================================
const STORAGE_KEY_CALENDARS = 'orbray_salary_calendars_v2';
const STORAGE_KEY_YEAR = 'orbray_salary_active_year_v2';
const STORAGE_KEY_ACTIVE_PERIOD = 'orbray_salary_active_period_v2';
const STORAGE_KEY_ATTENDANCE = 'orbray_salary_attendance_store_v2';
const STORAGE_KEY_SALARY_CONFIG = 'salary_rates_config_v2';
const STORAGE_KEY_PERIOD_SALARY_CONFIGS = 'period_salary_configs_v2';

function getScopedUserKey(baseKey) {
  const uid = (typeof getActiveEditingUserId === 'function') ? getActiveEditingUserId() : 'user_admin';
  return `${baseKey}_${uid}`;
}

function syncSalaryProfileWithActiveUser() {
  if (typeof getActiveEditingUser === 'function') {
    const u = getActiveEditingUser();
    if (u) {
      salaryProfile.companyName = (u.companyName || 'CALSA').toUpperCase();
      salaryProfile.empCode = (u.empCode || (u.id === 'user_admin' ? '20523' : ('EMP-' + (u.pin || '001')))).toUpperCase();
      salaryProfile.empName = u.name;
      salaryProfile.department = u.department || 'Operations';
      salaryProfile.userName = u.role === 'admin' ? 'ADMIN' : u.name;
    }
  }
}

function isZeroedLegacySalaryConfig(cfg) {
  if (!cfg || typeof cfg !== 'object') return true;
  if (cfg._intentionalZero) return false;
  return (
    Number(cfg.baseSalary || 0) === 0 &&
    Number(cfg.diligenceFullAmount || 0) === 0 &&
    Number(cfg.transportationAllowance || 0) === 0 &&
    Number(cfg.foodPerDay || 0) === 0 &&
    Number(cfg.otMealPerDay || 0) === 0 &&
    Number(cfg.ssoDeduction || 0) === 0
  );
}

function sanitizePeriodSalaryConfigs(mapObj) {
  if (!mapObj || typeof mapObj !== 'object') return {};
  const cleaned = {};
  Object.keys(mapObj).forEach(pId => {
    if (mapObj[pId] && typeof mapObj[pId] === 'object') {
      cleaned[pId] = mapObj[pId];
    }
  });
  return cleaned;
}

function getSalaryConfigForPeriod(periodId) {
  if (periodId && periodSalaryConfigs && periodSalaryConfigs[periodId] && typeof periodSalaryConfigs[periodId] === 'object') {
    return Object.assign({}, DEFAULT_SALARY_CONFIG, periodSalaryConfigs[periodId]);
  }
  const baseCfg = (!isZeroedLegacySalaryConfig(userBaseSalaryConfig)) ? userBaseSalaryConfig : DEFAULT_SALARY_CONFIG;
  return Object.assign({}, DEFAULT_SALARY_CONFIG, baseCfg);
}

function savePeriodSalaryConfigsToStorage() {
  try {
    const userPeriodCfgKey = getScopedUserKey(STORAGE_KEY_PERIOD_SALARY_CONFIGS);
    localStorage.setItem(userPeriodCfgKey, JSON.stringify(periodSalaryConfigs));
    const activeUid = (typeof getActiveEditingUserId === 'function') ? getActiveEditingUserId() : 'user_admin';
    if (activeUid === 'user_admin') {
      localStorage.setItem(STORAGE_KEY_PERIOD_SALARY_CONFIGS, JSON.stringify(periodSalaryConfigs));
    }
    if (typeof syncDataToCloud === 'function') {
      syncDataToCloud('periodSalaryConfigs', periodSalaryConfigs);
    }
  } catch (e) {
    console.warn('LocalStorage save periodSalaryConfigs failed', e);
  }
}

function getScopedCompanyAttendanceKey() {
  const uid = (typeof getActiveEditingUserId === 'function') ? getActiveEditingUserId() : 'user_admin';
  return `${STORAGE_KEY_ATTENDANCE}_${activeCompanyId}_${uid}`;
}

function saveCompaniesToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(allCompanies));
    localStorage.setItem(STORAGE_KEY_ACTIVE_COMPANY, activeCompanyId);
    if (typeof syncDataToCloud === 'function') {
      syncDataToCloud('allCompanies', allCompanies);
      syncDataToCloud('activeCompanyId', activeCompanyId);
    }
  } catch (e) {
    console.warn('Companies save failed', e);
  }
}

function loadStorageData() {
  try {
    // 1. โหลดข้อมูลทะเบียนบริษัททั้งหมด
    const rawCompanies = localStorage.getItem(STORAGE_KEY_COMPANIES);
    if (rawCompanies) {
      try {
        allCompanies = JSON.parse(rawCompanies);
      } catch (err) {
        console.error('Failed parsing companies registry', err);
        allCompanies = { 'orbray': JSON.parse(JSON.stringify(DEFAULT_ORBRAY_COMPANY)) };
      }
    } else {
      allCompanies = { 'orbray': JSON.parse(JSON.stringify(DEFAULT_ORBRAY_COMPANY)) };
    }

    if (!allCompanies['orbray']) {
      allCompanies['orbray'] = JSON.parse(JSON.stringify(DEFAULT_ORBRAY_COMPANY));
    }

    // รองรับและนำเข้าข้อมูลเดิมจาก STORAGE_KEY_CALENDARS
    const rawCals = localStorage.getItem(STORAGE_KEY_CALENDARS);
    if (rawCals) {
      try {
        const legacyCals = JSON.parse(rawCals);
        if (legacyCals && typeof legacyCals === 'object') {
          allCompanies['orbray'].calendars = Object.assign({}, allCompanies['orbray'].calendars, legacyCals);
        }
      } catch (err) {}
    }

    // 2. โหลดรหัสบริษัทที่เปิดใช้งานอยู่
    const savedCompId = localStorage.getItem(STORAGE_KEY_ACTIVE_COMPANY);
    if (savedCompId && allCompanies[savedCompId]) {
      activeCompanyId = savedCompId;
    } else {
      activeCompanyId = 'orbray';
    }

    const currentCompany = allCompanies[activeCompanyId] || allCompanies['orbray'];
    allCalendars = currentCompany.calendars || {};

    // 3. โหลดปี ค.ศ. ที่กำลังดู
    const savedYear = localStorage.getItem(STORAGE_KEY_YEAR);
    const availableYears = Object.keys(allCalendars).map(Number).sort((a, b) => a - b);
    if (savedYear && allCalendars[savedYear]) {
      activeYearCE = parseInt(savedYear, 10);
    } else if (availableYears.length > 0) {
      activeYearCE = availableYears[0];
    } else {
      activeYearCE = 2026;
      if (!allCalendars['2026']) {
        allCalendars['2026'] = JSON.parse(JSON.stringify(DEFAULT_CALENDAR_2026));
      }
      currentCompany.calendars['2026'] = allCalendars['2026'];
    }

    // โหลดการตั้งค่าโครงสร้างค่าเงินเฉพาะของ User ที่กำลัง Active
    const uid = (typeof getActiveEditingUserId === 'function') ? getActiveEditingUserId() : 'user_admin';
    const userCfgKey = getScopedUserKey(STORAGE_KEY_SALARY_CONFIG);
    const rawSalaryCfg = localStorage.getItem(userCfgKey);
    if (rawSalaryCfg) {
      const parsedCfg = JSON.parse(rawSalaryCfg);
      userBaseSalaryConfig = isZeroedLegacySalaryConfig(parsedCfg)
        ? { ...DEFAULT_SALARY_CONFIG }
        : Object.assign({}, DEFAULT_SALARY_CONFIG, parsedCfg);
    } else if (uid === 'user_admin') {
      const legacyCfg = localStorage.getItem(STORAGE_KEY_SALARY_CONFIG);
      if (legacyCfg) {
        const parsedLegacy = JSON.parse(legacyCfg);
        userBaseSalaryConfig = isZeroedLegacySalaryConfig(parsedLegacy)
          ? { ...DEFAULT_SALARY_CONFIG }
          : Object.assign({}, DEFAULT_SALARY_CONFIG, parsedLegacy);
      } else {
        userBaseSalaryConfig = { ...DEFAULT_SALARY_CONFIG };
      }
    } else {
      userBaseSalaryConfig = { ...DEFAULT_SALARY_CONFIG };
    }
    currentSalaryConfig = { ...userBaseSalaryConfig };

    // โหลดการตั้งค่าค่าเงินเฉพาะของแต่ละงวดเดือน (พร้อมกรองค่า 0 ตกค้างจากเวอร์ชันเก่าออก)
    const userPeriodCfgKey = getScopedUserKey(STORAGE_KEY_PERIOD_SALARY_CONFIGS);
    const rawPeriodSalaryCfg = localStorage.getItem(userPeriodCfgKey);
    if (rawPeriodSalaryCfg) {
      try {
        periodSalaryConfigs = sanitizePeriodSalaryConfigs(JSON.parse(rawPeriodSalaryCfg) || {});
      } catch (e) {
        periodSalaryConfigs = {};
      }
    } else if (uid === 'user_admin') {
      const legacyPeriodCfg = localStorage.getItem(STORAGE_KEY_PERIOD_SALARY_CONFIGS);
      try {
        periodSalaryConfigs = legacyPeriodCfg ? sanitizePeriodSalaryConfigs(JSON.parse(legacyPeriodCfg)) : {};
      } catch (e) {
        periodSalaryConfigs = {};
      }
    } else {
      periodSalaryConfigs = {};
    }

    // อัปเดตข้อมูลพนักงานในสลิปตาม Active User และ Active Company
    syncSalaryProfileWithActiveUser();
  } catch (e) {
    console.error('Storage load failed, using default', e);
    allCompanies = { 'orbray': JSON.parse(JSON.stringify(DEFAULT_ORBRAY_COMPANY)) };
    activeCompanyId = 'orbray';
    allCalendars = allCompanies['orbray'].calendars;
    activeYearCE = 2026;
    userBaseSalaryConfig = { ...DEFAULT_SALARY_CONFIG };
    periodSalaryConfigs = {};
    currentSalaryConfig = { ...DEFAULT_SALARY_CONFIG };
  }
}

function saveCalendarsToStorage() {
  try {
    if (allCompanies[activeCompanyId]) {
      allCompanies[activeCompanyId].calendars = allCalendars;
      saveCompaniesToStorage();
    }
    if (activeCompanyId === 'orbray') {
      localStorage.setItem(STORAGE_KEY_CALENDARS, JSON.stringify(allCalendars));
    }
    localStorage.setItem(STORAGE_KEY_YEAR, activeYearCE.toString());
    if (typeof syncDataToCloud === 'function') {
      syncDataToCloud('activeYearCE', activeYearCE);
    }
  } catch (e) {
    console.warn('Storage save failed', e);
  }
}

/**
 * รวบรวมข้อมูลทั้งหมดในเครื่อง (LocalStorage) ของ targetId เพื่อเตรียมอัปโหลดขึ้น Cloud Firestore
 */
window.collectAllLocalDataForCloud = function(targetId = null) {
  const uid = targetId || ((typeof getActiveEditingUserId === 'function') ? getActiveEditingUserId() : 'user_admin');
  const savedPeriodId = localStorage.getItem(STORAGE_KEY_ACTIVE_PERIOD) || (currentPeriod ? currentPeriod.id : null);
  const payload = {
    allCompanies: allCompanies,
    activeCompanyId: activeCompanyId,
    activeYearCE: activeYearCE,
    activePeriodId: savedPeriodId
  };

  try {
    const cfgRaw = localStorage.getItem(`${STORAGE_KEY_SALARY_CONFIG}_${uid}`)
      || (uid === 'user_admin' ? localStorage.getItem(STORAGE_KEY_SALARY_CONFIG) : null);
    if (cfgRaw) {
      const parsed = JSON.parse(cfgRaw);
      payload.salaryConfig = isZeroedLegacySalaryConfig(parsed) ? { ...DEFAULT_SALARY_CONFIG } : parsed;
    } else if (userBaseSalaryConfig) {
      payload.salaryConfig = isZeroedLegacySalaryConfig(userBaseSalaryConfig) ? { ...DEFAULT_SALARY_CONFIG } : userBaseSalaryConfig;
    }
  } catch (e) {}

  try {
    const pCfgRaw = localStorage.getItem(`${STORAGE_KEY_PERIOD_SALARY_CONFIGS}_${uid}`)
      || (uid === 'user_admin' ? localStorage.getItem(STORAGE_KEY_PERIOD_SALARY_CONFIGS) : null);
    if (pCfgRaw) {
      payload.periodSalaryConfigs = sanitizePeriodSalaryConfigs(JSON.parse(pCfgRaw));
    } else if (periodSalaryConfigs && Object.keys(periodSalaryConfigs).length > 0) {
      payload.periodSalaryConfigs = sanitizePeriodSalaryConfigs(periodSalaryConfigs);
    } else {
      payload.periodSalaryConfigs = {};
    }
  } catch (e) {}

  // รวบรวมข้อมูลตารางเวลาทำงาน (Attendance) ของทุกบริษัทและทุกงวดเดือน
  try {
    const compIds = Object.keys(allCompanies || { 'orbray': true });
    compIds.forEach(compId => {
      const compStoreKey = `${STORAGE_KEY_ATTENDANCE}_${compId}_${uid}`;
      let rawAtt = localStorage.getItem(compStoreKey);
      if (!rawAtt && compId === 'orbray') {
        rawAtt = localStorage.getItem(`${STORAGE_KEY_ATTENDANCE}_${uid}`)
          || (uid === 'user_admin' ? localStorage.getItem(STORAGE_KEY_ATTENDANCE) : null);
      }
      if (rawAtt) {
        const parsedAtt = JSON.parse(rawAtt);
        if (parsedAtt && typeof parsedAtt === 'object') {
          Object.keys(parsedAtt).forEach(periodId => {
            if (Array.isArray(parsedAtt[periodId]) && parsedAtt[periodId].length > 0) {
              payload[`attendance_${compId}_${periodId}`] = parsedAtt[periodId];
            }
          });
        }
      }
    });
  } catch (e) {}

  return payload;
};

/**
 * นำข้อมูลที่ได้จาก Cloud Firestore มาผสานลง LocalStorage และอัปเดตหน้าจอทันที
 */
window.applyCloudDataToLocal = function(cloudData, targetId = null) {
  if (!cloudData || typeof cloudData !== 'object') return;
  const uid = targetId || ((typeof getActiveEditingUserId === 'function') ? getActiveEditingUserId() : 'user_admin');

  try {
    // 1. ผสานข้อมูลทะเบียนบริษัทและปฏิทิน (allCompanies)
    if (cloudData.allCompanies && typeof cloudData.allCompanies === 'object') {
      const mergedCompanies = Object.assign({}, cloudData.allCompanies);
      if (!mergedCompanies['orbray']) {
        mergedCompanies['orbray'] = JSON.parse(JSON.stringify(DEFAULT_ORBRAY_COMPANY));
      }
      allCompanies = mergedCompanies;
      localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(allCompanies));
      if (allCompanies['orbray'] && allCompanies['orbray'].calendars) {
        localStorage.setItem(STORAGE_KEY_CALENDARS, JSON.stringify(allCompanies['orbray'].calendars));
      }
    }

    if (cloudData.activeCompanyId && allCompanies && allCompanies[cloudData.activeCompanyId]) {
      activeCompanyId = cloudData.activeCompanyId;
      localStorage.setItem(STORAGE_KEY_ACTIVE_COMPANY, activeCompanyId);
    }

    if (cloudData.activeYearCE) {
      activeYearCE = parseInt(cloudData.activeYearCE, 10) || 2026;
      localStorage.setItem(STORAGE_KEY_YEAR, String(activeYearCE));
    }

    if (cloudData.activePeriodId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_PERIOD, String(cloudData.activePeriodId));
    }

    // 2. ผสานโครงสร้างเงินเดือนหลัก (salaryConfig) โดยไม่ใช้ค่า 0 ตกค้างจากเวอร์ชันเก่ามาทับ
    if (cloudData.salaryConfig && typeof cloudData.salaryConfig === 'object') {
      const cleanCloudCfg = isZeroedLegacySalaryConfig(cloudData.salaryConfig)
        ? { ...DEFAULT_SALARY_CONFIG }
        : Object.assign({}, DEFAULT_SALARY_CONFIG, cloudData.salaryConfig);
      const userCfgKey = `${STORAGE_KEY_SALARY_CONFIG}_${uid}`;
      localStorage.setItem(userCfgKey, JSON.stringify(cleanCloudCfg));
      if (uid === 'user_admin') {
        localStorage.setItem(STORAGE_KEY_SALARY_CONFIG, JSON.stringify(cleanCloudCfg));
      }
    }

    // 3. ผสานโครงสร้างเงินเดือนรายงวด (periodSalaryConfigs) ให้ตรงกับ Cloud ล่าสุด
    if (cloudData.periodSalaryConfigs && typeof cloudData.periodSalaryConfigs === 'object') {
      const userPeriodCfgKey = `${STORAGE_KEY_PERIOD_SALARY_CONFIGS}_${uid}`;
      const cleanCloudPeriods = sanitizePeriodSalaryConfigs(cloudData.periodSalaryConfigs);
      localStorage.setItem(userPeriodCfgKey, JSON.stringify(cleanCloudPeriods));
      if (uid === 'user_admin') {
        localStorage.setItem(STORAGE_KEY_PERIOD_SALARY_CONFIGS, JSON.stringify(cleanCloudPeriods));
      }
    }

    // 4. ผสานข้อมูลตารางลงเวลาทำงาน (เรียงคีย์ legacy ก่อน แล้วค่อยทับด้วยคีย์ที่มีรหัสบริษัท)
    const attKeys = Object.keys(cloudData)
      .filter(k => k.startsWith('attendance_'))
      .sort((a, b) => {
        const aHasComp = a.substring('attendance_'.length).includes('_') ? 1 : 0;
        const bHasComp = b.substring('attendance_'.length).includes('_') ? 1 : 0;
        return aHasComp - bHasComp;
      });

    attKeys.forEach(key => {
      const rows = cloudData[key];
      if (!Array.isArray(rows)) return;

      // รูปแบบ key: attendance_<compId>_<YYYY-MM> หรือ attendance_<YYYY-MM>
      const withoutPrefix = key.substring('attendance_'.length);
      const lastUnderscore = withoutPrefix.lastIndexOf('_');
      let compId = 'orbray';
      let periodId = withoutPrefix;
      if (lastUnderscore > 0) {
        compId = withoutPrefix.substring(0, lastUnderscore);
        periodId = withoutPrefix.substring(lastUnderscore + 1);
      }

      const compStoreKey = `${STORAGE_KEY_ATTENDANCE}_${compId}_${uid}`;
      let compStore = {};
      try {
        const raw = localStorage.getItem(compStoreKey);
        if (raw) compStore = JSON.parse(raw) || {};
      } catch (e) {}
      compStore[periodId] = rows;
      localStorage.setItem(compStoreKey, JSON.stringify(compStore));

      if (compId === 'orbray') {
        const legacyKey = `${STORAGE_KEY_ATTENDANCE}_${uid}`;
        let legacyStore = {};
        try {
          const rawL = localStorage.getItem(legacyKey);
          if (rawL) legacyStore = JSON.parse(rawL) || {};
        } catch (e) {}
        legacyStore[periodId] = rows;
        localStorage.setItem(legacyKey, JSON.stringify(legacyStore));
      }
    });

    // 5. รีเฟรชหน้าจอให้แสดงข้อมูลล่าสุดทันที
    window.refreshAllViewsAfterCloudSync();
    if (typeof window.broadcastStorageToSimulator === 'function') {
      window.broadcastStorageToSimulator();
    }
  } catch (err) {
    console.warn('applyCloudDataToLocal error:', err);
  }
};

/**
 * รีเฟรช UI ทั้งหมดหลังซิงก์ข้อมูลจาก Cloud หรือเปลี่ยนสถานะจากอีกหน้าจอ
 */
window.refreshAllViewsAfterCloudSync = function() {
  const savedPeriodId = localStorage.getItem(STORAGE_KEY_ACTIVE_PERIOD) || (currentPeriod ? currentPeriod.id : null);
  loadStorageData();
  renderCompanyDropdown();
  updateYearSelectDropdown();
  refreshPeriodSelector(savedPeriodId);
  renderOrbrayCalendarGrid();
  updateRateLabelsOnCards();
  updateCardPeriodBadge();
  recalculateSalary();
  updateAdminScopeBanner();
  updateNavbarAuthUI(currentUser, isFirebaseOnline);
};

function saveAttendanceToStorage(periodId, rows) {
  try {
    const compStoreKey = getScopedCompanyAttendanceKey();
    let compStore = {};
    const rawComp = localStorage.getItem(compStoreKey);
    if (rawComp) compStore = JSON.parse(rawComp);
    compStore[periodId] = rows;
    localStorage.setItem(compStoreKey, JSON.stringify(compStore));

    // บันทึกลง key เดิมของ Orbray เพื่อรองรับความเข้ากันได้
    if (activeCompanyId === 'orbray') {
      const storeKey = getScopedUserKey(STORAGE_KEY_ATTENDANCE);
      let store = {};
      const raw = localStorage.getItem(storeKey);
      if (raw) store = JSON.parse(raw);
      store[periodId] = rows;
      localStorage.setItem(storeKey, JSON.stringify(store));
    }

    // ซิงค์ข้อมูลลง Cloud
    if (typeof syncDataToCloud === 'function') {
      syncDataToCloud(`attendance_${activeCompanyId}_${periodId}`, rows);
    }
  } catch (e) {
    console.warn('Attendance save failed', e);
  }
}

function loadAttendanceFromStorage(periodId) {
  try {
    const compStoreKey = getScopedCompanyAttendanceKey();
    let raw = localStorage.getItem(compStoreKey);

    // Fallback สำหรับ Orbray
    if (!raw && activeCompanyId === 'orbray') {
      const uid = (typeof getActiveEditingUserId === 'function') ? getActiveEditingUserId() : 'user_admin';
      const storeKey = getScopedUserKey(STORAGE_KEY_ATTENDANCE);
      raw = localStorage.getItem(storeKey);
      if (!raw && uid === 'user_admin') {
        raw = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
      }
    }

    if (raw) {
      const store = JSON.parse(raw);
      if (store[periodId] && Array.isArray(store[periodId])) {
        return store[periodId];
      }
    }
  } catch (e) {
    console.warn('Attendance load failed', e);
  }
  return null;
}

// ==========================================================================
// 5. ระบบคำนวณวันและรอบการจ่ายเงินเดือน (Calendar & Periods Generator)
// ==========================================================================
const THAI_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function toBE(v) {
  const n = parseInt(v, 10);
  if (!n) return NaN;
  return n < 2400 ? n + 543 : n;
}

const ENGLISH_MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

function getLastDayOfMonth(year, monthIndex) {
  const d = new Date(year, monthIndex + 1, 0);
  return d.getDate();
}

function formatDay2Digit(n) {
  return n < 10 ? '0' + n : '' + n;
}

function generatePayrollPeriodsForYear(yearCE) {
  const yearBE = yearCE + 543;
  const periods = [];

  for (let m = 0; m < 12; m++) {
    const monthNum = m + 1;
    const monthName = `${THAI_MONTHS[m]} ${yearCE}`;
    const periodId = `${yearCE}-${formatDay2Digit(monthNum)}`;

    let startYear = yearCE;
    let startMonth = m - 1;
    let startYearBE = yearBE;
    if (startMonth < 0) {
      startMonth = 11;
      startYear = yearCE - 1;
      startYearBE = yearBE - 1;
    }
    const startMonthName = THAI_MONTHS[startMonth];
    const endMonthName = THAI_MONTHS[m];
    const startMonthNameEN = ENGLISH_MONTHS[startMonth];
    const endMonthNameEN = ENGLISH_MONTHS[m];
    const startDate = `${startYear}-${formatDay2Digit(startMonth + 1)}-21`;
    const endDate = `${yearCE}-${formatDay2Digit(monthNum)}-20`;

    const lastDay = getLastDayOfMonth(yearCE, m);
    const payDate = `${formatDay2Digit(lastDay)}/${formatDay2Digit(monthNum)}/${yearCE}`;
    const displayName = `${endMonthName} ${yearCE}`;

    periods.push({
      id: periodId,
      yearCE,
      yearBE,
      monthIndex: m,
      monthName,
      startMonthName,
      endMonthName,
      startMonthNameEN,
      endMonthNameEN,
      displayName,
      startYear,
      startYearBE,
      startDate,
      endDate,
      payDate
    });
  }
  return periods;
}

function getOrbrayDayInfo(dateStr) {
  const yearCE = parseInt(dateStr.split('-')[0], 10);
  const cal = allCalendars[yearCE] || allCalendars[activeYearCE] || (allCompanies[activeCompanyId] && allCompanies[activeCompanyId].calendars[yearCE]) || DEFAULT_CALENDAR_2026;

  if (cal.customDayOverrides && cal.customDayOverrides[dateStr]) {
    const ov = cal.customDayOverrides[dateStr];
    return getDayTypeConfig(ov.type, ov.name);
  }

  if (cal.nationalHolidays && cal.nationalHolidays.includes(dateStr)) {
    return getDayTypeConfig('NATIONAL_HOLIDAY');
  }
  if (cal.memorialHolidays && cal.memorialHolidays.includes(dateStr)) {
    return getDayTypeConfig('MEMORIAL_HOLIDAY');
  }
  if (cal.bridgeHolidays && cal.bridgeHolidays.includes(dateStr)) {
    return getDayTypeConfig('BRIDGE_HOLIDAY');
  }
  if ((cal.orbrayWorkDays && cal.orbrayWorkDays.includes(dateStr)) || (cal.specialWorkDays && cal.specialWorkDays.includes(dateStr))) {
    return getDayTypeConfig('ORBRAY_WORKDAY');
  }

  const d = new Date(dateStr);
  const dayOfWeek = d.getDay();

  if (dayOfWeek === 0) {
    return getDayTypeConfig('SUNDAY');
  }

  if (dayOfWeek === 6) {
    if (cal.workingSaturdays && cal.workingSaturdays.includes(dateStr)) {
      return getDayTypeConfig('WORKING_SATURDAY');
    } else {
      return getDayTypeConfig('SATURDAY_HOLIDAY');
    }
  }

  return getDayTypeConfig('NORMAL_WORKDAY');
}

function getDayTypeConfig(type, customName = null) {
  switch (type) {
    case 'NATIONAL_HOLIDAY':
      return { type, name: customName || 'Public holiday', shortName: 'Holiday', isWorkDay: false, badgeClass: 'badge-national', calClass: 'day-national-holiday' };
    case 'MEMORIAL_HOLIDAY':
      return { type, name: customName || 'Paid company holiday', shortName: 'Holiday', isWorkDay: false, badgeClass: 'badge-memorial', calClass: 'day-memorial-holiday' };
    case 'ORBRAY_WORKDAY':
      return { type, name: customName || 'Special workday', shortName: 'Special', isWorkDay: true, badgeClass: 'badge-orbray', calClass: 'day-orbray-work' };
    case 'WORKING_SATURDAY':
      return { type, name: customName || 'Working Saturday', shortName: 'Work Sat', isWorkDay: true, badgeClass: 'badge-work-sat', calClass: 'day-working-sat' };
    case 'SATURDAY_HOLIDAY':
      return { type, name: customName || 'Saturday off', shortName: 'Sat off', isWorkDay: false, badgeClass: 'badge-sat-holiday', calClass: 'day-sat-holiday' };
    case 'SUNDAY':
      return { type, name: customName || 'Sunday', shortName: 'Sunday', isWorkDay: false, badgeClass: 'badge-sunday', calClass: 'day-sunday' };
    case 'BRIDGE_HOLIDAY':
      return { type, name: customName || 'Bridge holiday', shortName: 'Bridge', isWorkDay: false, badgeClass: 'badge-bridge', calClass: 'day-bridge' };
    default:
      return { type: 'NORMAL_WORKDAY', name: customName || 'Workday', shortName: 'Workday', isWorkDay: true, badgeClass: 'badge-workday', calClass: '' };
  }
}

// ==========================================================================
// 6. การคำนวณ OT จากเวลาออกงาน
// ==========================================================================
function getOTFromTimeOut(timeOutStr) {
  if (!timeOutStr) return 0;
  const t = timeOutStr.trim();
  switch (t) {
    case '17:00': return 0;
    case '17:30': return 0.5;
    case '17:50': return 0.5;
    case '18:00': return 1.0;
    case '18:20': return 1.0;
    case '18:30': return 1.0;
    case '18:50': return 1.5;
    case '19:00': return 1.5;
    case '19:20': return 2.0;
    case '19:50': return 2.5;
    default:
      const parts = t.split(':');
      if (parts.length === 2) {
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const effectiveH = h < 8 ? h + 24 : h;
        const totalMinutes = (effectiveH * 60 + m) - (17 * 60);
        if (totalMinutes <= 0) return 0;
        return Math.floor((totalMinutes / 60) * 2) / 2;
      }
      return 0;
  }
}

function updateRowOT(row) {
  if (!row.workDay || !row.outTime) {
    row.ot = 0;
    row.hol = 0;
    row.otHol = 0;
    row.otDay = 0;
    return;
  }
  const dayInfo = getOrbrayDayInfo(row.date);

  if (dayInfo.isWorkDay) {
    row.ot = getOTFromTimeOut(row.outTime);
    row.hol = 0;
    row.otHol = 0;
  } else {
    row.ot = 0;
    const parts = row.outTime.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const effectiveH = h < 8 ? h + 24 : h;
    const totalMinutes = effectiveH * 60 + m;

    const normalEndMinutes = 17 * 60;
    const startMinutes = 8 * 60;
    const lunchStart = 12 * 60;
    const lunchEnd = 13 * 60;

    if (totalMinutes <= normalEndMinutes) {
      let workMins = 0;
      if (totalMinutes <= lunchStart) {
        workMins = totalMinutes - startMinutes;
      } else if (totalMinutes <= lunchEnd) {
        workMins = lunchStart - startMinutes;
      } else {
        workMins = (totalMinutes - startMinutes) - 60;
      }
      if (workMins < 0) workMins = 0;
      row.hol = Math.floor((workMins / 60) * 2) / 2;
      row.otHol = 0;
    } else {
      row.hol = 8.0;
      row.otHol = getOTFromTimeOut(row.outTime);
    }
  }

  row.otDay = (row.ot >= 1 || row.hol >= 1 || row.otHol >= 1) ? 1 : 0;
}

// ==========================================================================
// 7. การสร้างและจัดการตารางเข้า-ออกงาน (Timesheet Table)
// ==========================================================================
const LEAVE_TYPES = {
  ANNUAL: { label: 'Annual leave', shortLabel: 'Annual', deductDiligence: false, badgeClass: 'badge-leave-annual' },
  SICK: { label: 'Sick leave', shortLabel: 'Sick', deductDiligence: true, badgeClass: 'badge-leave-deduct' },
  PERSONAL: { label: 'Personal leave', shortLabel: 'Personal', deductDiligence: true, badgeClass: 'badge-leave-deduct' },
  OTHER: { label: 'Other leave', shortLabel: 'Other', deductDiligence: true, badgeClass: 'badge-leave-deduct' }
};

function isTargetWorkDayInfo(dayInfo) {
  if (!dayInfo) return false;
  return (
    dayInfo.isWorkDay === true ||
    dayInfo.type === 'NORMAL_WORKDAY' ||
    dayInfo.type === 'WORKING_SATURDAY' ||
    dayInfo.type === 'ORBRAY_WORKDAY' ||
    dayInfo.name === 'วันทำงานปกติ' ||
    dayInfo.name === 'เสาร์ทำงาน' ||
    dayInfo.name === 'วันเสาร์ทำงานปกติ' ||
    dayInfo.name === 'วันทำงานพิเศษ'
  );
}

function buildAttendanceTable() {
  const tbody = document.getElementById('attendanceTbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const thaiDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const sundayOutOptions = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
    '16:30', '17:00', '17:30', '17:50', '18:00', '18:20', '18:30', '18:50',
    '19:00', '19:20', '19:50',
    '20:20', '20:50', '21:20', '21:50', '22:20', '22:50', '23:20', '23:50',
    '00:20', '00:50', '01:20', '01:50', '02:20', '02:50', '03:20', '03:50',
    '04:20', '04:50', '05:20', '05:50', '06:20', '06:50', '07:20', '07:50'
  ];

  const normalInOptions = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30'
  ];

  const normalOutOptions = [
    '17:00', '17:30', '17:50', '18:20', '18:50', '19:20', '19:50',
    '20:20', '20:50', '21:20', '21:50', '22:20', '22:50', '23:20', '23:50',
    '00:20', '00:50', '01:20', '01:50', '02:20', '02:50', '03:20', '03:50',
    '04:20', '04:50', '05:20', '05:50', '06:20', '06:50', '07:20', '07:50'
  ];

  currentAttendance.forEach((row, idx) => {
    const d = new Date(row.date);
    const dayName = thaiDays[d.getDay()];
    const dayInfo = getOrbrayDayInfo(row.date);

    const tr = document.createElement('tr');
    if (!dayInfo.isWorkDay) {
      tr.classList.add('row-holiday');
    }

    const isSundayOrHoliday = !dayInfo.isWorkDay;
    const availableOptions = isSundayOrHoliday ? sundayOutOptions : normalOutOptions;

    let inOptionsHtml = `<option value="" ${!row.inTime ? 'selected' : ''}>-</option>`;
    normalInOptions.forEach(opt => {
      const isSelected = (row.inTime === opt || (!row.inTime && row.workDay && opt === '08:00'));
      inOptionsHtml += `<option value="${opt}" ${isSelected ? 'selected' : ''}>${opt}</option>`;
    });

    let optionsHtml = `<option value="" ${!row.outTime ? 'selected' : ''}>-</option>`;
    availableOptions.forEach(opt => {
      const isSelected = (row.outTime === opt || (opt === '18:20' && row.outTime === '18:00'));
      optionsHtml += `<option value="${opt}" ${isSelected ? 'selected' : ''}>${opt}</option>`;
    });

    const totalRowOT = (row.workDay ? ((row.ot || 0) + (row.hol || 0) + (row.otHol || 0)) : 0);
    const otDisplay = totalRowOT > 0 ? totalRowOT.toFixed(1) : '-';
    const outTimeText = row.workDay && row.outTime ? row.outTime : '-';

    const isTargetDay = isTargetWorkDayInfo(dayInfo);
    const leaveCode = (!row.workDay && row.leaveType && LEAVE_TYPES[row.leaveType]) ? row.leaveType : '';
    const leaveObj = leaveCode ? LEAVE_TYPES[leaveCode] : null;
    const showLeaveSelector = !row.workDay && (isTargetDay || !!leaveCode);

    let leaveSelectHtml = '';
    if (showLeaveSelector) {
      leaveSelectHtml = `
        <select class="form-control form-control-sm form-select leave-type-select ${leaveCode ? (leaveCode === 'ANNUAL' ? 'leave-select-annual' : 'leave-select-deduct') : ''}"
          onchange="onAttendanceLeaveTypeChange(${idx}, this.value)"
          title="Select leave type">
          <option value="" ${!leaveCode ? 'selected' : ''}>Leave type…</option>
          <option value="ANNUAL" ${leaveCode === 'ANNUAL' ? 'selected' : ''}>Annual</option>
          <option value="SICK" ${leaveCode === 'SICK' ? 'selected' : ''}>Sick</option>
          <option value="PERSONAL" ${leaveCode === 'PERSONAL' ? 'selected' : ''}>Personal</option>
          <option value="OTHER" ${leaveCode === 'OTHER' ? 'selected' : ''}>Other</option>
        </select>
      `;
    }

    const mobileLeaveTagHtml = leaveObj
      ? `<div class="leave-status-subbadge ${leaveObj.badgeClass}">${leaveObj.shortLabel}</div>`
      : '';

    tr.innerHTML = `
      <!-- Col 0: Mobile Only Edit Icon Button -->
      <td class="col-att-edit mobile-only-table-cell text-center">
        <button type="button" class="btn-att-edit-mini" onclick="openAttendanceEditModal(${idx})" title="Edit">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      </td>

      <!-- Col 1: วันที่ -->
      <td class="col-att-date text-center font-monospace">${row.date.split('-').slice(1).join('/')}</td>

      <!-- Col 2: วัน -->
      <td class="col-att-day text-center font-weight-bold">${dayName}</td>

      <!-- Col 3: สถานะ -->
      <td class="col-att-status text-center">
        <span class="day-badge ${dayInfo.badgeClass}">
          <span class="desktop-only-inline">${dayInfo.name}</span>
          <span class="mobile-only-inline">${dayInfo.shortName || dayInfo.name}</span>
        </span>
        ${mobileLeaveTagHtml}
      </td>

      <!-- Col 4: เวลาเข้า (Desktop Only) -->
      <td class="col-att-in desktop-only-table-cell text-center">
        <select class="form-control form-control-sm form-select text-center" 
          onchange="onAttendanceTimeChange(${idx}, 'in', this.value)" 
          ${!row.workDay ? 'disabled' : ''}>
          ${inOptionsHtml}
        </select>
      </td>

      <!-- Col 5: เวลาออก (Desktop shows select, Mobile shows formatted text) -->
      <td class="col-att-out text-center">
        <span class="mobile-only-inline font-monospace font-weight-bold ${row.workDay && row.outTime ? 'text-primary' : 'text-muted'}">
          ${outTimeText}
        </span>
        <span class="desktop-only-inline">
          <select class="form-control form-control-sm form-select text-center" 
            onchange="onAttendanceTimeChange(${idx}, 'out', this.value)" 
            ${!row.workDay ? 'disabled' : ''}>
            ${optionsHtml}
          </select>
        </span>
      </td>

      <!-- Col 6: OT 1.5 (Desktop Only) -->
      <td class="col-att-ot15 desktop-only-table-cell text-right font-monospace ${row.workDay && row.ot > 0 ? 'text-primary font-weight-bold' : 'text-muted'}">
        ${row.workDay && row.ot ? row.ot.toFixed(1) : '0'}
      </td>

      <!-- Col 7: HOLIDAY 1.0 (Desktop Only) -->
      <td class="col-att-hol desktop-only-table-cell text-right font-monospace ${row.workDay && row.hol > 0 ? 'text-primary font-weight-bold' : 'text-muted'}">
        ${row.workDay && row.hol ? row.hol.toFixed(1) : '0'}
      </td>

      <!-- Col 8: OT HOL 3.0 (Desktop Only) -->
      <td class="col-att-othol desktop-only-table-cell text-right font-monospace ${row.workDay && row.otHol > 0 ? 'text-primary font-weight-bold' : 'text-muted'}">
        ${row.workDay && row.otHol ? row.otHol.toFixed(1) : '0'}
      </td>

      <!-- Col 9: OT รวม (Mobile Only) -->
      <td class="col-att-ot-total mobile-only-table-cell text-center font-monospace font-weight-bold ${totalRowOT > 0 ? 'text-primary' : 'text-muted'}">
        ${otDisplay}
      </td>

      <!-- Col 10: มาทำงาน / การลา (Desktop Only Checkbox + Leave Select) -->
      <td class="col-att-workday desktop-only-table-cell text-center">
        <div class="workday-cell-wrap">
          <input type="checkbox" ${row.workDay ? 'checked' : ''} onchange="onAttendanceToggleWorkDay(${idx}, this.checked)" title="Tick if worked">
          ${leaveSelectHtml}
        </div>
      </td>

      <!-- Col 11: วันที่มา (Desktop Only) -->
      <td class="col-att-come desktop-only-table-cell text-center">
        <span class="${row.come ? 'text-success font-weight-bold' : (leaveObj ? 'text-primary font-weight-bold' : 'text-muted')}" title="${leaveObj ? `${leaveObj.label}` : ''}">${row.come ? '1' : '0'}</span>
      </td>

      <!-- Col 12: วันทำ OT (Desktop Only) -->
      <td class="col-att-otday desktop-only-table-cell text-center">
        <span class="${row.otDay ? 'text-primary font-weight-bold' : 'text-muted'}">${row.otDay ? '1' : '0'}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });

  recalculateAttendanceTotals();
}

function onAttendanceTimeChange(index, field, value) {
  const row = currentAttendance[index];
  if (field === 'out') {
    row.outTime = value ? value.trim() : '';
  } else if (field === 'in') {
    row.inTime = value ? value.trim() : '';
  }
  updateRowOT(row);
  buildAttendanceTable();
  recalculateSalary();
  saveCurrentAttendance();
}

function onAttendanceToggleWorkDay(index, isChecked) {
  const row = currentAttendance[index];
  row.workDay = isChecked ? 1 : 0;
  row.come = isChecked ? 1 : 0;

  if (isChecked) {
    row.leaveType = '';
    row.inTime = '08:00';
    if (!row.outTime) {
      row.outTime = '17:00';
    }
    updateRowOT(row);
  } else {
    row.inTime = '';
    row.outTime = '';
    row.ot = 0;
    row.hol = 0;
    row.otHol = 0;
    row.otDay = 0;
    if (typeof row.leaveType === 'undefined') {
      row.leaveType = '';
    }
  }

  buildAttendanceTable();
  recalculateSalary();
  saveCurrentAttendance();
}

function onAttendanceLeaveTypeChange(index, leaveTypeVal) {
  const row = currentAttendance[index];
  if (!row) return;
  row.leaveType = leaveTypeVal || '';
  if (row.leaveType) {
    row.workDay = 0;
    row.come = 0;
    row.inTime = '';
    row.outTime = '';
    row.ot = 0;
    row.hol = 0;
    row.otHol = 0;
    row.otDay = 0;
  }
  buildAttendanceTable();
  recalculateSalary();
  saveCurrentAttendance();
}

function recalculateAttendanceTotals() {
  let totalOT15 = 0;
  let totalHol = 0;
  let totalOTHol = 0;
  let totalTargetDays = 0;
  let totalCameDays = 0;
  let totalOTDays = 0;
  let totalLeaveDays = 0;
  let totalAnnualLeaveDays = 0;
  let totalOtherLeaveDays = 0;
  let unexcusedAbsentTargetDays = 0;
  const leaveDeductionReasons = [];

  currentAttendance.forEach(row => {
    totalOT15 += parseFloat(row.ot) || 0;
    totalHol += parseFloat(row.hol) || 0;
    totalOTHol += parseFloat(row.otHol) || 0;

    // วันทำงานเป้าหมาย: นับตามจำนวนวันทำงานปกติ และเสาร์ทำงาน รวมกันแทน
    const dayInfo = getOrbrayDayInfo(row.date);
    const isTargetDay = isTargetWorkDayInfo(dayInfo);
    if (isTargetDay) {
      totalTargetDays += 1;
    }

    const came = parseInt(row.come, 10) || 0;
    totalCameDays += came;
    totalOTDays += parseInt(row.otDay, 10) || 0;

    const leaveCode = (!came && row.leaveType && LEAVE_TYPES[row.leaveType]) ? row.leaveType : '';
    if (leaveCode) {
      totalLeaveDays += 1;
      if (leaveCode === 'ANNUAL') {
        totalAnnualLeaveDays += 1;
      } else {
        totalOtherLeaveDays += 1;
        leaveDeductionReasons.push(LEAVE_TYPES[leaveCode].label);
      }
    } else if (isTargetDay && !came) {
      unexcusedAbsentTargetDays += 1;
    }
  });

  const elOT15 = document.getElementById('attTotalOT15');
  const elHol = document.getElementById('attTotalHol');
  const elOTHol = document.getElementById('attTotalOTHol');
  const elTarget = document.getElementById('attTotalTargetDays');
  const elCame = document.getElementById('attTotalCameDays');
  const elOTDays = document.getElementById('attTotalOTDays');

  if (elOT15) elOT15.innerText = totalOT15.toFixed(1);
  if (elHol) elHol.innerText = totalHol.toFixed(1);
  if (elOTHol) elOTHol.innerText = totalOTHol.toFixed(1);
  if (elTarget) elTarget.innerText = totalTargetDays;
  if (elCame) elCame.innerText = totalCameDays;
  if (elOTDays) elOTDays.innerText = totalOTDays;

  // อัปเดตแถบสรุปสำหรับมือถือ (Mobile Sum Row)
  const elMobileCame = document.getElementById('attMobileCameDays');
  const elMobileTarget = document.getElementById('attMobileTargetDays');
  const elMobileOT = document.getElementById('attMobileTotalOT');
  if (elMobileCame) elMobileCame.innerText = totalCameDays;
  if (elMobileTarget) elMobileTarget.innerText = totalTargetDays;
  if (elMobileOT) elMobileOT.innerText = (totalOT15 + totalHol + totalOTHol).toFixed(1);

  const paidDays = totalCameDays + totalLeaveDays;
  const isDiligenceEligible = (
    totalTargetDays > 0 &&
    totalOtherLeaveDays === 0 &&
    unexcusedAbsentTargetDays === 0 &&
    (totalCameDays + totalAnnualLeaveDays) >= totalTargetDays
  );

  return {
    totalOT15,
    totalHol,
    totalOTHol,
    totalTargetDays,
    totalCameDays,
    totalOTDays,
    totalLeaveDays,
    totalAnnualLeaveDays,
    totalOtherLeaveDays,
    unexcusedAbsentTargetDays,
    paidDays,
    isDiligenceEligible,
    leaveDeductionReasons
  };
}

// ==========================================================================
// 7.1 ระบบแก้ไขเวลาทำงานสำหรับมือถือ (Mobile Attendance Quick Edit Modal)
// ==========================================================================
let currentAttEditIndex = -1;

function openAttendanceEditModal(idx) {
  if (idx === undefined || idx === null || idx < 0 || idx >= currentAttendance.length) return;
  currentAttEditIndex = idx;
  const row = currentAttendance[idx];
  const dayInfo = getOrbrayDayInfo(row.date);
  const thaiDaysLong = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = new Date(row.date);
  const dayLong = thaiDaysLong[d.getDay()];

  const modal = document.getElementById('modalAttendanceEdit');
  if (!modal) return;

  const idxEl = document.getElementById('attEditRowIndex');
  if (idxEl) idxEl.value = idx;

  const subEl = document.getElementById('attEditModalSubtitle');
  if (subEl) subEl.innerText = `${row.date} (${dayLong})`;

  const badgeEl = document.getElementById('attEditDayBadge');
  if (badgeEl) {
    badgeEl.className = `day-badge ${dayInfo.badgeClass}`;
    badgeEl.innerText = dayInfo.name;
  }

  const checkEl = document.getElementById('attEditWorkDayCheck');
  if (checkEl) {
    checkEl.checked = !!row.workDay;
  }

  const hintEl = document.getElementById('attEditWorkStatusHint');
  if (hintEl) {
    hintEl.innerText = row.workDay ? 'Worked — record clock-in / clock-out' : 'Did not work today';
  }

  const normalInOptions = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30'
  ];

  const sundayOutOptions = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
    '16:30', '17:00', '17:30', '17:50', '18:00', '18:20', '18:30', '18:50',
    '19:00', '19:20', '19:50',
    '20:20', '20:50', '21:20', '21:50', '22:20', '22:50', '23:20', '23:50',
    '00:20', '00:50', '01:20', '01:50', '02:20', '02:50', '03:20', '03:50',
    '04:20', '04:50', '05:20', '05:50', '06:20', '06:50', '07:20', '07:50'
  ];

  const normalOutOptions = [
    '17:00', '17:30', '17:50', '18:20', '18:50', '19:20', '19:50',
    '20:20', '20:50', '21:20', '21:50', '22:20', '22:50', '23:20', '23:50',
    '00:20', '00:50', '01:20', '01:50', '02:20', '02:50', '03:20', '03:50',
    '04:20', '04:50', '05:20', '05:50', '06:20', '06:50', '07:20', '07:50'
  ];

  const isSundayOrHoliday = !dayInfo.isWorkDay;
  const availableOptions = isSundayOrHoliday ? sundayOutOptions : normalOutOptions;

  const inSelectEl = document.getElementById('attEditInTimeSelect');
  if (inSelectEl) {
    inSelectEl.innerHTML = `<option value="">— None —</option>`;
    normalInOptions.forEach(opt => {
      const isSelected = (row.inTime === opt || (!row.inTime && row.workDay && opt === '08:00'));
      inSelectEl.innerHTML += `<option value="${opt}" ${isSelected ? 'selected' : ''}>${opt}</option>`;
    });
    inSelectEl.disabled = !row.workDay;
  }

  const selectEl = document.getElementById('attEditOutTimeSelect');
  if (selectEl) {
    selectEl.innerHTML = `<option value="">— None —</option>`;
    availableOptions.forEach(opt => {
      const isSelected = (row.outTime === opt || (opt === '18:20' && row.outTime === '18:00'));
      selectEl.innerHTML += `<option value="${opt}" ${isSelected ? 'selected' : ''}>${opt}</option>`;
    });
    selectEl.disabled = !row.workDay;
  }

  const leaveGroupEl = document.getElementById('attEditLeaveGroup');
  const leaveSelectEl = document.getElementById('attEditLeaveTypeSelect');
  const isTargetDay = isTargetWorkDayInfo(dayInfo);
  const currentLeave = (!row.workDay && row.leaveType && LEAVE_TYPES[row.leaveType]) ? row.leaveType : '';

  if (leaveSelectEl) {
    leaveSelectEl.value = currentLeave;
  }
  if (leaveGroupEl) {
    leaveGroupEl.style.display = (!row.workDay && (isTargetDay || !!currentLeave)) ? 'block' : 'none';
  }
  updateAttEditModalLeaveHint(currentLeave);

  updateAttEditModalPreview();
  modal.style.display = 'flex';
}

function closeAttendanceEditModal() {
  const modal = document.getElementById('modalAttendanceEdit');
  if (modal) modal.style.display = 'none';
  currentAttEditIndex = -1;
}

function updateAttEditModalLeaveHint(leaveVal) {
  const hintEl = document.getElementById('attEditLeaveDiligenceHint');
  if (!hintEl) return;
  if (leaveVal === 'ANNUAL') {
    hintEl.innerText = 'Annual leave: base salary paid, diligence allowance kept.';
    hintEl.style.color = 'var(--success-color, #16a34a)';
  } else if (leaveVal && LEAVE_TYPES[leaveVal]) {
    hintEl.innerText = `${LEAVE_TYPES[leaveVal].label}: base salary paid, but diligence allowance is deducted.`;
    hintEl.style.color = 'var(--danger-color, #dc2626)';
  } else {
    hintEl.innerText = '* Absence without annual leave deducts the diligence allowance.';
    hintEl.style.color = 'var(--text-muted)';
  }
}

function onAttEditModalLeaveChange(leaveVal) {
  updateAttEditModalLeaveHint(leaveVal);
}

function onAttEditModalWorkDayToggle(isChecked) {
  const inSelectEl = document.getElementById('attEditInTimeSelect');
  const selectEl = document.getElementById('attEditOutTimeSelect');
  const hintEl = document.getElementById('attEditWorkStatusHint');
  const leaveGroupEl = document.getElementById('attEditLeaveGroup');
  const leaveSelectEl = document.getElementById('attEditLeaveTypeSelect');

  if (inSelectEl) {
    inSelectEl.disabled = !isChecked;
    if (isChecked && (!inSelectEl.value || inSelectEl.value === '')) {
      inSelectEl.value = '08:00';
    }
  }

  if (selectEl) {
    selectEl.disabled = !isChecked;
    if (isChecked && (!selectEl.value || selectEl.value === '')) {
      selectEl.value = '17:00';
    }
  }
  if (hintEl) {
    hintEl.innerText = isChecked ? 'Worked — record clock-in / clock-out' : 'Did not work today';
  }

  if (leaveGroupEl) {
    if (isChecked) {
      leaveGroupEl.style.display = 'none';
    } else if (currentAttEditIndex >= 0 && currentAttEditIndex < currentAttendance.length) {
      const row = currentAttendance[currentAttEditIndex];
      const dayInfo = getOrbrayDayInfo(row.date);
      const isTargetDay = isTargetWorkDayInfo(dayInfo);
      leaveGroupEl.style.display = (isTargetDay || (leaveSelectEl && leaveSelectEl.value)) ? 'block' : 'none';
    }
  }

  updateAttEditModalPreview();
}

function onAttEditModalTimeChange(val) {
  updateAttEditModalPreview();
}

function updateAttEditModalPreview() {
  if (currentAttEditIndex < 0 || currentAttEditIndex >= currentAttendance.length) return;
  const origRow = currentAttendance[currentAttEditIndex];
  const isWork = document.getElementById('attEditWorkDayCheck') ? document.getElementById('attEditWorkDayCheck').checked : false;
  const inTime = isWork && document.getElementById('attEditInTimeSelect') ? document.getElementById('attEditInTimeSelect').value : '';
  const outTime = isWork && document.getElementById('attEditOutTimeSelect') ? document.getElementById('attEditOutTimeSelect').value : '';

  const tempRow = { ...origRow, workDay: isWork ? 1 : 0, come: isWork ? 1 : 0, inTime: inTime, outTime: outTime };
  updateRowOT(tempRow);

  const totalOT = (tempRow.ot || 0) + (tempRow.hol || 0) + (tempRow.otHol || 0);

  const ot15El = document.getElementById('attEditPreviewOT15');
  const holEl = document.getElementById('attEditPreviewHol');
  const otHolEl = document.getElementById('attEditPreviewOTHol');
  const sumEl = document.getElementById('attEditTotalOTSum');

  if (ot15El) ot15El.innerText = `${(tempRow.ot || 0).toFixed(1)} h`;
  if (holEl) holEl.innerText = `${(tempRow.hol || 0).toFixed(1)} h`;
  if (otHolEl) otHolEl.innerText = `${(tempRow.otHol || 0).toFixed(1)} h`;
  if (sumEl) sumEl.innerText = `${totalOT.toFixed(1)} h`;
}

function saveAttendanceEditModal() {
  if (currentAttEditIndex < 0 || currentAttEditIndex >= currentAttendance.length) return;
  const row = currentAttendance[currentAttEditIndex];
  const isWork = document.getElementById('attEditWorkDayCheck') ? document.getElementById('attEditWorkDayCheck').checked : false;
  const inTime = isWork && document.getElementById('attEditInTimeSelect') ? document.getElementById('attEditInTimeSelect').value : '';
  const outTime = isWork && document.getElementById('attEditOutTimeSelect') ? document.getElementById('attEditOutTimeSelect').value : '';
  const leaveSelectEl = document.getElementById('attEditLeaveTypeSelect');

  row.workDay = isWork ? 1 : 0;
  row.come = isWork ? 1 : 0;
  row.leaveType = (!isWork && leaveSelectEl) ? (leaveSelectEl.value || '') : '';
  row.inTime = inTime ? inTime.trim() : (isWork ? '08:00' : '');
  row.outTime = outTime ? outTime.trim() : '';

  updateRowOT(row);
  buildAttendanceTable();
  recalculateSalary();
  saveCurrentAttendance();

  closeAttendanceEditModal();

  if (typeof showToast === 'function') {
    showToast(`Saved attendance for ${row.date}`, 'success');
  }
}

function autoFillNormalWorkdays(shouldSave = true) {
  currentAttendance.forEach(row => {
    const dayInfo = getOrbrayDayInfo(row.date);
    if (dayInfo.isWorkDay) {
      row.workDay = 1;
      row.come = 1;
      row.leaveType = '';
      row.inTime = '08:00';
      row.outTime = '17:00';
      row.ot = 0;
      row.hol = 0;
      row.otHol = 0;
      row.otDay = 0;
    } else {
      row.workDay = 0;
      row.come = 0;
      row.leaveType = '';
      row.inTime = '';
      row.outTime = '';
      row.ot = 0;
      row.hol = 0;
      row.otHol = 0;
      row.otDay = 0;
    }
  });
  if (shouldSave) {
    buildAttendanceTable();
    recalculateSalary();
    saveCurrentAttendance();
  }
}

function clearAttendanceTable() {
  if (!confirm('Clear all times in this period?')) return;
  currentAttendance.forEach(row => {
    row.workDay = 0;
    row.come = 0;
    row.leaveType = '';
    row.inTime = '';
    row.outTime = '';
    row.ot = 0;
    row.hol = 0;
    row.otHol = 0;
    row.otDay = 0;
  });
  buildAttendanceTable();
  recalculateSalary();
  saveCurrentAttendance();
}

function generateAttendanceForPeriod(startStr, endStr) {
  const rows = [];
  const [sy, sm, sd] = startStr.split('-').map(Number);
  const [ey, em, ed] = endStr.split('-').map(Number);
  let cur = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  while (cur <= end) {
    const y = cur.getFullYear();
    const m = ('0' + (cur.getMonth() + 1)).slice(-2);
    const d = ('0' + cur.getDate()).slice(-2);
    const dStr = `${y}-${m}-${d}`;
    const dayInfo = getOrbrayDayInfo(dStr);
    rows.push({
      date: dStr,
      inTime: dayInfo.isWorkDay ? '08:00' : '',
      outTime: dayInfo.isWorkDay ? '17:00' : '',
      ot: 0,
      hol: 0,
      otHol: 0,
      workDay: dayInfo.isWorkDay ? 1 : 0,
      come: dayInfo.isWorkDay ? 1 : 0,
      leaveType: '',
      otDay: 0
    });
    cur.setDate(cur.getDate() + 1);
  }
  currentAttendance = rows;
}

function saveCurrentAttendance() {
  if (currentPeriod && currentAttendance) {
    saveAttendanceToStorage(currentPeriod.id, currentAttendance);
  }
}

function loadAttendanceFromExcel() {
  currentAttendance = JSON.parse(JSON.stringify(EXCEL_SAMPLE_ATTENDANCE));
  salaryProfile.periodMonth = 'September';
  salaryProfile.payDate = '30/09/2569';
  buildAttendanceTable();
  recalculateSalary();
  saveCurrentAttendance();
  alert('Loaded 31 days of attendance from DATA SALARY 210826-200926.xlsx.');
}

// ==========================================================================
// 8. ระบบคำนวณเงินเดือนตามสูตร Excel (Salary Calculation Engine)
// ==========================================================================
function calculatePayroll() {
  recalculateSalary();
}

function recalculateSalary() {
  const totals = recalculateAttendanceTotals();

  const B2_targetDays = totals.totalTargetDays;
  const D2_cameDays = totals.totalCameDays;
  const paidDays = totals.paidDays;
  const F2_otDays = totals.totalOTDays;
  const G2_ot15Hours = totals.totalOT15;
  const H2_ot1Hours = totals.totalHol;
  const I2_ot3Hours = totals.totalOTHol;

  const baseSalary = typeof currentSalaryConfig.baseSalary !== 'undefined' ? Number(currentSalaryConfig.baseSalary) : DEFAULT_SALARY_CONFIG.baseSalary;
  const diligenceFullAmount = Number(currentSalaryConfig.diligenceFullAmount) || 0;
  const transportationAllowance = Number(currentSalaryConfig.transportationAllowance) || 0;
  const foodPerDay = Number(currentSalaryConfig.foodPerDay) || 0;
  const otMealPerDay = Number(currentSalaryConfig.otMealPerDay) || 0;
  const ot15Multiplier = Number(currentSalaryConfig.ot15Multiplier) || 1.5;
  const ot1Multiplier = Number(currentSalaryConfig.ot1Multiplier) || 1.0;
  const ot3Multiplier = Number(currentSalaryConfig.ot3Multiplier) || 3.0;
  const ssoDeduction = typeof currentSalaryConfig.ssoDeduction !== 'undefined' ? Number(currentSalaryConfig.ssoDeduction) : 0;

  const C2_dailyRate = B2_targetDays > 0 ? (baseSalary / B2_targetDays) : 0;
  const E2_actualSalary = (B2_targetDays > 0 && paidDays >= B2_targetDays)
    ? baseSalary
    : Math.round(C2_dailyRate * paidDays);

  const J2_foodAllowance = foodPerDay * D2_cameDays;
  const K2_otMealAllowance = otMealPerDay * F2_otDays;
  const L2_travelAllowance = transportationAllowance;
  const M2_diligenceAllowance = totals.isDiligenceEligible ? diligenceFullAmount : 0;

  // ฐานค่าจ้างต่อชั่วโมงปกติ: (เงินเดือน / 30 / 8)
  const baseHourlyRate = baseSalary > 0 ? (baseSalary / 30 / 8) : 0;
  const hourlyOTRate = baseHourlyRate;

  // 1. วันปกติ: (เงินเดือน/30/8) * (1.5 * ชั่วโมง OT1.5) -> ปัดเศษ >= 0.5 ขึ้น, < 0.5 ลง
  const N2_ot15Amount = Math.round(baseHourlyRate * (ot15Multiplier * G2_ot15Hours));

  // 2. วันฮอลิเดย์: (เงินเดือน/30/8) * (1 * ชั่วโมง OT1 หรือทำงาน 08:00-17:00 ของช่วงวันหยุดฮอลิเดย์) -> ปัดเศษ >= 0.5 ขึ้น, < 0.5 ลง
  const O2_ot1Amount = Math.round(baseHourlyRate * (ot1Multiplier * H2_ot1Hours));

  // 3. OT ฮอลิเดย์: (เงินเดือน/30/8) * (3 * ชั่วโมง OT3 หรือทำงาน 17:00-19:20 ของช่วงวันหยุดฮอลิเดย์) -> ปัดเศษ >= 0.5 ขึ้น, < 0.5 ลง
  const P2_ot3Amount = Math.round(baseHourlyRate * (ot3Multiplier * I2_ot3Hours));

  // ยอดหักประกันสังคม: ถ้าไม่มีรายได้เลยและไม่มีฐานเงินเดือน (เช่น ยังไม่ได้เริ่มงาน) ให้ยอดหักเป็น 0
  const totalEarnings = E2_actualSalary + J2_foodAllowance + K2_otMealAllowance + L2_travelAllowance +
                        M2_diligenceAllowance + N2_ot15Amount + O2_ot1Amount + P2_ot3Amount;
  const Q2_sso = (totalEarnings === 0 && baseSalary === 0) ? 0 : ssoDeduction;
  const totalDeductions = Q2_sso;
  const netPay = Math.max(0, totalEarnings - totalDeductions);

  // อัปเดตการ์ด Dashboard ด้านบน
  const elTotalIncome = document.getElementById('dashTotalIncome');
  const elTotalDeduct = document.getElementById('dashTotalDeduct');
  const elNetPay = document.getElementById('dashNetPay');
  if (elTotalIncome) elTotalIncome.innerText = formatCurrency(totalEarnings);
  if (elTotalDeduct) elTotalDeduct.innerText = formatCurrency(totalDeductions);
  if (elNetPay) elNetPay.innerText = formatCurrency(netPay);

  // อัปเดต Hero Header สถิติสำคัญ
  setElText('heroTargetDays', B2_targetDays);
  setElText('heroNetPay', formatCurrency(netPay));
  const totalOTHours = (G2_ot15Hours + H2_ot1Hours + I2_ot3Hours).toFixed(1);
  setElText('heroTotalOTHours', totalOTHours);

  // อัปเดตการ์ดภาพรวมบันทึกเวลาทำงานบนหน้าคำนวณเงินเดือน (Quick Overview)
  setElText('quickCameDays', D2_cameDays);
  setElText('quickTargetDays', B2_targetDays);
  setElText('quickTotalOTHours', totalOTHours);
  setElText('quickTotalOTDays', F2_otDays);

  // อัปเดตแถบ KPI บนหน้าบันทึกเวลาออกงาน (Attendance Page)
  setElText('attCardTargetDays', `${B2_targetDays} days`);
  setElText('attCardCameDays', `${D2_cameDays} days`);
  setElText('attCardOTHours', `${Number(totalOTHours || 0).toFixed(1)} h`);
  setElText('attCardNetPay', `฿${formatCurrency(netPay)}`);

  // อัปเดตรายการคำนวณเงินเดือนในการ์ด (รูปที่ 2)
  setElText('calcBaseSalary', formatCurrency(baseSalary));
  setElText('calcTargetDays', B2_targetDays);
  setElText('calcDailyRate', formatCurrency(C2_dailyRate));
  setElText('calcCameDays', D2_cameDays);
  setElText('calcActualSalary', formatCurrency(E2_actualSalary));

  setElText('calcFoodDays', D2_cameDays);
  setElText('calcFoodTotal', formatCurrency(J2_foodAllowance));

  setElText('calcOTMealDays', F2_otDays);
  setElText('calcOTMealTotal', formatCurrency(K2_otMealAllowance));

  setElText('calcTravelTotal', formatCurrency(L2_travelAllowance));

  const diligenceStatusEl = document.getElementById('calcDiligenceStatus');
  if (diligenceStatusEl) {
    if (totals.isDiligenceEligible) {
      diligenceStatusEl.innerText = totals.totalAnnualLeaveDays > 0
        ? `Full attendance (${totals.totalAnnualLeaveDays} days annual leave)`
        : 'Full attendance';
      diligenceStatusEl.className = 'badge-status-ok';
    } else if (totals.totalOtherLeaveDays > 0) {
      const uniqueLeaves = [...new Set(totals.leaveDeductionReasons)].join('/');
      diligenceStatusEl.innerText = `Diligence deducted (${uniqueLeaves} ${totals.totalOtherLeaveDays} days)`;
      diligenceStatusEl.className = 'day-badge badge-sunday';
    } else {
      diligenceStatusEl.innerText = 'Incomplete attendance';
      diligenceStatusEl.className = 'day-badge badge-sunday';
    }
  }
  const lblDiligenceSubtitle = document.getElementById('lblDiligenceSubtitle');
  if (lblDiligenceSubtitle) {
    const rateTxt = formatCurrency(currentSalaryConfig.diligenceFullAmount);
    if (totals.isDiligenceEligible) {
      lblDiligenceSubtitle.innerHTML = `Full calendar attendance (rate ฿<span id="lblRateDiligence">${rateTxt}</span>)`;
    } else if (totals.totalOtherLeaveDays > 0) {
      const uniqueLeaves = [...new Set(totals.leaveDeductionReasons)].join(', ');
      lblDiligenceSubtitle.innerHTML = `<span class="text-danger font-weight-bold">Deducted due to ${uniqueLeaves}</span> (rate ฿<span id="lblRateDiligence">${rateTxt}</span>)`;
    } else {
      lblDiligenceSubtitle.innerHTML = `Full calendar attendance (rate ฿<span id="lblRateDiligence">${rateTxt}</span>)`;
    }
  }
  setElText('calcDiligenceTotal', formatCurrency(M2_diligenceAllowance));

  setElText('calcHourlyOTRate', formatCurrency(hourlyOTRate));
  setElText('calcOT15Hours', G2_ot15Hours.toFixed(1));
  setElText('calcOT15Total', formatCurrency(N2_ot15Amount));

  setElText('calcOT1Hours', H2_ot1Hours.toFixed(1));
  setElText('calcOT1Total', formatCurrency(O2_ot1Amount));

  setElText('calcOT3Hours', I2_ot3Hours.toFixed(1));
  setElText('calcOT3Total', formatCurrency(P2_ot3Amount));

  setElText('calcSSOTotal', Q2_sso > 0 ? `-${formatCurrency(Q2_sso)}` : '0.00');
  setElText('calcSumIncome', formatCurrency(totalEarnings));
  setElText('calcSumDeduct', totalDeductions > 0 ? `-${formatCurrency(totalDeductions)}` : '0.00');
  setElText('calcGrandNetPay', formatCurrency(netPay));
  setElText('calcNetPayRow', formatCurrency(netPay));

  // อัปเดต Insight Panel (สัดส่วนรายได้ / วงแหวนการมาทำงาน / อัตราค่าจ้าง)
  const regularIncome = E2_actualSalary + J2_foodAllowance + L2_travelAllowance + M2_diligenceAllowance;
  const otIncome = K2_otMealAllowance + N2_ot15Amount + O2_ot1Amount + P2_ot3Amount;
  const mixTotal = regularIncome + otIncome + totalDeductions;
  const pct = (v) => mixTotal > 0 ? (v / mixTotal * 100) : 0;
  const pReg = pct(regularIncome), pOT = pct(otIncome), pDed = pct(totalDeductions);
  const segReg = document.getElementById('mixSegRegular');
  const segOT = document.getElementById('mixSegOT');
  const segDed = document.getElementById('mixSegDeduct');
  if (segReg) segReg.style.width = `${pReg}%`;
  if (segOT) segOT.style.width = `${pOT}%`;
  if (segDed) segDed.style.width = `${pDed}%`;
  setElText('mixPctRegular', `${Math.round(pReg)}%`);
  setElText('mixPctOT', `${Math.round(pOT)}%`);
  setElText('mixPctDeduct', `${Math.round(pDed)}%`);

  const attRatio = B2_targetDays > 0 ? Math.min(1, D2_cameDays / B2_targetDays) : 0;
  const ringFg = document.getElementById('attRingFg');
  if (ringFg) ringFg.setAttribute('stroke-dashoffset', (113.1 * (1 - attRatio)).toFixed(1));
  const ringTxt = document.getElementById('attRingPct');
  if (ringTxt) ringTxt.textContent = `${Math.round(attRatio * 100)}%`;
  setElText('insCameDays', D2_cameDays);
  setElText('insTargetDays', B2_targetDays);
  const missingDays = Math.max(0, B2_targetDays - paidDays);
  let insStatusText = `${missingDays} days short`;
  if (totals.isDiligenceEligible) {
    insStatusText = totals.totalAnnualLeaveDays > 0
      ? `${totals.totalAnnualLeaveDays} days annual leave · diligence earned`
      : 'Full attendance · diligence earned';
  } else if (totals.totalOtherLeaveDays > 0) {
    const uniqueLeaves = [...new Set(totals.leaveDeductionReasons)].join('/');
    insStatusText = `${uniqueLeaves} ${totals.totalOtherLeaveDays} days · diligence deducted`;
  }
  setElText('insAttStatus', insStatusText);

  setElText('insDailyRate', formatCurrency(C2_dailyRate));
  setElText('insHourlyRate', formatCurrency(baseHourlyRate));
  setElText('insOT15Rate', formatCurrency(baseHourlyRate * ot15Multiplier));
  setElText('cardPayDateDisplay', salaryProfile.payDate || '-');

  // Sync with Grand Net Formula Strip
  setElText('netBoxIncomeVal', formatCurrency(totalEarnings));
  setElText('netBoxDeductVal', totalDeductions > 0 ? formatCurrency(totalDeductions) : '0.00');
  setElText('netBoxNetVal', formatCurrency(netPay));
  if (currentPeriod) {
    setElText('netBoxPeriod', `${currentPeriod.endMonthName} ${currentPeriod.yearCE}`);
    setElText('netBoxPayDate', currentPeriod.payDate || salaryProfile.payDate || '-');
  }

  // ปรับปรุงข้อความระบุอัตราบนหน้าจอให้ตรงกับการตั้งค่าปัจจุบัน
  updateRateLabelsOnCards();

  updatePayslip({
    actualSalary: E2_actualSalary,
    diligence: M2_diligenceAllowance,
    travel: L2_travelAllowance,
    food: J2_foodAllowance,
    otMeal: K2_otMealAllowance,
    ot15: N2_ot15Amount,
    ot1: O2_ot1Amount,
    ot3: P2_ot3Amount,
    totalEarnings,
    totalDeductions,
    netPay
  });
}

function updateRateLabelsOnCards() {
  setElText('lblRateDiligence', formatCurrency(currentSalaryConfig.diligenceFullAmount));
  setElText('lblFoodTitle', `Meal allowance (฿${currentSalaryConfig.foodPerDay} / day)`);
  setElText('lblFoodPerDay', currentSalaryConfig.foodPerDay);
  setElText('lblOTMealTitle', `OT meal (฿${currentSalaryConfig.otMealPerDay} / day)`);
  setElText('lblOTMealPerDay', currentSalaryConfig.otMealPerDay);
  setElText('calcTravelTotal', formatCurrency(currentSalaryConfig.transportationAllowance));
  
  const baseFormatted = formatCurrency(currentSalaryConfig.baseSalary);

  setElText('lblOT15Title', `Overtime ${currentSalaryConfig.ot15Multiplier}× (workday)`);
  setElText('lblOT15Mult', currentSalaryConfig.ot15Multiplier);
  setElText('lblOT15Base', baseFormatted);
  setElText('lblOT15Days', '30');

  setElText('lblOT1Title', `Holiday ${currentSalaryConfig.ot1Multiplier}× (8 h on holiday)`);
  setElText('lblOT1Mult', currentSalaryConfig.ot1Multiplier);
  setElText('lblOT1Base', baseFormatted);
  setElText('lblOT1Days', '30');

  setElText('lblOT3Title', `Holiday OT ${currentSalaryConfig.ot3Multiplier}× (after 17:00)`);
  setElText('lblOT3Mult', currentSalaryConfig.ot3Multiplier);
  setElText('lblOT3Base', baseFormatted);
  setElText('lblOT3Days', '30');

  setElText('lblSSOMaxBase', formatCurrency(currentSalaryConfig.ssoMaxBase));
}

function updateCardPeriodBadge() {
  const badgeEl = document.getElementById('cardPeriodBadge');
  const statusEl = document.getElementById('cardPeriodConfigStatusBadge');
  const subtitleEl = document.getElementById('cardPeriodSubtitle');

  if (!currentPeriod) return;

  if (badgeEl) {
    badgeEl.innerText = (currentPeriod.endMonthNameEN || '').toUpperCase();
  }

  const hasOverride = Boolean(periodSalaryConfigs && periodSalaryConfigs[currentPeriod.id]);
  if (statusEl) {
    statusEl.style.display = 'none';
  }

  if (subtitleEl) {
    const daysCount = (currentAttendance && currentAttendance.length) ? currentAttendance.length : 31;
    const _fmtD = (iso, withYear) => { const d = new Date(iso + 'T00:00:00'); if (isNaN(d)) return iso; const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]; return `${d.getDate()} ${m}` + (withYear ? ` ${d.getFullYear()}` : ''); };
    subtitleEl.innerText = `${_fmtD(currentPeriod.startDate)} – ${_fmtD(currentPeriod.endDate, true)} · ${daysCount} days · ${hasOverride ? 'Custom rates' : 'Standard rates'}`;
  }
}

function updatePayslip(calc) {
  // หน้าสลิปเงินเดือนถูกนำออกตามที่ผู้ใช้ร้องขอ
}

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function formatCurrency(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ==========================================================================
// 9. ระบบจัดการปฏิทินแบบเพิ่มปี (Dynamic Multi-Year Calendar UI)
// ==========================================================================
function renderOrbrayCalendarGrid() {
  const grid = document.getElementById('orbrayCalendarGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const cal = allCalendars[activeYearCE] || allCalendars['2026'];
  const yearCE = cal.yearCE;
  const yearBE = cal.yearBE;

  setElText('calHeaderYear', `${yearCE}`);

  const activeComp = allCompanies[activeCompanyId] || allCompanies['orbray'];
  if (activeComp) {
    setElText('calHeaderCompanyBadge', activeComp.name.toUpperCase());
    const calCompSel = document.getElementById('calHeaderCompanySelect');
    if (calCompSel && calCompSel.value !== activeCompanyId) {
      calCompSel.value = activeCompanyId;
    }
  }

  const deleteBtn = document.getElementById('btnDeleteCurrentYear');
  if (deleteBtn) {
    deleteBtn.style.display = (yearCE === 2026 && Object.keys(allCalendars).length <= 1) ? 'none' : 'inline-flex';
  }

  const thaiDayHeaders = ['S', 'M', 'T', 'W', 'TH', 'F', 'S'];

  for (let m = 0; m < 12; m++) {
    const monthCard = document.createElement('div');
    monthCard.className = 'cal-month-card';

    const lastDay = getLastDayOfMonth(yearCE, m);
    const firstDayDate = new Date(yearCE, m, 1);
    const firstDayOfWeek = firstDayDate.getDay();

    const monthNum = m + 1;
    const periodId = `${yearCE}-${formatDay2Digit(monthNum)}`;

    let html = `
      <div class="cal-month-header">
        <div>
          <h3>${m + 1}. ${THAI_MONTHS[m]}</h3>
          <span class="th-name">${yearCE}</span>
        </div>
        <button type="button" class="btn btn-sm btn-outline-primary" onclick="selectPeriodMonth('${periodId}')" title="Open this period">
          Open period
        </button>
      </div>
      <table class="cal-mini-table">
        <thead>
          <tr>
            ${thaiDayHeaders.map((dh, i) => `<th class="${i === 0 ? 'col-sun' : ''}">${dh}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `;

    let currentDay = 1;
    for (let r = 0; r < 6; r++) {
      if (currentDay > lastDay) break;
      html += '<tr>';
      for (let c = 0; c < 7; c++) {
        if (r === 0 && c < firstDayOfWeek) {
          html += '<td class="cal-day-cell"></td>';
        } else if (currentDay > lastDay) {
          html += '<td class="cal-day-cell"></td>';
        } else {
          const dateStr = `${yearCE}-${formatDay2Digit(m + 1)}-${formatDay2Digit(currentDay)}`;
          const dayInfo = getOrbrayDayInfo(dateStr);
          const customClass = dayInfo.calClass || '';

          html += `
            <td class="cal-day-cell">
              <span class="cal-day-num ${customClass}" 
                title="${dayInfo.name} (${dateStr})"
                onclick="openEditDayModal('${dateStr}')">
                ${currentDay}
              </span>
            </td>
          `;
          currentDay++;
        }
      }
      html += '</tr>';
    }

    html += '</tbody></table>';
    monthCard.innerHTML = html;
    grid.appendChild(monthCard);
  }
}

function updateYearSelectDropdown() {
  const select = document.getElementById('appYearSelect');
  if (!select) return;
  select.innerHTML = '';

  const years = Object.keys(allCalendars).map(Number).sort((a, b) => a - b);
  years.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y;
    const cal = allCalendars[y];
    opt.innerText = `Year ${cal.yearCE}`;
    if (y === activeYearCE) opt.selected = true;
    select.appendChild(opt);
  });
}

function onAppYearChange() {
  const select = document.getElementById('appYearSelect');
  if (!select) return;
  activeYearCE = parseInt(select.value, 10);
  saveCalendarsToStorage();

  renderCompanyDropdown();
  refreshPeriodSelector();
  renderOrbrayCalendarGrid();
}

function refreshPeriodSelector(preferredPeriodId = null) {
  const select1 = document.getElementById('payrollPeriodSelect');
  const select2 = document.getElementById('payrollPeriodSelectAtt');
  const selects = [select1, select2].filter(Boolean);
  if (selects.length === 0) return;

  const periods = generatePayrollPeriodsForYear(activeYearCE);
  selects.forEach(select => {
    select.innerHTML = '';
    periods.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.innerText = p.displayName;
      select.appendChild(opt);
    });
  });

  const savedPeriodId = preferredPeriodId || localStorage.getItem(STORAGE_KEY_ACTIVE_PERIOD);
  const currentMonthNum = new Date().getMonth() + 1;
  const matchPeriod = (savedPeriodId && periods.find(p => p.id === savedPeriodId))
    || periods.find(p => p.monthIndex + 1 === currentMonthNum)
    || periods[0];
  selects.forEach(select => {
    select.value = matchPeriod.id;
  });

  onPayrollPeriodSelectChange(false);
}

function onPayrollPeriodSelectAttChange() {
  const selectAtt = document.getElementById('payrollPeriodSelectAtt');
  const selectMain = document.getElementById('payrollPeriodSelect');
  if (selectAtt && selectMain) {
    selectMain.value = selectAtt.value;
  }
  onPayrollPeriodSelectChange(true);
}

function onPayrollPeriodSelectChange(isUserAction = true) {
  const select = document.getElementById('payrollPeriodSelect');
  const selectAtt = document.getElementById('payrollPeriodSelectAtt');
  if (!select && !selectAtt) return;

  const activeSelect = select || selectAtt;
  const periodVal = activeSelect.value;
  if (select && select.value !== periodVal) select.value = periodVal;
  if (selectAtt && selectAtt.value !== periodVal) selectAtt.value = periodVal;

  const periods = generatePayrollPeriodsForYear(activeYearCE);
  const found = periods.find(p => p.id === periodVal);
  if (!found) return;

  currentPeriod = found;
  salaryProfile.periodMonth = `${found.endMonthNameEN} ${found.yearCE}`;
  salaryProfile.payDate = found.payDate;

  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_PERIOD, found.id);
    if (isUserAction && typeof syncDataToCloud === 'function') {
      syncDataToCloud('activePeriodId', found.id);
    }
  } catch (e) {}

  // โหลดการตั้งค่าค่าเงินเฉพาะของงวดนี้ (ถ้ามีบันทึกแยกไว้) หรือใช้ค่ามาตรฐาน
  currentSalaryConfig = getSalaryConfigForPeriod(found.id);
  updateRateLabelsOnCards();
  updateCardPeriodBadge();

  const uid = (typeof getActiveEditingUserId === 'function') ? getActiveEditingUserId() : 'user_admin';
  const savedAtt = loadAttendanceFromStorage(found.id);
  if (savedAtt) {
    currentAttendance = savedAtt;
  } else if (found.id === '2026-09' && uid === 'user_admin' && activeCompanyId === 'orbray') {
    currentAttendance = JSON.parse(JSON.stringify(EXCEL_SAMPLE_ATTENDANCE));
  } else {
    generateAttendanceForPeriod(found.startDate, found.endDate);
    autoFillNormalWorkdays(false);
  }

  const periodSubtitle = document.getElementById('timesheetPeriodSubtitle');
  if (periodSubtitle) {
    periodSubtitle.innerText = `${found.displayName} · cut-off ${found.startDate} to ${found.endDate}`;
  }

  const btnExcel = document.getElementById('btnLoadExcelSample');
  if (btnExcel) {
    btnExcel.style.display = (found.id === '2026-09' && uid === 'user_admin' && activeCompanyId === 'orbray') ? 'inline-flex' : 'none';
  }

  buildAttendanceTable();
  recalculateSalary();
}

function navPrevPeriod() {
  const select = document.getElementById('payrollPeriodSelect') || document.getElementById('payrollPeriodSelectAtt');
  if (!select || select.selectedIndex <= 0) return;
  const newIndex = select.selectedIndex - 1;
  const selectMain = document.getElementById('payrollPeriodSelect');
  const selectAtt = document.getElementById('payrollPeriodSelectAtt');
  if (selectMain) selectMain.selectedIndex = newIndex;
  if (selectAtt) selectAtt.selectedIndex = newIndex;
  onPayrollPeriodSelectChange();
}

function navNextPeriod() {
  const select = document.getElementById('payrollPeriodSelect') || document.getElementById('payrollPeriodSelectAtt');
  if (!select || select.selectedIndex >= select.options.length - 1) return;
  const newIndex = select.selectedIndex + 1;
  const selectMain = document.getElementById('payrollPeriodSelect');
  const selectAtt = document.getElementById('payrollPeriodSelectAtt');
  if (selectMain) selectMain.selectedIndex = newIndex;
  if (selectAtt) selectAtt.selectedIndex = newIndex;
  onPayrollPeriodSelectChange();
}

function selectPeriodMonth(periodId) {
  const select = document.getElementById('payrollPeriodSelect');
  const selectAtt = document.getElementById('payrollPeriodSelectAtt');
  if (select) select.value = periodId;
  if (selectAtt) selectAtt.value = periodId;
  onPayrollPeriodSelectChange();
  const calSection = document.getElementById('view-calendar');
  const btnToggle = document.getElementById('btnToggleCalendar');
  if (calSection) calSection.style.display = 'none';
  if (btnToggle) btnToggle.innerText = 'Work calendar';
  switchView('main');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// 10. ระบบเพิ่มปีปฏิทินใหม่ (Add Year Modal)
// ==========================================================================
function openAddYearModal() {
  const nextBE = activeYearCE + 1;
  const inpBE = document.getElementById('inpNewYearBE');
  if (inpBE) inpBE.value = nextBE;
  document.getElementById('addYearModal').style.display = 'flex';
}

function closeAddYearModal() {
  document.getElementById('addYearModal').style.display = 'none';
}

function confirmAddNewYear() {
  const inpBE = document.getElementById('inpNewYearBE');
  const yearBE = toBE(inpBE.value);
  if (!yearBE || yearBE < 2400 || yearBE > 3000) {
    alert('Please enter a valid year (e.g. 2027).');
    return;
  }
  const yearCE = yearBE - 543;

  if (allCalendars[yearCE]) {
    alert(`Year ${yearCE} already exists.`);
    activeYearCE = yearCE;
    updateYearSelectDropdown();
    onAppYearChange();
    closeAddYearModal();
    return;
  }

  const satPreset = document.getElementById('selSatPreset').value;

  const newCal = {
    yearCE,
    yearBE,
    title: `${yearBE} / ${yearCE}`,
    nationalHolidays: [],
    memorialHolidays: [],
    bridgeHolidays: [],
    orbrayWorkDays: [],
    workingSaturdays: [],
    customDayOverrides: {}
  };

  let cur = new Date(yearCE, 0, 1);
  const end = new Date(yearCE, 11, 31);
  let satIndex = 0;

  while (cur <= end) {
    if (cur.getDay() === 6) {
      const dStr = cur.toISOString().split('T')[0];
      if (satPreset === 'ALL_WORK') {
        newCal.workingSaturdays.push(dStr);
      } else if (satPreset === 'ALT_WORK') {
        if (satIndex % 2 === 1) {
          newCal.workingSaturdays.push(dStr);
        }
      }
      satIndex++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  allCalendars[yearCE] = newCal;
  activeYearCE = yearCE;
  saveCalendarsToStorage();

  updateYearSelectDropdown();
  onAppYearChange();
  closeAddYearModal();

  showSuccessPopup('Saved', `Calendar year ${yearCE} has been added.`);
  showToastNotification(`Calendar year ${yearCE} added`);
}

function deleteCurrentYear() {
  const years = Object.keys(allCalendars);
  if (years.length <= 1) {
    alert('Cannot delete: at least one calendar year is required.');
    return;
  }

  const cal = allCalendars[activeYearCE];
  if (!confirm(`Delete the ${cal.yearCE} calendar?`)) return;

  delete allCalendars[activeYearCE];
  activeYearCE = Object.keys(allCalendars).map(Number)[0];
  saveCalendarsToStorage();

  updateYearSelectDropdown();
  onAppYearChange();
}

// ==========================================================================
// 11. กล่องแก้ไขสถานะวันในปฏิทิน (Edit Day Modal)
// ==========================================================================
function openEditDayModal(dateStr) {
  const modal = document.getElementById('editDayModal');
  if (!modal) return;

  const dayInfo = getOrbrayDayInfo(dateStr);
  const d = new Date(dateStr);
  const thaiDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  document.getElementById('modalTargetDateStr').value = dateStr;
  document.getElementById('modalDayDateDisplay').innerText = `${dateStr} (${thaiDays[d.getDay()]})`;

  const select = document.getElementById('modalDayTypeSelect');
  select.value = dayInfo.type;

  const nameInput = document.getElementById('modalHolidayNameInput');
  const cal = allCalendars[activeYearCE] || allCalendars['2026'];
  const override = cal.customDayOverrides ? cal.customDayOverrides[dateStr] : null;

  nameInput.value = override ? (override.name || '') : (dayInfo.type !== 'NORMAL_WORKDAY' ? dayInfo.name : '');
  onModalDayTypeSelectChange();

  modal.style.display = 'flex';
}

function closeEditDayModal() {
  document.getElementById('editDayModal').style.display = 'none';
}

function onModalDayTypeSelectChange() {
  const select = document.getElementById('modalDayTypeSelect');
  const group = document.getElementById('modalHolidayNameGroup');
  if (select.value === 'NORMAL_WORKDAY' || select.value === 'SUNDAY') {
    group.style.display = 'none';
  } else {
    group.style.display = 'block';
  }
}

function saveDayStatusFromModal() {
  const dateStr = document.getElementById('modalTargetDateStr').value;
  const newType = document.getElementById('modalDayTypeSelect').value;
  const holidayName = document.getElementById('modalHolidayNameInput').value.trim();

  const yearCE = parseInt(dateStr.split('-')[0], 10);
  const cal = allCalendars[yearCE];
  if (!cal) return;

  if (!cal.customDayOverrides) cal.customDayOverrides = {};

  cal.customDayOverrides[dateStr] = {
    type: newType,
    name: holidayName || null
  };

  saveCalendarsToStorage();
  renderOrbrayCalendarGrid();

  if (currentPeriod && currentAttendance) {
    const foundRow = currentAttendance.find(r => r.date === dateStr);
    if (foundRow) {
      updateRowOT(foundRow);
      buildAttendanceTable();
      recalculateSalary();
      saveCurrentAttendance();
    }
  }

  closeEditDayModal();
  showSuccessPopup('Saved', 'Day status has been updated.');
  showToastNotification('Day status updated');
}

// ==========================================================================
// 11.1 ระบบเลือกและจัดการหลายบริษัท (Multi-Company & Calendar Registry System)
// ==========================================================================

function renderCompanyDropdown() {
  const ribbonSelect = document.getElementById('ribbonCompanySelect');
  const calHeaderSelect = document.getElementById('calHeaderCompanySelect');
  const selects = [ribbonSelect, calHeaderSelect].filter(Boolean);
  if (selects.length === 0) return;

  const activeComp = allCompanies[activeCompanyId] || allCompanies['orbray'];
  const activeYearBE = activeYearCE + 543;

  selects.forEach(sel => {
    sel.innerHTML = '';

    // รายการบริษัทที่มีข้อมูลในระบบ
    Object.values(allCompanies).forEach(comp => {
      const opt = document.createElement('option');
      opt.value = comp.id;
      opt.innerText = `${comp.name.toUpperCase()} ${activeYearCE}`;
      if (comp.id === activeCompanyId) {
        opt.selected = true;
      }
      sel.appendChild(opt);
    });

    // เส้นคั่น
    const sep = document.createElement('option');
    sep.disabled = true;
    sep.innerText = '──────────';
    sel.appendChild(sep);

    // เมนูเพิ่มบริษัทใหม่
    const optAdd = document.createElement('option');
    optAdd.value = '__ADD_COMPANY__';
    optAdd.innerText = '+ Add company…';
    sel.appendChild(optAdd);

    // เมนูจัดการรายชื่อบริษัท
    const optManage = document.createElement('option');
    optManage.value = '__MANAGE_COMPANIES__';
    optManage.innerText = 'Manage companies…';
    sel.appendChild(optManage);
  });

  // อัปเดต Badge บนหัวปฏิทิน
  const badge = document.getElementById('calHeaderCompanyBadge');
  if (badge && activeComp) {
    badge.innerText = activeComp.name.toUpperCase();
  }
}

function onRibbonCompanyChange(val) {
  if (val === '__ADD_COMPANY__') {
    renderCompanyDropdown();
    openAddCompanyModal();
    return;
  }
  if (val === '__MANAGE_COMPANIES__') {
    renderCompanyDropdown();
    openManageCompaniesModal();
    return;
  }
  switchActiveCompany(val);
}

function switchActiveCompany(companyId) {
  if (!allCompanies[companyId]) return;

  activeCompanyId = companyId;
  saveCompaniesToStorage();

  const comp = allCompanies[activeCompanyId];
  allCalendars = comp.calendars || {};

  // ตรวจสอบปี ค.ศ.
  const years = Object.keys(allCalendars).map(Number).sort((a, b) => a - b);
  if (years.length > 0 && !allCalendars[activeYearCE]) {
    activeYearCE = years[0];
  }
  localStorage.setItem(STORAGE_KEY_YEAR, activeYearCE.toString());

  // อัปเดตชื่อบริษัทใน salaryProfile
  salaryProfile.companyName = comp.name.toUpperCase();

  // รีเฟรชหน้าจอทั้งหมด
  renderCompanyDropdown();
  updateYearSelectDropdown();
  refreshPeriodSelector();
  renderOrbrayCalendarGrid();
  recalculateAttendanceTotals();
  recalculateSalary();

  showToastNotification(`Switched to ${comp.name} (${activeYearCE})`);
}

function openAddCompanyModal() {
  const modal = document.getElementById('addCompanyModal');
  if (!modal) return;

  const nameInput = document.getElementById('compNewName');
  const codeInput = document.getElementById('compNewCode');
  const descInput = document.getElementById('compNewDesc');
  const yearBEInput = document.getElementById('compNewYearBE');
  const satPreset = document.getElementById('compNewSatPreset');
  const natHolsCheck = document.getElementById('compNewUseNationalHols');
  const memHolsInput = document.getElementById('compNewMemorialHols');
  const specialWorkInput = document.getElementById('compNewSpecialWorkdays');

  if (nameInput) nameInput.value = '';
  if (codeInput) codeInput.value = '';
  if (descInput) descInput.value = '';
  if (yearBEInput) yearBEInput.value = activeYearCE.toString();
  if (satPreset) satPreset.value = 'ALL_OFF';
  if (natHolsCheck) natHolsCheck.checked = true;
  if (memHolsInput) memHolsInput.value = '';
  if (specialWorkInput) specialWorkInput.value = '';

  updateCompNewYearCEPreview();
  modal.style.display = 'flex';
  if (nameInput) nameInput.focus();
}

function closeAddCompanyModal() {
  const modal = document.getElementById('addCompanyModal');
  if (modal) modal.style.display = 'none';
}

function updateCompNewYearCEPreview() {
  const inpBE = document.getElementById('compNewYearBE');
  const preview = document.getElementById('compNewYearCEPreview');
  if (!inpBE || !preview) return;
  const val = toBE(inpBE.value);
  if (val && val >= 2400 && val <= 3000) {
    preview.innerText = val.toString();
  } else {
    preview.innerText = '-';
  }
}

function confirmAddNewCompany() {
  const nameInput = document.getElementById('compNewName');
  const codeInput = document.getElementById('compNewCode');
  const descInput = document.getElementById('compNewDesc');
  const yearBEInput = document.getElementById('compNewYearBE');
  const satPreset = document.getElementById('compNewSatPreset')?.value || 'ALL_OFF';
  const useNationalHols = document.getElementById('compNewUseNationalHols')?.checked ?? true;
  const memorialHolsInput = document.getElementById('compNewMemorialHols')?.value.trim() || '';
  const specialWorkdaysInput = document.getElementById('compNewSpecialWorkdays')?.value.trim() || '';

  const name = nameInput ? nameInput.value.trim() : '';
  if (!name) {
    alert('Please enter a company name.');
    nameInput?.focus();
    return;
  }

  const yearBE = toBE(yearBEInput?.value);
  if (!yearBE || yearBE < 2400 || yearBE > 3000) {
    alert('Please enter a valid year (e.g. 2026).');
    yearBEInput?.focus();
    return;
  }
  const yearCE = yearBE - 543;

  // ตรวจสอบชื่อซ้ำ
  const existing = Object.values(allCompanies).find(c => c.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    alert(`A company named "${name}" already exists. Please use another name.`);
    nameInput?.focus();
    return;
  }

  const newId = 'comp_' + Date.now();
  const code = codeInput?.value.trim().toUpperCase() || name.substring(0, 6).toUpperCase();

  // สร้างปฏิทินวันทำงานตามวันที่และรูปแบบที่เลือก
  const newCal = {
    yearCE,
    yearBE,
    title: `${yearBE} / ${yearCE}`,
    nationalHolidays: [],
    memorialHolidays: [],
    bridgeHolidays: [],
    orbrayWorkDays: [],
    specialWorkDays: [],
    workingSaturdays: [],
    customDayOverrides: {}
  };

  // 1. วันหยุดนักขัตฤกษ์
  if (useNationalHols) {
    if (yearCE === 2026) {
      newCal.nationalHolidays = [...DEFAULT_CALENDAR_2026.nationalHolidays];
    } else {
      newCal.nationalHolidays = [
        `${yearCE}-01-01`, `${yearCE}-01-02`, `${yearCE}-04-06`, `${yearCE}-04-13`,
        `${yearCE}-04-14`, `${yearCE}-04-15`, `${yearCE}-05-01`, `${yearCE}-05-04`,
        `${yearCE}-07-28`, `${yearCE}-08-12`, `${yearCE}-10-13`, `${yearCE}-10-23`,
        `${yearCE}-12-05`, `${yearCE}-12-10`, `${yearCE}-12-31`
      ];
    }
  }

  // 2. วันหยุดประเพณีบริษัท
  if (memorialHolsInput) {
    const mHols = memorialHolsInput.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
    mHols.forEach(d => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        newCal.memorialHolidays.push(d);
      }
    });
  }

  // 3. วันทำงานพิเศษของบริษัท
  if (specialWorkdaysInput) {
    const sWorks = specialWorkdaysInput.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
    sWorks.forEach(d => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        newCal.orbrayWorkDays.push(d);
        newCal.specialWorkDays.push(d);
      }
    });
  }

  // 4. วันเสาร์ทำงาน / วันเสาร์หยุด
  if (satPreset === 'CLONE_ORBRAY' && DEFAULT_CALENDAR_2026.workingSaturdays) {
    newCal.workingSaturdays = [...DEFAULT_CALENDAR_2026.workingSaturdays];
  } else {
    let cur = new Date(yearCE, 0, 1);
    const end = new Date(yearCE, 11, 31);
    let satIndex = 0;
    while (cur <= end) {
      if (cur.getDay() === 6) {
        const dStr = cur.toISOString().split('T')[0];
        if (satPreset === 'ALL_WORK') {
          newCal.workingSaturdays.push(dStr);
        } else if (satPreset === 'ALT_WORK') {
          if (satIndex % 2 === 1) {
            newCal.workingSaturdays.push(dStr);
          }
        }
        satIndex++;
      }
      cur.setDate(cur.getDate() + 1);
    }
  }

  // บันทึกบริษัทใหม่
  allCompanies[newId] = {
    id: newId,
    name: name.toUpperCase(),
    code,
    description: descInput?.value.trim() || '',
    isDefault: false,
    createdAt: new Date().toISOString().split('T')[0],
    calendars: {
      [yearCE.toString()]: newCal
    }
  };

  saveCompaniesToStorage();
  closeAddCompanyModal();

  // สลับไปยังบริษัทใหม่ทันที
  switchActiveCompany(newId);

  showSuccessPopup(
    'Company added',
    `"${name}" was created with a ${yearCE} work calendar and is now active.`
  );
}

function openManageCompaniesModal() {
  const modal = document.getElementById('manageCompaniesModal');
  if (!modal) return;
  renderManageCompaniesTable();
  modal.style.display = 'flex';
}

function closeManageCompaniesModal() {
  const modal = document.getElementById('manageCompaniesModal');
  if (modal) modal.style.display = 'none';
}

function renderManageCompaniesTable() {
  const tbody = document.getElementById('manageCompaniesTableBody');
  const countEl = document.getElementById('manageCompTotalCount');
  if (!tbody) return;

  const comps = Object.values(allCompanies);
  if (countEl) countEl.innerText = comps.length.toString();

  tbody.innerHTML = '';
  comps.forEach(comp => {
    const tr = document.createElement('tr');
    tr.className = 'manage-comp-row';
    const isActive = comp.id === activeCompanyId;
    const yearsList = Object.keys(comp.calendars || {}).map(Number).sort((a, b) => a - b);
    const yearsStr = yearsList.join(', ') || '-';

    tr.innerHTML = `
      <td class="col-comp-info">
        <div class="comp-title-line">
          <div class="comp-title-left">
            <span class="comp-title-text">${comp.name}</span>
            ${comp.isDefault ? '<span class="badge-default-pill">Default</span>' : ''}
          </div>
          <div class="mobile-only-inline comp-status-mobile">
            ${isActive 
              ? '<span class="badge-active-comp">Active</span>' 
              : '<span class="text-muted small">Inactive</span>'}
          </div>
        </div>
        ${comp.description ? `<div class="comp-desc text-muted small">${comp.description}</div>` : ''}
        <div class="mobile-only-block comp-meta-mobile">
          <span class="comp-chip-tag">
            <svg class="comp-chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            <span class="comp-chip-label">Code:</span>
            <strong class="comp-chip-val font-mono">${comp.code || '-'}</strong>
          </span>
          <span class="comp-chip-year">
            <svg class="comp-chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span class="comp-chip-label">Years:</span>
            <strong class="comp-chip-val">${yearsStr}</strong>
          </span>
        </div>
      </td>
      <td class="col-comp-code desktop-only-table-cell">
        <span style="font-family: var(--font-mono); font-weight: 700;">${comp.code || '-'}</span>
      </td>
      <td class="col-comp-years desktop-only-table-cell">
        <span style="font-size: 0.8rem; font-family: var(--font-mono);">${yearsStr}</span>
      </td>
      <td class="col-comp-status desktop-only-table-cell">
        ${isActive 
          ? '<span class="badge-active-comp">Active</span>' 
          : '<span class="text-muted small">Inactive</span>'}
      </td>
      <td class="col-comp-actions">
        ${!isActive 
          ? `<button type="button" class="btn btn-sm btn-outline-primary" onclick="closeManageCompaniesModal(); switchActiveCompany('${comp.id}');" style="margin-right: 4px;">Activate</button>`
          : ''}
        <button type="button" class="btn btn-sm btn-outline-secondary" onclick="openEditCompanyModal('${comp.id}')" style="margin-right: 4px;">Edit</button>
        ${!comp.isDefault 
          ? `<button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteCompany('${comp.id}')">Delete</button>`
          : '<button type="button" class="btn btn-sm btn-outline-secondary" disabled title="The default company cannot be deleted">Delete</button>'}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openEditCompanyModal(companyId) {
  const comp = allCompanies[companyId];
  if (!comp) return;

  const modal = document.getElementById('editCompanyModal');
  if (!modal) return;

  document.getElementById('editCompanyTargetId').value = comp.id;
  document.getElementById('editCompanyName').value = comp.name;
  document.getElementById('editCompanyCode').value = comp.code || '';
  document.getElementById('editCompanyDesc').value = comp.description || '';

  modal.style.display = 'flex';
}

function closeEditCompanyModal() {
  const modal = document.getElementById('editCompanyModal');
  if (modal) modal.style.display = 'none';
}

function saveEditCompany() {
  const targetId = document.getElementById('editCompanyTargetId')?.value;
  const comp = allCompanies[targetId];
  if (!comp) return;

  const nameInput = document.getElementById('editCompanyName');
  const codeInput = document.getElementById('editCompanyCode');
  const descInput = document.getElementById('editCompanyDesc');

  const name = nameInput ? nameInput.value.trim() : '';
  if (!name) {
    alert('Please enter a company name.');
    nameInput?.focus();
    return;
  }

  comp.name = name.toUpperCase();
  comp.code = codeInput?.value.trim().toUpperCase() || comp.code;
  comp.description = descInput?.value.trim() || '';

  if (targetId === activeCompanyId) {
    salaryProfile.companyName = comp.name;
  }

  saveCompaniesToStorage();
  closeEditCompanyModal();
  renderCompanyDropdown();
  renderManageCompaniesTable();
  renderOrbrayCalendarGrid();

  showToastNotification(`${comp.name} updated`);
}

function deleteCompany(companyId) {
  const comp = allCompanies[companyId];
  if (!comp) return;

  if (comp.isDefault || comp.id === 'orbray') {
    alert('The default company (ORBRAY) cannot be deleted.');
    return;
  }

  if (Object.keys(allCompanies).length <= 1) {
    alert('At least one company is required.');
    return;
  }

  if (!confirm(`Delete "${comp.name}" and all of its calendars and data?`)) {
    return;
  }

  const wasActive = (companyId === activeCompanyId);
  delete allCompanies[companyId];

  if (wasActive) {
    activeCompanyId = 'orbray';
  }

  saveCompaniesToStorage();
  if (wasActive) {
    switchActiveCompany('orbray');
  } else {
    renderCompanyDropdown();
    renderManageCompaniesTable();
  }

  showToastNotification(`${comp.name} deleted`);
}

// ==========================================================================
// 11.2. ระบบสแกนและวิเคราะห์รูปปฏิทินบริษัทด้วย AI (AI Calendar Scanner & Vision Analyzer)
// ==========================================================================
const STORAGE_KEY_GEMINI_KEY = 'gemini_vision_api_key_v1';
let scanUploadedImages = [];
let currentScanResult = null;
let isDropzoneInitialized = false;

function openCalendarScanModal(targetCompanyId) {
  const modal = document.getElementById('calendarScanModal');
  if (!modal) return;

  const currentComp = allCompanies[activeCompanyId] || allCompanies['orbray'];
  const curNameEl = document.getElementById('scanCurrentCompName');
  if (curNameEl && currentComp) {
    curNameEl.innerText = currentComp.name.toUpperCase();
  }

  // กำหนดปีเริ่มต้นให้ตรงกับปีที่กำลังทำงาน
  const beInput = document.getElementById('scanTargetYearBE');
  const ceInput = document.getElementById('scanTargetYearCE');
  if (beInput) beInput.value = activeYearCE.toString();
  if (ceInput) ceInput.value = (activeYearCE + 543).toString();

  // โหลด Gemini API Key จาก Storage
  const apiKeyInp = document.getElementById('scanGeminiApiKey');
  const savedApiKey = localStorage.getItem(STORAGE_KEY_GEMINI_KEY);
  if (apiKeyInp && savedApiKey) {
    apiKeyInp.value = savedApiKey;
  }

  // รีเซ็ตการเลือกบริษัทเป้าหมายเป็น CURRENT
  const radioCurrent = document.getElementById('scanRadioCurrent');
  if (radioCurrent) radioCurrent.checked = true;
  toggleScanCompanyTarget('CURRENT');

  // เตรียม drag & drop บน dropzone
  initScanDropzone();

  // ปรับปรุงการแสดงผลรูปภาพและผลลัพธ์
  renderScanImagesGallery();
  if (!currentScanResult) {
    const resSec = document.getElementById('scanResultsSection');
    if (resSec) resSec.style.display = 'none';
    const applyBtn = document.getElementById('btnApplyScanResult');
    if (applyBtn) applyBtn.disabled = true;
  }

  modal.style.display = 'flex';
}

function closeCalendarScanModal() {
  const modal = document.getElementById('calendarScanModal');
  if (modal) modal.style.display = 'none';
}

function initScanDropzone() {
  if (isDropzoneInitialized) return;
  const dropzone = document.getElementById('scanDropzone');
  if (!dropzone) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('drag-hover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('drag-hover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      handleScanFilesSelected(dt.files);
    }
  }, false);

  isDropzoneInitialized = true;
}

function toggleScanCompanyTarget(val) {
  const newFields = document.getElementById('scanNewCompFields');
  if (!newFields) return;
  if (val === 'NEW') {
    newFields.style.display = 'block';
    const nameInp = document.getElementById('scanInpNewCompName');
    if (nameInp) nameInp.focus();
  } else {
    newFields.style.display = 'none';
  }
}

function toggleScanApiKeyAccordion() {
  const body = document.getElementById('scanApiKeyBody');
  const icon = document.getElementById('scanApiKeyToggleIcon');
  if (!body) return;
  const isHidden = (body.style.display === 'none' || !body.style.display);
  body.style.display = isHidden ? 'block' : 'none';
  if (icon) icon.innerText = isHidden ? '▴' : '▾';
}

function onScanApiKeyInput(val) {
  if (val && val.trim()) {
    localStorage.setItem(STORAGE_KEY_GEMINI_KEY, val.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_GEMINI_KEY);
  }
}

function onScanYearChange(val) {
  const be = toBE(val);
  const ceInp = document.getElementById('scanTargetYearCE');
  if (ceInp) {
    ceInp.value = (be && be >= 2400 && be <= 3000) ? be.toString() : '-';
  }
}

function handleScanFilesSelected(files) {
  if (!files || files.length === 0) return;

  const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
  if (validFiles.length === 0) {
    alert('Please choose image files only (JPG, PNG, WEBP).');
    return;
  }

  // รองรับสูงสุด 2 รูปภาพ (เช่น หน้า/หลัง หรือ ครึ่งปีแรก/ครึ่งปีหลัง)
  const remainingSlots = 2 - scanUploadedImages.length;
  if (remainingSlots <= 0) {
    alert('You can upload up to 2 images. Click "Clear images" to replace them.');
    return;
  }

  const filesToAdd = validFiles.slice(0, remainingSlots);
  let loadedCount = 0;

  filesToAdd.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64Data = dataUrl.split(',')[1] || '';
      scanUploadedImages.push({
        name: file.name,
        size: file.size,
        mimeType: file.type || 'image/jpeg',
        dataUrl,
        base64Data
      });
      loadedCount++;
      if (loadedCount === filesToAdd.length) {
        renderScanImagesGallery();
        updateScanStatus(`Images uploaded (${scanUploadedImages.length}/2)`);
      }
    };
    reader.readAsDataURL(file);
  });

  // เคลียร์ input file เพื่อให้เลือกไฟล์เดิมซ้ำได้ถ้าลบไป
  const fileInput = document.getElementById('scanFileInput');
  if (fileInput) fileInput.value = '';
}

async function loadSampleOrbrayImages() {
  updateScanStatus('Loading the Orbray 2026 sample calendar…');
  const sampleUrls = [
    { name: 'Image (1).jpg — Orbray 2026 (Jan–Jun)', url: 'Image (1).jpg' },
    { name: 'Image (2).jpg — Orbray 2026 (Jul–Dec)', url: 'Image (2).jpg' }
  ];

  scanUploadedImages = [];
  for (const sample of sampleUrls) {
    try {
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onloadend = () => {
          const dataUrl = reader.result;
          scanUploadedImages.push({
            name: sample.name,
            size: blob.size,
            mimeType: blob.type || 'image/jpeg',
            dataUrl: dataUrl,
            base64Data: dataUrl.split(',')[1] || ''
          });
          resolve();
        };
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('Fetch fallback to Image element for', sample.url, err);
      await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || 800;
            canvas.height = img.naturalHeight || 600;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            scanUploadedImages.push({
              name: sample.name,
              size: 1200000,
              mimeType: 'image/jpeg',
              dataUrl: dataUrl,
              base64Data: dataUrl.split(',')[1] || ''
            });
          } catch (e) {
            scanUploadedImages.push({
              name: sample.name,
              size: 1200000,
              mimeType: 'image/jpeg',
              dataUrl: sample.url,
              base64Data: ''
            });
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = sample.url;
      });
    }
  }

  renderScanImagesGallery();
  updateScanStatus(`Sample calendar loaded (${scanUploadedImages.length} images). Ready to analyze.`);
  showToastNotification(`Sample calendar loaded`);
}

function clearScanImages() {
  scanUploadedImages = [];
  renderScanImagesGallery();
  const resSec = document.getElementById('scanResultsSection');
  if (resSec) resSec.style.display = 'none';
  const applyBtn = document.getElementById('btnApplyScanResult');
  if (applyBtn) applyBtn.disabled = true;
  updateScanStatus('Images cleared. Please upload a calendar image.');
}

function removeScanImage(index) {
  if (index >= 0 && index < scanUploadedImages.length) {
    scanUploadedImages.splice(index, 1);
    renderScanImagesGallery();
    updateScanStatus(`${scanUploadedImages.length} image(s) remaining`);
  }
}

function renderScanImagesGallery() {
  const gallery = document.getElementById('scanImagesGallery');
  const countEl = document.getElementById('scanImageCount');
  const clearBtn = document.getElementById('btnClearScanImages');
  if (!gallery) return;

  if (countEl) countEl.innerText = scanUploadedImages.length.toString();
  if (clearBtn) clearBtn.style.display = scanUploadedImages.length > 0 ? 'inline-block' : 'none';

  if (scanUploadedImages.length === 0) {
    gallery.innerHTML = `
      <div class="scan-empty-gallery-hint">
        <div class="hint-icon">🖼️</div>
        <div>No images selected</div>
        <small class="text-muted">Choose a calendar image, or load the Orbray sample.</small>
      </div>
    `;
    return;
  }

  let html = '';
  scanUploadedImages.forEach((img, idx) => {
    const sizeKb = img.size ? Math.round(img.size / 1024) : 0;
    const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
    html += `
      <div class="scan-img-card">
        <div class="scan-img-thumb-wrap">
          <img src="${img.dataUrl}" alt="${img.name}" class="scan-img-thumb" />
          <button type="button" class="btn-remove-scan-img" onclick="removeScanImage(${idx})" title="Remove image">&times;</button>
        </div>
        <div class="scan-img-meta">
          <div class="scan-img-name" title="${img.name}">${img.name}</div>
          <div class="scan-img-size">${sizeStr} · Image ${idx + 1}</div>
        </div>
      </div>
    `;
  });
  gallery.innerHTML = html;
}

function updateScanStatus(msg) {
  const el = document.getElementById('scanStatusMsg');
  if (el) el.innerText = msg;
}

async function startCalendarAnalysis(mode) {
  const beInp = document.getElementById('scanTargetYearBE');
  const targetYearBE = toBE(beInp ? beInp.value : '2026') || 2569;
  const targetYearCE = targetYearBE - 543;

  if (mode === 'PRESET') {
    updateScanStatus('Analyzing with Smart Preset…');
    setTimeout(() => {
      currentScanResult = buildSmartCalendarPreset(targetYearCE, targetYearBE);
      renderScanResults(currentScanResult);
      updateScanStatus('Smart Preset analysis complete. Click any day to adjust it.');
      showToastNotification(`Calendar ${targetYearCE} analyzed`);
    }, 250);
    return;
  }

  // โหมด AI Vision
  if (scanUploadedImages.length === 0) {
    alert('Please upload at least one calendar image, or load the Orbray sample first.');
    return;
  }

  const apiKeyInp = document.getElementById('scanGeminiApiKey');
  const apiKey = (apiKeyInp ? apiKeyInp.value.trim() : '') || localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || '';

  if (!apiKey) {
    const choosePreset = confirm('No Gemini API key has been entered.\n\n- OK: open the API key field\n- Cancel: analyze with Smart Preset instead (no key needed)');
    if (choosePreset) {
      const body = document.getElementById('scanApiKeyBody');
      if (body) body.style.display = 'block';
      if (apiKeyInp) apiKeyInp.focus();
    } else {
      startCalendarAnalysis('PRESET');
    }
    return;
  }

  await callGeminiCalendarVisionAPI(scanUploadedImages, apiKey, targetYearBE, targetYearCE);
}

async function callGeminiCalendarVisionAPI(images, apiKey, targetYearBE, targetYearCE) {
  const spin = document.getElementById('scanAISpin');
  const btnAI = document.getElementById('btnRunAIScan');
  const btnPreset = document.getElementById('btnRunPresetScan');

  if (spin) spin.style.display = 'inline';
  if (btnAI) btnAI.disabled = true;
  if (btnPreset) btnPreset.disabled = true;
  updateScanStatus('Sending images to Google Gemini Vision for analysis…');

  const promptText = `
You are an expert AI specialized in Thai industrial/company annual calendar cards.
Examine the uploaded calendar image(s) carefully.
The user is registering the calendar for Year B.E. ${targetYearBE} (CE ${targetYearCE}).

Legend and Visual Markers to Detect:
1. National Holidays: Marked by yellow dots or yellow shaded circles.
2. Memorial Day with pay: Marked by purple dots or distinct purple symbols.
3. Special Workdays (e.g. Orbray Day): Marked with red circles, red badges, or red text on what would otherwise be a weekend/holiday.
4. Working Saturdays: Look at column 'S' (Saturday).
   - If Saturday date has NO circle around it -> It is a WORKING SATURDAY.
   - If Saturday date HAS a circle around it -> It is a SATURDAY HOLIDAY.
5. Bridge / Special Holidays: Any other special company holidays indicated in the legend.

Format Requirement:
Return ONLY a valid, raw JSON object (without markdown code blocks, without backticks, without commentary).
Use ISO date format: YYYY-MM-DD (where YYYY is ${targetYearCE}).
Schema:
{
  "companyName": "ORBRAY",
  "yearBE": ${targetYearBE},
  "yearCE": ${targetYearCE},
  "title": "${targetYearBE} / ${targetYearCE}",
  "nationalHolidays": ["YYYY-MM-DD", ...],
  "memorialHolidays": ["YYYY-MM-DD", ...],
  "bridgeHolidays": ["YYYY-MM-DD", ...],
  "orbrayWorkDays": ["YYYY-MM-DD", ...],
  "workingSaturdays": ["YYYY-MM-DD", ...]
}
`;

  try {
    const parts = [{ text: promptText }];
    images.forEach(img => {
      if (img.base64Data) {
        parts.push({
          inline_data: {
            mime_type: img.mimeType || 'image/jpeg',
            data: img.base64Data
          }
        });
      }
    });

    const payload = {
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.1,
        response_mime_type: 'application/json'
      }
    };

    // รองรับโมเดล Gemini 1.5 Flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson.error ? errJson.error.message : `HTTP ${response.status} ${response.statusText}`;
      throw new Error(errMsg);
    }

    const data = await response.json();
    let textResponse = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      textResponse = data.candidates[0].content.parts.map(p => p.text || '').join('');
    }

    // Clean JSON response
    textResponse = textResponse.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    let parsed = null;
    try {
      parsed = JSON.parse(textResponse);
    } catch (parseErr) {
      // Regex extraction fallback
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse the AI response as JSON');
      }
    }

    // ทำความสะอาดและตรวจทานข้อมูล
    parsed.yearCE = targetYearCE;
    parsed.yearBE = targetYearBE;
    parsed.title = `${targetYearBE} / ${targetYearCE}`;
    if (!Array.isArray(parsed.nationalHolidays)) parsed.nationalHolidays = [];
    if (!Array.isArray(parsed.memorialHolidays)) parsed.memorialHolidays = [];
    if (!Array.isArray(parsed.bridgeHolidays)) parsed.bridgeHolidays = [];
    if (!Array.isArray(parsed.orbrayWorkDays)) parsed.orbrayWorkDays = [];
    if (!Array.isArray(parsed.workingSaturdays)) parsed.workingSaturdays = [];
    if (!parsed.customDayOverrides) parsed.customDayOverrides = {};

    currentScanResult = parsed;
    renderScanResults(currentScanResult);
    updateScanStatus('Gemini Vision analysis complete.');
    showToastNotification(`AI analysis done: ${parsed.workingSaturdays.length} working Saturdays, ${parsed.nationalHolidays.length} holidays`);

  } catch (error) {
    console.error('Gemini Vision API error:', error);
    updateScanStatus(`AI error: ${error.message}`);
    const fallback = confirm(`Could not reach the Gemini API (${error.message}).\n\nUse Smart Preset instead?`);
    if (fallback) {
      startCalendarAnalysis('PRESET');
    }
  } finally {
    if (spin) spin.style.display = 'none';
    if (btnAI) btnAI.disabled = false;
    if (btnPreset) btnPreset.disabled = false;
  }
}

function buildSmartCalendarPreset(yearCE, yearBE) {
  // หากเป็นปี 2569 (2026) คืนค่าปฏิทินตามรูปถ่ายการ์ด Orbray Image (1) & Image (2) เต็มรูปแบบ
  if (yearCE === 2026) {
    return JSON.parse(JSON.stringify(DEFAULT_CALENDAR_2026));
  }

  // สำหรับปีอื่น ใช้หลักเกณฑ์ปฏิทินไทยและโรงงานอุตสาหกรรม
  const preset = {
    yearCE,
    yearBE,
    title: `${yearBE} / ${yearCE}`,
    nationalHolidays: [
      `${yearCE}-01-01`, `${yearCE}-01-02`, `${yearCE}-04-06`, `${yearCE}-04-13`,
      `${yearCE}-04-14`, `${yearCE}-04-15`, `${yearCE}-05-01`, `${yearCE}-05-04`,
      `${yearCE}-07-28`, `${yearCE}-08-12`, `${yearCE}-10-13`, `${yearCE}-10-23`,
      `${yearCE}-12-05`, `${yearCE}-12-10`, `${yearCE}-12-31`
    ],
    memorialHolidays: [],
    bridgeHolidays: [],
    orbrayWorkDays: [],
    workingSaturdays: [],
    customDayOverrides: {}
  };

  // จัดวันเสาร์ทำงานแบบสลับเสาร์ (Alternate Saturdays)
  let cur = new Date(yearCE, 0, 1);
  const end = new Date(yearCE, 11, 31);
  let satIndex = 0;
  while (cur <= end) {
    if (cur.getDay() === 6) {
      if (satIndex % 2 === 1) {
        preset.workingSaturdays.push(cur.toISOString().split('T')[0]);
      }
      satIndex++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return preset;
}

function getTotalSaturdaysInYear(yearCE) {
  let count = 0;
  let cur = new Date(yearCE, 0, 1);
  const end = new Date(yearCE, 11, 31);
  while (cur <= end) {
    if (cur.getDay() === 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count || 52;
}

function renderScanResults(cal) {
  if (!cal) return;

  const resSection = document.getElementById('scanResultsSection');
  const applyBtn = document.getElementById('btnApplyScanResult');
  if (resSection) resSection.style.display = 'block';
  if (applyBtn) applyBtn.disabled = false;

  const natCount = (cal.nationalHolidays || []).length;
  const memCount = (cal.memorialHolidays || []).length;
  const specCount = (cal.orbrayWorkDays || []).length + (cal.specialWorkDays || []).length;
  const workSatCount = (cal.workingSaturdays || []).length;
  const totalSats = getTotalSaturdaysInYear(cal.yearCE);
  const satOffCount = Math.max(0, totalSats - workSatCount);

  setElText('resCountNat', natCount.toString());
  setElText('resCountMem', memCount.toString());
  setElText('resCountSpec', specCount.toString());
  setElText('resCountWorkSat', workSatCount.toString());
  setElText('resCountSatOff', satOffCount.toString());

  // ชื่อบริษัทและปี
  const radioCurrent = document.getElementById('scanRadioCurrent');
  let compName = 'ORBRAY';
  if (radioCurrent && radioCurrent.checked) {
    compName = allCompanies[activeCompanyId] ? allCompanies[activeCompanyId].name : 'ORBRAY';
  } else {
    const newNameInp = document.getElementById('scanInpNewCompName');
    compName = (newNameInp && newNameInp.value.trim()) ? newNameInp.value.trim().toUpperCase() : 'NEW COMPANY';
  }
  setElText('scanResCompName', compName);
  setElText('scanResYear', `${cal.yearCE}`);

  // วาดตาราง 12 เดือนจำลองที่คลิกสลับวันได้
  renderScanMiniCalendar(cal);

  // เลื่อนหน้าจอให้เห็นผลลัพธ์อย่างนุ่มนวล
  resSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderScanMiniCalendar(cal) {
  const container = document.getElementById('scanMiniCalendarGrid');
  if (!container) return;
  container.innerHTML = '';

  const thaiDayHeaders = ['S', 'M', 'T', 'W', 'TH', 'F', 'S'];

  for (let m = 0; m < 12; m++) {
    const monthCard = document.createElement('div');
    monthCard.className = 'scan-mini-month-card';

    const lastDay = getLastDayOfMonth(cal.yearCE, m);
    const firstDayDate = new Date(cal.yearCE, m, 1);
    const firstDayOfWeek = firstDayDate.getDay();

    let html = `
      <div class="scan-mini-month-header">
        <strong>${m + 1}. ${THAI_MONTHS[m]}</strong>
        <span class="text-muted small">${cal.yearCE}</span>
      </div>
      <table class="scan-mini-table">
        <thead>
          <tr>
            ${thaiDayHeaders.map((dh, i) => `<th class="${i === 0 ? 'col-sun' : ''}">${dh}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `;

    let currentDay = 1;
    for (let r = 0; r < 6; r++) {
      if (currentDay > lastDay) break;
      html += '<tr>';
      for (let c = 0; c < 7; c++) {
        if (r === 0 && c < firstDayOfWeek) {
          html += '<td class="scan-mini-cell empty"></td>';
        } else if (currentDay > lastDay) {
          html += '<td class="scan-mini-cell empty"></td>';
        } else {
          const dateStr = `${cal.yearCE}-${formatDay2Digit(m + 1)}-${formatDay2Digit(currentDay)}`;
          const dayStatus = getScanDateStatus(dateStr, cal);

          html += `
            <td class="scan-mini-cell">
              <span class="scan-mini-day-badge ${dayStatus.cls}" 
                    id="scanDay_${dateStr}"
                    title="${dateStr} - ${dayStatus.name} (click to change)"
                    onclick="toggleScanCalendarDate('${dateStr}')">
                ${currentDay}
              </span>
            </td>
          `;
          currentDay++;
        }
      }
      html += '</tr>';
    }

    html += '</tbody></table>';
    monthCard.innerHTML = html;
    container.appendChild(monthCard);
  }
}

function getScanDateStatus(dateStr, cal) {
  if (cal.nationalHolidays && cal.nationalHolidays.includes(dateStr)) {
    return { type: 'NATIONAL_HOLIDAY', name: 'Public holiday', cls: 'day-national-holiday' };
  }
  if (cal.memorialHolidays && cal.memorialHolidays.includes(dateStr)) {
    return { type: 'MEMORIAL_HOLIDAY', name: 'Paid company holiday', cls: 'day-memorial-holiday' };
  }
  if ((cal.orbrayWorkDays && cal.orbrayWorkDays.includes(dateStr)) || (cal.specialWorkDays && cal.specialWorkDays.includes(dateStr))) {
    return { type: 'ORBRAY_WORKDAY', name: 'Special workday', cls: 'day-orbray-work' };
  }
  if (cal.bridgeHolidays && cal.bridgeHolidays.includes(dateStr)) {
    return { type: 'BRIDGE_HOLIDAY', name: 'Bridge holiday', cls: 'day-bridge' };
  }

  const d = new Date(dateStr);
  const dow = d.getDay();

  if (dow === 0) {
    return { type: 'SUNDAY', name: 'Sunday', cls: 'day-sunday' };
  }

  if (dow === 6) {
    if (cal.workingSaturdays && cal.workingSaturdays.includes(dateStr)) {
      return { type: 'WORKING_SATURDAY', name: 'Working Saturday', cls: 'day-working-sat' };
    } else {
      return { type: 'SATURDAY_HOLIDAY', name: 'Saturday off', cls: 'day-sat-holiday' };
    }
  }

  return { type: 'NORMAL_WORKDAY', name: 'Workday', cls: '' };
}

function toggleScanCalendarDate(dateStr) {
  if (!currentScanResult) return;

  const d = new Date(dateStr);
  const dow = d.getDay();
  const cal = currentScanResult;

  if (!cal.nationalHolidays) cal.nationalHolidays = [];
  if (!cal.memorialHolidays) cal.memorialHolidays = [];
  if (!cal.orbrayWorkDays) cal.orbrayWorkDays = [];
  if (!cal.workingSaturdays) cal.workingSaturdays = [];

  if (dow === 6) {
    // เสาร์: สลับระหว่าง เสาร์ทำงาน <-> เสาร์หยุด
    const idx = cal.workingSaturdays.indexOf(dateStr);
    if (idx >= 0) {
      cal.workingSaturdays.splice(idx, 1);
    } else {
      cal.workingSaturdays.push(dateStr);
      cal.workingSaturdays.sort();
    }
  } else if (dow === 0) {
    // อาทิตย์: สลับระหว่าง วันอาทิตย์หยุด <-> วันทำงานพิเศษ
    const idx = cal.orbrayWorkDays.indexOf(dateStr);
    if (idx >= 0) {
      cal.orbrayWorkDays.splice(idx, 1);
    } else {
      cal.orbrayWorkDays.push(dateStr);
      cal.orbrayWorkDays.sort();
    }
  } else {
    // วันธรรมดา (จันทร์ - ศุกร์): วนลูป สถานะ
    // 1. วันทำงานปกติ -> 2. วันหยุดนักขัตฤกษ์ -> 3. วันหยุดประเพณี -> 4. วันทำงานพิเศษ -> วนกลับ
    if (cal.nationalHolidays.includes(dateStr)) {
      cal.nationalHolidays = cal.nationalHolidays.filter(s => s !== dateStr);
      cal.memorialHolidays.push(dateStr);
    } else if (cal.memorialHolidays.includes(dateStr)) {
      cal.memorialHolidays = cal.memorialHolidays.filter(s => s !== dateStr);
      cal.orbrayWorkDays.push(dateStr);
    } else if (cal.orbrayWorkDays.includes(dateStr)) {
      cal.orbrayWorkDays = cal.orbrayWorkDays.filter(s => s !== dateStr);
    } else {
      cal.nationalHolidays.push(dateStr);
    }
  }

  // อัปเดต badge และ title ของวันที่ถูกกด
  const badge = document.getElementById(`scanDay_${dateStr}`);
  const newStatus = getScanDateStatus(dateStr, cal);
  if (badge) {
    badge.className = `scan-mini-day-badge ${newStatus.cls}`;
    badge.title = `${dateStr} - ${newStatus.name} (click to change)`;
  }

  // อัปเดต KPI Summary Pills
  const natCount = cal.nationalHolidays.length;
  const memCount = cal.memorialHolidays.length;
  const specCount = cal.orbrayWorkDays.length;
  const workSatCount = cal.workingSaturdays.length;
  const totalSats = getTotalSaturdaysInYear(cal.yearCE);
  const satOffCount = Math.max(0, totalSats - workSatCount);

  setElText('resCountNat', natCount.toString());
  setElText('resCountMem', memCount.toString());
  setElText('resCountSpec', specCount.toString());
  setElText('resCountWorkSat', workSatCount.toString());
  setElText('resCountSatOff', satOffCount.toString());
}

function applyAnalyzedCalendarToCompany() {
  if (!currentScanResult) {
    alert('No analyzed calendar yet. Please run an analysis first.');
    return;
  }

  const radioNew = document.getElementById('scanRadioNew');
  const isNew = radioNew && radioNew.checked;
  const yearCE = currentScanResult.yearCE;
  const yearBE = currentScanResult.yearBE;

  if (isNew) {
    const nameInp = document.getElementById('scanInpNewCompName');
    const codeInp = document.getElementById('scanInpNewCompCode');
    const name = nameInp ? nameInp.value.trim() : '';

    if (!name) {
      alert('Please enter the new company name.');
      if (nameInp) nameInp.focus();
      return;
    }

    // ตรวจสอบชื่อซ้ำ
    const existing = Object.values(allCompanies).find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      alert(`A company named "${name}" already exists. Use another name or save to the current company.`);
      if (nameInp) nameInp.focus();
      return;
    }

    const newId = 'comp_' + Date.now();
    const code = (codeInp && codeInp.value.trim()) ? codeInp.value.trim().toUpperCase() : name.substring(0, 6).toUpperCase();

    allCompanies[newId] = {
      id: newId,
      name: name.toUpperCase(),
      code,
      description: `Created from calendar image scan (${new Date().toLocaleDateString('en-GB')})`,
      isDefault: false,
      createdAt: new Date().toISOString().split('T')[0],
      calendars: {
        [yearCE.toString()]: currentScanResult
      }
    };

    saveCompaniesToStorage();
    closeCalendarScanModal();
    switchActiveCompany(newId);

    showSuccessPopup(
      'Company created',
      `"${name}" was created with its ${yearCE} calendar from the scanned image and is now active.`
    );
  } else {
    // บันทึกลงบริษัทปัจจุบัน
    const comp = allCompanies[activeCompanyId] || allCompanies['orbray'];
    if (!comp.calendars) comp.calendars = {};
    comp.calendars[yearCE.toString()] = currentScanResult;

    allCalendars = comp.calendars;
    activeYearCE = yearCE;

    saveCalendarsToStorage();
    closeCalendarScanModal();

    renderCompanyDropdown();
    updateYearSelectDropdown();
    refreshPeriodSelector();
    renderOrbrayCalendarGrid();
    recalculateAttendanceTotals();
    recalculateSalary();

    showSuccessPopup(
      'Calendar saved',
      `The ${yearCE} work calendar was applied to "${comp.name}".`
    );
  }
}

// ==========================================================================
// 12. การสลับแท็บและพิมพ์สลิป (View Navigation & Printing)
// ==========================================================================
function toggleCalendarView() {
  const calSection = document.getElementById('view-calendar');
  if (!calSection) return;

  if (calSection.style.display === 'none' || !calSection.style.display) {
    switchView('calendar');
  } else {
    switchView(currentActiveView || 'main');
  }
}

let currentActiveView = 'main';

function closeSlipView() {
  switchView(currentActiveView === 'attendance' ? 'attendance' : 'main');
}

function switchView(viewName) {
  const mainView = document.getElementById('view-main');
  const attView = document.getElementById('view-attendance');
  const calView = document.getElementById('view-calendar');

  const navBtnMain = document.getElementById('navBtnMain');
  const navBtnAtt = document.getElementById('navBtnAttendance');
  const navBtnCal = document.getElementById('navBtnCalendar');

  const mobTabMain = document.getElementById('mobileTabMain');
  const mobTabAtt = document.getElementById('mobileTabAttendance');
  const mobTabCal = document.getElementById('mobileTabCalendar');

  // Track the primary view
  if (viewName === 'attendance' || viewName === 'timesheet') {
    currentActiveView = 'attendance';
  } else if (viewName === 'main' || viewName === 'salary') {
    currentActiveView = 'main';
  }

  // Hide all views first
  if (mainView) mainView.style.display = 'none';
  if (attView) attView.style.display = 'none';
  if (calView) calView.style.display = 'none';

  // Remove active class from nav buttons and mobile tabs
  [navBtnMain, navBtnAtt, navBtnCal, mobTabMain, mobTabAtt, mobTabCal].forEach(btn => {
    if (btn) btn.classList.remove('active');
  });

  if (viewName === 'main' || viewName === 'salary') {
    if (mainView) mainView.style.display = 'block';
    if (navBtnMain) navBtnMain.classList.add('active');
    if (mobTabMain) mobTabMain.classList.add('active');
  } else if (viewName === 'attendance' || viewName === 'timesheet') {
    if (attView) attView.style.display = 'block';
    if (navBtnAtt) navBtnAtt.classList.add('active');
    if (mobTabAtt) mobTabAtt.classList.add('active');
  } else if (viewName === 'calendar') {
    if (calView) calView.style.display = 'block';
    if (navBtnCal) navBtnCal.classList.add('active');
    if (mobTabCal) mobTabCal.classList.add('active');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prepareAndPrint() {
  window.print();
}

// ==========================================================================
// 13. ระบบจัดการหน้าต่างตั้งค่าค่าเงิน (Salary & Rates Settings Modal - Image 2)
// ==========================================================================
function openSettingsSalaryModal() {
  const modal = document.getElementById('settingsSalaryModal');
  if (!modal) return;

  // อัปเดต currentSalaryConfig ให้ตรงกับงวดที่กำลังเลือกอยู่
  if (currentPeriod && currentPeriod.id) {
    currentSalaryConfig = getSalaryConfigForPeriod(currentPeriod.id);
  }

  // นำค่าปัจจุบันใส่ลงในฟอร์ม
  setInputValue('cfgBaseSalary', typeof currentSalaryConfig.baseSalary !== 'undefined' ? currentSalaryConfig.baseSalary : DEFAULT_SALARY_CONFIG.baseSalary);
  setInputValue('cfgTransportationAllowance', currentSalaryConfig.transportationAllowance ?? 0);
  setInputValue('cfgDiligenceFullAmount', currentSalaryConfig.diligenceFullAmount ?? 0);
  setInputValue('cfgFoodPerDay', currentSalaryConfig.foodPerDay ?? 0);
  setInputValue('cfgOtMealPerDay', currentSalaryConfig.otMealPerDay ?? 0);
  setInputValue('cfgOt15Multiplier', currentSalaryConfig.ot15Multiplier ?? 1.5);
  setInputValue('cfgOt1Multiplier', currentSalaryConfig.ot1Multiplier ?? 1.0);
  setInputValue('cfgOt3Multiplier', currentSalaryConfig.ot3Multiplier ?? 3.0);
  setInputValue('cfgSsoDeduction', typeof currentSalaryConfig.ssoDeduction !== 'undefined' ? currentSalaryConfig.ssoDeduction : DEFAULT_SALARY_CONFIG.ssoDeduction);
  setInputValue('cfgSsoMaxBase', currentSalaryConfig.ssoMaxBase ?? 17500);

  updateModalPeriodInfo();
  updateLiveOTPreview();
  modal.style.display = 'flex';
}

function updateModalPeriodInfo() {
  const badgeEl = document.getElementById('modalSalaryPeriodBadge');
  const statusEl = document.getElementById('modalSalaryConfigStatusBadge');
  const subtitleEl = document.getElementById('modalSalaryPeriodSubtitle');
  const btnSavePeriod = document.getElementById('btnSaveSalaryForPeriod');
  const btnResetPeriod = document.getElementById('btnResetPeriodSalaryConfig');

  const pName = currentPeriod ? currentPeriod.displayName : 'current period';
  const pMonth = currentPeriod ? currentPeriod.endMonthName : 'this period';
  const hasPeriodOverride = Boolean(currentPeriod && periodSalaryConfigs && periodSalaryConfigs[currentPeriod.id]);
  const pYear = currentPeriod ? currentPeriod.yearCE : '';
  const pMobileName = currentPeriod ? `${pMonth} ${pYear}` : 'this period';

  const iconCal2D = `<svg class="modal-badge-2d-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
  const iconGlobe2D = `<svg class="modal-badge-2d-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
  const iconEdit2D = `<svg class="modal-badge-2d-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
  const iconSave2D = `<svg class="btn-2d-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`;

  if (badgeEl) {
    badgeEl.innerHTML = `${iconCal2D} <span class="desktop-only-inline">Period: ${pName}</span><span class="mobile-only-inline">${pMobileName}</span>`;
  }
  if (statusEl) {
    if (hasPeriodOverride) {
      statusEl.className = 'card-paydate-badge modal-badge-status status-override';
      statusEl.innerHTML = `${iconEdit2D} <span class="desktop-only-inline">Custom rates for this period</span><span class="mobile-only-inline">Custom</span>`;
    } else {
      statusEl.className = 'card-paydate-badge modal-badge-status status-global';
      statusEl.innerHTML = `${iconGlobe2D} <span class="desktop-only-inline">Using standard rates</span><span class="mobile-only-inline">Standard</span>`;
    }
    statusEl.style.background = '';
    statusEl.style.color = '';
    statusEl.style.borderColor = '';
  }
  if (subtitleEl) {
    subtitleEl.innerHTML = `<span class="desktop-only-inline">Salary, allowance and overtime rates for ${pName}</span><span class="mobile-only-inline">Salary, allowances and OT rates</span>`;
  }
  const saveLabelEl = document.getElementById('btnSaveSalaryPeriodLabel');
  if (saveLabelEl) {
    saveLabelEl.innerText = `Save for ${pMonth} only`;
  } else if (btnSavePeriod) {
    btnSavePeriod.innerHTML = `${iconSave2D} <span>Save for ${pMonth} only</span>`;
  }
  if (btnResetPeriod) {
    btnResetPeriod.style.display = hasPeriodOverride ? 'inline-flex' : 'none';
  }
}

function closeSettingsSalaryModal() {
  const modal = document.getElementById('settingsSalaryModal');
  if (modal) modal.style.display = 'none';
}

function updateLiveOTPreview() {
  const base = parseFloat(document.getElementById('cfgBaseSalary')?.value) || 0;
  const rate = base > 0 ? (base / 30 / 8) : 0;

  const previewEl = document.getElementById('cfgLiveOTRate');
  if (previewEl) previewEl.innerText = formatCurrency(rate);

  const salaryEl = document.getElementById('cfgLiveOTSalary');
  if (salaryEl) salaryEl.innerText = formatCurrency(base);
}

function parseFormNumber(val, defaultVal = 0) {
  if (val === '' || val === null || val === undefined) return defaultVal;
  const n = parseFloat(val);
  return isNaN(n) ? defaultVal : n;
}

function saveSalaryConfigFromModal(scope = 'period') {
  const newConfig = {
    baseSalary: parseFormNumber(document.getElementById('cfgBaseSalary')?.value, 0),
    transportationAllowance: parseFormNumber(document.getElementById('cfgTransportationAllowance')?.value, 0),
    diligenceFullAmount: parseFormNumber(document.getElementById('cfgDiligenceFullAmount')?.value, 0),
    foodPerDay: parseFormNumber(document.getElementById('cfgFoodPerDay')?.value, 0),
    otMealPerDay: parseFormNumber(document.getElementById('cfgOtMealPerDay')?.value, 0),
    otDivisorHours: currentSalaryConfig?.otDivisorHours ?? 240,
    ot15Multiplier: parseFormNumber(document.getElementById('cfgOt15Multiplier')?.value, 1.5),
    ot1Multiplier: parseFormNumber(document.getElementById('cfgOt1Multiplier')?.value, 1.0),
    ot3Multiplier: parseFormNumber(document.getElementById('cfgOt3Multiplier')?.value, 3.0),
    ssoDeduction: parseFormNumber(document.getElementById('cfgSsoDeduction')?.value, 0),
    ssoMaxBase: parseFormNumber(document.getElementById('cfgSsoMaxBase')?.value, currentSalaryConfig?.ssoMaxBase ?? 17500)
  };

  const periodId = currentPeriod ? currentPeriod.id : null;
  const periodName = currentPeriod ? currentPeriod.displayName : 'current period';

  if (scope === 'all') {
    // บันทึกเป็นค่ามาตรฐานสำหรับทุกงวด
    userBaseSalaryConfig = { ...newConfig };
    try {
      const userCfgKey = getScopedUserKey(STORAGE_KEY_SALARY_CONFIG);
      localStorage.setItem(userCfgKey, JSON.stringify(userBaseSalaryConfig));
      const activeUid = (typeof getActiveEditingUserId === 'function') ? getActiveEditingUserId() : 'user_admin';
      if (activeUid === 'user_admin') {
        localStorage.setItem(STORAGE_KEY_SALARY_CONFIG, JSON.stringify(userBaseSalaryConfig));
      }
    } catch (e) {
      console.warn('LocalStorage save base config failed', e);
    }
    // หากงวดปัจจุบันมีการตั้งค่าเฉพาะอยู่ ให้อัปเดตงวดปัจจุบันด้วย
    if (periodId) {
      periodSalaryConfigs[periodId] = { ...newConfig };
      savePeriodSalaryConfigsToStorage();
    }
    currentSalaryConfig = { ...newConfig };
    if (typeof syncDataToCloud === 'function') {
      syncDataToCloud('salaryConfig', currentSalaryConfig);
    }
    closeSettingsSalaryModal();
    updateRateLabelsOnCards();
    updateCardPeriodBadge();
    recalculateSalary();
    showSuccessPopup('Saved', 'These rates are now the standard for all periods.');
    showToastNotification('Standard rates saved for all periods');
  } else {
    // บันทึกเฉพาะงวดนี้ (Default behavior)
    if (periodId) {
      periodSalaryConfigs[periodId] = { ...newConfig };
      savePeriodSalaryConfigsToStorage();
    }
    currentSalaryConfig = { ...newConfig };
    closeSettingsSalaryModal();
    updateRateLabelsOnCards();
    updateCardPeriodBadge();
    recalculateSalary();
    showSuccessPopup('Saved for this period', `Rates saved for ${periodName}. Other periods are unaffected.`);
    showToastNotification(`Rates saved for ${periodName}`);
  }
}

function resetPeriodSalaryConfigToDefault() {
  if (!currentPeriod || !currentPeriod.id) return;
  if (!periodSalaryConfigs || !periodSalaryConfigs[currentPeriod.id]) {
    showToastNotification('This period already uses standard rates');
    return;
  }
  if (confirm(`Remove the custom rates for "${currentPeriod.displayName}" and use standard rates?`)) {
    delete periodSalaryConfigs[currentPeriod.id];
    savePeriodSalaryConfigsToStorage();
    currentSalaryConfig = getSalaryConfigForPeriod(currentPeriod.id);
    closeSettingsSalaryModal();
    updateRateLabelsOnCards();
    updateCardPeriodBadge();
    recalculateSalary();
    showSuccessPopup('Restored', `${currentPeriod.displayName} now uses standard rates.`);
    showToastNotification(`${currentPeriod.displayName} restored to standard rates`);
  }
}

function clearSalaryConfigToZero() {
  const periodName = currentPeriod ? currentPeriod.displayName : 'this period';
  if (confirm(`Set salary, allowances and deductions to 0?\n\n(Use this if you had not started work or had no income in ${periodName}.)`)) {
    setInputValue('cfgBaseSalary', 0);
    setInputValue('cfgTransportationAllowance', 0);
    setInputValue('cfgDiligenceFullAmount', 0);
    setInputValue('cfgFoodPerDay', 0);
    setInputValue('cfgOtMealPerDay', 0);
    setInputValue('cfgSsoDeduction', 0);
    setInputValue('cfgSsoMaxBase', 0);
    updateLiveOTPreview();
    showToastNotification('All values set to 0 — press "Save for this period" to confirm');
  }
}

function resetSalaryConfigToDefault() {
  if (confirm('Reset the form to the default values?')) {
    setInputValue('cfgBaseSalary', DEFAULT_SALARY_CONFIG.baseSalary);
    setInputValue('cfgTransportationAllowance', DEFAULT_SALARY_CONFIG.transportationAllowance);
    setInputValue('cfgDiligenceFullAmount', DEFAULT_SALARY_CONFIG.diligenceFullAmount);
    setInputValue('cfgFoodPerDay', DEFAULT_SALARY_CONFIG.foodPerDay);
    setInputValue('cfgOtMealPerDay', DEFAULT_SALARY_CONFIG.otMealPerDay);
    setInputValue('cfgOt15Multiplier', DEFAULT_SALARY_CONFIG.ot15Multiplier);
    setInputValue('cfgOt1Multiplier', DEFAULT_SALARY_CONFIG.ot1Multiplier);
    setInputValue('cfgOt3Multiplier', DEFAULT_SALARY_CONFIG.ot3Multiplier);
    setInputValue('cfgSsoDeduction', DEFAULT_SALARY_CONFIG.ssoDeduction);
    setInputValue('cfgSsoMaxBase', DEFAULT_SALARY_CONFIG.ssoMaxBase);
    updateLiveOTPreview();
    showToastNotification('Form reset to defaults — press Save to confirm');
  }
}

function setInputValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

// ==========================================================================
// 14. ระบบจัดการ PIN Authentication & ผู้ใช้งาน (ADMIN PIN: 20523)
// ==========================================================================
function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  clearAuthAlerts();
  clearPinInput();
  modal.style.display = 'flex';
  const pinInput = document.getElementById('pinDisplayInput');
  if (pinInput) {
    setTimeout(() => pinInput.focus(), 150);
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'none';
  clearAuthAlerts();
  clearPinInput();
}

function clearAuthAlerts() {
  const err = document.getElementById('authErrorAlert');
  const succ = document.getElementById('authSuccessAlert');
  if (err) { err.style.display = 'none'; err.innerText = ''; }
  if (succ) { succ.style.display = 'none'; succ.innerText = ''; }
}

function showAuthError(msg) {
  const err = document.getElementById('authErrorAlert');
  if (err) { err.innerText = msg; err.style.display = 'block'; }
}

function showAuthSuccess(msg) {
  const succ = document.getElementById('authSuccessAlert');
  if (succ) { succ.innerText = msg; succ.style.display = 'block'; }
}

function pressPinDigit(digit) {
  const input = document.getElementById('pinDisplayInput');
  if (!input) return;
  clearAuthAlerts();
  if (input.value.length < 8) {
    input.value += digit;
  }
}

function backspacePinDigit() {
  const input = document.getElementById('pinDisplayInput');
  if (!input) return;
  clearAuthAlerts();
  input.value = input.value.slice(0, -1);
}

function clearPinInput() {
  const input = document.getElementById('pinDisplayInput');
  if (input) input.value = '';
}

function togglePinVisibility() {
  const input = document.getElementById('pinDisplayInput');
  const icon = document.getElementById('pinVisibilityIcon');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.innerText = '🙈';
  } else {
    input.type = 'password';
    if (icon) icon.innerText = '👁️';
  }
}

function handlePinKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitPinLogin();
  }
}

async function submitPinLogin() {
  clearAuthAlerts();
  const input = document.getElementById('pinDisplayInput');
  const pin = input ? input.value.trim() : '';

  if (!pin) {
    showAuthError('Please enter your PIN.');
    return;
  }

  const btn = document.getElementById('btnAuthSubmit');
  const prevText = btn ? btn.innerText : '';
  if (btn) { btn.disabled = true; btn.innerText = 'Checking…'; }

  try {
    const res = await loginWithPin(pin);
    if (res.success) {
      const roleText = res.user.role === 'admin' ? 'Admin' : 'Employee';
      showAuthSuccess(`Welcome, ${res.user.name} (${roleText})`);
      setTimeout(() => {
        closeAuthModal();
        reloadUserDataAfterAuthChange();
        showToastNotification(`Signed in as ${res.user.name}`);
      }, 500);
    } else {
      showAuthError(res.error || 'Incorrect PIN.');
    }
  } catch (err) {
    showAuthError(err.message || 'Could not verify the PIN.');
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = prevText; }
  }
}

function quickLoginAdmin() {
  const input = document.getElementById('pinDisplayInput');
  if (input) input.value = '20523';
  submitPinLogin();
}

async function handleLogout() {
  if (confirm('Sign out?')) {
    await logoutCurrentUser();
    reloadUserDataAfterAuthChange();
    showToastNotification('Signed out');
  }
}

/**
 * โหลดข้อมูลและรีเฟรชหน้าจอทั้งหมดหลังจากผู้ใช้เปลี่ยน
 */
function reloadUserDataAfterAuthChange() {
  loadStorageData();
  refreshPeriodSelector();
  renderOrbrayCalendarGrid();
  updateRateLabelsOnCards();
  updateCardPeriodBadge();
  recalculateSalary();
  updateAdminScopeBanner();
  updateNavbarAuthUI(currentUser, isFirebaseOnline);
}

/**
 * สลับเปลี่ยนพนักงานที่กำลังดู/แก้ไขข้อมูล (เฉพาะ ADMIN)
 */
function switchEditingUser(targetUserId) {
  if (!targetUserId) return;

  // ตรวจสอบสิทธิ์: เฉพาะ ADMIN (JITTRAKAN K.) เท่านั้นที่สามารถดูหรือสลับข้อมูลของพนักงานคนอื่นได้
  if (!currentUser || currentUser.role !== 'admin' || currentUser.id !== 'user_admin') {
    showToastNotification('Only admins can view other employees');
    return;
  }

  setActiveEditingUserId(targetUserId);
  const targetUser = getActiveEditingUser();

  // อัปเดตข้อมูลและคำนวณใหม่
  loadStorageData();
  refreshPeriodSelector();
  renderOrbrayCalendarGrid();
  updateRateLabelsOnCards();
  updateCardPeriodBadge();
  recalculateSalary();
  updateAdminScopeBanner();

  // อัปเดต Dropdown ใน Navbar และ Modal ให้ตรงกัน
  const navSelect = document.getElementById('adminUserNavSelect');
  if (navSelect) navSelect.value = targetUserId;
  const modalSelect = document.getElementById('userModalSwitchSelect');
  if (modalSelect) modalSelect.value = targetUserId;
  updateNavbarAuthUI(currentUser);

  showToastNotification(`Now viewing: ${targetUser.name}`);
}

/**
 * อัปเดตแบนเนอร์แจ้งเตือนสถานะการแก้ไขข้อมูลของ Admin
 */
function updateAdminScopeBanner() {
  const banners = [
    document.getElementById('adminScopeBanner'),
    document.getElementById('adminScopeBannerAtt')
  ].filter(Boolean);
  if (banners.length === 0) return;

  const activeUserId = getActiveEditingUserId();
  if (currentUser && currentUser.role === 'admin' && activeUserId && activeUserId !== currentUser.id) {
    const activeUser = getActiveEditingUser();
    const bannerHtml = `
      <div class="banner-content">
        <span class="banner-icon">⚠️</span>
        <span>Viewing as admin: <strong>${escapeHtml(activeUser.name)}</strong></span>
        <button type="button" class="btn btn-xs btn-outline-primary" onclick="switchEditingUser('user_admin')">
          Back to my data
        </button>
      </div>
    `;
    banners.forEach(b => {
      b.innerHTML = bannerHtml;
      b.style.display = 'flex';
    });
  } else {
    banners.forEach(b => {
      b.style.display = 'none';
    });
  }
}

/**
 * เปิดหน้าต่างป๊อปอัพข้อมูลผู้ใช้และเมนูลัด (User Profile Modal)
 */
function openUserProfileModal(event) {
  if (event) {
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
    if (typeof event.preventDefault === 'function') event.preventDefault();
  }

  // หากยังไม่ได้ล็อกอิน ให้เปิดหน้าต่าง Login แทน
  if (!currentUser) {
    if (typeof openAuthModal === 'function') openAuthModal();
    return;
  }

  const modal = document.getElementById('userProfileModal');
  if (!modal) return;

  const activeUserId = (typeof getActiveEditingUserId === 'function') ? getActiveEditingUserId() : currentUser.id;
  const activeUser = (typeof getActiveEditingUser === 'function') ? (getActiveEditingUser() || currentUser) : currentUser;

  // 1. Avatar
  const avatarEl = document.getElementById('userModalAvatar');
  if (avatarEl) {
    avatarEl.innerText = (currentUser.name || 'U').charAt(0).toUpperCase();
  }

  // 2. Name & Role
  const nameEl = document.getElementById('userModalName');
  if (nameEl) {
    nameEl.innerText = (currentUser.name || 'USER').toUpperCase();
  }

  const roleBadgeEl = document.getElementById('userModalRoleBadge');
  if (roleBadgeEl) {
    if (currentUser.role === 'admin') {
      roleBadgeEl.className = 'user-modal-role-pill role-admin';
      roleBadgeEl.innerHTML = `
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
        <span>Admin</span>
      `;
    } else {
      roleBadgeEl.className = 'user-modal-role-pill role-user';
      roleBadgeEl.innerHTML = `
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 8 0v2"/></svg>
        <span>Employee</span>
      `;
    }
  }

  const codeEl = document.getElementById('userModalCode');
  if (codeEl) {
    codeEl.innerText = currentUser.empCode ? `ID: ${currentUser.empCode}` : `ID: ${currentUser.id ? currentUser.id.replace('user_', '') : '20523'}`;
  }

  // 3. Admin Switch Section & Manage Users button
  const adminSec = document.getElementById('userModalAdminSection');
  const manageUsersBtn = document.getElementById('userModalManageUsersBtn');
  const switchSelect = document.getElementById('userModalSwitchSelect');

  if (currentUser.role === 'admin') {
    if (adminSec) adminSec.style.display = 'block';
    if (manageUsersBtn) manageUsersBtn.style.display = 'flex';
    
    if (switchSelect && typeof getAllSystemUsers === 'function') {
      const allUsers = getAllSystemUsers();
      switchSelect.innerHTML = allUsers.map(u => {
        const isSel = (u.id === activeUserId) ? 'selected' : '';
        const meLabel = (u.id === currentUser.id) ? ' (me)' : '';
        return `<option value="${u.id}" ${isSel}>${escapeHtml(u.name.toUpperCase())}${meLabel}</option>`;
      }).join('');
    }
  } else {
    if (adminSec) adminSec.style.display = 'none';
    if (manageUsersBtn) manageUsersBtn.style.display = 'none';
  }

  // 4. Firebase Cloud Status
  const fbStatusEl = document.getElementById('userModalFbStatus');
  if (fbStatusEl) {
    const isOnline = (typeof isFirebaseOnline !== 'undefined') ? Boolean(isFirebaseOnline) : false;
    if (isOnline) {
      fbStatusEl.className = 'user-modal-status-pill status-online';
      fbStatusEl.innerText = 'ONLINE';
    } else {
      fbStatusEl.className = 'user-modal-status-pill status-offline';
      fbStatusEl.innerText = 'LOCAL';
    }
  }

  modal.style.display = 'flex';
}

/**
 * ปิดหน้าต่างป๊อปอัพข้อมูลผู้ใช้
 */
function closeUserProfileModal() {
  const modal = document.getElementById('userProfileModal');
  if (modal) modal.style.display = 'none';
}

function handleUserProfileBackdropClick(event) {
  if (event.target && (event.target.id === 'userProfileModal' || event.target.classList.contains('user-profile-modal-backdrop') || event.target.classList.contains('modal-backdrop'))) {
    closeUserProfileModal();
  }
}

function handleModalUserSwitch(targetUserId) {
  closeUserProfileModal();
  if (typeof switchEditingUser === 'function') {
    switchEditingUser(targetUserId);
  }
}

/**
 * ย้อนกลับไปยังหน้าต่างเมนูโปรไฟล์ผู้ใช้ (Back Button Navigation)
 */
function goBackToUserProfileModal() {
  if (typeof closeAccountModal === 'function') closeAccountModal();
  if (typeof closeManageUsersModal === 'function') closeManageUsersModal();
  if (typeof closeFirebaseConfigModal === 'function') closeFirebaseConfigModal();
  if (typeof closeEditUserModal === 'function') closeEditUserModal();
  openUserProfileModal();
}

/**
 * ฟังก์ชันสำรองสำหรับโค้ดเดิม
 */
function toggleUserMenu(event) {
  openUserProfileModal(event);
}

function closeUserMenu() {
  closeUserProfileModal();
}

// Global click listener to close dropdown when clicking outside
window.addEventListener('click', (e) => {
  const dropdown = document.getElementById('userProfileDropdown');
  const trigger = document.getElementById('userProfileTriggerBtn');
  if (dropdown && dropdown.style.display !== 'none') {
    if (!dropdown.contains(e.target) && (!trigger || !trigger.contains(e.target))) {
      dropdown.style.display = 'none';
    }
  }
});

/**
 * อัปเดต Navbar ส่วนแสดงสถานะการล็อกอินและ User Dropdown Menu
 */
function getFirebaseStatusPillHtml(isOnline) {
  const isCustom = (typeof isUsingCustomFirebaseServer === 'function') ? isUsingCustomFirebaseServer() : false;
  const cfg = (typeof getActiveFirebaseConfig === 'function') ? getActiveFirebaseConfig() : null;
  const isOnlineBool = Boolean(isOnline);

  let statusClass = 'status-local';
  let dotColor = '#000000';
  let labelText = 'LOCAL';
  let tooltip = 'FIREBASE SERVER: LOCAL STORAGE (OFFLINE) — CLICK TO CONFIGURE';

  if (isOnlineBool) {
    statusClass = 'status-online';
    dotColor = '#16a34a';
    const pId = (cfg?.projectId || 'CLOUD').toUpperCase();
    const shortId = pId.length > 14 ? pId.substring(0, 12) + '..' : pId;
    labelText = `${shortId}`;
    tooltip = `FIREBASE SERVER: CLOUD CONNECTED (${pId}) — CLICK TO MANAGE`;
  } else if (isCustom) {
    statusClass = 'status-offline';
    dotColor = '#dc2626';
    const pId = (cfg?.projectId || 'OFFLINE').toUpperCase();
    const shortId = pId.length > 14 ? pId.substring(0, 12) + '..' : pId;
    tooltip = `FIREBASE SERVER: OFFLINE (${pId}) — CLICK TO CHECK CONFIG`;
  }
  return `
    <button type="button" class="btn-firebase-pill ${statusClass}" onclick="openFirebaseConfigModal()" title="${tooltip}" aria-label="Firebase server">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
      </svg>
      <span class="status-indicator-dot" style="background-color: ${dotColor};"></span>
    </button>
  `;
}

function getSimulatorTriggerBtnHtml() {
  if (window.self !== window.top || window.location.search.includes('mode=mobile_sim')) {
    return '';
  }
  return `
    <button type="button" class="btn-simulator-trigger" id="btnPhoneSimulator" onclick="openPhoneSimulator()" title="Phone preview">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="3" ry="3"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    </button>
  `;
}

function updateNavbarAuthUI(user, isOnline) {
  const container = document.getElementById('navAuthArea');
  if (!container) return;

  const fbPillHtml = getFirebaseStatusPillHtml(isOnline);
  const simBtnHtml = getSimulatorTriggerBtnHtml();

  if (user) {
    const activeUserId = getActiveEditingUserId();
    const activeUser = getActiveEditingUser() || user;

    if (user.role === 'admin') {
      // ผู้ใช้เป็น ADMIN: แสดง Badge + ชื่อผู้ใช้ (กดเพื่อเปิดเมนู บัญชีของฉัน, จัดการผู้ใช้, เซิร์ฟเวอร์ Firebase, สลับพนักงาน) + ปุ่มออกจากระบบ
      const allUsers = getAllSystemUsers();
      const optionsHtml = allUsers.map(u => {
        const selected = (u.id === activeUserId) ? 'selected' : '';
        return `<option value="${u.id}" ${selected}>${escapeHtml(u.name.toUpperCase())}</option>`;
      }).join('');

      container.innerHTML = `
        <div class="factorium-auth-group">
          ${simBtnHtml}
          ${fbPillHtml}

          <div class="user-menu-container">
            <button type="button" class="btn-user-profile-trigger" id="userProfileTriggerBtn" onclick="openUserProfileModal(event)" title="Admin: ${escapeHtml(activeUser.name)} — open profile">
              <span class="user-role-badge user-role-badge-icon" title="Admin">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              </span>
            </button>
          </div>
        </div>
      `;
    } else {
      // พนักงานทั่วไป: แสดงชื่อ + กดเพื่อเปิดเมนู บัญชีของฉัน + เซิร์ฟเวอร์ Firebase + ออกจากระบบ
      container.innerHTML = `
        <div class="factorium-auth-group">
          ${simBtnHtml}
          ${fbPillHtml}

          <div class="user-menu-container">
            <button type="button" class="btn-user-profile-trigger" id="userProfileTriggerBtn" onclick="openUserProfileModal(event)" title="Employee: ${escapeHtml(user.name)} — open profile">
              <span class="user-role-badge badge-user user-role-badge-icon" title="Employee">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
            </button>
          </div>
        </div>
      `;
    }
  } else {
    // ยังไม่ได้ล็อกอิน: แสดงปุ่ม Firebase Status + เข้าสู่ระบบ และ เริ่มใช้งานฟรี
    container.innerHTML = `
      <div class="factorium-auth-group">
        ${simBtnHtml}
        ${fbPillHtml}
        <button type="button" class="btn-factorium-outline" onclick="openAuthModal()">
          Get started
        </button>
        <button type="button" class="btn-factorium-gradient" onclick="openAuthModal()">
          Sign in
        </button>
      </div>
    `;
  }

  updateAdminScopeBanner();
}

/**
 * ==========================================================================
 * ระบบจัดการบัญชีผู้ใช้งานส่วนตัว (My Account Profile Modal)
 * ==========================================================================
 */
function openAccountModal() {
  closeUserProfileModal();
  const modal = document.getElementById('accountModal');
  if (!modal) return;

  const user = currentUser || (typeof getActiveEditingUser === 'function' ? getActiveEditingUser() : null);
  if (!user) {
    showToastNotification('Please sign in to manage your account');
    openAuthModal();
    return;
  }

  const alertBox = document.getElementById('accountAlert');
  if (alertBox) {
    alertBox.style.display = 'none';
    alertBox.textContent = '';
  }

  // เติมข้อมูลลงในการ์ดสรุปโปรไฟล์
  const avatarLarge = document.getElementById('accAvatarLarge');
  if (avatarLarge) avatarLarge.textContent = user.role === 'admin' ? 'A' : (user.avatar || 'U');

  const summaryName = document.getElementById('accSummaryName');
  if (summaryName) summaryName.textContent = user.name;

  const summaryRole = document.getElementById('accSummaryRole');
  if (summaryRole) {
    summaryRole.className = user.role === 'admin' ? 'badge-account-role' : 'badge-account-role-user';
    summaryRole.textContent = user.role === 'admin' ? 'Admin' : 'Employee';
  }

  const summaryCode = document.getElementById('accSummaryCode');
  if (summaryCode) summaryCode.textContent = 'ID: ' + (user.empCode || (user.id === 'user_admin' ? '20523' : ('EMP-' + user.pin)));

  const summaryDept = document.getElementById('accSummaryDept');
  if (summaryDept) summaryDept.textContent = user.department || 'Operations';

  // เติมฟอร์ม
  const elName = document.getElementById('accName');
  if (elName) elName.value = user.name || '';

  const elCompany = document.getElementById('accCompany');
  if (elCompany) elCompany.value = user.companyName || 'CALSA';

  const elEmpCode = document.getElementById('accEmpCode');
  if (elEmpCode) elEmpCode.value = user.empCode || (user.id === 'user_admin' ? '20523' : ('EMP-' + user.pin));

  const elDept = document.getElementById('accDept');
  if (elDept) elDept.value = user.department || '';

  const elPin = document.getElementById('accPin');
  if (elPin) {
    elPin.value = user.pin || '';
    elPin.type = 'password';
  }
  const pinIcon = document.getElementById('accPinIcon');
  if (pinIcon) pinIcon.textContent = '👁️';

  modal.style.display = 'flex';
}

function closeAccountModal() {
  const modal = document.getElementById('accountModal');
  if (modal) modal.style.display = 'none';
}

function toggleAccPinVisibility() {
  const input = document.getElementById('accPin');
  const icon = document.getElementById('accPinIcon');
  if (!input || !icon) return;

  if (input.type === 'password') {
    input.type = 'text';
    icon.textContent = '🙈';
  } else {
    input.type = 'password';
    icon.textContent = '👁️';
  }
}

function handleSaveAccountProfile(e) {
  e.preventDefault();
  const alertBox = document.getElementById('accountAlert');
  if (alertBox) {
    alertBox.style.display = 'none';
    alertBox.textContent = '';
  }

  const name = document.getElementById('accName')?.value.trim();
  const companyName = document.getElementById('accCompany')?.value.trim();
  const empCode = document.getElementById('accEmpCode')?.value.trim();
  const department = document.getElementById('accDept')?.value.trim();
  const pin = document.getElementById('accPin')?.value.trim();

  if (!name) {
    if (alertBox) {
      alertBox.className = 'alert alert-danger';
      alertBox.textContent = 'Please enter a full name.';
      alertBox.style.display = 'block';
    }
    return;
  }

  if (!pin || !/^\d{4,8}$/.test(pin)) {
    if (alertBox) {
      alertBox.className = 'alert alert-danger';
      alertBox.textContent = 'PIN must be 4–8 digits.';
      alertBox.style.display = 'block';
    }
    return;
  }

  const res = updateCurrentAccountProfile({
    name,
    companyName: (companyName || 'CALSA').toUpperCase(),
    empCode: (empCode || '-').toUpperCase(),
    department: department || '-',
    pin
  });

  if (res.success) {
    // ซิงก์ข้อมูลพนักงานไปยัง salaryProfile และการคำนวณ พร้อมรีเฟรชหน้าจอทั้งหมด
    try {
      reloadUserDataAfterAuthChange();
    } catch (err) {
      console.error('Error syncing profile after save:', err);
    }

    closeAccountModal();
    showSuccessPopup('Saved', `Account details for ${name} saved.`);
    showToastNotification(`Account saved`);
  } else {
    if (alertBox) {
      alertBox.className = 'alert alert-danger';
      alertBox.textContent = res.error || 'Could not save. Please try again.';
      alertBox.style.display = 'block';
    } else {
      alert(res.error || 'Could not save. Please try again.');
    }
  }
}

/**
 * ระบบจัดการรายชื่อผู้ใช้และ PIN (Manage Users Modal - Admin Only: JITTRAKAN K.)
 */
function openManageUsersModal() {
  if (!currentUser || currentUser.role !== 'admin' || currentUser.id !== 'user_admin') {
    showToastNotification('Sign in as admin to manage users');
    openAuthModal();
    return;
  }
  closeUserProfileModal();
  const modal = document.getElementById('manageUsersModal');
  if (!modal) return;
  renderManageUsersTable();
  modal.style.display = 'flex';
}

function closeManageUsersModal() {
  const modal = document.getElementById('manageUsersModal');
  if (modal) modal.style.display = 'none';
}

function renderManageUsersTable() {
  const tbody = document.getElementById('manageUsersTableBody');
  const cardsContainer = document.getElementById('manageUsersCardsMobile');
  if (!tbody && !cardsContainer) return;

  const users = getAllSystemUsers();

  // 1. Desktop Table HTML
  if (tbody) {
    tbody.innerHTML = users.map(u => {
      const isMasterAdmin = (u.id === 'user_admin');
      const badge = isMasterAdmin 
        ? '<span class="user-role-badge">ADMIN</span>' 
        : '<span class="user-role-badge badge-user">USER</span>';

      const actionHtml = isMasterAdmin 
        ? '<span class="badge-pill-locked" title="MASTER ADMIN">MASTER</span>' 
        : `
          <div class="user-action-group">
            <button type="button" class="btn btn-outline-primary btn-action-pill" onclick="openEditUserModal('${u.id}')" title="Edit">
              Edit
            </button>
            <button type="button" class="btn btn-outline-danger btn-action-pill" onclick="confirmDeleteUser('${u.id}')" title="Delete">
              Delete
            </button>
          </div>
        `;

      return `
        <tr>
          <td style="text-align: center;">${badge}</td>
          <td><strong>${escapeHtml(u.name.toUpperCase())}</strong></td>
          <td style="text-align: center;"><span class="badge-account-code">${escapeHtml(u.empCode || '-')}</span></td>
          <td><span>${escapeHtml(u.department || '-')}</span></td>
          <td style="text-align: center;"><span class="pin-code-badge">${escapeHtml(u.pin)}</span></td>
          <td style="text-align: center;">${actionHtml}</td>
        </tr>
      `;
    }).join('');
  }

  // 2. Mobile Cards HTML (Full responsive without horizontal scroll)
  if (cardsContainer) {
    cardsContainer.innerHTML = users.map(u => {
      const isMasterAdmin = (u.id === 'user_admin');
      const badge = isMasterAdmin 
        ? '<span class="user-role-badge">ADMIN</span>' 
        : '<span class="user-role-badge badge-user">USER</span>';

      const actionHtml = isMasterAdmin 
        ? '<span class="badge-pill-locked" title="MASTER ADMIN">MASTER</span>' 
        : `
          <div class="user-card-action-btns">
            <button type="button" class="btn btn-outline-primary btn-action-pill" onclick="openEditUserModal('${u.id}')" title="Edit">
              Edit
            </button>
            <button type="button" class="btn btn-outline-danger btn-action-pill" onclick="confirmDeleteUser('${u.id}')" title="Delete">
              Delete
            </button>
          </div>
        `;

      return `
        <div class="user-card-mobile">
          <div class="user-card-top">
            <div class="user-card-identity">
              ${badge}
              <span class="user-card-name">${escapeHtml(u.name.toUpperCase())}</span>
            </div>
            <div class="user-card-actions">
              ${actionHtml}
            </div>
          </div>
          <div class="user-card-divider"></div>
          <div class="user-card-info-grid">
            <div class="user-card-info-row">
              <div class="user-card-meta-item">
                <span class="user-card-meta-label">ID:</span>
                <span class="user-card-val">${escapeHtml(u.empCode || '-')}</span>
              </div>
              <div class="user-card-meta-item">
                <span class="user-card-meta-label">PIN:</span>
                <span class="user-card-val">${escapeHtml(u.pin)}</span>
              </div>
            </div>
            <div class="user-card-dept-row">
              <span class="user-card-meta-label">Dept:</span>
              <span class="user-card-dept-text">${escapeHtml(u.department || '-')}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

function handleAddNewUserSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('newUserName')?.value.trim();
  const empCode = document.getElementById('newUserEmpCode')?.value.trim();
  const pin = document.getElementById('newUserPin')?.value.trim();
  const dept = document.getElementById('newUserDept')?.value.trim();

  const res = registerNewUser(name, pin, 'user', dept, 'CALSA', empCode);
  if (res.success) {
    document.getElementById('newUserName').value = '';
    if (document.getElementById('newUserEmpCode')) document.getElementById('newUserEmpCode').value = '';
    document.getElementById('newUserPin').value = '';
    document.getElementById('newUserDept').value = '';
    renderManageUsersTable();
    updateNavbarAuthUI(currentUser, isFirebaseOnline);
    showSuccessPopup('Employee added', `${name} (PIN: ${pin}) was added.`);
    showToastNotification(`Added ${name} (ID ${res.user.empCode})`);
  } else {
    alert(res.error || 'Could not add the user.');
  }
}

/**
 * หน้าต่าง Modal แก้ไขข้อมูลพนักงาน (Admin Only)
 */
function openEditUserModal(userId) {
  if (!currentUser || currentUser.role !== 'admin' || currentUser.id !== 'user_admin') {
    showToastNotification('Only admins can edit employees');
    return;
  }
  const users = getAllSystemUsers(true);
  const u = users.find(x => x.id === userId);
  if (!u) return;

  const modal = document.getElementById('editUserModal');
  if (!modal) return;

  const alertBox = document.getElementById('editUserAlert');
  if (alertBox) {
    alertBox.style.display = 'none';
    alertBox.textContent = '';
  }

  const idInput = document.getElementById('editUserId');
  const nameInput = document.getElementById('editUserName');
  const empCodeInput = document.getElementById('editUserEmpCode');
  const deptInput = document.getElementById('editUserDept');
  const pinInput = document.getElementById('editUserPin');

  if (idInput) idInput.value = u.id;
  if (nameInput) nameInput.value = u.name || '';
  if (empCodeInput) empCodeInput.value = u.empCode || '';
  if (deptInput) deptInput.value = u.department || '';
  if (pinInput) pinInput.value = u.pin || '';

  modal.style.display = 'flex';
}

function closeEditUserModal() {
  const modal = document.getElementById('editUserModal');
  if (modal) modal.style.display = 'none';
}

function handleSaveEditUserSubmit(e) {
  e.preventDefault();
  const userId = document.getElementById('editUserId')?.value;
  const name = document.getElementById('editUserName')?.value.trim();
  const empCode = document.getElementById('editUserEmpCode')?.value.trim();
  const dept = document.getElementById('editUserDept')?.value.trim();
  const pin = document.getElementById('editUserPin')?.value.trim();
  const alertBox = document.getElementById('editUserAlert');

  if (!userId || !name) {
    if (alertBox) {
      alertBox.textContent = 'Please enter the employee name.';
      alertBox.style.display = 'block';
    }
    return;
  }

  if (!pin || !/^\d{4,8}$/.test(pin)) {
    if (alertBox) {
      alertBox.textContent = 'PIN must be 4–8 digits.';
      alertBox.style.display = 'block';
    }
    return;
  }

  const res = updateSystemUser(userId, {
    name: name.toUpperCase(),
    empCode: (empCode || '-').toUpperCase(),
    department: dept || '-',
    pin: pin
  });

  if (res.success) {
    renderManageUsersTable();
    updateNavbarAuthUI(currentUser, isFirebaseOnline);
    if (getActiveEditingUserId() === userId) {
      syncSalaryProfileWithActiveUser();
      recalculateSalary();
    }
    closeEditUserModal();
    showSuccessPopup('Saved', `"${name}" was updated.`);
    showToastNotification(`${name} updated`);
  } else {
    if (alertBox) {
      alertBox.textContent = res.error || 'Could not save. Please try again.';
      alertBox.style.display = 'block';
    } else {
      alert(res.error || 'Could not save. Please try again.');
    }
  }
}

function confirmDeleteUser(userId) {
  if (userId === 'user_admin') {
    alert('The main admin account (JITTRAKAN K.) cannot be deleted.');
    return;
  }
  const users = getAllSystemUsers();
  const u = users.find(x => x.id === userId);
  if (!u) return;

  if (confirm(`Delete "${u.name}" (ID ${u.empCode || '-'}, PIN ${u.pin})?`)) {
    const res = deleteSystemUser(userId);
    if (res.success) {
      renderManageUsersTable();
      updateNavbarAuthUI(currentUser, isFirebaseOnline);
      reloadUserDataAfterAuthChange();
      showToastNotification(`${u.name} deleted`);
    } else {
      alert(res.error || 'Could not delete.');
    }
  }
}

function confirmClearAllStaffUsers() {
  const users = getAllSystemUsers();
  const staffUsers = users.filter(u => u.id !== 'user_admin');
  if (staffUsers.length === 0) {
    showToastNotification('There are no other employees yet');
    return;
  }

  if (confirm(`Delete all ${staffUsers.length} employees?\n\nThe main admin account (JITTRAKAN K.) will be kept.`)) {
    clearAllStaffUsers();
    renderManageUsersTable();
    updateNavbarAuthUI(currentUser, isFirebaseOnline);
    reloadUserDataAfterAuthChange();
    showToastNotification('All employees deleted');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ==========================================================================
// 15. ระบบตั้งค่าและเพิ่มเซิร์ฟเวอร์ Firebase (Firebase Server Configuration)
// ==========================================================================
function openFirebaseConfigModal() {
  closeAuthModal();
  closeUserProfileModal();
  const modal = document.getElementById('firebaseConfigModal');
  if (!modal) return;

  const alertBox = document.getElementById('fbConfigAlert');
  if (alertBox) {
    alertBox.style.display = 'none';
    alertBox.textContent = '';
  }

  const rawPaste = document.getElementById('fbCfgRawPaste');
  if (rawPaste) rawPaste.value = '';

  const cfg = typeof getActiveFirebaseConfig === 'function' ? getActiveFirebaseConfig() : DEFAULT_FIREBASE_CONFIG;
  const isCustom = typeof isUsingCustomFirebaseServer === 'function' ? isUsingCustomFirebaseServer() : false;

  setInputValue('fbCfgApiKey', cfg.apiKey || '');
  setInputValue('fbCfgAuthDomain', cfg.authDomain || '');
  setInputValue('fbCfgProjectId', cfg.projectId || '');
  setInputValue('fbCfgStorageBucket', cfg.storageBucket || '');
  setInputValue('fbCfgMessagingSenderId', cfg.messagingSenderId || '');
  setInputValue('fbCfgAppId', cfg.appId || '');

  // แสดงผลแถบสถานะเซิร์ฟเวอร์ พร้อมปุ่มซิงก์ข้ามอุปกรณ์ (คอม <-> มือถือ)
  const statusBanner = document.getElementById('fbServerStatusBanner');
  if (statusBanner) {
    if (isCustom) {
      statusBanner.className = 'fb-server-status-banner banner-custom';
      statusBanner.innerHTML = `
        <div class="fb-status-icon">🟢</div>
        <div class="fb-status-content" style="flex:1;">
          <div class="fb-status-title">Server: <strong>${escapeHtml(cfg.projectId)}</strong> <span class="fb-status-tag-custom">Online</span></div>
          <div class="fb-status-desc">Connected to Firebase Firestore. Data syncs in real time.</div>
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:10px;">
            <button type="button" class="btn btn-sm" style="background:#111111; color:#ffffff; border:1px solid #111111; font-size:0.76rem; padding:5px 10px; border-radius:6px; cursor:pointer; font-weight:600;" onclick="copyFirebaseSyncLinkForMobile()">
              Copy mobile sync link
            </button>
            <button type="button" class="btn btn-sm" style="background:#ffffff; color:#111111; border:1px solid #cbd5e1; font-size:0.76rem; padding:5px 10px; border-radius:6px; cursor:pointer; font-weight:600;" onclick="manualPullFromCloud()">
              Pull from cloud
            </button>
            <button type="button" class="btn btn-sm" style="background:#ffffff; color:#111111; border:1px solid #cbd5e1; font-size:0.76rem; padding:5px 10px; border-radius:6px; cursor:pointer; font-weight:600;" onclick="manualPushToCloud()">
              Push to cloud
            </button>
          </div>
        </div>
      `;
    } else {
      statusBanner.className = 'fb-server-status-banner banner-demo';
      statusBanner.innerHTML = `
        <div class="fb-status-icon">🟡</div>
        <div class="fb-status-content">
          <div class="fb-status-title">Server: <strong>Local storage</strong> <span class="fb-status-tag-demo">Offline</span></div>
          <div class="fb-status-desc">Not connected to the cloud. Data is stored in this browser only. To sync between computer and phone, enter a Firebase config below or open a sync link from a connected device.</div>
        </div>
      `;
    }
  }

  modal.style.display = 'flex';
}

/**
 * คัดลอกลิงก์ที่มีคอนฟิก Firebase ฝังอยู่ เพื่อส่งไปเปิดในมือถือให้เชื่อมต่ออัตโนมัติทันที
 */
function copyFirebaseSyncLinkForMobile() {
  const alertBox = document.getElementById('fbConfigAlert');
  const apiKey = document.getElementById('fbCfgApiKey')?.value.trim();
  const authDomain = document.getElementById('fbCfgAuthDomain')?.value.trim();
  const projectId = document.getElementById('fbCfgProjectId')?.value.trim();
  const storageBucket = document.getElementById('fbCfgStorageBucket')?.value.trim();
  const messagingSenderId = document.getElementById('fbCfgMessagingSenderId')?.value.trim();
  const appId = document.getElementById('fbCfgAppId')?.value.trim();

  const cfg = (projectId && apiKey)
    ? { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId }
    : (typeof getActiveFirebaseConfig === 'function' ? getActiveFirebaseConfig() : null);

  const syncUrl = typeof generateFirebaseSyncUrl === 'function' ? generateFirebaseSyncUrl(cfg) : '';
  if (!syncUrl) {
    showToastNotification('Save a Firebase connection before creating a sync link');
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(syncUrl).then(() => {
      if (alertBox) {
        alertBox.className = 'alert alert-success';
        alertBox.innerHTML = '<strong>Sync link copied.</strong> Open it in your phone browser to connect Firebase and pull all data automatically.';
        alertBox.style.display = 'block';
      }
      showToastNotification('Sync link copied');
    }).catch(() => {
      prompt('Copy this link and open it on your phone:', syncUrl);
    });
  } else {
    prompt('Copy this link and open it on your phone:', syncUrl);
  }
}

async function manualPullFromCloud() {
  const alertBox = document.getElementById('fbConfigAlert');
  if (alertBox) {
    alertBox.className = 'alert alert-info';
    alertBox.textContent = 'Pulling the latest data from Cloud Firestore…';
    alertBox.style.display = 'block';
  }
  if (typeof pullAllUserDataFromCloud === 'function') {
    const ok = await pullAllUserDataFromCloud(null, false);
    if (alertBox) {
      alertBox.className = ok ? 'alert alert-success' : 'alert alert-danger';
      alertBox.textContent = ok
        ? 'All cloud data has been pulled to this device.'
        : 'Could not pull from the cloud. Please check the connection.';
    }
  }
}

async function manualPushToCloud() {
  const alertBox = document.getElementById('fbConfigAlert');
  if (alertBox) {
    alertBox.className = 'alert alert-info';
    alertBox.textContent = 'Uploading all data on this device to Cloud Firestore…';
    alertBox.style.display = 'block';
  }
  if (typeof pushAllLocalDataToCloud === 'function') {
    const ok = await pushAllLocalDataToCloud(null, false);
    if (alertBox) {
      alertBox.className = ok ? 'alert alert-success' : 'alert alert-danger';
      alertBox.textContent = ok
        ? 'Upload complete. Other devices on the same account will receive the same data.'
        : 'Could not upload to the cloud. Please check the connection.';
    }
  }
}

function closeFirebaseConfigModal() {
  const modal = document.getElementById('firebaseConfigModal');
  if (modal) modal.style.display = 'none';
}

function toggleFbApiKeyVisibility() {
  const input = document.getElementById('fbCfgApiKey');
  const icon = document.getElementById('fbApiKeyToggleIcon');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.textContent = '🙈';
  } else {
    input.type = 'password';
    if (icon) icon.textContent = '👁️';
  }
}

/**
 * แยกและเติมข้อมูลคอนฟิกอัตโนมัติจากโค้ด Firebase ที่ผู้ใช้วาง
 */
function parseRawFirebaseConfig() {
  const textarea = document.getElementById('fbCfgRawPaste');
  const alertBox = document.getElementById('fbConfigAlert');
  if (!textarea) return;

  const raw = textarea.value.trim();
  if (!raw) {
    if (alertBox) {
      alertBox.className = 'alert alert-warning';
      alertBox.textContent = 'Paste your Firebase config in the text box first.';
      alertBox.style.display = 'block';
    }
    return;
  }

  function extractVal(txt, key) {
    const r = new RegExp(`(?:['"]?${key}['"]?\\s*:\\s*['"])([^'"]+)(?:['"])`, 'i');
    const m = txt.match(r);
    return m ? m[1].trim() : '';
  }

  const apiKey = extractVal(raw, 'apiKey');
  const authDomain = extractVal(raw, 'authDomain');
  const projectId = extractVal(raw, 'projectId');
  const storageBucket = extractVal(raw, 'storageBucket');
  const messagingSenderId = extractVal(raw, 'messagingSenderId');
  const appId = extractVal(raw, 'appId');

  let filledCount = 0;
  if (apiKey) { setInputValue('fbCfgApiKey', apiKey); filledCount++; }
  if (authDomain) { setInputValue('fbCfgAuthDomain', authDomain); filledCount++; }
  if (projectId) { setInputValue('fbCfgProjectId', projectId); filledCount++; }
  if (storageBucket) { setInputValue('fbCfgStorageBucket', storageBucket); filledCount++; }
  if (messagingSenderId) { setInputValue('fbCfgMessagingSenderId', messagingSenderId); filledCount++; }
  if (appId) { setInputValue('fbCfgAppId', appId); filledCount++; }

  if (filledCount > 0) {
    if (alertBox) {
      alertBox.className = 'alert alert-success';
      alertBox.textContent = `Filled ${filledCount} fields. Check them and press "Test connection" before saving.`;
      alertBox.style.display = 'block';
    }
    showToastNotification(`Parsed ${filledCount} config fields`);
  } else {
    // ลองแปลงแบบ JSON โดยตรง
    try {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object') {
        if (obj.apiKey) { setInputValue('fbCfgApiKey', obj.apiKey); filledCount++; }
        if (obj.authDomain) { setInputValue('fbCfgAuthDomain', obj.authDomain); filledCount++; }
        if (obj.projectId) { setInputValue('fbCfgProjectId', obj.projectId); filledCount++; }
        if (obj.storageBucket) { setInputValue('fbCfgStorageBucket', obj.storageBucket); filledCount++; }
        if (obj.messagingSenderId) { setInputValue('fbCfgMessagingSenderId', String(obj.messagingSenderId)); filledCount++; }
        if (obj.appId) { setInputValue('fbCfgAppId', obj.appId); filledCount++; }
      }
    } catch(e) {}

    if (filledCount > 0) {
      if (alertBox) {
        alertBox.className = 'alert alert-success';
        alertBox.textContent = `Filled ${filledCount} fields`;
        alertBox.style.display = 'block';
      }
      showToastNotification(`Parsed ${filledCount} config fields`);
    } else {
      if (alertBox) {
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = 'Could not parse the pasted text. Check the format or fill the fields manually.';
        alertBox.style.display = 'block';
      }
    }
  }
}

/**
 * ทดสอบการเชื่อมต่อกับเซิร์ฟเวอร์ Firebase
 */
async function testFirebaseConfigFromModal() {
  const alertBox = document.getElementById('fbConfigAlert');
  const btnTest = document.getElementById('btnTestFbConn');

  const apiKey = document.getElementById('fbCfgApiKey')?.value.trim();
  const authDomain = document.getElementById('fbCfgAuthDomain')?.value.trim();
  const projectId = document.getElementById('fbCfgProjectId')?.value.trim();
  const storageBucket = document.getElementById('fbCfgStorageBucket')?.value.trim();
  const messagingSenderId = document.getElementById('fbCfgMessagingSenderId')?.value.trim();
  const appId = document.getElementById('fbCfgAppId')?.value.trim();

  if (!projectId || !apiKey) {
    if (alertBox) {
      alertBox.className = 'alert alert-danger';
      alertBox.textContent = 'Enter a Project ID and API key before testing.';
      alertBox.style.display = 'block';
    }
    return;
  }

  const cfg = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };

  if (btnTest) {
    btnTest.disabled = true;
    btnTest.innerHTML = 'Testing…';
  }
  if (alertBox) {
    alertBox.className = 'alert alert-info';
    alertBox.textContent = 'Connecting to Firebase…';
    alertBox.style.display = 'block';
  }

  const res = (typeof testFirebaseConnection === 'function') 
    ? await testFirebaseConnection(cfg) 
    : { success: false, error: 'Test function unavailable' };

  if (btnTest) {
    btnTest.disabled = false;
    btnTest.innerHTML = 'Test connection';
  }

  if (res.success) {
    if (alertBox) {
      alertBox.className = 'alert alert-success';
      alertBox.textContent = `🟢 ${res.message}`;
      alertBox.style.display = 'block';
    }
    showToastNotification(`Connected to "${projectId}"`);
  } else {
    if (alertBox) {
      alertBox.className = 'alert alert-danger';
      alertBox.textContent = `❌ ${res.error}`;
      alertBox.style.display = 'block';
    }
    showToastNotification(`Connection failed`);
  }
}

/**
 * บันทึกคอนฟิกเซิร์ฟเวอร์ Firebase และเริ่มเชื่อมต่อใช้งานทันที
 */
async function saveFirebaseConfigFromModal() {
  const alertBox = document.getElementById('fbConfigAlert');
  const btnSave = document.getElementById('btnSaveFbConfig');

  const apiKey = document.getElementById('fbCfgApiKey')?.value.trim();
  const authDomain = document.getElementById('fbCfgAuthDomain')?.value.trim();
  const projectId = document.getElementById('fbCfgProjectId')?.value.trim();
  const storageBucket = document.getElementById('fbCfgStorageBucket')?.value.trim();
  const messagingSenderId = document.getElementById('fbCfgMessagingSenderId')?.value.trim();
  const appId = document.getElementById('fbCfgAppId')?.value.trim();

  if (!projectId || !apiKey) {
    if (alertBox) {
      alertBox.className = 'alert alert-danger';
      alertBox.textContent = 'Please enter both Project ID and API key.';
      alertBox.style.display = 'block';
    }
    return;
  }

  const newCfg = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };

  if (btnSave) {
    btnSave.disabled = true;
    btnSave.innerHTML = 'Connecting…';
  }

  if (typeof reinitFirebaseWithNewConfig === 'function') {
    await reinitFirebaseWithNewConfig(newCfg);
  } else if (typeof saveFirebaseConfig === 'function') {
    saveFirebaseConfig(newCfg);
  }

  if (btnSave) {
    btnSave.disabled = false;
    btnSave.innerHTML = 'Save & connect';
  }

  closeFirebaseConfigModal();
  updateNavbarAuthUI(currentUser, isFirebaseOnline);
  showSuccessPopup('Connected', `Firebase (${projectId}) is connected and syncing.`);
  showToastNotification(`Connected to Firebase (${projectId})`);
}

/**
 * คืนค่าการตั้งค่าเซิร์ฟเวอร์กลับเป็นโหมดเริ่มต้น (Local Storage ออฟไลน์)
 */
async function resetFirebaseConfigDefault() {
  if (confirm('Reset Firebase to the default (offline local storage)?')) {
    if (typeof resetFirebaseConfigToDefault === 'function') {
      await resetFirebaseConfigToDefault();
    } else {
      localStorage.removeItem(STORAGE_KEY_FIREBASE_CFG);
    }
    closeFirebaseConfigModal();
    updateNavbarAuthUI(currentUser, isFirebaseOnline);
    showSuccessPopup('Reset', 'Now using offline local storage.');
    showToastNotification('Switched to local mode');
  }
}

// ==========================================================================
// ระบบหน้าต่างเด้งแจ้งเตือนบันทึกสำเร็จ (Success Confirmation Modal Dialog)
// ==========================================================================
let successPopupTimer = null;

function showSuccessPopup(title = 'Saved', message = 'Your changes have been saved.', callback = null) {
  const modal = document.getElementById('successConfirmModal');
  const titleEl = document.getElementById('successPopupTitle');
  const msgEl = document.getElementById('successPopupMessage');
  const okBtn = document.getElementById('successPopupOkBtn');

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;

  if (modal) {
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    if (okBtn) okBtn.focus();
  }

  if (successPopupTimer) clearTimeout(successPopupTimer);
  window._successPopupCallback = callback;

  // ปิดอัตโนมัติเมื่อครบ 3 วินาทีหากผู้ใช้ไม่ได้กดปุ่ม
  successPopupTimer = setTimeout(() => {
    closeSuccessPopup();
  }, 3000);
}

function closeSuccessPopup() {
  if (successPopupTimer) {
    clearTimeout(successPopupTimer);
    successPopupTimer = null;
  }
  const modal = document.getElementById('successConfirmModal');
  if (modal) {
    modal.style.display = 'none';
  }
  if (typeof window._successPopupCallback === 'function') {
    const cb = window._successPopupCallback;
    window._successPopupCallback = null;
    cb();
  }
}

function handleSuccessBackdropClick(event) {
  if (event && event.target && event.target.id === 'successConfirmModal') {
    closeSuccessPopup();
  }
}

// ระบบ Toast Notification แจ้งเตือนสวยงาม
function showToastNotification(message) {
  let toast = document.getElementById('appGlobalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appGlobalToast';
    toast.className = 'app-toast';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ==========================================================================
// 16. เริ่มต้นระบบ (DOM Ready Initialization) & Cross-Window / Simulator Sync
// ==========================================================================
function isSyncableStorageKey(k) {
  if (!k) return false;
  return (
    k.startsWith('orbray_') ||
    k.startsWith('salary_') ||
    k.startsWith('period_salary_') ||
    k.startsWith('multi_company_') ||
    k.startsWith('custom_firebase_') ||
    k.startsWith('gemini_')
  );
}

window.broadcastStorageToSimulator = function() {
  try {
    const dump = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (isSyncableStorageKey(k)) {
        dump[k] = localStorage.getItem(k);
      }
    }
    // หากอยู่บนหน้าต่างหลัก ให้ส่งข้อมูลไปยัง Phone Simulator iframe
    const simIframe = document.getElementById('simIframe');
    if (simIframe && simIframe.contentWindow) {
      simIframe.contentWindow.postMessage({ type: 'SALARY_APP_STORAGE_SYNC', storage: dump }, '*');
    }
    // หากอยู่ใน Phone Simulator iframe ให้ส่งข้อมูลกลับไปยังหน้าต่างหลักด้วย
    if (window.self !== window.top && window.parent) {
      window.parent.postMessage({ type: 'SALARY_APP_STORAGE_SYNC', storage: dump }, '*');
    }
  } catch (e) {}
};

window.addEventListener('message', async (event) => {
  if (!event.data || event.data.type !== 'SALARY_APP_STORAGE_SYNC' || !event.data.storage) return;
  try {
    const incoming = event.data.storage;
    let fbConfigChanged = false;
    const prevFbCfg = localStorage.getItem(STORAGE_KEY_FIREBASE_CFG);

    Object.keys(incoming).forEach(k => {
      if (incoming[k] !== null && incoming[k] !== undefined) {
        if (k === STORAGE_KEY_FIREBASE_CFG && incoming[k] !== prevFbCfg) {
          fbConfigChanged = true;
        }
        localStorage.setItem(k, incoming[k]);
      }
    });

    if (fbConfigChanged && typeof initFirebaseApp === 'function') {
      initFirebaseApp();
    } else if (typeof checkStoredCurrentUser === 'function') {
      checkStoredCurrentUser();
    }

    if (typeof window.refreshAllViewsAfterCloudSync === 'function') {
      window.refreshAllViewsAfterCloudSync();
    }
  } catch (e) {}
});

window.addEventListener('storage', (event) => {
  if (!event.key) return;
  if (isSyncableStorageKey(event.key)) {
    if (event.key === STORAGE_KEY_FIREBASE_CFG && typeof initFirebaseApp === 'function') {
      initFirebaseApp();
    } else if (typeof checkStoredCurrentUser === 'function') {
      checkStoredCurrentUser();
    }
    if (typeof window.refreshAllViewsAfterCloudSync === 'function') {
      window.refreshAllViewsAfterCloudSync();
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {
  // ตรวจสอบว่ากำลังทำงานอยู่ภายใน Phone Simulator หรือไม่
  if (window.self !== window.top || window.location.search.includes('mode=mobile_sim')) {
    document.body.classList.add('is-in-simulator');
    document.documentElement.classList.add('is-in-simulator');
    const simModal = document.getElementById('phoneSimulatorModal');
    if (simModal) simModal.remove();
  }

  loadStorageData();
  renderCompanyDropdown();
  updateYearSelectDropdown();
  refreshPeriodSelector();
  renderOrbrayCalendarGrid();
  updateRateLabelsOnCards();
  updateCardPeriodBadge();

  // ลงทะเบียนติดตามสถานะผู้ใช้จาก Firebase
  if (typeof addAuthStateListener === 'function') {
    addAuthStateListener((user, isOnline) => {
      syncSalaryProfileWithActiveUser();
      recalculateSalary();
      updateNavbarAuthUI(user, isOnline);
    });
  }

  updateAdminScopeBanner();

  if (window._justImportedFbConfigFromUrl) {
    setTimeout(() => {
      showToastNotification(`Connected to Firebase (${window._justImportedFbConfigFromUrl}) and synced`);
    }, 500);
  }
});

// ==========================================================================
// 17. ระบบ Phone Simulator (แบบจำลองหน้าจอมือถือ iPhone 11 ขึ้นไป)
// ==========================================================================
const SIMULATOR_DEVICES = {
  // iPhone 16 / 15 Series (Dynamic Island)
  'iphone16promax': {
    name: 'iPhone 16 Pro Max',
    width: 440,
    height: 956,
    island: true,
    islandWidth: 126,
    islandHeight: 35,
    borderRadius: 54,
    screenRadius: 44,
    bezel: 11
  },
  'iphone15pro': {
    name: 'iPhone 15 Pro / 16',
    width: 393,
    height: 852,
    island: true,
    islandWidth: 120,
    islandHeight: 33,
    borderRadius: 50,
    screenRadius: 40,
    bezel: 11
  },
  'iphone15promax': {
    name: 'iPhone 15 Pro Max / 14 Pro Max',
    width: 430,
    height: 932,
    island: true,
    islandWidth: 124,
    islandHeight: 34,
    borderRadius: 52,
    screenRadius: 42,
    bezel: 11
  },
  // iPhone 14 / 13 / 12 Series (Slim Notch)
  'iphone14': {
    name: 'iPhone 14 / 13 / 12',
    width: 390,
    height: 844,
    island: false,
    notchWidth: 154,
    notchHeight: 30,
    borderRadius: 48,
    screenRadius: 38,
    bezel: 11
  },
  'iphone14plus': {
    name: 'iPhone 14 Plus / 13 Pro Max',
    width: 428,
    height: 926,
    island: false,
    notchWidth: 154,
    notchHeight: 30,
    borderRadius: 48,
    screenRadius: 38,
    bezel: 11
  },
  'iphone13mini': {
    name: 'iPhone 13 mini / 12 mini',
    width: 375,
    height: 812,
    island: false,
    notchWidth: 148,
    notchHeight: 28,
    borderRadius: 44,
    screenRadius: 34,
    bezel: 11
  },
  // iPhone 11 Series (Classic Notch)
  'iphone11': {
    name: 'iPhone 11 / XR',
    width: 414,
    height: 896,
    island: false,
    notchWidth: 210,
    notchHeight: 30,
    borderRadius: 46,
    screenRadius: 36,
    bezel: 14
  },
  'iphone11pro': {
    name: 'iPhone 11 Pro / X',
    width: 375,
    height: 812,
    island: false,
    notchWidth: 205,
    notchHeight: 30,
    borderRadius: 44,
    screenRadius: 34,
    bezel: 13
  }
};

let currentSimDeviceKey = 'iphone15pro';
let currentSimScale = 'fit';
let simIsLandscape = false;
let simClockTimer = null;

function openPhoneSimulator() {
  const modal = document.getElementById('phoneSimulatorModal');
  if (!modal) return;

  modal.style.display = 'flex';

  const iframe = document.getElementById('simIframe');
  if (iframe) {
    if (!iframe._hasSyncLoadListener) {
      iframe.addEventListener('load', () => {
        if (typeof window.broadcastStorageToSimulator === 'function') {
          window.broadcastStorageToSimulator();
        }
      });
      iframe._hasSyncLoadListener = true;
    }
    const currentSrc = iframe.getAttribute('src');
    if (!currentSrc || currentSrc === 'about:blank') {
      iframe.src = 'index.html?mode=mobile_sim';
    } else if (typeof window.broadcastStorageToSimulator === 'function') {
      window.broadcastStorageToSimulator();
    }
  }

  updateSimulatorClock();
  if (simClockTimer) clearInterval(simClockTimer);
  simClockTimer = setInterval(updateSimulatorClock, 1000);

  setTimeout(() => {
    applySimulatorDeviceAndScale();
  }, 20);
}

function closePhoneSimulator() {
  const modal = document.getElementById('phoneSimulatorModal');
  if (modal) modal.style.display = 'none';

  if (simClockTimer) {
    clearInterval(simClockTimer);
    simClockTimer = null;
  }
}

function changeSimulatorDevice(deviceId) {
  if (SIMULATOR_DEVICES[deviceId]) {
    currentSimDeviceKey = deviceId;
    applySimulatorDeviceAndScale();
  }
}

function toggleSimulatorOrientation() {
  simIsLandscape = !simIsLandscape;
  const textEl = document.getElementById('simOrientationText');
  if (textEl) {
    textEl.textContent = simIsLandscape ? 'Landscape' : 'Portrait';
  }
  applySimulatorDeviceAndScale();
}

function changeSimulatorScale(scaleVal) {
  currentSimScale = scaleVal;
  applySimulatorDeviceAndScale();
}

function reloadSimulatorFrame() {
  const iframe = document.getElementById('simIframe');
  if (iframe) {
    try {
      iframe.contentWindow.location.reload();
    } catch (e) {
      iframe.src = 'index.html?mode=mobile_sim&t=' + Date.now();
    }
  }
}

function handleSimulatorBackdropClick(event) {
  if (event && event.target && (event.target.id === 'phoneSimulatorModal' || event.target.classList.contains('sim-stage-container'))) {
    closePhoneSimulator();
  }
}

function updateSimulatorClock() {
  const timeEl = document.getElementById('simStatusTime');
  if (!timeEl) return;
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  timeEl.textContent = `${hours}:${mins}`;
}

function applySimulatorDeviceAndScale() {
  const dev = SIMULATOR_DEVICES[currentSimDeviceKey] || SIMULATOR_DEVICES['iphone15pro'];
  const phoneFrame = document.getElementById('simPhoneFrame');
  const screenBezel = document.getElementById('simScreenBezel');
  const dynamicIsland = document.getElementById('simDynamicIsland');
  const notch = document.getElementById('simNotch');
  const scaler = document.getElementById('simDeviceScaler');
  if (!phoneFrame || !screenBezel || !scaler) return;

  const w = simIsLandscape ? dev.height : dev.width;
  const h = simIsLandscape ? dev.width : dev.height;

  // ปรับขนาด Chassis ให้ตรงกับขนาดหน้าจอ + Bezel
  phoneFrame.style.width = `${w}px`;
  phoneFrame.style.height = `${h}px`;
  phoneFrame.style.borderRadius = `${dev.borderRadius}px`;
  phoneFrame.style.padding = `${dev.bezel}px`;
  screenBezel.style.borderRadius = `${dev.screenRadius}px`;

  // Hardware buttons ในโหมดแนวนอน vs แนวตั้ง
  const silentBtn = phoneFrame.querySelector('.sim-btn-silent');
  const volUpBtn = phoneFrame.querySelector('.sim-btn-vol-up');
  const volDownBtn = phoneFrame.querySelector('.sim-btn-vol-down');
  const powerBtn = phoneFrame.querySelector('.sim-btn-power');
  if (simIsLandscape) {
    if (silentBtn) silentBtn.style.display = 'none';
    if (volUpBtn) volUpBtn.style.display = 'none';
    if (volDownBtn) volDownBtn.style.display = 'none';
    if (powerBtn) powerBtn.style.display = 'none';
  } else {
    if (silentBtn) silentBtn.style.display = 'block';
    if (volUpBtn) volUpBtn.style.display = 'block';
    if (volDownBtn) volDownBtn.style.display = 'block';
    if (powerBtn) powerBtn.style.display = 'block';
  }

  // ปรับการแสดงผล Dynamic Island vs Notch
  if (dev.island) {
    if (dynamicIsland) {
      dynamicIsland.style.display = 'flex';
      dynamicIsland.style.width = `${dev.islandWidth}px`;
      dynamicIsland.style.height = `${dev.islandHeight}px`;
    }
    if (notch) notch.style.display = 'none';
  } else {
    if (dynamicIsland) dynamicIsland.style.display = 'none';
    if (notch) {
      notch.style.display = 'flex';
      notch.style.width = `${dev.notchWidth}px`;
      notch.style.height = `${dev.notchHeight}px`;
    }
  }

  // คำนวณ Scale
  let scale = 1.0;
  if (currentSimScale === 'fit') {
    const stage = document.querySelector('.sim-stage-container');
    const availableW = Math.max(300, (stage ? stage.clientWidth : window.innerWidth) - 40);
    const availableH = Math.max(300, (stage ? stage.clientHeight : (window.innerHeight - 90)) - 40);
    const totalW = w + (dev.bezel * 2) + 16;
    const totalH = h + (dev.bezel * 2) + 16;
    const scaleW = availableW / totalW;
    const scaleH = availableH / totalH;
    scale = Math.min(1.0, Math.min(scaleW, scaleH));
  } else {
    scale = parseFloat(currentSimScale) || 1.0;
  }

  scaler.style.transform = `scale(${scale.toFixed(3)})`;
}

// Window resize & ESC key
window.addEventListener('resize', () => {
  const modal = document.getElementById('phoneSimulatorModal');
  if (modal && modal.style.display !== 'none' && currentSimScale === 'fit') {
    applySimulatorDeviceAndScale();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const profModal = document.getElementById('userProfileModal');
    if (profModal && profModal.style.display !== 'none') {
      closeUserProfileModal();
      return;
    }
    const modal = document.getElementById('phoneSimulatorModal');
    if (modal && modal.style.display !== 'none') {
      closePhoneSimulator();
    }
  }
});
