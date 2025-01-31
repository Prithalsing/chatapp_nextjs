import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env');
  }


  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  
  const payload = await req.json();
  const body = JSON.stringify(payload);

  
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;


  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, image_url, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(' ');

    await prisma.user.upsert({
      where: { id: id },
      create: {
        id: id,
        email: email,
        name: name || null,
        imageUrl: image_url,
      },
      update: {
        email: email,
        name: name || null,
        imageUrl: image_url,
      },
    });
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    await prisma.user.delete({
      where: { id: id },
    });
  }

  return new Response('', { status: 200 });
}
