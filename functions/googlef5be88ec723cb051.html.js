export async function onRequest() {
  return new Response("google-site-verification: googlef5be88ec723cb051.html\n", {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
