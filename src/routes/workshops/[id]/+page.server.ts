import { getWorkshopDetails } from '$lib/appAdapter';
import { error, isHttpError } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
  params,
  locals: { supabase },
}) => {
  const workshopId = params.id;

  // test if workshopId is uuid
  if (
    !workshopId.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    )
  ) {
    error(400, 'Invalid workshop ID');
  }

  // Fetch the workshop details from supabase
  try {
    const workshop = await getWorkshopDetails(supabase, workshopId);
    if (workshop === null) {
      error(404, 'Workshop not found');
    }
    return { workshop };
  } catch (err) {
    console.error('Error fetching workshop details:', err);
    if (!isHttpError(err)) {
      error(500, 'Internal Server Error');
    }
    error(err.status, err.body.message);
  }
};
