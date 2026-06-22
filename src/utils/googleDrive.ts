export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
}

// Format raw Google Drive sizes to legible strings
export function formatBytes(bytesString?: string): string {
  if (!bytesString) return '0 KB';
  const bytes = parseInt(bytesString, 10);
  if (isNaN(bytes)) return '0 KB';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// List files from Google Drive
export async function fetchGoogleDriveFiles(accessToken: string, queryText?: string): Promise<GoogleDriveFile[]> {
  try {
    let q = "trashed = false";
    if (queryText) {
      const sanitized = queryText.replace(/'/g, "\\'");
      q += ` and name contains '${sanitized}'`;
    }

    const fields = "files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink, thumbnailLink)";
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&orderBy=modifiedTime desc,name`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let message = `${response.statusText} (${response.status})`;
      try {
        const errData = await response.json();
        if (errData && errData.error && errData.error.message) {
          message = errData.error.message;
        }
      } catch (e) {
        // Fallback to text
      }
      throw new Error(message);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error fetching Google Drive files:', error);
    throw error;
  }
}

// Upload a generic file to Google Drive using multipart upload
export async function uploadFileToGoogleDrive(accessToken: string, file: File): Promise<GoogleDriveFile> {
  try {
    const metadata = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink,iconLink,thumbnailLink', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData
    });

    if (!response.ok) {
      let message = `${response.statusText} (${response.status})`;
      try {
        const errData = await response.json();
        if (errData && errData.error && errData.error.message) {
          message = errData.error.message;
        }
      } catch (e) {
        // Fallback to text
      }
      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
}

// Create a new blank Google Doc or Sheet on Google Drive
export async function createGoogleDriveDoc(accessToken: string, type: 'document' | 'spreadsheet' | 'presentation', name: string): Promise<GoogleDriveFile> {
  try {
    let mimeType = 'application/vnd.google-apps.document';
    if (type === 'spreadsheet') {
      mimeType = 'application/vnd.google-apps.spreadsheet';
    } else if (type === 'presentation') {
      mimeType = 'application/vnd.google-apps.presentation';
    }

    const body = {
      name: name,
      mimeType: mimeType
    };

    const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,modifiedTime,size,webViewLink,iconLink,thumbnailLink', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      let message = `${response.statusText} (${response.status})`;
      try {
        const errData = await response.json();
        if (errData && errData.error && errData.error.message) {
          message = errData.error.message;
        }
      } catch (e) {
        // Fallback to text
      }
      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Google Doc/Sheet:', error);
    throw error;
  }
}

// Delete a file from Google Drive
export async function deleteGoogleDriveFile(accessToken: string, fileId: string): Promise<boolean> {
  try {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok && response.status !== 404) {
      let message = `${response.statusText} (${response.status})`;
      try {
        const errData = await response.json();
        if (errData && errData.error && errData.error.message) {
          message = errData.error.message;
        }
      } catch (e) {
        // Fallback to text
      }
      throw new Error(message);
    }

    return true;
  } catch (error) {
    console.error('Error deleting Google Drive file:', error);
    throw error;
  }
}
