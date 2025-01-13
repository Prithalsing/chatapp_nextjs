import formidable from 'formidable';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req) {
    return new Promise((resolve, reject) => { // Use a Promise
        const form = new formidable.IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Form parsing error:", err);
                resolve(NextResponse.json({ error: "File upload failed" }, { status: 500 })); // Resolve with error
                return;
            }

            const file = files.file;
            if (!file) {
                resolve(NextResponse.json({ error: "No file uploaded" }, { status: 400 })); // Resolve with error
                return;
            }

            const oldPath = file[0].filepath;
            const filename = file[0].originalFilename;
            const newPath = path.join(process.cwd(), 'public', 'uploads', filename);

            try {
                await fs.rename(oldPath, newPath);
                const fileUrl = `/uploads/${filename}`;
                resolve(NextResponse.json({ fileUrl })); // Resolve with success
            } catch (error) {
                console.error("File moving error:", error);
                resolve(NextResponse.json({ error: "File upload failed" }, { status: 500 })); // Resolve with error
            }
        });
    });
}