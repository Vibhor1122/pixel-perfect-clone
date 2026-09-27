const GOOGLE_CLIENT_ID = import.meta.env["VITE_GOOGLE_CLIENT_ID"];

if (!GOOGLE_CLIENT_ID) {
  throw new Error("Missing VITE_GOOGLE_CLIENT_ID");
}

export const GOOGLE_DRIVE_SCOPE =
  "https://www.googleapis.com/auth/drive.file";

type TokenResponse = {
  access_token?: string;
  error?: string;
};

type TokenClient = {
  requestAccessToken: (options?: { prompt?: string }) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

export function getGoogleDriveAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error("Google authentication has not loaded yet."));
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_DRIVE_SCOPE,

      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }

        if (!response.access_token) {
          reject(new Error("Google did not return an access token."));
          return;
        }

        resolve(response.access_token);
      },
    });

    tokenClient.requestAccessToken({
      prompt: "consent",
    });
  });
}

export type DriveUploadResult = {
  id: string;
  name: string;
  webViewLink: string;
};

export async function uploadPdfToGoogleDrive(
  file: File,
  accessToken: string
): Promise<DriveUploadResult> {
  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files can be uploaded.");
  }

  const metadata = {
    name: file.name,
    mimeType: "application/pdf",
  };

  const form = new FormData();

  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    })
  );

  form.append("file", file);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Google Drive upload failed: ${message}`);
  }

  return (await response.json()) as DriveUploadResult;
}

export async function makeDriveFileViewable(
  fileId: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "reader",
        type: "anyone",
      }),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Could not make the uploaded PDF viewable: ${message}`
    );
  }
}