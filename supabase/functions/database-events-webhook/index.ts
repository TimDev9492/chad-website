// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'https://esm.sh/@supabase/functions-js@2.4.4/src/edge-runtime.d.ts';
import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';
import { Database } from '../_shared/storage_schema.ts';
import { JsonError, JsonResponse } from '../_shared/utils.ts';

const supabaseWebhookConfig = {
  webhookConfig: {
    hmacMessageHeaderName: 'x-supabase-hmac-message',
    signatureHeaderName: 'x-supabase-signature',
    secret: Deno.env.get('WEBHOOK_SECRET') || '',
  },
};

const validateSupabaseWebhook = async (req: Request) => {
  if (!supabaseWebhookConfig.webhookConfig) {
    console.warn(
      'Supabase Webhook Guard is not configured. Please check your SupabaseModule configuration.',
    );
    return false;
  }

  const hmacMessageHeaderName =
    supabaseWebhookConfig.webhookConfig.hmacMessageHeaderName ||
    'x-supabase-hmac-message';
  const signatureHeaderName =
    supabaseWebhookConfig.webhookConfig.signatureHeaderName ||
    'x-supabase-signature';
  const message = req.headers.get(hmacMessageHeaderName);
  const signature = req.headers.get(signatureHeaderName);

  if (!signature) {
    console.warn(
      'Supabase Webhook Guard: Signature not found in the request headers.',
    );
    return false;
  }

  const calculatedSignature = createHmac(
    'sha256',
    supabaseWebhookConfig.webhookConfig.secret,
  )
    .update(message)
    .digest('base64');

  const hmacMatch = signature === calculatedSignature;

  if (!hmacMatch) {
    console.warn('Supabase Webhook Guard: Request could not be authenticated.');
    return false;
  } else {
    console.log('Supabase Webhook Guard: Request authenticated.');
  }

  return true;
};

type StorageObjectRecord = Database['storage']['Tables']['objects']['Row'];
type DatabaseWebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: any;
  old_record: any;
};
type InsertPayload = DatabaseWebhookPayload & {
  type: 'INSERT';
  old_record: null;
};
type UpdatePayload = DatabaseWebhookPayload & {
  type: 'UPDATE';
};
type DeletePayload = DatabaseWebhookPayload & {
  type: 'DELETE';
  record: null;
};

const webhookHandlers: Record<
  string,
  (
    supabase: SupabaseClient,
    webhookPayload: DatabaseWebhookPayload,
  ) => Promise<Response>
