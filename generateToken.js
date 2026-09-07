import http from "http";
import google from "googleapis";
import open from "open";
import "dotenv/config"

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/oauth2callback";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/tasks",
];

console.log(CLIENT_ID, " ",CLIENT_SECRET)

const oauth2Client = new google.Auth.OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);

async function main() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // new token
    scope: SCOPES,
  });

  console.log("\nMembuka browser untuk login Google...");
  console.log("Kalau browser tidak otomatis terbuka, buka manual URL ini:\n");
  console.log(authUrl, "\n");

  await open(authUrl);

  // temporary server
  const server = http.createServer(async (req, res) => {
    if (!req.url.startsWith("/oauth2callback")) return;

    const urlParams = new URL(req.url, REDIRECT_URI).searchParams;
    const code = urlParams.get("code");

    if (!code) {
      res.end("Gagal mendapatkan authorization code.");
      return;
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);

      res.end("Berhasil! Kamu bisa tutup tab ini dan kembali ke terminal.");
      server.close();

      console.log("\n=== SIMPAN INI KE .env DI VM ===");
      console.log("GOOGLE_REFRESH_TOKEN=" + tokens.refresh_token);
      console.log("=================================\n");

      if (!tokens.refresh_token) {
        console.warn(
          "refresh_token tidak muncul. Kemungkinan kamu pernah " +
            "authorize app ini sebelumnya. Coba revoke akses dulu di " +
            "https://myaccount.google.com/permissions lalu jalankan ulang script ini.",
        );
      }
    } catch (err) {
      console.error("Gagal menukar code jadi token:", err.message);
      res.end("Terjadi error, cek terminal.");
      server.close();
    }
  });

  server.listen(3000, () => {
    console.log("Menunggu callback di http://localhost:3000 ...");
  });
}

main().catch(console.error);
