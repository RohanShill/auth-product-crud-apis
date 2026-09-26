// Automated test suite for Auth & Product CRUD APIs
const dotenv = require('dotenv');
dotenv.config();

const BASE_URL = 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('--- Starting API Test Suite ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let accessToken = '';
  let refreshTokenCookie = '';
  let createdProductId = '';

  try {
    // 1. Validation error on register
    console.log('\n--- 1. Testing Register Validation ---');
    const resBadRegister = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'A',
        email: 'invalid-email',
        password: '123',
        confirmPassword: '456'
      })
    });
    const badRegData = await resBadRegister.json();
    assert(resBadRegister.status === 400, 'Register invalid data returns 400');
    assert(Array.isArray(badRegData.errors) && badRegData.errors.length >= 3, 'Field-level errors returned');

    // 2. Successful register
    console.log('\n--- 2. Testing Register Success ---');
    const resRegister = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword
      })
    });
    const regData = await resRegister.json();
    assert(resRegister.status === 201, 'Register returns 201 Created');
    assert(regData.user && regData.user.name === 'John Doe', 'User returned without password');
    assert(!regData.accessToken && !regData.user.password, 'No password or token returned on register');

    // 3. Duplicate email returns 409
    console.log('\n--- 3. Testing Duplicate Email 409 ---');
    const resDup = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Guy',
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword
      })
    });
    const dupData = await resDup.json();
    assert(resDup.status === 409, 'Duplicate email returns 409 Conflict');

    // 4. Login wrong password returns 401
    console.log('\n--- 4. Testing Login Wrong Password ---');
    const resBadLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword999'
      })
    });
    assert(resBadLogin.status === 401, 'Wrong password returns 401 Unauthorized');

    // 5. Successful login
    console.log('\n--- 5. Testing Login Success ---');
    const resLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const loginData = await resLogin.json();
    assert(resLogin.status === 200, 'Login returns 200 OK');
    assert(loginData.accessToken, 'Access token returned in body');

    const setCookie = resLogin.headers.get('set-cookie');
    assert(setCookie && setCookie.includes('refreshToken'), 'Refresh token sent as cookie');

    accessToken = loginData.accessToken;
    refreshTokenCookie = setCookie ? setCookie.split(';')[0] : '';

    // 6. Test GET /api/auth/me
    console.log('\n--- 6. Testing GET /api/auth/me ---');
    const resMe = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const meData = await resMe.json();
    assert(resMe.status === 200, '/me returns 200 for authenticated user');
    assert(meData.user.email === testEmail, 'User email matches');

    // 7. Test Refresh Token endpoint
    console.log('\n--- 7. Testing Refresh Token ---');
    const resRefresh = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        Cookie: refreshTokenCookie
      }
    });
    const refreshData = await resRefresh.json();
    assert(resRefresh.status === 200, 'Refresh token returns 200 OK');
    assert(refreshData.accessToken, 'New access token issued');

    if (refreshData.accessToken) {
      accessToken = refreshData.accessToken;
    }
    const newCookie = resRefresh.headers.get('set-cookie');
    if (newCookie) {
      refreshTokenCookie = newCookie.split(';')[0];
    }

    // 8. Create Product with validation failure
    console.log('\n--- 8. Testing Product Validation on Create ---');
    const resBadProd = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        name: '',
        price: 'not-a-number'
      })
    });
    const badProdData = await resBadProd.json();
    assert(resBadProd.status === 400, 'Invalid product data returns 400');
    assert(Array.isArray(badProdData.errors) && badProdData.errors.length > 0, 'Field level errors provided');

    // 9. Create Product successfully
    console.log('\n--- 9. Testing Product Creation ---');
    const resProd = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        name: 'Wireless Noise-Canceling Headphones',
        description: 'Premium over-ear Bluetooth headphones with active noise cancellation.',
        price: 199.99,
        category: 'Electronics',
        stock: 25
      })
    });
    const prodData = await resProd.json();
    assert(resProd.status === 201, 'Create product returns 201 Created');
    assert(prodData.product && prodData.product._id, 'Product object returned');
    createdProductId = prodData.product._id;

    // 10. List products (Public)
    console.log('\n--- 10. Testing List Products ---');
    const resList = await fetch(`${BASE_URL}/products`);
    const listData = await resList.json();
    assert(resList.status === 200, 'Get all products returns 200 OK');
    assert(Array.isArray(listData.products) && listData.products.length > 0, 'Products list non-empty');

    // 11. Get single product by ID (Public)
    console.log('\n--- 11. Testing Get Single Product ---');
    const resSingle = await fetch(`${BASE_URL}/products/${createdProductId}`);
    const singleData = await resSingle.json();
    assert(resSingle.status === 200, 'Get single product returns 200 OK');
    assert(singleData.product._id === createdProductId, 'Product ID matches');

    // 12. Update Product
    console.log('\n--- 12. Testing Update Product ---');
    const resUpdate = await fetch(`${BASE_URL}/products/${createdProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        price: 179.99,
        stock: 40
      })
    });
    const updateData = await resUpdate.json();
    assert(resUpdate.status === 200, 'Update product returns 200 OK');
    assert(updateData.product.price === 179.99 && updateData.product.stock === 40, 'Updated fields verified');

    // 13. Delete Product
    console.log('\n--- 13. Testing Delete Product ---');
    const resDelete = await fetch(`${BASE_URL}/products/${createdProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    assert(resDelete.status === 200, 'Delete product returns 200 OK');

    // Check confirmed not found after delete
    const resCheckDeleted = await fetch(`${BASE_URL}/products/${createdProductId}`);
    assert(resCheckDeleted.status === 404, 'Confirm deleted product returns 404');

    // 14. Logout
    console.log('\n--- 14. Testing Logout ---');
    const resLogout = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    assert(resLogout.status === 200, 'Logout returns 200 OK');

    // 15. Verify refresh token revoked after logout
    console.log('\n--- 15. Testing Revoked Refresh Token ---');
    const resRevokedRefresh = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { Cookie: refreshTokenCookie }
    });
    assert(resRevokedRefresh.status === 403, 'Refresh with revoked token returns 403');

    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test suite runtime error:', err);
    process.exit(1);
  }
}

runTests();
