export async function getPastGame(gameId: string) {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/games/${gameId}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    }
  );

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

export async function getPastGameList() {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/games/list`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    }
  );
  if (!response.ok) return null;
  return await response.json();
}
