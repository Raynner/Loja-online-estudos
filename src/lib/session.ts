import "server-only";

import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import type { RowDataPacket } from "mysql2";
import { db } from "./db";

const COOKIE_NAME = "loja_admin_session"
const SESSION_SECONDS = 60 * 60 * 8;

interface AdminSessionRow extends RowDataPacket {
    id: number;
    name: string;
    email: string;
}

function hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

export async function createSession(adminId: number) {
    const cookieStore = await cookies();
    const oldToken = cookieStore.get(COOKIE_NAME)?.value;

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);

    await db.execute(
        `INSERT INTO admin_sessions (
            token_hash,
            admin_id,
            expires_at
            )
        VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 8 HOUR))`,
        [tokenHash, adminId]
    );

    if (oldToken) {
        await db.execute(
            "DELETE FROM admin_sessions WHERE token_hash = ?",
            [hashToken(oldToken)]
        );
    }

    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_SECONDS,
    });
}

export async function getAdminSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
            return null;
    }

    const [rows] = await db.execute<AdminSessionRow[]>(
        `SELECT
            admin_users.id,
            admin_users.name,
            admin_users.email
        FROM admin_sessions
        INNER JOIN admin_users
            ON admin_users.id = admin_sessions.admin_id
        WHERE admin_sessions.token_hash = ?
            AND admin_sessions.expires_at > UTC_TIMESTAMP()
            AND admin_users.active = TRUE
        LIMIT 1`,
        [hashToken(token)]
    );

    return rows[0] ?? null;
}

export async function destroySession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (token) {
        await db.execute(
            "DELETE FROM admin_sessions WHERE token_hash = ?",
            [hashToken(token)]
        );
    }

    cookieStore.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
}