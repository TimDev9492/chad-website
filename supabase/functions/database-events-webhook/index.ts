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

Deno.serve(async (req) => {
  console.log('database-events-webhook invocation!');
  if (req.method !== 'POST') {
    return JsonError(405, 'Method Not Allowed');
  }

  // check if the request is coming from supabase
  const isValid = await validateSupabaseWebhook(req);
  if (!isValid) return JsonError(401, 'Unauthorized');

  const webhookPayload = (await req.json()) as DatabaseWebhookPayload;
  if (
    webhookPayload.schema !== 'storage' ||
    webhookPayload.table !== 'objects'
  ) {
    return JsonError(
      400,
      'This webhook only supports the `storage.objects` table',
    );
  }
  if ((webhookPayload.record as StorageObjectRecord).bucket_id !== 'avatars') {
    return JsonError(400, 'This webhook only operates on the `avatars` bucket');
  }
  // construct supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );
  if (webhookPayload.type === 'INSERT') {
    return await handleInsert(supabase, webhookPayload as InsertPayload);
  }
  if (webhookPayload.type === 'UPDATE') {
    return await handleUpdate(supabase, webhookPayload as UpdatePayload);
  }
  if (webhookPayload.type === 'DELETE') {
    return await handleDelete(supabase, webhookPayload as DeletePayload);
  }
  return JsonError(400, 'Unsupported webhook type');
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

const handleUpdate = async (
  supabase: SupabaseClient,
  payload: UpdatePayload,
): Promise<Response> => {
  return JsonError(400, "This webhook doesn't support UPDATE events");
};

const handleDelete = async (
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
