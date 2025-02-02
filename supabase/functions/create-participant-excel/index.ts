// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'https://esm.sh/@supabase/functions-js@2.4.4/src/edge-runtime.d.ts';
// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.3/package/types/index.d.ts"
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs';

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { JsonError } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create supabase service role client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // get requesting user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser(token);
    if (userErr || !user)
      return JsonError(401, 'Unauthorized!', userErr?.message);
    const {
      data: { role },
      error: roleErr,
    } = await supabase
      .from('roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    if (roleErr || !role)
      return JsonError(500, 'Internal Server Error!', roleErr?.message);

    // Check if user has admin role
    if (role !== 'admin')
      return JsonError(
        403,
        'Forbidden!',
        'Only admins can access this resource!',
      );

    // Prepare data
    const headers = [
      'Vorname',
      'Nachname',
      'E-Mail',
      'Telefonnummer',
      'Geschlecht',
      'Geburtsdatum',
      'Pfahl',
      'Gemeinde',
      'Braucht Schlafplatz?',
      'Braucht Frühstück?',
      'Ernährung',
      'Straße und Hausnummer',
      'PLZ',
      'Stadt',
      'Wohnsitz',
    ];

    const { data, error } = await supabase.from('participants').select('*');
    if (error)
      return JsonError(500, 'Failed to fetch participant info!', error.message);
    const participantData = data.map((participant) => [
      participant.first_name ?? '-',
      participant.last_name ?? '-',
      participant.email ?? '-',
      participant.phone_number ?? '-',
      participant.gender ?? '-',
      participant.date_of_birth ?? '-',
      participant.stake_name ?? '-',
      participant.ward_name ?? '-',
      participant.needs_place_to_sleep ? 'Ja' : 'Nein',
      participant.wants_breakfast ? 'Ja' : 'Nein',
      participant.food_preferences ?? '-',
      participant.street_name_and_number ?? '-',
      participant.postal_code ?? '-',
      participant.city ?? '-',
      participant.country_of_residency ?? '-',
    ]);

    // create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...participantData]);

    // make header bold (does not work on free version)
    headers.forEach((_, col) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellRef]) return;
      worksheet[cellRef].s = { font: { bold: true } };
    });

    // create a new workbook and a worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teilnehmerliste');

    // convert workbook to a binary buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Convert buffer to Uint8Array
    const excelData = new Uint8Array(excelBuffer);

    // Return response
    return new Response(excelData, {
      headers: {
        ...corsHeaders,
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="data.xlsx"',
      },
    });
    // deno-lint-ignore no-explicit-any
  } catch (error: any) {
    return JsonError(500, 'Failed to create excel spreadsheet!', error.message);
  }
});
