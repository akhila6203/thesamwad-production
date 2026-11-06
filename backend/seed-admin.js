const db = require("./src/config/db");
const bcrypt = require("bcryptjs");

const ADMIN_NAME = "TheSamwad Admin";
const ADMIN_EMAIL = "admin@thesamwad.com";
const ADMIN_PASSWORD = "V9#qR2!mX7@pL4$zT8&k";

async function setupAdmin() {
  try {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    db.query(
      "SELECT id FROM admins WHERE email = ? LIMIT 1",
      [ADMIN_EMAIL],
      (selectError, rows) => {
        if (selectError) {
          console.error("Unable to check admin:", selectError);
          db.end();
          return;
        }

        const finish = (error) => {
          if (error) {
            console.error("Unable to configure admin:", error);
          } else {
            console.log("Admin account configured successfully.");
            console.log("Email:", ADMIN_EMAIL);
          }

          db.end();
        };

        if (rows.length > 0) {
          db.query(
            `UPDATE admins
             SET name = ?, password = ?, status = 'active'
             WHERE id = ?`,
            [ADMIN_NAME, passwordHash, rows[0].id],
            finish
          );
        } else {
          db.query(
            `INSERT INTO admins (name, email, password, status)
             VALUES (?, ?, ?, 'active')`,
            [ADMIN_NAME, ADMIN_EMAIL, passwordHash],
            finish
          );
        }
      }
    );
  } catch (error) {
    console.error("Admin setup failed:", error);
    db.end();
  }
}

setupAdmin();