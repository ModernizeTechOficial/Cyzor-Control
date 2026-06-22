export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  due?: string; // ISO 8601 date-time string (e.g. "2026-06-20T00:00:00.000Z")
  status: 'needsAction' | 'completed';
  completed?: string; // ISO 8601 timestamp
  position?: string;
  updated?: string;
}

// Fetch all task lists (categories or containers of tasks)
export async function fetchGoogleTaskLists(accessToken: string): Promise<GoogleTaskList[]> {
  const url = 'https://tasks.googleapis.com/tasks/v1/users/@me/lists';
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error fetching Google Task Lists:', errorText);
    throw new Error(`Failed to fetch Google Task Lists: ${response.statusText}`);
  }

  const data = await response.json();
  return data.items || [];
}

// Create a new task list
export async function createGoogleTaskList(accessToken: string, title: string): Promise<GoogleTaskList> {
  const url = 'https://tasks.googleapis.com/tasks/v1/users/@me/lists';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error creating Google Task List:', errorText);
    throw new Error(`Failed to create Google Task List: ${response.statusText}`);
  }

  return response.json();
}

// Delete a task list
export async function deleteGoogleTaskList(accessToken: string, taskListId: string): Promise<void> {
  const url = `https://tasks.googleapis.com/tasks/v1/users/@me/lists/${taskListId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error deleting Google Task List:', errorText);
    throw new Error(`Failed to delete Google Task List: ${response.statusText}`);
  }
}

// Fetch tasks within a specific task list
export async function fetchGoogleTasks(accessToken: string, taskListId: string, showCompleted = true): Promise<GoogleTask[]> {
  const params = new URLSearchParams({
    showCompleted: showCompleted.toString(),
    showHidden: 'true'
  });
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error fetching Google Tasks:', errorText);
    throw new Error(`Failed to fetch Google Tasks: ${response.statusText}`);
  }

  const data = await response.json();
  return data.items || [];
}

// Create a new task in a specific list
export async function createGoogleTask(accessToken: string, taskListId: string, task: Omit<GoogleTask, 'id'>): Promise<GoogleTask> {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: task.title,
      notes: task.notes || undefined,
      due: task.due || undefined,
      status: task.status || 'needsAction'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error creating Google Task:', errorText);
    throw new Error(`Failed to create Google Task: ${response.statusText}`);
  }

  return response.json();
}

// Update a task (edit title, notes, status, due)
export async function updateGoogleTask(accessToken: string, taskListId: string, taskId: string, task: Partial<GoogleTask>): Promise<GoogleTask> {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`;
  const response = await fetch(url, {
    method: 'PATCH', // PATCH is safer as list fields are optional
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: task.title,
      notes: task.notes === '' ? null : task.notes, // Clear out if empty
      due: task.due === '' ? null : task.due,
      status: task.status,
      completed: task.status === 'completed' ? new Date().toISOString() : null
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error updating Google Task:', errorText);
    throw new Error(`Failed to update Google Task: ${response.statusText}`);
  }

  return response.json();
}

// Delete a task
export async function deleteGoogleTask(accessToken: string, taskListId: string, taskId: string): Promise<void> {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error deleting Google Task:', errorText);
    throw new Error(`Failed to delete Google Task: ${response.statusText}`);
  }
}
