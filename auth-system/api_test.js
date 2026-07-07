// ============================================================
// E2E REST API Verification Script
// ============================================================

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 Starting E2E REST API Verification Tests...\n');

  let adminToken = '';
  let deptId = null;
  let projectId = null;
  let taskId = null;
  let userId = 1; // Default admin ID is 1

  try {
    // 1. Auth: Login as seeded Admin
    console.log('1. Authenticating as admin...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'Admin@1234',
      }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    adminToken = loginData.data.token;
    console.log('✅ Admin login successful. Token acquired.\n');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    };

    // 2. Department CRUD
    console.log('2. Testing Departments CRUD...');
    // Create Department
    const createDeptRes = await fetch(`${BASE_URL}/departments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Engineering ' + Date.now(),
        description: 'Core product engineering department',
      }),
    });
    const createDeptData = await createDeptRes.json();
    if (!createDeptRes.ok) {
      throw new Error(`Create Department failed: ${JSON.stringify(createDeptData)}`);
    }
    deptId = createDeptData.data.department.id;
    console.log(`✅ Department created. ID: ${deptId}`);

    // List Departments (with pagination & search)
    const listDeptRes = await fetch(`${BASE_URL}/departments?search=Engineering&sortBy=name&sortOrder=asc&limit=5`, {
      headers,
    });
    const listDeptData = await listDeptRes.json();
    if (!listDeptRes.ok) {
      throw new Error(`List Departments failed: ${JSON.stringify(listDeptData)}`);
    }
    console.log(`✅ List Departments verified. Total count: ${listDeptData.data.pagination.total}`);

    // Get Department details
    const getDeptRes = await fetch(`${BASE_URL}/departments/${deptId}`, { headers });
    const getDeptData = await getDeptRes.json();
    if (!getDeptRes.ok) {
      throw new Error(`Get Department failed: ${JSON.stringify(getDeptData)}`);
    }
    console.log(`✅ Get Department details verified. Name: ${getDeptData.data.department.name}`);

    // Update Department
    const updateDeptRes = await fetch(`${BASE_URL}/departments/${deptId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        description: 'Core engineering and systems architecture group',
      }),
    });
    const updateDeptData = await updateDeptRes.json();
    if (!updateDeptRes.ok) {
      throw new Error(`Update Department failed: ${JSON.stringify(updateDeptData)}`);
    }
    console.log('✅ Department updated successfully.\n');


    // 3. Projects CRUD & Many-to-Many
    console.log('3. Testing Projects CRUD & Member Associations...');
    // Create Project
    const createProjRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Admin Dashboard ' + Date.now(),
        description: 'New SaaS dashboard application',
        status: 'planned',
        department_id: deptId,
      }),
    });
    const createProjData = await createProjRes.json();
    if (!createProjRes.ok) {
      throw new Error(`Create Project failed: ${JSON.stringify(createProjData)}`);
    }
    projectId = createProjData.data.project.id;
    console.log(`✅ Project created. ID: ${projectId}`);

    // List Projects (with filters)
    const listProjRes = await fetch(`${BASE_URL}/projects?status=planned&department_id=${deptId}`, {
      headers,
    });
    const listProjData = await listProjRes.json();
    if (!listProjRes.ok) {
      throw new Error(`List Projects failed: ${JSON.stringify(listProjData)}`);
    }
    console.log(`✅ List Projects verified. Count in dept: ${listProjData.data.projects.length}`);

    // Add Member (Many-to-Many)
    const addMemberRes = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId }),
    });
    const addMemberData = await addMemberRes.json();
    if (!addMemberRes.ok) {
      throw new Error(`Add Project Member failed: ${JSON.stringify(addMemberData)}`);
    }
    console.log('✅ Member added to project successfully.');

    // Get Project (verifies many-to-many in response)
    const getProjRes = await fetch(`${BASE_URL}/projects/${projectId}`, { headers });
    const getProjData = await getProjRes.json();
    if (!getProjRes.ok) {
      throw new Error(`Get Project failed: ${JSON.stringify(getProjData)}`);
    }
    const members = getProjData.data.project.members || [];
    console.log(`✅ Get Project details verified. Members count: ${members.length}`);
    if (members.length === 0 || members[0].id !== userId) {
      throw new Error('Project members association failed to load.');
    }


    // 4. Tasks CRUD & One-to-Many
    console.log('\n4. Testing Tasks CRUD & One-to-Many...');
    // Create Task
    const createTaskRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Design Database Schema',
        description: 'Build Sequelize models and schema setup',
        status: 'todo',
        priority: 'high',
        due_date: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
        project_id: projectId,
        assignee_id: userId,
      }),
    });
    const createTaskData = await createTaskRes.json();
    if (!createTaskRes.ok) {
      throw new Error(`Create Task failed: ${JSON.stringify(createTaskData)}`);
    }
    taskId = createTaskData.data.task.id;
    console.log(`✅ Task created. ID: ${taskId}`);

    // List Tasks (verify search & filter)
    const listTaskRes = await fetch(`${BASE_URL}/tasks?search=Schema&priority=high&assignee_id=${userId}`, {
      headers,
    });
    const listTaskData = await listTaskRes.json();
    if (!listTaskRes.ok) {
      throw new Error(`List Tasks failed: ${JSON.stringify(listTaskData)}`);
    }
    console.log(`✅ List Tasks verified. Result count: ${listTaskData.data.tasks.length}`);

    // Update Task
    const updateTaskRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        status: 'in_progress',
      }),
    });
    const updateTaskData = await updateTaskRes.json();
    if (!updateTaskRes.ok) {
      throw new Error(`Update Task failed: ${JSON.stringify(updateTaskData)}`);
    }
    console.log(`✅ Task status updated. New status: ${updateTaskData.data.task.status}`);

    // Get Task details
    const getTaskRes = await fetch(`${BASE_URL}/tasks/${taskId}`, { headers });
    const getTaskData = await getTaskRes.json();
    if (!getTaskRes.ok) {
      throw new Error(`Get Task failed: ${JSON.stringify(getTaskData)}`);
    }
    console.log(`✅ Get Task details verified. Assignee Name: ${getTaskData.data.task.assignee.name}, Project Name: ${getTaskData.data.task.project.name}`);


    // 5. Cleanup Verification (Cascading and deletion)
    console.log('\n5. Testing Cascading and Deletions...');
    // Delete Task
    const deleteTRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers,
    });
    if (!deleteTRes.ok) {
      throw new Error('Delete Task failed');
    }
    console.log('✅ Task deleted successfully.');

    // Delete Project
    const deletePRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers,
    });
    if (!deletePRes.ok) {
      throw new Error('Delete Project failed');
    }
    console.log('✅ Project deleted successfully.');

    // Delete Department
    const deleteDRes = await fetch(`${BASE_URL}/departments/${deptId}`, {
      method: 'DELETE',
      headers,
    });
    if (!deleteDRes.ok) {
      throw new Error('Delete Department failed');
    }
    console.log('✅ Department deleted successfully.');

    console.log('\n🎉 ALL E2E REST API VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ E2E Verification Tests FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