> = {
  'storage.objects': async (supabase, webhookPayload) => {
    if (
      (webhookPayload.record as StorageObjectRecord).bucket_id !== 'avatars'
    ) {
      return JsonError(
        400,
        'This webhook only operates on the `avatars` bucket',
      );
    }

    if (webhookPayload.type === 'INSERT') {
      return await handleInsert(supabase, webhookPayload as InsertPayload);
    }
    if (webhookPayload.type === 'UPDATE') {
      return await rejectUpdate(supabase, webhookPayload as UpdatePayload);
    }
    if (webhookPayload.type === 'DELETE') {
      return await rejectDelete(supabase, webhookPayload as DeletePayload);
    }
    return JsonError(400, 'Unsupported webhook type');
  },
  'auth.users': async (supabase, webhookPayload) => {
    if (webhookPayload.type === 'UPDATE') {
      return await rejectUpdate(supabase, webhookPayload as UpdatePayload);
    }
    if (webhookPayload.type === 'DELETE') {
      return await rejectDelete(supabase, webhookPayload as DeletePayload);
    }
    if (webhookPayload.type === 'INSERT') {
      const record = webhookPayload.record;

      // get public id of user
      const { data: userInfoData, error: userInfoError } = await supabase
        .from('user_infos')
        .select('public_id')
        .eq('user_id', record.id)
        .single();
      if (userInfoError) {
        return JsonError(500, 'Failed to get user public id', userInfoError);
      }
      const publicId = userInfoData.public_id;

      const provider = record.raw_app_meta_data.provider;
      if (provider === 'google') {
        const { full_name: fullName, avatar_url: avatarUrl } =
          record.raw_user_meta_data;
        const nameParts = fullName.split(' ');
        let lastName = nameParts.pop();
        let firstName = nameParts.join(' ');
        if (!firstName) {
          firstName = lastName;
          lastName = undefined;
        }
        const { error } = await supabase
          .from('public_infos')
          .update({
            first_name: firstName,
            last_name: lastName,
            avatar_url: avatarUrl,
          })
          .eq('public_id', publicId);
        if (error) {
          return JsonError(500, 'Failed to update users public infos', error);
        }

        return JsonResponse(
          200,
          `Successfully updated public infos for user ${record.email}`,
        );
      } else if (provider === 'email') {
        // do nothing
      } else {
        return JsonError(
          400,
          `Unsupported provider '${provider}' for user ${record.email}`,
        );
      }
    }
    return JsonError(400, 'Unsupported webhook type');
  },
  'public.payment_infos': async (supabase, webhookPayload) => {
    if (webhookPayload.type === 'UPDATE') {
      const oldRecord = webhookPayload.old_record;
      const record = webhookPayload.record;

      if (oldRecord.status === 'CONFIRMED' || record.status !== 'CONFIRMED') {
        return JsonResponse(200, 'Nothing to do.');
      }

      const { data, error } = await supabase
        .from('user_infos')
        .select('email')
        .eq('user_id', record.user_id)
        .single();
      if (error) {
        return JsonError(500, 'Failed to get user email', error);
      }
      const { email } = data;

      // send confirmation email using resend
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';

      console.log(`Sending confirmation email to ${email} using Resend API...`);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'CHAD Team <no-reply@chad25.com>',
          to: [email],
          subject: 'Deine Anmeldung war erfolgreich!',
          html: `
              <!doctype html>
              <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                  />
                  <title>Anmeldebestätigung</title>
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                      margin: 0;
                      padding: 0;
                      background-color: #f9f9f9;
                      color: #333333;
                      line-height: 1.6;
                    }

                    .container {
                      max-width: 600px;
                      margin: 0 auto;
                      background-color: #ffffff;
                    }

                    .header {
                      background-color: #6198e7;
                      padding: 20px;
                      color: white;
                      text-align: center;
                    }

                    .content {
                      padding: 30px;
                      border-left: 1px solid #eeeeee;
                      border-right: 1px solid #eeeeee;
                    }

                    .content h2 {
                      color: #6198e7;
                      margin-top: 0;
                    }

                    .content p {
                      margin-bottom: 20px;
                    }

                    .button {
                      display: inline-block;
                      background-color: #efb8d4;
                      color: white;
                      padding: 12px 25px;
                      text-decoration: none;
                      border-radius: 5px;
                      margin-top: 15px;
                    }

                    .button:hover {
                      background-color: #e593be;
                    }

                    .footer {
                      background-color: #ff914d;
                      padding: 20px;
                      text-align: center;
                      color: #333333;
                    }

                    .footer a {
                      color: #eeeeee;
                      text-decoration: none;
                      margin: 0 10px;
                    }

                    .footer a:hover {
                      text-decoration: underline;
                    }

                    .footer p {
                      color: #eeeeee;
                    }

                    .divider {
                      height: 1px;
                      background-color: #eeeeee;
                      margin: 15px 0;
                    }

                    @media only screen and (max-width: 620px) {
                      .container {
                        width: 100%;
                      }
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>CHAD Tagung 2025</h1>
                    </div>

                    <div class="content">
                      <h2>Du bist erfolgreich angemeldet!</h2>
                      <p>Hallo,</p>
                      <p>
                        Deine Zahlung ist erfolgreich eingegangen. Du bist nun für die Tagung
                        angemeldet. Wir freuen uns auf dich!
                      </p>

                      <div class="divider"></div>

                      <h3 style="color: #ff914d">Nächste Schritte</h3>
                      <p>
                        Wenn du möchtest, kannst du dich für Workshops anmelden, oder
                        Musikwünsche für den Tanzabend einschicken. Das geht alles einfach
                        über unsere Website.
                      </p>

                      <a
                        href="https://www.chad25.com"
                        class="button"
                        >Zur Website</a
                      >
                    </div>

                    <div class="footer">
                      <div>
                        <a href="mailto:orga@chad25.com">E-Mail</a>
                        <a href="https://www.instagram.com/chadtagung">Instagram</a>
                      </div>

                      <p style="margin-top: 15px; font-size: 12px">
                        © 2025 Chad. All rights reserved.
                      </p>
                    </div>
                  </div>
                </body>
              </html>`,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        console.log('Email sent successfully:', data);
        return JsonResponse(
          200,
          `Successfully sent confirmation email to ${email}`,
        );
      } else {
        const error = await res.json();

        console.error('Error sending email:', error);
        return JsonError(
          500,
          `Failed to send confirmation email to ${email}`,
          JSON.stringify(error),
        );
      }
    }
    if (webhookPayload.type === 'DELETE') {
      return await rejectDelete(supabase, webhookPayload as DeletePayload);
    }
    if (webhookPayload.type === 'INSERT') {
      return await rejectInsert(supabase, webhookPayload as InsertPayload);
    }
    return JsonError(400, 'Unsupported webhook type');
  },
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return JsonError(405, 'Method Not Allowed');
  }

  // check if the request is coming from supabase
  const isValid = await validateSupabaseWebhook(req);
  if (!isValid) return JsonError(401, 'Unauthorized');

  const webhookPayload = (await req.json()) as DatabaseWebhookPayload;

  const handlerKey = `${webhookPayload.schema}.${webhookPayload.table}`;

  console.log(`Invoked on '${handlerKey}'`);

  if (!Object.keys(webhookHandlers).includes(handlerKey)) {
    return JsonError(
      400,
      `This webhook does not support the '${webhookHandlers.schema}.${webhookHandlers.table}' table`,
    );
  }

  // construct supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );

  return await webhookHandlers[handlerKey](supabase, webhookPayload);
});

