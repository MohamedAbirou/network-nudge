const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const generateNudges = async (userId: string) => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-nudges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate nudges");
  }

  return await response.json();
};

export const sendNudgeEmails = async () => {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/send-nudge-emails`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send emails");
  }

  return await response.json();
};
