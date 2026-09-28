import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function main() {
    const name = process.env.ADMIN_NAME?.trim();
    const email = process.env.ADMIN_EMAIL?.trim().toLocaleLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
        throw new Error ("Preencha ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD.");
    }

    if (name.length > 100) {
        throw new Error("O nome deve ter até 100 caracteres.")
    }

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Informe um e-mail válido.");
    }

    if (
        password.length < 12 ||
        Buffer.byteLength(password, "utf-8") > 72
    ) {
        throw new Error("Use uma senha com pelo menos 12 caracteres e até 72 bytes.");
    }

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT ?? 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        const [existing] = await connection.execute(
            "SELECT id FROM admin_users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            throw new Error("Já existe uma administradora com esse e-mail.");
        }

        const passwordHash = await bcrypt.hash(password,12);

        await connection.execute(
            `INSERT INTO admin_users (
                name,
                email,
                password_hash
            ) VALUES (?, ?, ?)`,
            [name, email, passwordHash]
        );
        console.log("Conta administrativa criada com sucesso.")
    } finally {
        await connection.end();
    }
}

main().catch((error) => {
    console.error("Não foi possível criar a conta:", error.message);
    process.exitCode = 1;
});