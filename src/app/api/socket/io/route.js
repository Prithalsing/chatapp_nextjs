import { createServer } from "http";
import { NextResponse } from "next/server";
import { initializeSocketIO } from "@/lib/socket";

const httpServer = createServer();
const io = initializeSocketIO(httpServer);

export async function GET(req) {
    try {
        const res = new NextResponse();
        res.socket = { server: httpServer };
        return res;
    } catch (error) {
        console.error("Socket.IO Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";