export async function sendTelegramMessage(message: string) {
  try {
    console.log('Sending message to internal API...');
    const response = await fetch('/api/telegram/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Internal API error:', errorData);
      return false;
    }

    console.log('Internal API success');
    return true;
  } catch (error) {
    console.error('Failed to send message via internal API:', error);
    // If it's a fetch error, it might be because the server is not running or CORS
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
    }
    return false;
  }
}
