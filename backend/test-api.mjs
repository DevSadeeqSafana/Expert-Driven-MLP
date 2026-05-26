/**
 * End-to-end API Integration Test
 * Expert-Driven Mobile Learning Platform
 * 
 * Run: node test-api.mjs
 */

const BASE_URL = 'http://10.153.240.193:5001/api';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

let adminToken = '';
let learnerToken = '';
let expertToken = '';
let expertProfileId = '';

const log = (msg, color = colors.reset) => console.log(`${color}${msg}${colors.reset}`);
const pass = (label) => log(`  ✅ PASS: ${label}`, colors.green);
const fail = (label, err) => log(`  ❌ FAIL: ${label} — ${err?.message || err}`, colors.red);
const section = (title) => {
  console.log('');
  log(`${colors.bold}━━━ ${title} ━━━${colors.reset}`, colors.cyan);
};

async function req(method, path, body, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  log(`\n${colors.bold}🚀 Expert-Driven MLP — API Integration Test${colors.reset}`, colors.cyan);
  log(`   Server: ${BASE_URL}\n`);

  // ─── AUTH ───────────────────────────────────────────
  section('MODULE 1: Admin Login');
  try {
    const { data } = await req('POST', '/auth/login', { email: 'admin@mlp.com', password: 'admin123' });
    if (data.success && data.token) {
      adminToken = data.token;
      pass(`Admin login — Role: ${data.user.role}`);
    } else {
      fail('Admin login', data.message);
    }
  } catch (e) { fail('Admin login', e); }

  // ─── LEARNER REGISTRATION ───────────────────────────
  section('MODULE 1: Learner Registration & OTP');
  let learnerEmail = `learner_${Date.now()}@test.com`;
  let learnerOtp = '';
  try {
    const { data } = await req('POST', '/auth/register', {
      fullname: 'Alice Learner',
      email: learnerEmail,
      password: 'password123',
      role: 'learner',
    });
    if (data.success) {
      learnerOtp = data.debugOtp;
      pass(`Learner registered — OTP: ${data.debugOtp}`);
    } else {
      fail('Learner registration', data.message);
    }
  } catch (e) { fail('Learner registration', e); }

  try {
    const { data } = await req('POST', '/auth/verify-otp', { email: learnerEmail, otp: learnerOtp || '123456' });
    if (data.success && data.token) {
      learnerToken = data.token;
      pass(`Learner OTP verified — JWT issued`);
    } else {
      fail('Learner OTP verification', data.message);
    }
  } catch (e) { fail('Learner OTP verification', e); }

  // ─── LEARNER PROFILE ─────────────────────────────────
  section('MODULE 1: Learner Profile');
  try {
    const { data } = await req('GET', '/auth/profile', null, learnerToken);
    if (data.success && data.user.role === 'learner') {
      pass(`Profile fetch — Name: ${data.user.fullname}, Role: ${data.user.role}`);
    } else {
      fail('Learner profile fetch', data.message);
    }
  } catch (e) { fail('Learner profile', e); }

  try {
    const { data } = await req('PUT', '/auth/profile', { bio: 'Passionate learner!', learningLevel: 'intermediate' }, learnerToken);
    if (data.success) {
      pass(`Profile updated — Level: ${data.user.learningLevel}`);
    } else {
      fail('Learner profile update', data.message);
    }
  } catch (e) { fail('Learner profile update', e); }

  // ─── EXPERT REGISTRATION ────────────────────────────
  section('MODULE 2: Expert Registration & Verification');
  let expertEmail = `expert_${Date.now()}@test.com`;
  let expertOtp = '';
  try {
    const { data } = await req('POST', '/auth/register', {
      fullname: 'Bob Expert',
      email: expertEmail,
      password: 'password123',
      role: 'learner', // Starts as learner, applies for expert separately
    });
    if (data.success) {
      expertOtp = data.debugOtp;
      pass(`Expert-candidate registered — OTP: ${data.debugOtp}`);
    } else {
      fail('Expert registration', data.message);
    }
  } catch (e) { fail('Expert registration', e); }

  try {
    const { data } = await req('POST', '/auth/verify-otp', { email: expertEmail, otp: expertOtp || '123456' });
    if (data.success) {
      expertToken = data.token;
      pass(`Expert-candidate OTP verified`);
    } else {
      fail('Expert OTP verification', data.message);
    }
  } catch (e) { fail('Expert OTP verification', e); }

  try {
    const { data } = await req('POST', '/experts/apply', {
      expertise: 'Machine Learning & AI',
      yearsExperience: 7,
    }, expertToken);
    if (data.success) {
      expertProfileId = data.expert.id;
      pass(`Expert application submitted — Status: ${data.expert.verification_status}`);
    } else {
      fail('Expert application', data.message);
    }
  } catch (e) { fail('Expert application', e); }

  // ─── ADMIN APPROVES EXPERT ──────────────────────────
  try {
    const { data } = await req('PUT', `/experts/verify/${expertProfileId}`, { status: 'approved' }, adminToken);
    if (data.success) {
      pass(`Expert approved by admin — Status: ${data.expert.verification_status}`);
    } else {
      fail('Expert approval', data.message);
    }
  } catch (e) { fail('Expert approval', e); }

  // Re-login as expert to get refreshed JWT with expert role
  try {
    const { data } = await req('POST', '/auth/login', { email: expertEmail, password: 'password123' });
    if (data.success) {
      expertToken = data.token;
      pass(`Expert re-login — Role: ${data.user.role}`);
    } else {
      fail('Expert re-login', data.message);
    }
  } catch (e) { fail('Expert re-login', e); }

  // ─── COURSE MANAGEMENT ─────────────────────────────
  section('MODULE 3: Course & Lesson Creation');
  let courseId = '';
  try {
    const { data } = await req('POST', '/courses', {
      title: 'Intro to Machine Learning',
      description: 'A beginner friendly introduction to ML concepts.',
      category: 'Technology',
      level: 'beginner',
      price: 0,
      status: 'published',
    }, expertToken);
    if (data.success) {
      courseId = data.course.id;
      pass(`Course created — ID: ${courseId}`);
    } else {
      fail('Course creation', data.message);
    }
  } catch (e) { fail('Course creation', e); }

  try {
    const { data } = await req('POST', '/courses/lessons', {
      courseId,
      title: 'What is Machine Learning?',
      notes: 'Introduction to core concepts...',
      duration: 600,
      orderNumber: 1,
    }, expertToken);
    if (data.success) {
      pass(`Lesson added — Title: ${data.lesson.title}`);
    } else {
      fail('Lesson creation', data.message);
    }
  } catch (e) { fail('Lesson creation', e); }

  // ─── PUBLIC COURSE LISTING ──────────────────────────
  section('MODULE 3: Course Listing (Public)');
  try {
    const { data } = await req('GET', '/courses');
    if (data.success) {
      pass(`Courses fetched — Total: ${data.count} course(s)`);
    } else {
      fail('Course listing', data.message);
    }
  } catch (e) { fail('Course listing', e); }

  try {
    const { data } = await req('GET', `/courses/${courseId}`);
    if (data.success && data.course.lessons?.length > 0) {
      pass(`Course detail with lessons — Lessons: ${data.course.lessons.length}`);
    } else {
      fail('Course detail fetch', data.message);
    }
  } catch (e) { fail('Course detail fetch', e); }

  // ─── SUMMARY ────────────────────────────────────────
  console.log('');
  log(`${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, colors.cyan);
  log(`  🎉 Integration test complete!`, colors.green);
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`, colors.cyan);
}

runTests().catch(console.error);