const handleInsert = async (
  supabase: SupabaseClient,
  payload: InsertPayload,
): Promise<Response> => {
  const record = payload.record as StorageObjectRecord;

  // extract public_id from filename
  const public_id = record.name!.split('/').pop()!.split('.')[0];

  // get all files in the avatars bucket
  let files: FileMetadata[];
  try {
    files = await listAllFiles(supabase, {
      bucket_id: 'avatars',
      folder: '',
      batchSize: 100,
    });
  } catch (error) {
    return JsonError(
      500,
      'Failed to list files in the avatars bucket',
      JSON.stringify(error),
    );
  }

  const filesToDelete: string[] = [];

  const uploadDate = new Date(record.created_at!);
  for (const file of files) {
    if (file.name === record.name) continue;
    if (!file.name.startsWith(`${public_id}.`)) continue;
    if (file.lastModified >= uploadDate) continue;
    filesToDelete.push(file.name);
  }

  // delete the files
  const { data, error } = await supabase.storage
    .from('avatars')
    .remove(filesToDelete);
  if (error) return JsonError(500, 'Failed to delete old avatar files', error);

  return JsonResponse(
    200,
    `Successfully deleted ${filesToDelete.length} file${filesToDelete.length === 1 ? '' : 's'}!`,
  );
};

const rejectInsert = async (
  supabase: SupabaseClient,
  payload: InsertPayload,
): Promise<Response> => {
  return JsonError(400, "This webhook doesn't support INSERT events");
};

const rejectUpdate = async (
  supabase: SupabaseClient,
  payload: UpdatePayload,
): Promise<Response> => {
  return JsonError(400, "This webhook doesn't support UPDATE events");
};

const rejectDelete = async (
  supabase: SupabaseClient,
  payload: DeletePayload,
): Promise<Response> => {
  return JsonError(400, "This webhook doesn't support DELETE events");
};

const listAllFiles = async (
  supabase: SupabaseClient,
  {
    bucket_id,
    folder,
    batchSize = 100,
  }: {
    bucket_id: string;
    folder: string;
    batchSize: number;
  },
): Promise<FileMetadata[]> => {
  let offset = 0;
  const fileInfos: FileMetadata[] = [];
  do {
    // fetch next batch
    const { data, error } = await supabase.storage
      .from(bucket_id)
      .list(folder, {
        limit: batchSize,
        offset,
      });
    if (error) throw error;

    // add results to fileInfos
    fileInfos.push(
      ...data.map((fileData: any) => ({
        name: fileData.name,
        lastModified: new Date(fileData.metadata.lastModified),
      })),
    );

    // increment offset
    offset += batchSize;
  } while (fileInfos.length == offset);
  return fileInfos;
};

type FileMetadata = {
  name: string;
  lastModified: Date;
};
