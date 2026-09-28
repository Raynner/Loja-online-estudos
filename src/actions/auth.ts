"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { db } from "../lib/db";
import { createSession, destroySession } from "../lib/session";

type LoginState = {
    error: string
};

interface AdminRow extends RowDataPacket {
    id: number;
    password_hash: string;
}

interface AttemptRow extends RowDataPacket {
    attempt_count: number;
}

export async function login(
    _previousState: LoginState,
    formData: FormData
): Promise<LoginState> {
    const emailValue = formData.get("email");
    const passwordValue = formData.get("password");

    if (
        typeof emailValue !== "string" ||
        typeof passwordValue !== "string"
    ) {
        return { error: "Informe o e-mail e a senha."};
    }

    const email = emailValue.trim().toLocaleLowerCase();
    const password = passwordValue;

    if (
        !email ||
        email.length > 254 || 
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !password ||
        Buffer.byteLength(password, "utf-8") > 72
    ) {
        return { error: "Confira o e-mail e a senha."}
    }

    try {
        await db.execute(
            `INSERT INTO login_attempts (
                email,
                attempt_count,
                reset_at
            )
            VALUES (
                ?,
                1,
                DATE_ADD(UTC_TIMESTAMP(), INTERVAL 15 MINUTE)
            )
            ON DUPLICATE KEY UPDATE
                attempt_count = IF(
                reset_at <= UTC_TIMESTAMP(),
                1,
                attempt_count + 1
                ),
                reset_at = IF(
                reset_at <= UTC_TIMESTAMP(),
                DATE_ADD(UTC_TIMESTAMP(), INTERVAL 15 MINUTE),
                reset_at
                )`,
                [email]
        );

        const [attempts] = await db.execute<AttemptRow[]>(
            `SELECT attempt_count
                FROM login_attempts
                WHERE email = ?`,
                [email]
        );

        if (!attempts[0] || attempts[0].attempt_count > 5) {
            return { error: "Limite de tentativas atingido. Aguarde 15 minutos.",}
        };

        const [admins] = await db.execute<AdminRow[]>(
            `SELECT id, password_hash
                FROM admin_users
                WHERE email = ?
                    AND active = TRUE
                LIMIT 1`,
                [email]
        );
    

    const admin = admins[0];

    if (!admin) {
        return { error: "E-mail ou senha incorretos." };
    }

    const passwordMatches = await bcrypt.compare(
        password,
        admin.password_hash
    );

    if (!passwordMatches) {
        return { error: "E-mail ou senha incorretos." };
    }

    await createSession(admin.id);
} catch (error) {
    console.error ("Falha no login:", error);

    return {
        error: "Não foi possível entrar agora. Tente novamente.",
    };
}

redirect ("/admin");
}

export async function logout() {
    await destroySession();
    redirect("/login");
}