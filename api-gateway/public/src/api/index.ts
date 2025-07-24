const API_BASE = '';

export async function getCourses() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) {
    throw new Error('Failed to fetch courses');
  }
  return res.json();
}

export async function getCourse(id: number) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch course');
  }
  return res.json();
}

export async function getUser(id: string) {
  const res = await fetch(`${API_BASE}/users/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch user');
  }
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to login');
  }
  return data;
}
export async function registerUser(fullName: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fullName, email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to register');
  }
  return data;
}

export async function createCourse(course: { title: string; description: string; plan: string }) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'admin',
    },
    body: JSON.stringify(course),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create course');
  }
  return data;
}

export async function deleteCourse(id: number) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: { 'x-user-role': 'admin' },
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete course');
  }
  return true;
}

export async function getSubscriptions() {
  const res = await fetch(`${API_BASE}/subscriptions`);
  if (!res.ok) {
    throw new Error('Failed to fetch subscriptions');

  }
  return res.json();
}
// Added for profile page to retrieve a user's course progress

export async function getUserProgress(userId: string) {
  const res = await fetch(`${API_BASE}/progress/${userId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch user progress');
  }
  return res.json();
}
